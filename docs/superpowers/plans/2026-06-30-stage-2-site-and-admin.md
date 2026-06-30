# Stage 2 — Site Build + Admin CRUD — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Fecha:** 2026-06-30
**Estado:** Planificado · arranca por Fase 2a (just-in-time: 2b/2c se detallan al llegar)
**Stage previo:** `docs/superpowers/plans/2026-06-18-stage-1-cms-architecture.md` (✅ completo, en `master`)
**Spec / diseño:** `docs/superpowers/specs/2026-06-18-micka-photography-portfolio-design.md`
**Figma:** https://www.figma.com/design/D1d7pqScYAAPmXHEqkW3Cm/Micka---Photography

**Goal:** Construir el sitio público bilingüe sobre la base de Stage 1: Home pixel-perfect (Desktop + Mobile), las 5 subpáginas conectadas a datos reales del CMS, y el panel admin custom con CRUD completo de las 7 colecciones + formulario de contacto. Sin motion GSAP (eso es Stage 3): el Home se construye estático, responsive, con estados hover en CSS.

**Architecture:** Componentes React (Server Components por defecto; Client solo donde haya interacción) que consumen el data layer tipado de Stage 1 (`src/lib/pocketbase`). El design system del Figma se traduce primero a tokens + componentes reutilizables (UI Kit), luego se ensambla el Home y las subpáginas. El admin usa Server Actions autenticadas contra PocketBase (cookie de sesión de Stage 1) para CRUD + upload de archivos. Contenido de prueba vía script de seed propio.

---

## Decisiones de brainstorming (2026-06-30)

- **Subpáginas:** no tienen mockup en Figma (solo el Home). Se **diseñan derivándolas del design system** del Home + UI Kit (mismos tokens, navbar, footer, componentes). El cliente aprueba.
- **Contenido:** **seed de prueba propio** (datos + imágenes placeholder temáticas de ciclismo). El cliente carga lo real después vía el admin.
- **Admin:** **CRUD custom completo de las 7 colecciones** (incluye upload de imágenes; sin depender del panel nativo `/_/`).
- **Email contacto:** lógica preparada, envío real detrás de una env var. Si falta la API key, el mensaje se **persiste igual** en `contact_messages`. Resend/SMTP se conecta luego.
- **Orden de fases:** 2a → 2b → 2c (Home primero, admin al final).
- **Motion:** diferido entero a Stage 3.

---

## Design system (valores exactos del Figma)

Colores (ya en `tailwind.config.ts` como `brand.*`):
`Black #000000` · `White #ffffff` · `Violet #a020f0` · `Darker Violet #8315c8` · `Gray #202020` · `Gray background #212121` · `Light Gray #373636`.

Tipografía (Figma variables — **define la escala a crear en Task 1**):

| Token | Familia | Weight | Size | Line-height |
|---|---|---|---|---|
| H1 | Syne | ExtraBold (800) | 45 | 45 (1.0) |
| H2 | Syne | Bold (700) | 30 | 30 (1.0) |
| Card Title | Syne | Bold (700) | 20 | 20 (1.0) |
| H3 | Syne | Bold (700) | 16 | 100% |
| H4 | Syne | Bold (700) | 14 | 100% |
| Body | Inter | Regular (400) | 14 | 100% |
| Body Semibold | Inter | SemiBold (600) | 14 | 100% |

> ⚠️ El `[locale]/layout.tsx` actual carga **Syne 700** e **Inter (default)**. Hay que sumar **Syne 800** e **Inter 600**.

Sombra de botones: `Buttons Shadow` = drop-shadow `#00000040`, offset `(0,4)`, radius `4` → ya existe como `shadow-button` (`0 4px 4px 0 #00000040`).

Nodos Figma de referencia:
- **Home Desktop:** `128:154` (1440×3917) — usar **este**, no `3:7` ("Desktop - old version").
- **Home Mobile:** `3:6` (393×3688).
- **UI Kit:** `20:3` — Button (`20:119`), Image+Description (`20:82`), Menu Item (`43:349`), Toggle Language (`72:164`).
- **Menú mobile (overlay):** symbol `Menu` `43:377`.

