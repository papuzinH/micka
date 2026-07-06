# Stage 3 — Motion Engineering (GSAP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Fecha:** 2026-07-06
**Estado:** Planificado · arranca por Fase 3a (just-in-time: 3c/3d/3e se detallan al llegar)
**Rama sugerida:** `stage-3-motion` (desde `master`, con Stage 2 ya mergeado)
**Stage previo:** `docs/superpowers/plans/2026-06-30-stage-2-site-and-admin.md` (✅ completo, en `master`) + pulido `2026-07-05-home-fidelity-polish.md`
**Spec / diseño:** `docs/superpowers/specs/2026-06-18-micka-photography-portfolio-design.md`
**Figma:** https://www.figma.com/design/D1d7pqScYAAPmXHEqkW3Cm/Micka---Photography

**Goal:** Dar vida al sitio con la capa de motion definida en la propuesta ("Motion Engineering with GSAP"): animaciones de entrada, transiciones scroll-based y transiciones entre páginas, logrando la experiencia fluida e inmersiva propia de la identidad de fotografía deportiva. Todo sobre el sitio ya construido y pixel-perfect de Stage 2, **sin tocar el layout ni el modelo de datos** — solo se agrega la capa de animación.

**Architecture:** Una capa de motion aislada en `src/lib/motion/` (el módulo que el spec ya reserva para GSAP). Un `MotionProvider` cliente montado en el layout `(site)` inicializa GSAP + ScrollTrigger + smooth scroll (Lenis) una sola vez y expone el contexto; las secciones (que hoy son Server Components) se animan **envolviendo su markup en primitivas cliente** (`Reveal`, `Parallax`, `SplitReveal`, `StaggerGroup`, `Marquee` animado) que reciben `children` — así se preserva el data-fetching server-side y no hay que reescribir las secciones. **Toda animación respeta `prefers-reduced-motion`** (regla firme del proyecto): bajo reduced-motion las primitivas renderizan el estado final estático y Lenis/transiciones se desactivan.

---

## Decisiones de brainstorming (2026-07-06)

Confirmadas con el cliente antes de planificar:

- **Alcance:** **Home a fondo + subpáginas livianas.** El Home lleva el storytelling scroll-based completo (reveals, parallax, pin puntual, marquee animado); las 5 subpáginas usan un set reutilizable liviano (entrance de headers/grillas + hover). No "todo por igual".
- **Smooth scroll:** **Sí — Lenis.** Inercia suave que da el feel premium y sincroniza con ScrollTrigger. **Se desactiva bajo `prefers-reduced-motion`** y se degrada a scroll nativo.
- **Transiciones entre páginas:** **Elaboradas (cortina/overlay).** Transición cinematográfica tipo cortina violeta / overlay con wordmark entre rutas. Es la pieza de mayor riesgo técnico en App Router → fase propia con spike + fallback.
- **Carácter del motion:** **Cinematográfico pero sobrio.** Deportivo y con presencia (reveals con desplazamiento, parallax de fotos, marquee en movimiento, algún pin), pero sin marear ni sacrificar performance en mobile.
- **El Figma NO define motion.** `get_motion_context` sobre el Home (`128:154`, recursivo) devolvió `{"nodes":[]}` → **no hay prototipo/smart-animate**. Igual que las subpáginas en Stage 2, **el agente diseña el motion** derivándolo de la identidad, y el cliente valida visualmente. Las medidas/estados finales salen del Figma vía `get_design_context` cuando haga falta un valor exacto.

---

## Stack de motion (decidido)

| Paquete | Rol | Nota |
|---|---|---|
| `gsap` | Motor de animación + `ScrollTrigger` + `SplitText` | GSAP es **gratis desde 2025** (incluye todos los plugins, SplitText inclusive). |
| `@gsap/react` | Hook `useGSAP()` para React 19 | Maneja `gsap.context()` + cleanup automático al desmontar. Patrón oficial GSAP↔React. |
| `lenis` | Smooth scroll | Se conecta a ScrollTrigger vía `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker`. |

