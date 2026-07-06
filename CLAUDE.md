# Micka Photography Portfolio — Contexto del proyecto

> Este archivo da contexto a cualquier agente que retome el proyecto en cualquier stage.
> El detalle completo de diseño vive en el spec; este archivo es el índice operativo + estado.

## Regla de mantenimiento de contexto (IMPORTANTE)

**Cada iteración/stage debe actualizar lo relevante antes de cerrar:**
- **Este `CLAUDE.md`** → actualizar la sección "Estado actual", el changelog de "Decisiones y cambios", y agregar cualquier convención nueva que surja.
- **El spec** (`docs/superpowers/specs/2026-06-18-micka-photography-portfolio-design.md`) → solo si cambia el diseño, el modelo de datos, el stack o el alcance.
- **Los planes** (`docs/superpowers/plans/`) → marcar tasks completadas (`- [x]`) y crear el plan del siguiente stage cuando llegue su turno (planificación just-in-time, un plan por stage).

Mantené estos documentos como la fuente de verdad: si la realidad del código diverge de lo documentado, actualizá el documento.

## Qué es

Portfolio fotográfico deportivo de "Don Micka de la Vega" (ciclismo femenino). Estética
editorial oscura, alto rendimiento, motion design. Sitio público bilingüe (EN/FR) de 6
páginas + panel admin custom para que Micka gestione el contenido sin programador.

## Stack

- **Front + admin:** Next.js (App Router, TypeScript) + Tailwind + GSAP → Vercel.
- **Backend/CMS:** PocketBase (3ª instancia) en VPS `lhstudio.com.ar`, en `https://micka.lhstudio.com.ar` (SSL, reverse proxy).
- **Imágenes:** almacenamiento **local en el VPS** (storage por defecto de PocketBase, servidas vía `…/api/files/...`). Migración futura a Cloudflare R2 (S3 + CDN) pendiente si crece tráfico/peso — R2 quedó descartado por ahora para evitar requerir tarjeta.
- **i18n:** next-intl, rutas localizadas `/en` (default) y `/fr`.
- **Email contacto:** Resend (o SMTP) vía Server Action.

## Convenciones (reglas firmes)

- App Router only; TypeScript estricto.
- **Todo acceso a PocketBase pasa por `src/lib/pocketbase`** — ningún componente importa el SDK directo.
- Campos de texto de contenido en PocketBase tienen variantes `_en` y `_fr`.
- URL/credenciales de PocketBase → variables de entorno (`.env.local`, nunca commiteadas). (R2 no se usa por ahora.)
- Imágenes del CMS se sirven desde `https://micka.lhstudio.com.ar/api/files/...` → cuando se arme el front, agregar ese host a `images.remotePatterns` de `next.config`.
- TDD bite-sized, commits frecuentes (uno por task mínimo). Prefijar comandos con `rtk` (ver CLAUDE.md global).
- Respetar `prefers-reduced-motion` en toda animación GSAP.
- El middleware de Next vive en `src/proxy.ts` (Next.js 16 renombró la convención `middleware`→`proxy`).
- **Prohibido que el agente corra tests visuales** (Chrome/`chrome-devtools` MCP, Playwright e2e en
  navegador, capturas, etc.) — pedido explícito del cliente (2026-07-05): la validación visual la hace
  él. El agente se limita a verificación no visual: `tsc --noEmit`, ESLint, unit tests (Vitest) y
  `next build`. No ejecutar `npx playwright test` ni herramientas de browser automation salvo pedido
  explícito puntual del cliente en esa conversación.

## Design tokens (Figma)

- Colores: Negro `#000000`, Gris `#202020`, Gris fondo `#212121`, Gris claro `#373636`, Blanco `#ffffff`, Violeta `#a020f0`, Violeta oscuro `#8315c8`.
- Fuentes: **Syne** Bold (titulares), **Inter** (body). En Tailwind: `font-display` / `font-body`, colores `brand.*`, `shadow-button`.
- Figma: https://www.figma.com/design/D1d7pqScYAAPmXHEqkW3Cm/Micka---Photography
  - Home Desktop: nodeId `128:154` · Home Mobile: `3:6` · UI Kit: `20:3`

## Modelo de datos (colecciones PocketBase)

`categories`, `albums`, `photos`, `reviews`, `collabs`, `site_content`, `contact_messages`.
Esquema versionado en `pocketbase/pb_schema.json`. Detalle de campos en el spec (sección "Modelo de datos").

## Estructura de carpetas (objetivo)