**Cómo trabajar cada pieza visual:** antes de implementar un componente/sección, sacar su `get_design_context` por nodeId (medidas, colores, paddings exactos) y un `get_screenshot` de referencia. El metadata ya está mapeado en el brainstorming; el detalle fino se obtiene just-in-time por task.

---

## Global Constraints (heredados de Stage 1 + nuevos)

- App Router; TypeScript estricto. Server Components por defecto; `"use client"` solo con interacción/estado.
- **Todo acceso a PocketBase pasa por `src/lib/pocketbase`** (ningún componente importa el SDK directo).
- i18n next-intl; locales `en` (default) y `fr`. Todo texto visible sale de `src/messages/*.json` (UI) o de campos `_en`/`_fr` del CMS (contenido).
- Imágenes del CMS se sirven desde `https://micka.lhstudio.com.ar/api/files/...` → agregar a `images.remotePatterns` (Fase 2b).
- **Sin GSAP en Stage 2.** Hover/focus states en CSS sí; animaciones de entrada/scroll en Stage 3. Respetar `prefers-reduced-motion` desde ya en cualquier transición CSS.
- TDD bite-sized; un commit por task como mínimo. Prefijar comandos con `rtk`.
- Estructura de carpetas nueva: `src/components/{ui,layout,home,site,admin}/`.
- Cerrar cada fase actualizando `CLAUDE.md` (estado + changelog) y marcando tasks `- [x]` en este plan.

---

## Mapa de fases

| Fase | Foco | Entregable verificable |
|---|---|---|
| **2a** | Design system en código + shell + Home pixel-perfect (estático, responsive) | Home `/en` y `/fr` idéntico al Figma en Desktop y Mobile, con datos placeholder |
| **2b** | Seed + queries tipadas + las 5 subpáginas con datos reales del CMS | Portfolio (+detalle), About, Reviews, Collabs, Contact navegables con datos de PocketBase |
| **2c** | Admin CRUD custom de las 7 colecciones + formulario de contacto (persist + email diferido) | Micka puede gestionar todo el contenido desde `/admin`; contacto persiste y (cuando haya key) envía email |

---

# FASE 2a — Design system + shell + Home pixel-perfect

> **✅ COMPLETA (2026-06-30).** Las 8 tasks implementadas y commiteadas en `stage-2-site`. Verde: `tsc`/ESLint limpios, 25/25 unit, 9/9 e2e, `next build` OK; Home Desktop+Mobile validado vs Figma en EN y FR. Desvío menor: el menú mobile quedó consolidado dentro de `Navbar.tsx` (no en un `MobileMenu.tsx` aparte). Nav desktop sin íconos por item (el `MenuItem` los soporta opcionalmente).

**Salida de fase:** Home completo y responsive en ambos locales, ensamblado con componentes del UI Kit y el shell (navbar/footer). Datos de las secciones dinámicas (Starred albums, My faves) con placeholders locales — la conexión al CMS es 2b.

## Task 1: Fundamentos del design system (tipografía + tokens + fuentes)

**Files:**
- Modify: `tailwind.config.ts` (escala tipográfica `fontSize`), `src/app/globals.css` (si usa `@theme`), `src/app/(site)/[locale]/layout.tsx` y `src/app/(admin)/admin/layout.tsx` (weights de fuentes).
- Test: `src/lib/__tests__/tokens.test.ts` (extender).

**Interfaces:**
- Consumes: tokens `brand.*` existentes.
- Produces: utilidades `text-h1…text-h4`, `text-card`, `text-body`, `text-body-semibold` con size+line-height del Figma; fuentes Syne `700`+`800` e Inter `400`+`600` cargadas; `font-display`/`font-body` ya existen.

- [ ] **Step 1:** Extender `tokens.test.ts` (RED): aserta que `tailwindConfig.theme.extend.fontSize` define `h1` (45px) y `card` (20px) con su line-height, y que `brand['gray-bg']` sigue siendo `#212121`.
- [ ] **Step 2:** Agregar la escala `fontSize` a `tailwind.config.ts` con los 7 tokens de la tabla (size + lineHeight). GREEN.
- [ ] **Step 3:** En ambos layouts, cargar `Syne({ weight: ["700","800"] })` e `Inter({ weight: ["400","600"] })`. Verificar `next build`.
- [ ] **Step 4:** `rtk vitest run src/lib/__tests__/tokens.test.ts` (PASS) + `rtk next build` (OK). Commit: `feat: add Figma typographic scale and load required font weights`.