- Sin dependencias extra de transición de página: la cortina se implementa **con GSAP** (custom), no con `framer-motion`. Se evalúa la View Transitions API nativa de Next 16 como alternativa en el spike de 3d.
- **Node 20.14** (restricción heredada de Stage 1): `gsap`/`lenis`/`@gsap/react` son compatibles. Instalar con `rtk pnpm add` / `npm i` según el lockfile del repo.

---

## Global Constraints (heredados + nuevos)

- App Router; TypeScript estricto. **GSAP corre solo en cliente**: las primitivas de motion son `"use client"`; las secciones siguen siendo Server Components y se **envuelven** (pasan `children`). No convertir a client una sección solo para animarla si se puede envolver.
- **Toda animación respeta `prefers-reduced-motion`.** Baseline CSS global + guardas JS en cada primitiva. Bajo reduced-motion: estado final visible, sin transform/opacity animada, sin Lenis, transición de página instantánea. Esto además hace el motion **determinista y testeable** (jsdom mockea `matchMedia`) y no rompe e2e (Playwright puede forzar `reducedMotion: "reduce"`).
- **Todo el motion vive en `src/lib/motion/`** (el módulo reservado en el spec). Ningún componente importa `gsap` directo fuera de esa carpeta → mismo principio que "todo PocketBase pasa por `src/lib/pocketbase`". Facilita cambiar/limpiar la capa de una.
- **No romper Stage 2:** el markup, el orden de secciones, el i18n y el data layer quedan intactos. El motion es aditivo. Si una animación exige mover markup, documentarlo.
- **Performance:** `will-change` acotado, `ScrollTrigger` con `scrub`/`toggleActions` en vez de listeners manuales, matar triggers al desmontar, `gsap.matchMedia()` para no correr efectos pesados (pin, parallax fuerte) en mobile. Objetivo: no regresar los Core Web Vitals de Stage 2/4.
- **Verificación del agente (sin tests visuales — convención firme del 2026-07-05):** `npx tsc --noEmit` + ESLint limpios, **unit tests (Vitest)** de las primitivas y del provider (comportamiento reduced-motion, cleanup), `npx next build` OK. **La validación visual (fluidez, timing, feel) la hace el cliente.** El agente **no** corre chrome-devtools MCP ni Playwright en navegador. La suite e2e existente queda en el repo; su corrida es del cliente/CI (el motion se diseña para no romperla).
- TDD bite-sized; un commit por task como mínimo. Prefijar comandos con `rtk`. `npx next build` directo para builds reales (rtk no persiste `BUILD_ID` en este entorno).
- Cerrar cada fase actualizando `CLAUDE.md` (estado + changelog) y marcando tasks `- [x]` en este plan.

---

## Mapa de fases

| Fase | Foco | Entregable verificable |
|---|---|---|
| **3a** | Fundación de motion: deps + `MotionProvider` (Lenis + GSAP/ScrollTrigger) + baseline reduced-motion + primitivas reutilizables | Provider montado sin romper el sitio; primitivas con unit tests (incl. reduced-motion); `next build` OK |
| **3b** | Home a fondo: aplicar las primitivas sección por sección (hero entrance, parallax, marquee animado, reveals, pin puntual) | Home `/en` y `/fr` con el storytelling scroll-based completo; validado visualmente por el cliente |
| **3c** | Subpáginas livianas: set reutilizable de entrance para `PageHeader` + grillas | Portfolio (+detalle), About, Reviews, Collabs, Contact con entrance sutil consistente |
| **3d** | Transiciones entre páginas (cortina/overlay con GSAP) | Navegación entre rutas con cortina; fallback instantáneo bajo reduced-motion / si falla |
| **3e** | Cierre: auditoría reduced-motion + performance + verificación integral + docs | tsc/ESLint/unit/build verdes; `CLAUDE.md` + spec actualizados; Stage 3 cerrado |

---

# FASE 3a — Fundación de motion

**Salida de fase:** infraestructura de motion lista y probada, **sin animar todavía ninguna sección**. El sitio se ve igual que al cerrar Stage 2 pero con Lenis activo (scroll suave) y las primitivas disponibles para 3b.

