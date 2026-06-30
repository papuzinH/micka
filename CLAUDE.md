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
| 3 | 3 | Motion Engineering (GSAP) | _pendiente de planificar_ |
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
- **Próximo:** Fase 2b (seed + queries tipadas + las 5 subpáginas con datos del CMS), luego 2c (admin CRUD + contacto). Plan: `docs/superpowers/plans/2026-06-30-stage-2-site-and-admin.md`.

### Minor findings diferidos a Stage 2 (del review final)
- ✅ `as any` en `tokens.test.ts` y `i18n/request.ts:6` → resueltos en Fase 2a (tipos concretos + `(typeof routing.locales)[number]`).
- ✅ `(site)/[locale]/page.tsx` con `setRequestLocale` propio → resuelto en Fase 2a (el Home ahora es SSG).
- ⏳ `fr.json` == `en.json` → el Home ya está traducido (en/fr reales); subpáginas/CMS en Fase 2b.
- ⏳ a11y `aria-label` en botones del admin → pendiente (admin en Fase 2c).
- `pb_schema.json` es **input del seeder**, no un export fiel de PocketBase (no re-importable por el panel). Documentado.
- ⏳ Agregar `micka.lhstudio.com.ar` a `images.remotePatterns` → Fase 2b (cuando el front consuma imágenes del CMS).

## Decisiones y cambios (changelog)

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
