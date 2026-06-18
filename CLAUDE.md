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
| 2 | 2 | Layout Home + 5 subpáginas + admin CRUD + contacto | _pendiente de planificar_ |
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
- **Pendiente del usuario (no bloquea código):** confirmar en el panel que "Use S3 storage" está OFF y que el reverse proxy permite uploads grandes (`client_max_body_size 50M`).
- **Próximo:** integrar la rama (`finishing-a-development-branch`) y, con aprobación del cliente, planificar **Stage 2** (Home pixel-perfect + 5 subpáginas + admin CRUD + formulario de contacto). Minor findings diferidos a Stage 2 en el ledger (`.git/sdd/progress.md`) y abajo.

### Minor findings diferidos a Stage 2 (del review final)
- `as any` en `tokens.test.ts` y `i18n/request.ts:6` (usar `(typeof routing.locales)[number]`).
- `fr.json` == `en.json` (traducciones reales en Stage 2).
- `(site)/[locale]/page.tsx`: `useTranslations` sin `setRequestLocale` propio (riesgo cuando haya más páginas).
- a11y: `aria-label` en botones del admin (tienen texto visible; pasada de a11y en Stage 2).
- `pb_schema.json` es **input del seeder**, no un export fiel de PocketBase (no re-importable por el panel). Documentado.
- Agregar `micka.lhstudio.com.ar` a `images.remotePatterns` cuando el front consuma imágenes del CMS.

## Decisiones y cambios (changelog)

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