## Task 1: Instalar el stack + baseline `prefers-reduced-motion`

**Files:**
- Modify: `package.json` (deps `gsap`, `@gsap/react`, `lenis`), `src/app/globals.css` (baseline reduced-motion).

**Interfaces:**
- Produces: dependencias instaladas; regla CSS global que, bajo `prefers-reduced-motion: reduce`, anula `animation`/`transition`/`scroll-behavior` como red de seguridad para cualquier cosa que se escape de las guardas JS.

- [x] **Step 1:** Instalar `gsap`, `@gsap/react`, `lenis` (mismo package manager que el repo). Verificar que `next build` sigue OK.
- [x] **Step 2:** Agregar a `globals.css` el bloque `@media (prefers-reduced-motion: reduce)` que fuerza `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important;` sobre `*`. (Red de seguridad; las guardas JS son la defensa primaria.)
- [x] **Step 3:** Commit: `chore(motion): add gsap, @gsap/react, lenis + reduced-motion CSS baseline`.

## Task 2: `MotionProvider` — Lenis + GSAP/ScrollTrigger + reduced-motion

**Files:**
- Create: `src/lib/motion/MotionProvider.tsx` (`"use client"`), `src/lib/motion/useReducedMotion.ts`, `src/lib/motion/register.ts` (registro idempotente de plugins).
- Modify: `src/app/(site)/[locale]/layout.tsx` (envolver `children` con `MotionProvider`; el admin **no** lo lleva).
- Test: `src/lib/motion/__tests__/MotionProvider.test.tsx`, `useReducedMotion.test.ts`.

**Interfaces:**
- `register.ts`: `registerGsap()` registra `ScrollTrigger`/`SplitText`/`useGSAP` una sola vez (guard SSR: solo en browser).
- `useReducedMotion()`: hook que lee `matchMedia("(prefers-reduced-motion: reduce)")` con listener y estado (SSR-safe: default `false` en server, corrige en `useEffect`).
- `MotionProvider`: inicializa Lenis (si **no** reduced-motion), engancha `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker.add((t)=>lenis.raf(t*1000))` y `gsap.ticker.lagSmoothing(0)`; destruye Lenis + mata todos los `ScrollTrigger` en cleanup. Bajo reduced-motion: no crea Lenis (scroll nativo) y expone `reducedMotion` por contexto.

- [x] **Step 1:** Test (RED): `useReducedMotion` devuelve `true` cuando `matchMedia` matchea (mock de `window.matchMedia`); `MotionProvider` **no** instancia Lenis bajo reduced-motion y renderiza `children`.
- [x] **Step 2:** Implementar `register.ts`, `useReducedMotion.ts`, `MotionProvider.tsx`. GREEN.
- [x] **Step 3:** Montar `MotionProvider` en el layout `(site)` alrededor de `children` (dentro de `NextIntlClientProvider`). No tocar el layout `(admin)`.
- [x] **Step 4:** `rtk vitest run` PASS + `npx next build` OK (verificar que no rompe SSG del Home ni de las subpáginas). Commit: `feat(motion): MotionProvider with Lenis + ScrollTrigger wiring (honors reduced-motion)`.

## Task 3: Primitivas de reveal/stagger — `Reveal`, `StaggerGroup`

**Files:**
- Create: `src/lib/motion/Reveal.tsx`, `src/lib/motion/StaggerGroup.tsx` (ambas `"use client"`).
- Test: `__tests__/Reveal.test.tsx`, `StaggerGroup.test.tsx`.

**Interfaces:**
- `<Reveal as? from? delay? once>`: envuelve `children`; anima opacity+`y` (o `from` custom) al entrar en viewport vía `ScrollTrigger` (`useGSAP`). Bajo reduced-motion: renderiza `children` visibles sin animar (sin estado inicial oculto → **no** deja contenido invisible si JS no corre: el estado oculto se aplica desde JS, nunca desde CSS estático).
- `<StaggerGroup stagger? childSelector?>`: anima sus hijos en cascada al entrar. Mismos criterios reduced-motion + no-JS-safe.