```
src/app/(site)/[locale]/   → sitio público (6 páginas) — route group (site), root layout con <html lang={locale}>
src/app/(admin)/admin/     → login + panel custom — route group (admin), root layout con <html lang="en">
src/lib/pocketbase/        → cliente tipado, types, auth, queries
src/lib/i18n/              → routing + request next-intl
src/lib/motion/            → wrappers GSAP (Stage 3)
src/messages/              → en.json / fr.json
pocketbase/                → pb_schema.json + README de provisión
```

Nota: Los paréntesis en `(site)` y `(admin)` son route groups de Next.js — NO afectan las URLs.
Las rutas siguen siendo `/en`, `/fr`, `/admin`, `/admin/login`. Cada grupo tiene su propio root layout
con `<html><body>` para cumplir la restricción de Next.js App Router (no puede haber un único layout
raíz en `src/app/layout.tsx` cuando los grupos tienen layouts incompatibles — i18n vs. admin).

## Plan por stages (Phase 2 de la propuesta)

Cada stage requiere aprobación expresa del cliente antes de avanzar. Un plan detallado por stage, just-in-time.

| Stage | Semana | Foco | Plan |
|---|---|---|---|
| 1 | 1 | Arquitectura y estructura del CMS | `docs/superpowers/plans/2026-06-18-stage-1-cms-architecture.md` |
| 2 | 2 | Layout Home + 5 subpáginas + admin CRUD + contacto | `docs/superpowers/plans/2026-06-30-stage-2-site-and-admin.md` (Fase 2a detallada; 2b/2c esbozadas) |
| 3 | 3 | Motion Engineering (GSAP) | `docs/superpowers/plans/2026-07-06-stage-3-motion-engineering.md` (Fase 3a detallada; 3b esbozada; 3c/3d/3e just-in-time) |
| 4 | 4 | Optimización, testing, SEO, deploy | _pendiente de planificar_ |

## Estado actual

- **✅ STAGE 1 COMPLETO** (rama `stage-1-cms`). Verificación integral en verde: `tsc --noEmit` limpio, **11/11 unit tests**, `next build` OK, **5/5 e2e** (incluido login admin exitoso contra el PocketBase real). Pasó review final de rama (un Critical encontrado y corregido: mismatch de cookie en el login).
  - Task 1: scaffold Next.js + Tailwind v4 + Vitest + design tokens.
  - Task 2: i18n next-intl (`/en` default, `/fr`), fuentes Syne+Inter, `src/proxy.ts`.
  - Task 3 ✅ (usuario): PocketBase en `https://micka.lhstudio.com.ar` (server actualizado 0.22.14 → 0.39.4).
  - Task 4 ✅: storage local en el VPS (R2 descartado por ahora).
  - Task 5 ✅: 7 colecciones creadas vía `pocketbase/seed-collections.mjs` (esquema en `pb_schema.json`).
  - Task 6: data layer tipado (`src/lib/pocketbase`: client + 7 types).
  - Task 7: admin login completo (auth + Server Actions + login + dashboard) — login exitoso verificado e2e contra backend real.
  - Fix estructural: route groups `(site)`/`(admin)` para root layouts separados.
- **Infra confirmada:** el reverse proxy del VPS es **Caddy dockerizado** (contenedor `n8n-stack-caddy-1`, Caddyfile con `micka.lhstudio.com.ar { reverse_proxy 192.227.152.170:8093 }`). Caddy **no limita el tamaño de body por defecto** → subidas de fotos OK sin configurar nada (el `client_max_body_size` era un tema de nginx, no aplica). SSL automático por Caddy.
- **Único pendiente del usuario (no bloquea código):** confirmar en el panel de PocketBase que "Use S3 storage" está OFF (es el default, storage local).
- **🚧 STAGE 2 EN CURSO** (rama `stage-2-site`) — **Fase 2a COMPLETA** (8 tasks: design system + UI Kit + shell + Home pixel-perfect). Verificación integral en verde: `tsc` limpio, ESLint limpio, **25/25 unit**, **9/9 e2e**, `next build` OK. Home Desktop+Mobile validado visualmente contra Figma en EN y FR.
  - Design system en código: escala tipográfica del Figma (Task 1); `Button`/`MenuItem`/`ToggleLanguage`/`ImageDescription` del UI Kit (Tasks 2-3); helper `cn()`.
  - Shell: `Navbar` (desktop + menú mobile con Esc/scroll-lock) + `Footer` montados en el layout `(site)` (Task 4).
  - Home: hero, bio, marquee, bloques editoriales, Starred albums, "My faves", craft block, "Nothing is left to chance", CTA (Tasks 5-7), con placeholders de ciclismo en `/public/placeholders` (extraídos del Figma) y textos i18n reales del Home en en/fr.