## Task 2: Componente `Button` (UI Kit)

**Files:**
- Create: `src/components/ui/Button.tsx`, `src/components/ui/__tests__/Button.test.tsx`.

**Figma:** `20:119` (Default/Hover × Large/Small). Fondo violeta, texto blanco, `shadow-button`, radio redondeado; Hover → `Darker Violet`. Sacar `get_design_context` para padding/radio/size exactos.

**Interfaces:**
- Produces: `<Button size="lg"|"sm" variant="solid"|... href?>` — renderiza `<a>` (con `Link` localizado) si hay `href`, si no `<button>`. Estados hover/focus en CSS, accesible (focus-visible).

- [ ] **Step 1:** Test (RED): renderiza texto, aplica clase de tamaño, usa `Link` cuando hay `href`.
- [ ] **Step 2:** Implementar `Button` (variantes con un mapa de clases). GREEN.
- [ ] **Step 3:** `rtk vitest run` PASS. Commit: `feat: add Button UI component from Figma UI Kit`.

## Task 3: Componentes `MenuItem`, `ToggleLanguage`, `ImageDescription` (UI Kit)

**Files:**
- Create: `src/components/ui/MenuItem.tsx`, `ToggleLanguage.tsx`, `ImageDescription.tsx` (+ tests).

**Figma:** Menu Item `43:349` (Mobile/Desktop + Hover), Toggle Language `72:164` (EN/FR), Image+Description `20:82`.

**Interfaces:**
- `MenuItem`: `{ href; label; active? }` con hover/underline; usa `Link` localizado + `usePathname` para `active`.
- `ToggleLanguage`: client component; cambia locale **preservando la ruta actual** vía `usePathname`/`useRouter` de `@/lib/i18n/routing`. Marca el locale activo.
- `ImageDescription`: `{ src; alt; title; description }` — imagen con overlay de descripción (usado en Starred albums). Acepta `next/image`.

- [ ] **Step 1:** Tests (RED) por componente: `ToggleLanguage` arma el href del otro locale conservando el path; `MenuItem` marca `active`; `ImageDescription` renderiza title+alt.
- [ ] **Step 2:** Implementar los 3. GREEN. (Mockear `next-intl/navigation` ya está en `src/__mocks__`.)
- [ ] **Step 3:** `rtk vitest run` PASS. Commit: `feat: add MenuItem, ToggleLanguage and ImageDescription UI components`.

## Task 4: Shell — `Navbar` (desktop + mobile menu) + `Footer`

**Files:**
- Create: `src/components/layout/Navbar.tsx`, `MobileMenu.tsx`, `Footer.tsx`.
- Modify: `src/app/(site)/[locale]/layout.tsx` (montar Navbar + Footer alrededor de `children`).
- Test: `tests/e2e/navigation.spec.ts`.

**Figma:** Navbar desktop en `128:154` (logo `DON MICKA DE LA VEGA`, `Frame 5` con 6 Menu Items, Toggle Language). Mobile en `3:6` (logo + hamburger `43:231`, overlay symbol `Menu` `43:377`). Footer `128:217` / mobile `69:136`.

**Interfaces:**
- `Navbar`: server component que arma los 6 links (Home, Portfolio, About, Reviews, Collabs, Contact) desde rutas localizadas; incrusta `ToggleLanguage`. En mobile delega a `MobileMenu` (client, maneja open/close + `aria-expanded`, cierra con Esc, bloquea scroll).
- `Footer`: links + wordmark.
- Labels de nav desde `messages` namespace `nav`.