- [x] **Step 1:** Tests (RED): ambas renderizan `children`; bajo reduced-motion no aplican estado inicial oculto; sin `matchMedia` disponible degradan a visible.
- [x] **Step 2:** Implementar con `useGSAP` + `ScrollTrigger`. **Regla anti-FOUC/anti-invisibilidad:** el estado inicial oculto se setea con `gsap.set` en el `useGSAP` (JS), nunca en el markup — si el JS no corre, el contenido queda visible.
- [x] **Step 3:** `rtk vitest run` PASS. Commit: `feat(motion): Reveal and StaggerGroup scroll primitives`.

## Task 4: Primitivas `Parallax`, `SplitReveal`, `Marquee` (animado)

**Files:**
- Create: `src/lib/motion/Parallax.tsx`, `src/lib/motion/SplitReveal.tsx`, `src/lib/motion/Marquee.tsx` (`"use client"`).
- Test: `__tests__/` de cada una.

**Interfaces:**
- `<Parallax speed>`: mueve `children` en `y` proporcional al scroll (`scrub`), acotado en mobile vía `gsap.matchMedia()`. Reduced-motion → sin transform.
- `<SplitReveal as>`: parte el texto en líneas/palabras (`SplitText`) y las revela en cascada al entrar. Reduced-motion → texto plano, **sin** split (accesibilidad: revertir SplitText siempre en cleanup para no dejar el DOM partido para lectores de pantalla).
- `<Marquee speed direction>`: cinta horizontal en loop infinito (reemplaza el marquee estático de Stage 2). Pausa/estático bajo reduced-motion. Opcional (evaluar en 3b): modular la velocidad con la del scroll.

- [x] **Step 1:** Tests (RED): `SplitReveal` bajo reduced-motion no parte el texto (queda accesible); `Parallax`/`Marquee` renderizan `children`.
- [x] **Step 2:** Implementar las 3. Ojo con `SplitText`: revertir en cleanup del `useGSAP`.
- [x] **Step 3:** `rtk vitest run` PASS + `npx next build`. Commit: `feat(motion): Parallax, SplitReveal and animated Marquee primitives`.
- [x] **Step 4:** Cerrar 3a: actualizar `CLAUDE.md` (estado + changelog "Fase 3a completa: fundación de motion").

---

# FASE 3b — Home a fondo (storytelling scroll-based)

**Salida de fase:** el Home recorre una secuencia cinematográfica sobria de arriba a abajo. Se aplica **envolviendo** el markup de cada sección con las primitivas de 3a — sin reescribir las secciones. Antes de cada sección, si se necesita un valor exacto (offset, escala, duración implícita), sacar `get_design_context` del nodo Figma correspondiente. **Validación visual = cliente.**

**Mapa sección → motion** (orden real de `page.tsx`: Hero → BioBlock → Marquee → EditorialIntro → StarredAlbums → CraftBlock → FavesGallery → NothingBar → ContactCta):

| Sección | Componente | Motion propuesto (sobrio/cinematográfico) |
|---|---|---|
| Hero | `home/Hero.tsx` | Timeline de entrada al cargar: imagen con clip/scale reveal, H1 con `SplitReveal` por línea, pill fade+scale, botones `StaggerGroup`. Parallax leve de la imagen al scrollear. |
| Bio | `home/BioBlock.tsx` | `Reveal` del retrato (clip), `SplitReveal` del heading, `Parallax` con profundidades distintas en la tira de 3 fotos, divisor violeta que "se dibuja". |
| Marquee | `home/Marquee.tsx` | Reemplazar la cinta estática por `<Marquee>` animado (loop infinito). |
| EditorialIntro | `home/EditorialIntro.tsx` | `Reveal` de las cajas con el borde izquierdo violeta creciendo; acentos en cascada. |
| Starred albums | `home/StarredAlbums.tsx` | `StaggerGroup` de las 3 cards (y+scale sutil), `Parallax` en las imágenes, labels que entran; **pin puntual** opcional del título sobre el panel de líneas (evaluar en mobile con matchMedia). |
| Craft | `home/CraftBlock.tsx` | `SplitReveal`/`Reveal` de los titulares Syne + acento. |
| Faves | `home/FavesGallery.tsx` | `StaggerGroup` + `Parallax` por profundidades de la galería. |
| Nothing bar | `home/NothingBar.tsx` | `SplitReveal` por línea de la declaración de 2 líneas. |
| Contact CTA | `home/ContactCta.tsx` | Regla violeta que se dibuja, `Reveal` del heading, "pop" del botón. |