- **🚧 STAGE 2 — Fase 2b COMPLETA** (rama `stage-2-site`). Data layer del CMS + Home conectado + las 5 subpáginas con datos reales de PocketBase. Verde: `tsc` limpio, **44/44 unit**, **12/12 e2e**, `next build` OK; validado visualmente (Home + 6 subpáginas, EN).
  - Infra de datos: helper `fileUrl()` (URLs canónicas + thumbs), `images.remotePatterns` para `micka.lhstudio.com.ar`, **queries tipadas resilientes** (`src/lib/pocketbase/queries.ts`: getCategories/Albums/StarredAlbums/AlbumBySlug/PhotosByAlbum/FavePhotos/Reviews/Collabs/SiteContent + `localized()`), seed de contenido (`pocketbase/seed-content.mjs`, ejecutado).
  - **Home** conectado a `getStarredAlbums()`/`getFavePhotos()` (thumbs + fallback a placeholders; ISR `revalidate=300`).
  - **Subpáginas:** Portfolio (galería por categoría) + detalle `/portfolio/[slug]` (`generateStaticParams` + metadata localizada + grid de fotos), About (textos de `site_content`), Reviews, Collabs, Contact (UI del form con estados; Server Action → 2c). Componentes `site/{PageHeader,AlbumCard,PhotoGrid,ContactForm}`. 404/error localizados.
- **✅ STAGE 2 — Fase 2c COMPLETA → STAGE 2 CERRADO** (rama `stage-2-site`). Admin CRUD custom de las 7 colecciones + contacto funcional. Verde: `tsc` limpio, **44/44 unit**, **15/15 e2e**, `next build` OK; admin validado visualmente (dashboard, lista, form de edición).
  - **Admin shell:** `requireAdminPb()` (PB autenticado server-side desde la cookie de Stage 1), route group `(panel)` con sidebar + guard centralizado; login fuera del grupo. Dashboard con conteos por colección.
  - **CRUD config-driven:** `src/lib/admin/collections.ts` (config declarativa de las 7) dirige sidebar/listas/forms. Rutas dinámicas `(panel)/[collection]/{page,new,[id]}`. Validación Zod generada desde la config + extracción de FormData (localizados EN/FR, bools, files). Server Actions genéricas `saveRecord`/`deleteRecord` con upload + `revalidatePath`. `contact_messages` = bandeja read-only.
  - **Contacto:** `submitContact` (Zod + honeypot → persiste en `contact_messages` + email Resend best-effort tras env vars; fallback a solo-persistir). `ContactForm` usa la action vía `useActionState`.
  - Límite de archivo subido a 15MB (autorizado por el cliente). Email tras `RESEND_API_KEY`/`CONTACT_TO_EMAIL`/`CONTACT_FROM_EMAIL` (opcionales).
- **Pendiente menor (mejora futura, no bloquea):** gestión de `photos` es de a una (sin upload múltiple ni drag-reorder; el orden es por campo numérico). El campo `description`/`value` (editor) se edita como textarea (sin WYSIWYG). a11y de botones del admin OK (todos con texto).
- **✅ Pasada final de pulido del Home COMPLETA** (2026-07-05, 10 fixes de fidelidad vs. Figma —
  ver changelog). Verde: `tsc`/ESLint limpios, **45/45 unit**, `next build` OK. **Pendiente:
  validación visual EN/FR desktop+mobile la hace el cliente directamente** (pidió que el agente no
  corra tests visuales/e2e en navegador — ver Convenciones).
- **✅ STAGE 3 PLANIFICADO** (2026-07-06) — `docs/superpowers/plans/2026-07-06-stage-3-motion-engineering.md`.
  Brainstorming + plan escritos (mismo formato que Stage 2). **Decisiones del cliente:** (1) alcance =
  **Home a fondo + subpáginas livianas**; (2) **smooth scroll con Lenis** (off bajo reduced-motion);
  (3) **transiciones de página elaboradas** (cortina/overlay — pieza de mayor riesgo, fase propia con
  spike + fallback); (4) carácter **cinematográfico pero sobrio**. El Figma **no** define motion
  (`get_motion_context` del Home = `{"nodes":[]}`) → el agente lo diseña, el cliente valida
  visualmente. Stack: `gsap` + `@gsap/react` + `lenis`. Fases: 3a fundación (provider Lenis+
  ScrollTrigger + primitivas) · 3b Home a fondo · 3c subpáginas livianas · 3d transiciones de página ·
  3e cierre. Toda animación respeta `prefers-reduced-motion` (baseline CSS + guardas JS); el motion
  vive aislado en `src/lib/motion/`.