- [ ] **Step 1:** Definir el namespace `nav` en `en.json`/`fr.json` (6 labels) — placeholders EN reales; FR traducido.
- [ ] **Step 2:** Implementar `Navbar` + `Footer` (desktop) y montarlos en el layout `(site)`.
- [ ] **Step 3:** Implementar `MobileMenu` (hamburger → overlay full-screen con los links + toggle idioma).
- [ ] **Step 4:** e2e `navigation.spec.ts`: desde `/en` los links del navbar navegan; el mobile menu abre/cierra (viewport mobile). 
- [ ] **Step 5:** `rtk playwright test tests/e2e/navigation.spec.ts` PASS + `rtk next build`. Commit: `feat: add site shell (navbar with mobile menu + footer)`.

## Task 5: Home — Hero + bloque bio + marquee

**Files:**
- Create: `src/components/home/Hero.tsx`, `BioBlock.tsx`, `Marquee.tsx`.
- Modify: `src/app/(site)/[locale]/page.tsx` (empezar a componer el Home).

**Figma (128:154 / 3:6):** Hero = `Rectangle 7` (imagen) + `Blur` + título H1 `DON MICKA DE LA VEGA` + pill `One eye. One Vision. Zero Limits` + 2 botones. Bio = `Rectangle 13` (imagen) + `Don Micka de la Vega` / `Performance Photography` + `Women's Cycling — Aesthetics & Intensity` + imágenes `Rectangle 14/15`. Marquee = `Frame 3` (`Capturing power | Structuring movement | Elevating the image of sport.` repetido).

**Interfaces:**
- Secciones como server components; textos desde `messages` namespace `home.hero` / `home.bio`. Imágenes con placeholders locales (`/public/placeholders/...`) hasta 2b. Marquee: cinta de texto repetida estática (sin animación; GSAP en Stage 3) con `aria-hidden` en las copias.

- [ ] **Step 1:** Sacar `get_design_context` de hero/bio/marquee (desktop y mobile) para medidas exactas.
- [ ] **Step 2:** Agregar textos a `home.hero`/`home.bio` (en/fr) y placeholders a `/public`.
- [ ] **Step 3:** Implementar `Hero`, `BioBlock`, `Marquee` responsive (desktop ↔ mobile) y componerlos en `page.tsx`.
- [ ] **Step 4:** Verificación visual vs. Figma (`get_screenshot` lado a lado) + `next build`. Commit: `feat: build Home hero, bio block and marquee (responsive)`.

## Task 6: Home — bloques editoriales + Starred albums + My faves

**Files:**
- Create: `src/components/home/EditorialIntro.tsx`, `StarredAlbums.tsx`, `FavesGallery.tsx`.
- Modify: `page.tsx`.

**Figma:** bloques `Specializing in women's cycling…` + `Core Focus` (`Group 3`). `Starred albums` (`128:193`) = 3× Image+Description (`128:195/198/201`) + Button. `My faves of all time` (`135:218`) = galería de rectángulos de imagen (`135:217…222`).

**Interfaces:**
- `StarredAlbums` y `FavesGallery` reciben sus items por **props** con una interfaz que en 2b se llenará desde el CMS (`Album[]` / `Photo[]`); en 2a se pasan **placeholders locales** tipados igual. Mantener la firma estable para no reescribir en 2b.
- Botón "ver portfolio" → ruta localizada `/portfolio`.

- [ ] **Step 1:** `get_design_context` de las 3 sub-secciones (grilla, gaps, aspect ratios).
- [ ] **Step 2:** Definir las props (`StarredAlbumsProps`, `FavesGalleryProps`) alineadas con `Album`/`Photo` de `types.ts`.
- [ ] **Step 3:** Implementar las 3 secciones + datos placeholder; componer en `page.tsx`.
- [ ] **Step 4:** Verificación visual + `next build`. Commit: `feat: build Home editorial blocks, starred albums and faves gallery`.

## Task 7: Home — "Nothing is left to chance" + CTA final

**Files:**
- Create: `src/components/home/NothingLeftToChance.tsx`, `ContactCta.tsx`.
- Modify: `page.tsx`.

**Figma:** sección `Nothing is left to chance` (`128:205`) con 2 imágenes (`Rectangle 18/19`) + textos (`Light shapes the body…`, `This visual standard…`). CTA `Brands. Teams. Athletes.` (`128:213`) + `Looking for imagery that matches your level of ambition?` + Button → `/contact`.