**Tasks (agrupadas por bloque del Home; commit por task):**

- [x] **Task 5 — Hero entrance + parallax.** Timeline de carga + parallax de la imagen. Cuidar que el LCP (imagen/H1 del hero) no quede oculto esperando JS: la entrada parte de un estado visible-degradable. Commit: `feat(motion): animate Home hero (entrance timeline + parallax)`.
- [x] **Task 6 — Bio + Marquee animado + EditorialIntro.** Reveals/parallax de bio, cinta animada, cajas editoriales. Commit: `feat(motion): animate bio block, marquee and editorial intro`.
- [x] **Task 7 — Starred albums + Craft + Faves.** Stagger/parallax de cards y galería; pin puntual del título Starred (con `matchMedia` para desactivar en mobile). Commit: `feat(motion): animate starred albums, craft block and faves gallery`.
- [x] **Task 8 — Nothing bar + Contact CTA + pasada de ritmo.** Reveals finales + ajuste de timing/orden global del Home (que no se solapen mal, que el scrub sea coherente). Verificación: `tsc`/ESLint/unit/`next build`. Commit: `feat(motion): animate closing sections + tune Home scroll rhythm`.
- [x] **Task 9 — Cierre 3b:** auditoría reduced-motion del Home completo (con reduced-motion todo debe verse como el Stage 2 estático) + update `CLAUDE.md`. Commit incluido en el update de docs.

---

# FASE 3c — Subpáginas livianas *(se detalla al llegar)*

**Salida prevista:** entrance sutil y consistente en las 5 subpáginas, con un set reutilizable — **no** el despliegue completo del Home.

**Tasks previstas (referencia):**
1. Envolver `site/PageHeader.tsx` con un `Reveal`/`SplitReveal` estándar → entrada consistente del título en Portfolio/About/Reviews/Collabs/Contact.
2. `site/PhotoGrid.tsx` y `site/AlbumCard.tsx`: `StaggerGroup` de items al entrar (galería Portfolio + detalle de álbum). Lazy/`batch` de ScrollTrigger para grillas largas.
3. Reviews/Collabs: `StaggerGroup` de las cards. About: `Reveal` de los bloques de texto/imagen.
4. `site/ContactForm.tsx`: entrance sutil (sin animar estados de validación que ya existen).
5. Hover states "con motion" donde sume (sobrio). Verificación + update `CLAUDE.md`.

**A resolver al inicio de 3c:** confirmar que el set liviano es realmente liviano (no replicar parallax/pin del Home) para no sobrecargar páginas de catálogo/lectura.

---

# FASE 3d — Transiciones entre páginas (cortina/overlay) *(se detalla al llegar)*

> ⚠️ **Fase de mayor riesgo.** App Router no expone un evento de cambio de ruta limpio; la cortina requiere interceptar la navegación. Arranca con un **spike** y define un **fallback** antes de invertir en el pulido.

**Enfoque propuesto (GSAP, sin librería de transición):**
1. **Spike (timeboxed):** evaluar dos caminos y elegir uno:
   - (a) **Custom GSAP curtain:** `TransitionProvider` cliente + `TransitionLink`/`useTransitionRouter` que reproduce la cortina-in, hace `router.push`, y con un `template.tsx` en `(site)` reproduce cortina-out/entrada del contenido.
   - (b) **View Transitions API** nativa de Next 16 como base + GSAP para la coreografía de la cortina.