- **✅ STAGE 3 — Fase 3a COMPLETA** (rama `stage-3-motion`). Fundación de motion lista y probada; el
  sitio se ve igual que al cerrar Stage 2 pero con Lenis activo y las primitivas disponibles para 3b.
  Verde: `tsc`/ESLint limpios, **64/64 unit** (+13 nuevos), `next build` OK.
  - Task 1: `gsap`+`@gsap/react`+`lenis` instalados; baseline CSS `prefers-reduced-motion` en `globals.css`.
  - Task 2: `MotionProvider` (`src/lib/motion/`) inicializa Lenis+ScrollTrigger una vez, montado en el
    layout `(site)` (el admin no lo lleva). `useReducedMotion()` con lazy initializer (valor correcto
    ya en el primer render del cliente, sin flash) y degrada a `true` si `matchMedia` no existe.
  - Task 3-4: primitivas `Reveal`/`StaggerGroup`/`Parallax`/`SplitReveal`/`Marquee` — todas `"use
    client"`, envuelven `children`, llaman `registerGsap()` (idempotente) internamente para ser
    testeables standalone sin `MotionProvider`, y respetan reduced-motion (no ocultan/animan nada).
  - **Próximo:** Fase 3b — aplicar las primitivas al Home sección por sección (validación visual del
    cliente).

### Minor findings diferidos a Stage 2 (del review final)
- ✅ `as any` en `tokens.test.ts` y `i18n/request.ts:6` → resueltos en Fase 2a (tipos concretos + `(typeof routing.locales)[number]`).
- ✅ `(site)/[locale]/page.tsx` con `setRequestLocale` propio → resuelto en Fase 2a (el Home ahora es SSG).
- ✅ `fr.json` == `en.json` → resuelto: todas las subpáginas traducidas en/fr reales (Fase 2b).
- ✅ a11y `aria-label` en botones del admin → resuelto: el admin de Fase 2c usa botones con texto (Save/Delete/+New/Log out).
- `pb_schema.json` es **input del seeder**, no un export fiel de PocketBase (no re-importable por el panel). Documentado.
- ✅ Agregar `micka.lhstudio.com.ar` a `images.remotePatterns` → resuelto en Fase 2b.
- ✅ **Pequeños fixes de fidelidad del Home** → resueltos en la pasada de pulido del 2026-07-05
  (`docs/superpowers/plans/2026-07-05-home-fidelity-polish.md`, 10 tasks).

## Decisiones y cambios (changelog)

- **2026-07-06** — **Fase 3a de Stage 3 COMPLETA** (rama `stage-3-motion`). Fundación de motion: 4
  tasks, TDD estricto. **Deps:** `gsap`@3.15 (ScrollTrigger+SplitText gratis desde 2025) +
  `@gsap/react`@2.1 (`useGSAP`) + `lenis`@1.3. **`MotionProvider`** (`src/lib/motion/MotionProvider.tsx`)
  monta Lenis+ScrollTrigger una sola vez en el layout `(site)`; bajo reduced-motion no instancia Lenis
  (scroll nativo). **Bug real encontrado y corregido:** `useReducedMotion` originalmente calculaba el
  valor en un `useEffect` (default `false` en el primer render) — eso dejaba una ventana de un tick en
  la que `MotionProvider` alcanzaba a instanciar Lenis incluso con `prefers-reduced-motion` activo,
  antes de que el efecto corrigiera el estado (un flash real, no solo cosmético). Se cambió a un lazy
  initializer de `useState` que calcula el valor de forma síncrona en el primer render del cliente
  (SSR-safe: `false` en el server, no afecta el markup). **Primitivas** (`Reveal`, `StaggerGroup`,
  `Parallax`, `SplitReveal`, `Marquee`): cada una llama `registerGsap()` (idempotente, guardado por un
  flag) dentro de su propio `useGSAP`, en vez de depender de que `MotionProvider` ya haya registrado
  los plugins — así son testeables de forma aislada (sin envolver en `MotionProvider` en cada test) y
  siguen funcionando si se usan fuera del árbol del provider. El estado inicial oculto siempre se
  aplica con `gsap.set` dentro de `useGSAP` (nunca CSS/markup) y se salta por completo bajo
  reduced-motion. `SplitReveal` revierte `SplitText` siempre en el cleanup (accesibilidad). `Parallax`
  usa `gsap.matchMedia("(min-width: 768px)")` para no correr en mobile. `useReducedMotion` degrada a
  `true` (no animar) si `matchMedia` no existe en el navegador. **Nota de testing:** jsdom no
  implementa `matchMedia` (mock global agregado a `vitest.setup.ts`, default `matches:false`,
  sobreescribible por test) ni afecta a `ScrollTrigger` (no usa `ResizeObserver`/`IntersectionObserver`,
  no hizo falta poliyfillearlos). Se encontró y corrigió un bug de testing (no de producción): usar
  `vi.restoreAllMocks()` en un `afterEach` borraba el `mockImplementation` de un mock de constructor
  (`Lenis`) después del primer test al no ser un spy real — cambiado a `mockClear()`. Verde:
  `tsc`/ESLint limpios, **64/64 unit**, `next build` OK.