- [ ] **Step 1:** `get_design_context` de ambas secciones.
- [ ] **Step 2:** Textos a `home.craft` / `home.cta` (en/fr).
- [ ] **Step 3:** Implementar las 2 secciones + componer; cerrar el ensamblado completo del Home.
- [ ] **Step 4:** Verificación visual + `next build`. Commit: `feat: build Home 'nothing left to chance' section and final CTA`.

## Task 8: Cierre de Home — responsive QA + i18n + verificación de fase

**Files:**
- Modify: `page.tsx`, componentes (ajustes responsive), `en.json`/`fr.json` (revisión completa).
- Test: `tests/e2e/home.spec.ts`.

- [ ] **Step 1:** Pasada responsive Desktop (1440) ↔ Mobile (393) sección por sección contra Figma; ajustar breakpoints.
- [ ] **Step 2:** Revisar que **ningún texto del Home esté hardcodeado** (todo vía `messages`); completar `fr.json`.
- [ ] **Step 3:** e2e `home.spec.ts`: `/en` y `/fr` renderizan las secciones clave (hero, starred, cta, footer); el toggle de idioma cambia el contenido.
- [ ] **Step 4:** Verificación integral: `rtk tsc --noEmit` limpio · `rtk vitest run` (todos PASS) · `rtk playwright test` (todos PASS) · `rtk next build` OK.
- [ ] **Step 5:** Actualizar `CLAUDE.md` (estado + changelog "Fase 2a completa"). Commit: `feat: finalize pixel-perfect Home (responsive, i18n, e2e)`.

---

# FASE 2b — Datos del CMS + las 5 subpáginas

> **✅ COMPLETA (2026-06-30).** Sitio público conectado al PocketBase real. Verde: `tsc` limpio, 44/44 unit, 12/12 e2e, `next build` OK; Home + 6 subpáginas validadas visualmente en EN. Detalle en el changelog del `CLAUDE.md`. Subpáginas diseñadas derivándolas del design system y aprobadas por el cliente vía screenshots ("Avanzá y mostrame").

**Tasks (todas hechas):**
- [x] 1. Seed `seed-content.mjs` (ejecutado) · [x] 2. `fileUrl()` + `remotePatterns` · [x] 3. Queries tipadas + tests · [x] 4. Home conectado · [x] 5. Portfolio + detalle · [x] 6. About/Reviews/Collabs · [x] 7. Contact (UI; action → 2c) · [x] 8. 404/error localizados + verificación.

**Tasks previstas (referencia original):**
1. **Seed script** (`pocketbase/seed-content.mjs`): categorías, álbumes (con `starred`), fotos, reviews, collabs, `site_content`, con imágenes placeholder temáticas subidas vía SDK autenticado. Idempotente (mismo patrón que `seed-collections.mjs`).
2. **`images.remotePatterns`** → `micka.lhstudio.com.ar` en `next.config.ts` + helper `fileUrl(record, filename)` en `src/lib/pocketbase`.
3. **Queries tipadas** (`src/lib/pocketbase/queries.ts`): `getStarredAlbums`, `getCategories`, `getAlbums`, `getAlbumBySlug`, `getPhotosByAlbum`, `getReviews`, `getCollabs`, `getSiteContent` — con tests unit (mock del SDK) y filtro `published`. Helper de localización `localized(record, field, locale)`.
4. **Conectar el Home** a datos reales (Starred albums, My faves, textos `site_content`) reemplazando placeholders de 2a (las firmas de props ya quedaron alineadas).
5. **Portfolio** `/[locale]/portfolio` (galería por categorías/álbumes) + **detalle** `/[locale]/portfolio/[slug]` (grilla de fotos, lazy-load) con `generateStaticParams` + metadata localizada.
6. **About**, **Reviews**, **Collabs** — diseñadas sobre el design system, consumiendo el CMS.
7. **Contact** (UI del formulario; la Server Action de envío es 2c) + estados de error/success.
8. **404/500 localizadas** + verificación de fase (tsc/unit/e2e/build) + update `CLAUDE.md`.