2. **Cortina:** overlay violeta (o con el wordmark "MICKA'S / PHOTOS") que barre la pantalla. `pointer-events` controlados para no bloquear la UI.
3. **Fallback firme:** bajo `prefers-reduced-motion` o si la transición no resuelve, **navegación instantánea** (nunca dejar al usuario trabado). Esto también mantiene la e2e existente (navegación) verde si el cliente la corre con reduced-motion.
4. Coordinar con Lenis (resetear scroll/anclas al cambiar de ruta) y con las animaciones de entrada de cada página (que no se pisen con la cortina-out).

**A resolver al inicio de 3d:** ¿cortina full-screen violeta o con wordmark? ¿mismo efecto en mobile o más liviano? (validar con el cliente con una referencia).

---

# FASE 3e — Cierre de Stage 3 *(se detalla al llegar)*

**Tasks previstas:**
1. **Auditoría `prefers-reduced-motion` integral:** con reduced-motion ON, el sitio entero (Home + subpáginas + navegación) debe comportarse como el estático de Stage 2 — sin Lenis, sin reveals ocultos, sin cortina. Revisar que ninguna primitiva deje contenido invisible si el JS falla.
2. **Pasada de performance:** `will-change` acotado, matar ScrollTriggers/Lenis al desmontar, `matchMedia` para efectos pesados en mobile, sin layout shift introducido por el motion. (La optimización fina de imágenes/CWV es Stage 4; acá solo "no regresar".)
3. **Verificación integral (agente):** `npx tsc --noEmit` limpio · ESLint limpio · `rtk vitest run` (todos PASS, incl. primitivas + provider) · `npx next build` OK.
4. **Validación visual (cliente):** Home + subpáginas + transiciones en EN/FR, desktop + mobile.
5. **Docs:** actualizar `CLAUDE.md` (estado + changelog "Stage 3 completo") y el **spec** (documentar como decisiones de UI: Lenis smooth scroll + transiciones de página elaboradas; el módulo `lib/motion` deja de estar "pendiente"). Marcar tasks `- [x]` en este plan.

---

## Self-Review

**Spec coverage (Stage 3 — "Motion Engineering con GSAP"):**
- Animaciones de entrada → 3a (primitivas) + 3b (Home) + 3c (subpáginas) ✓
- Transiciones suaves entre secciones → 3b (scroll-based, Lenis) ✓
- Efectos scroll-based (ScrollTrigger) → 3b/3c ✓
- Transiciones entre páginas → 3d (cortina/overlay — decisión del cliente, no explícita en el spec pero dentro de "smooth transitions") ✓
- Respeto de `prefers-reduced-motion` → constraint global + baseline CSS + guardas por primitiva + auditoría 3e ✓

**Diferido a Stage 4 (no en este plan):** optimización fina de imágenes / compresión adaptativa / lazy-load avanzado, SEO técnico final (sitemap/hreflang/JSON-LD), tests de usabilidad multi-dispositivo, DNS + deploy a producción. Acá solo se cuida "no regresar" performance.

**Riesgos / cosas a vigilar:**
- **Secciones Server Component:** animar envolviendo con primitivas cliente que reciben `children` — no convertir a client innecesariamente ni romper el data-fetching del Home/subpáginas.
- **Invisibilidad si el JS no corre / SSG:** el estado inicial oculto de los reveals se setea desde JS (`gsap.set`), nunca desde CSS estático → si falla el JS o bajo reduced-motion, el contenido queda visible. Cuidar el LCP del hero.
- **Transiciones de página (3d):** el punto más frágil en App Router → spike + fallback instantáneo obligatorio antes de pulir.
- **Verificación no visual:** el agente valida con tsc/ESLint/unit/build; **el feel lo valida el cliente**. Bakear la mayor cantidad de garantías en unit tests (reduced-motion, cleanup, no-split accesible) para compensar la falta de validación visual del agente.
- **Lenis + mobile:** confirmar comportamiento táctil y que no pelee con el scroll nativo; `matchMedia` para aligerar parallax/pin en mobile.
- **e2e existente:** el motion no debe romper la navegación; diseñar la cortina y Lenis para degradar a instantáneo bajo reduced-motion (Playwright lo fuerza fácil) — así la suite de Stage 2 sigue verde cuando el cliente/CI la corra.