- **2026-07-06** — **Stage 3 planificado** (brainstorming + plan en
  `docs/superpowers/plans/2026-07-06-stage-3-motion-engineering.md`). Hallazgo clave: el Figma **no
  tiene prototipo/motion** (`get_motion_context` sobre el Home `128:154` recursivo = `{"nodes":[]}`)
  → como con las subpáginas de Stage 2, **el agente diseña el motion** y el cliente valida
  visualmente. **4 decisiones tomadas con el cliente:** (1) alcance **Home a fondo + subpáginas
  livianas** (no "todo por igual"); (2) **smooth scroll con Lenis** (se desactiva bajo
  `prefers-reduced-motion`); (3) **transiciones de página elaboradas** (cortina/overlay — la pieza más
  frágil en App Router → fase 3d propia con spike + fallback instantáneo); (4) carácter
  **cinematográfico pero sobrio**. **Stack:** `gsap` (gratis desde 2025, incl. ScrollTrigger/SplitText)
  + `@gsap/react` (`useGSAP`) + `lenis`. **Arquitectura:** todo el motion aislado en `src/lib/motion/`
  (un `MotionProvider` cliente en el layout `(site)` inicializa Lenis+ScrollTrigger una vez; las
  secciones — hoy Server Components — se animan **envolviendo** su markup con primitivas cliente
  `Reveal`/`StaggerGroup`/`Parallax`/`SplitReveal`/`Marquee` que reciben `children`, sin reescribir ni
  romper el data-fetching). **Constraint firme:** toda animación respeta `prefers-reduced-motion`
  (baseline CSS global + guardas JS por primitiva; el estado inicial oculto se setea desde JS, nunca
  CSS → nada queda invisible si el JS falla). **Verificación del agente sin tests visuales** (`tsc`/
  ESLint/Vitest de primitivas+provider/`next build`); el feel lo valida el cliente. **Fases:** 3a
  fundación · 3b Home a fondo · 3c subpáginas livianas · 3d transiciones de página · 3e cierre.
- **2026-07-05** — **Pasada final de fidelidad del Home (feedback del cliente)** —
  `docs/superpowers/plans/2026-07-05-home-fidelity-polish.md`, 10 tasks. **ToggleLanguage**:
  reconstruido como switch real (`role="switch"` + `aria-checked`, `Navbar.tsx`/test/e2e
  actualizados) — 3 iteraciones según feedback directo del cliente: (1) mostraba ambos estados a
  la vez → se pasó a un solo thumb violeta con texto+bandera adentro; (2) ese thumb quedaba con el
  texto apretado → se agrandó a medidas fijas; (3) diseño final (con referencia visual del
  cliente): el thumb **es directamente el círculo de la bandera** (sin fondo violeta ni texto
  adentro) y se desliza del todo a la izquierda (EN, bandera UK) o a la derecha (FR, bandera
  francesa); el código "EN"/"FR" se lee aparte, del lado opuesto de la pista (track `rounded-full
  w-24 h-9`, thumb `size-7` circular, `translate-x-15`). **Navbar**: logo reescrito a lockup de 2 líneas
  bicolor ("Don Micka" violeta / "de la Vega" blanco, Syne ExtraBold) según nodo Figma `128:293`
  (antes: una sola línea blanca, no coincidía con el diseño); links + toggle agrupados en un mismo
  contenedor flex con gap uniforme a la derecha del logo. **Footer**: wordmark a 2 líneas bicolor
  sin tagline (clave `footer.tagline` removida de en/fr). **Bordes**: `BioBlock` (borde violeta 2px
  reemplaza blanco tenue) y `ContactCta` (nueva regla horizontal violeta 2px). **BioBlock**: tira de
  fotos con proporciones y offsets propios por foto (grow `307/210/212`, `mt-[61px]`/`mt-2`) en vez
  de `aspect-[3/4]` uniforme, replicando el Figma (`2413:248`) casi exacto. **CraftBlock**:
  tipografía a Syne Bold + acento `brand-violet-dark` en línea propia. **EditorialIntro**: título
  "Core Focus" a blanco (no violeta) + acentos en bloque de línea propia. **StarredAlbums**: título
  sacado del panel con fondo de líneas diagonales (antes quedaba tapado por el `absolute inset-0`).
  **Marquee**: texto a blanco (antes negro, invisible sobre el violeta). **Hero**: subtítulo a
  `brand-violet-dark` con marco doble (ring + padding, replicando el efecto de doble rectángulo del
  Figma); botones sin flecha (`iconRight={null}`). **Nueva convención**: el agente tiene prohibido
  correr tests visuales (chrome-devtools MCP, Playwright e2e en navegador) en este proyecto — el
  cliente valida visualmente por su cuenta; verificación del agente limitada a `tsc`/ESLint/Vitest/
  `next build` (ver Convenciones). Verde: `tsc`/ESLint limpios, **45/45 unit**, `next build` OK.