**Decisión de diseño abierta (resolver al inicio de 2b):** layout de cada subpágina. Se proponen mockups derivados del Home/UI Kit y se valida con el cliente antes de pulir.

---

# FASE 2c — Admin CRUD custom (7 colecciones) + contacto

> **✅ COMPLETA (2026-06-30) → STAGE 2 CERRADO.** Admin CRUD config-driven de las 7 colecciones + contacto funcional. Decisiones del cliente: límite de archivo 15MB; Server Actions nativas + Zod (sin react-hook-form). Verde: `tsc` limpio, 44/44 unit, 15/15 e2e, `next build` OK. Detalle en el changelog del `CLAUDE.md`. Mejoras futuras no bloqueantes: upload múltiple + drag-reorder de fotos, WYSIWYG para campos editor.

**Tasks (todas hechas):**
- [x] 1. Admin shell + guard (`requireAdminPb`, route group `(panel)` + sidebar) · [x] 2. Mutaciones genéricas (`saveRecord`/`deleteRecord` + revalidación) · [x] 3. Forms Zod + config (`collections.ts`, `form.ts`) · [x] 4. Upload de imágenes con preview · [x] 5. CRUD de las 7 colecciones (config-driven; `contact_messages` read-only) · [x] 6. Contacto público (`submitContact`: Zod + honeypot + persist + Resend tras env var) · [x] 7. e2e admin + contacto · [x] 8. Verificación + `CLAUDE.md`.

**Tasks previstas (referencia original):**
1. **Admin shell**: layout del panel (sidebar/nav de colecciones), reutilizando la sesión + guard de Stage 1. Cliente PB autenticado server-side desde la cookie (`src/lib/pocketbase/admin.ts`).
2. **Capa de mutaciones** genérica: Server Actions `createRecord/updateRecord/deleteRecord/uploadFile` por colección, con revalidación (`revalidatePath`/tags) del front público.
3. **Forms** con `react-hook-form` + `zod` (schemas compartidos): campos `_en`/`_fr`, relaciones (`category`, `album`), toggles (`published`, `starred`), `order`.
4. **Upload de imágenes** (cover, photos, avatar, logo) vía SDK con preview y validación de tipo/peso.
5. **CRUD por colección** (las 7): `categories`, `albums`, `photos` (con upload múltiple + reorder), `reviews`, `collabs`, `site_content`, `contact_messages` (bandeja: list/view/marcar/borrar — sin create).
6. **Formulario de contacto público** (Server Action): validación Zod → persiste en `contact_messages`; **email detrás de env var** (Resend) con fallback a solo-persistencia si falta la key. Anti-spam básico (honeypot).
7. **e2e admin**: login → crear álbum → aparece en el front; enviar contacto → aparece en la bandeja.
8. Verificación de fase + update `CLAUDE.md` + cierre de Stage 2.

---

## Self-Review

**Spec coverage (Stage 2):**
- Home pixel-perfect Desktop & Mobile → Fase 2a ✓
- 5 subpáginas con el design system → Fase 2b ✓ (diseñadas, no en Figma)
- Interconexión con datos del CMS → Fase 2b ✓
- Panel admin custom con CRUD → Fase 2c ✓ (custom completo, 7 colecciones)
- Formulario de contacto (email + persistencia) → Fase 2c ✓ (email diferido tras env var)

**Diferido a Stage 3+ (no en este plan):** motion GSAP (entrance/scroll/marquee animado), optimización fina de imágenes/SEO técnico final/deploy (Stage 4).

**Riesgos / cosas a vigilar:**
- Las subpáginas no tienen Figma → validar diseño con el cliente al inicio de 2b para evitar retrabajo.
- Upload de archivos desde Server Actions a PocketBase autenticado: confirmar manejo de `FormData`/multipart y límites (Caddy no limita body → OK).
- Mantener estables las firmas de props de las secciones del Home (2a) para que 2b solo cambie la fuente de datos.
- Minor findings de Stage 1 a resolver de paso en 2a: `as any` en `tokens.test.ts` e `i18n/request.ts`; `setRequestLocale` por página; a11y de botones del admin.