- **2026-06-30** — **Fase 2c de Stage 2 COMPLETA → Stage 2 cerrado** (rama `stage-2-site`). Admin CRUD custom + contacto. **Decisiones tomadas con el cliente:** (1) límite de archivo de PocketBase a **15MB** (ejecutado `set-file-limits.mjs`; el front sirve thumbs, el original pesado no afecta performance); (2) **Server Actions nativas + Zod** (sin react-hook-form). **Admin:** `requireAdminPb()` centraliza el guard de Stage 1; route group `(panel)` con sidebar + guard, login fuera. **CRUD config-driven** desde `collections.ts` (config declarativa de las 7 colecciones con tipos de campo) → genera sidebar, listas y forms con rutas dinámicas `[collection]/{,new,[id]}`. Validación Zod construida desde la config + extracción de FormData (localizados `_en`/`_fr`, bools, files); `saveRecord`/`deleteRecord` genéricas con upload + `revalidatePath("/", "layout")`. Componentes `admin/{Sidebar,FormField,FileInput,RecordForm,CollectionList,DeleteButton,MessageView}`. `contact_messages` = bandeja read-only (sin create/edit). **Contacto:** `submitContact` (Zod + honeypot → persiste en `contact_messages` + email Resend best-effort tras `RESEND_API_KEY`/`CONTACT_TO_EMAIL`/`CONTACT_FROM_EMAIL`; si faltan, solo persiste). `ContactForm` migrado a `useActionState` con la action real. **Nota de tooling:** `rtk next build` no persiste el `BUILD_ID` en este entorno → usar `npx next build` directo para builds reales (el resumen de rtk sí sirve para ver errores). Verde: `tsc` limpio, 44/44 unit, 15/15 e2e (incl. login admin + contacto end-to-end con cleanup), build OK. **Mejoras futuras (no bloquean):** upload múltiple + drag-reorder de fotos; WYSIWYG para campos `editor` (hoy textarea).
- **2026-06-30** — **Fase 2b de Stage 2 COMPLETA** (rama `stage-2-site`). Sitio público conectado al CMS real. **Data layer:** `fileUrl()` (URLs canónicas de PocketBase + `?thumb=`), `images.remotePatterns`, **queries tipadas resilientes** (try/catch → vacío para no romper SSG; las `listRule` ya filtran `published`) + `localized(record, field, locale)`. **Seed** `seed-content.mjs` (3 categorías, 5 álbumes/3 starred, 12 fotos, 3 reviews, 3 collabs, 3 site_content; ciclismo femenino EN/FR) ejecutado contra el PocketBase real. **Home** conectado (Starred albums + faves desde el CMS, con fallback a placeholders; ISR `revalidate=300`). **5 subpáginas** derivadas del design system: Portfolio (galería por categoría) + `/portfolio/[slug]` (`generateStaticParams` + metadata localizada + grid de fotos con caption-on-hover), About (`site_content`), Reviews (cards con avatar), Collabs (wordmarks + links), Contact (UI con estados; Server Action diferida a 2c). Componentes `src/components/site/{PageHeader,AlbumCard,PhotoGrid,ContactForm}`; 404/error localizados. **2 fixes clave:** (1) `createPocketBase()` desactiva `autoCancellation` — en SSG, `/en` y `/fr` renderizan en paralelo y las requests idénticas del SDK colisionaban y se cancelaban → fallback silencioso; (2) el `[]` de un build fallido quedaba en el **Data Cache** de Next → un `rm -rf .next` lo limpia (en Vercel cada deploy es build limpio, no se repite). **Imágenes:** 4 placeholders del Figma pesaban 8-11MB > límite default de 5MB de PocketBase; se optimizaron a <2MB (System.Drawing). Queda `set-file-limits.mjs` para subir el límite a 15MB en producción (requiere OK explícito del cliente — bloqueado por el clasificador por mutar el esquema). Verde: `tsc` limpio, 44/44 unit, 12/12 e2e, build OK; Home + 6 subpáginas validadas visualmente en EN.
- **2026-06-30** — **Pasada de fidelidad al Figma #2** (revisión de secciones del Home). **EditorialIntro**: las cajas de texto ahora llevan fondo gris + **borde izquierdo violeta** (la "Line 1" del Figma) y las imágenes van sin fondo (antes el gris cubría toda la sección). **Texto de acento violeta** en EditorialIntro (`introAccent`/`focusAccent`) y CraftBlock (`lightAccent`/`standardAccent`) — los strings i18n se separaron en parte normal + acento. **Marquee** inclinado ~-2° (barra violeta sobre negro, `w-[110%]` para cubrir bordes). **StarredAlbums** con fondo de líneas diagonales (`repeating-linear-gradient`) y labels de las cards alineados a la derecha (`ImageDescription` con caja `right-0` + `text-right`). Verde: tsc/ESLint, 25/25 unit, 9/9 e2e, build OK; validado vs nodos 2409:217/218/219 y 128:180.
- **2026-06-30** — **Pasada de fidelidad al Figma** (post-revisión de los frames Desktop/Mobile/Menu/UI Kit). (A) Agregados los 6 íconos de navegación vía `lucide-react` (home/business_center/person/reviews/supervisor_account/alternate_email → House/Briefcase/User/MessageSquareQuote/Users/AtSign) al navbar (izquierda) y al menú mobile (derecha). (B) Menú mobile alineado al frame Menu: toggle EN/FR dentro del overlay, item activo con fondo gris, y **fix del overlay translúcido** — el `backdrop-blur` del `<header>` creaba un containing-block para el `fixed`; el overlay se movió fuera del header. (C) Botones del hero a 58px (nuevo size `xl` en `Button`, con padding por tamaño). (D) Hero centrado en mobile (derecha en desktop) y `NothingBar` a 2 líneas prominente en mobile. Verde: tsc/ESLint limpios, 25/25 unit, 9/9 e2e, build OK; validado visualmente vs los frames del Figma.
- **2026-06-30** — **Fase 2a de Stage 2 COMPLETA** (rama `stage-2-site`, 8 tasks). Design system en código + UI Kit (`Button`, `MenuItem`, `ToggleLanguage` con banderas EN/FR en `/public/flags`, `ImageDescription`) + shell (`Navbar` con menú mobile Esc/scroll-lock + `Footer`) + **Home pixel-perfect** (Desktop+Mobile, estático/responsive, sin GSAP) con todas sus secciones (hero, bio, marquee, editorial, Starred albums, faves, craft, NothingBar, CTA) y placeholders de ciclismo extraídos del Figma (`/public/placeholders`). Tipografía del Figma (Syne 700/800, Inter 400/600); botones uppercase; i18n del Home real en en/fr. Helper `cn()`. Stub de `next-intl/navigation` ampliado a `Link`/hooks funcionales + mock de `next/image` para tests. Secciones del Home con datos por props (alineados con `Album`/`Photo`) para que 2b solo cambie la fuente. Resueltos 3 minor findings de Stage 1. Verde: `tsc`/ESLint limpios, 25/25 unit, 9/9 e2e, build OK; validado visualmente vs Figma en EN y FR.
- **2026-06-30** — **Stage 2 planificado** (brainstorming + plan en `docs/superpowers/plans/2026-06-30-stage-2-site-and-admin.md`). Hallazgo clave del Figma: **solo el Home está diseñado** (Desktop `128:154`, Mobile `3:6`) + UI Kit (`20:3`); las 5 subpáginas NO tienen mockup. Decisiones: (1) las subpáginas las diseña el agente derivándolas del design system; (2) contenido vía **seed propio** (el cliente carga lo real luego); (3) admin = **CRUD custom completo de las 7 colecciones**; (4) email de contacto detrás de env var (persiste igual si falta key); (5) orden **2a→2b→2c**; (6) motion 100% diferido a Stage 3. Design system exacto extraído del Figma (tipografía H1 Syne ExtraBold/800 45px — el layout hoy solo carga Syne 700/Inter 400; Task 1 suma 800/600). Stage 2 dividido en 3 fases internas; arranca por 2a (design system + shell + Home pixel-perfect estático/responsive).
- **2026-06-18** — **fix admin login cookie write/read mismatch + token expiry validation**: `loginAdmin` (actions.ts) pasó de usar `pb.authStore.exportToCookie()` (retornaba un string Set-Cookie completo, no JSON) a `JSON.stringify({ token, record })`. `page.tsx` ahora usa `parseAuthCookie` + `pb.authStore.save()` + `pb.authStore.isValid` para validar expiración JWT real. `AuthCookie.record` ampliado a `Record<string, unknown> & { id: string }` para compatibilidad con el tipo `RecordModel` del SDK. `playwright.config.ts` carga `.env.local` manualmente para que las variables POCKETBASE_ADMIN_* estén disponibles en los tests. Nuevo e2e de login exitoso añadido y verificado contra PocketBase real. `tsc` limpio; 11/11 unit tests PASS; build OK; 5/5 e2e PASS (nuevo test corre sin skip).
- **2026-06-18** — **fix route groups (site)/(admin)**: `src/app/[locale]/` movido a `src/app/(site)/[locale]/` y `src/app/admin/` movido a `src/app/(admin)/admin/`. Se creó `src/app/(admin)/admin/layout.tsx` como root layout con `<html lang="en"><body>` + Syne/Inter fonts + globals.css. Razón: sin un root layout propio, las rutas `/admin` lanzaban "Missing `<html>` and `<body>` tags". La solución "multiple root layouts via route groups" es el patrón oficial de Next.js para este caso. URLs no cambian. `tsc --noEmit` limpio; build OK; 4/4 e2e PASS; 11/11 unit tests PASS.
- **2026-06-18** — Brainstorming + diseño aprobado. Decisiones: backend PocketBase en VPS propio (no Supabase), panel admin custom en Next.js, imágenes en R2+CDN, i18n con rutas localizadas (default EN), contacto = email (Resend) + persistencia en CMS. Spec y plan de Stage 1 escritos.
- **2026-06-18** — Task 1: Scaffold completado. create-next-app@16.2.9 instala Tailwind v4 (CSS-based config); se mantiene `tailwind.config.ts` para tokens importables desde tests (compatible con `@config` directive de Tailwind v4). Vitest fijado en v2.x y jsdom en v24.x por restricción de Node 20.14 (rolldown de vitest 4.x requiere Node >=20.19). Build (Turbopack) y test unitario de tokens: PASS.
- **2026-06-18** — Task 6: pocketbase@0.27.0 instalado. `src/lib/pocketbase/client.ts` con `getPocketBaseUrl()` + `createPocketBase()`. `src/lib/pocketbase/types.ts` con 7 interfaces tipadas (Category, Album, Photo, Review, Collab, SiteContent, ContactMessage). SDK expone `baseURL` (uppercase) como propiedad canónica. 3/3 tests PASS. `tsc --noEmit` limpio.
- **2026-06-18** — Task 7: Admin login implementado. `src/lib/pocketbase/auth.ts` (parseAuthCookie, isValidAuth, ADMIN_COOKIE). Server Actions `loginAdmin`/`logoutAdmin` en `src/app/admin/actions.ts`. Login page con `useActionState` (React 19). Dashboard protegido con cookie check + redirect. 3/3 unit tests PASS (TDD). E2e redirect test PASS; credenciales inválidas test `test.skip` (requiere PocketBase Task 3). Build PASS.
- **2026-06-18** — Task 3 (usuario): PocketBase provisionado en `https://micka.lhstudio.com.ar` (subdominio real difiere del `micka-api...` planificado; refs actualizadas en docs, `.env.local.example` y test del data layer). `/api/health` OK.
- **2026-06-18** — Task 4: **cambio de arquitectura** — storage de imágenes pasa a **local en el VPS** (default de PocketBase) en vez de Cloudflare R2, para no requerir tarjeta. R2 queda como migración futura opcional. Spec y plan actualizados.
- **2026-06-18** — Task 2: next-intl@4.13.0 instalado. Routing bilíngüe `/en` (default) y `/fr` operativo. Root `layout.tsx`/`page.tsx` eliminados; reemplazados por `src/app/[locale]/layout.tsx` con Syne+Inter fonts. Middleware renombrado a `src/proxy.ts` (Next.js 16 depreca `middleware.ts`). Mock de `next-intl/navigation` en Vitest para entorno jsdom. Playwright configurado con `webServer` + `baseURL`. Unit test routing: PASS (TDD RED→GREEN). E2e locale: 2/2 PASS. Build: PASS.

## Documentos clave

- Spec / diseño: `docs/superpowers/specs/2026-06-18-micka-photography-portfolio-design.md`
- Planes: `docs/superpowers/plans/`
- Propuesta original: `Project Proposal Web Development - Micka.pdf`
- Provisión de PocketBase: `pocketbase/README.md` (se crea en Stage 1, Task 3)
