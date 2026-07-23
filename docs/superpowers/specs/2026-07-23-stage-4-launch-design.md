# Stage 4 — Optimización, testing, SEO y lanzamiento (diseño)

> Spec del stage de cierre del proyecto Micka Photography Portfolio. Deriva del spec maestro
> (`2026-06-18-micka-photography-portfolio-design.md`, sección "Stage 4") y de las decisiones
> tomadas con Lauti el 2026-07-23. El plan de implementación se escribe aparte
> (`docs/superpowers/plans/`), just-in-time.

## Contexto

Stages 1–3 están completos, mergeados a `master` y en producción (`https://micka-plum.vercel.app`).
El feedback del cliente fue muy positivo y sus 3 pedidos (branding, acceso admin, textos FR) están
resueltos o encaminados. Stage 4 es el cierre contractual de la propuesta: optimización, testing,
SEO técnico y deploy al dominio propio del cliente.

**Estado real del código al arrancar (verificado 2026-07-23):**

- Hay `generateMetadata` con title/description localizados en las 5 subpáginas, pero **no** hay
  `metadataBase`, canonicals, hreflang, Open Graph, sitemap, robots ni JSON-LD.
- El favicon es el default del scaffold de create-next-app (`src/app/favicon.ico`) y quedaron los
  SVGs de ejemplo de Next en `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`,
  `window.svg`).
- `next/image` ya se usa en todo el sitio (lazy-loading default), con `remotePatterns` para
  PocketBase; falta afinar `sizes`/`priority` y auditar qué thumb pide cada contexto.
- Testing: 81 unit (Vitest) + 15 e2e (Playwright). No hay CI: los checks se corren a mano.
- El dominio propio del cliente **no existe todavía**: Lauti le va a proponer candidatos a Micka
  para que él lo compre. Nada del stage puede bloquearse por eso.

## Decisiones de alcance (2026-07-23)

1. **Dominio como variable pendiente.** Todo lo que depende de la URL pública se parametriza con
   `NEXT_PUBLIC_SITE_URL` (fallback: `https://micka-plum.vercel.app`). Cuando Micka compre el
   dominio, el switch es DNS + env var en Vercel + redeploy — cero código. La propuesta de
   dominios y el runbook de activación son entregables del stage; la activación en sí queda
   condicionada al cliente.
2. **Testing = CI en GitHub Actions + e2e ampliado.** El agente sigue sin correr e2e/browser
   (convención del proyecto): los e2e los ejecuta el CI y/o Lauti localmente.
3. **Extras de cierre: Vercel Analytics + guía de uso del admin.** Ambos aprobados por Lauti.
4. **Guía del admin en dos formatos con una sola fuente:** página estática `/admin/help` (inglés)
   con CSS imprimible; el PDF de cortesía sale de esa misma página vía imprimir → PDF.
5. **Ejecución: una rama `stage-4-launch` con fases secuenciales 4a→4d** (mismo modelo que
   Stages 2 y 3), validación del cliente/Lauti contra el preview de Vercel de la rama, merge
   fast-forward a `master` al cierre.

## Arquitectura general

- Rama `stage-4-launch` desde `master`. Commits chicos, un commit por task como mínimo.
- Cada fase termina en verde: `npx tsc --noEmit` + ESLint + unit + `npx next build`.
- Nueva env var **`NEXT_PUBLIC_SITE_URL`** (en `.env.local.example`, Vercel y CI). Un solo helper
  la lee y aplica el fallback; nadie más hardcodea URLs públicas.
- El trabajo de SEO se concentra en helpers testeables (metadata/alternates, JSON-LD, sitemap)
  para que la lógica tenga unit tests y las páginas solo los consuman.

## Fase 4a — SEO técnico

- **`metadataBase` + canonicals + hreflang**: helper común que, dado un pathname y el locale,
  genera `alternates` (canonical + `languages` en/fr) — aplicado a las 6 páginas del sitio
  (Home + 5 subpáginas) y al detalle de álbum.
- **Open Graph / Twitter cards**: og-image estática 1200×630 con branding (wordmark "Don Micka
  de la Vega" sobre foto de ciclismo; la diseña el agente, la valida el cliente/Lauti como todo
  lo visual), `og:locale` por idioma, descripción localizada. Twitter `summary_large_image`.
- **`sitemap.ts`** (App Router): rutas estáticas por locale + `/portfolio/[slug]` dinámicos desde
  PocketBase, cada entrada con sus alternates hreflang. Resiliente: si PocketBase no responde,
  emite solo las estáticas (mismo patrón try/catch → vacío del data layer).
- **`robots.ts`**: allow general, `Disallow: /admin`, referencia al sitemap. Además, el layout del
  admin declara `robots: noindex` explícito.
- **JSON-LD** en el Home: `Person` (el fotógrafo) + `WebSite`, generados por helper puro
  (testeable, omite campos sin datos, nunca rompe el render).
- **Iconografía**: favicon + app icons con el branding (reemplaza el default del scaffold);
  limpieza de los SVGs de ejemplo de `public/`.

## Fase 4b — Performance de imágenes

Auditoría puntual de todos los usos de `next/image` del sitio:

- `sizes` correcto por contexto (hero full-width, grids de 2–3 columnas, cards, retrato del bio).
- `priority` en la imagen LCP del hero del Home (y evaluar el header de detalle de álbum).
- Verificar que cada contexto pida el **thumb** de PocketBase adecuado vía `fileUrl()` y no el
  original (que puede pesar hasta 15MB).
- Sin cambios estructurales: `next/image` ya lazy-loadea; esto es afinación. La medición
  (Lighthouse/PageSpeed) la corre Lauti sobre el preview — el agente no corre browser.

## Fase 4c — Testing + CI

- **Workflow de GitHub Actions** (`.github/workflows/ci.yml`) en push/PR a `master`:
  - Job "checks" (siempre): `tsc --noEmit`, ESLint, `vitest run`, `next build`.
  - Job "e2e" (Playwright, chromium): necesita los secrets `POCKETBASE_*` cargados en GitHub
    (task manual de Lauti, un minuto; el plan lista los nombres exactos). Si los secrets no
    están, el job se salta con aviso en el summary — no rompe el CI (el stage no queda
    bloqueado por la carga de secrets).
- **E2e nuevos** (los corre CI/Lauti, nunca el agente): sitemap y robots responden 200 con el
  contenido esperado; hreflang presente en el HTML de Home y una subpágina; smoke de navegación
  completa del sitio en ambos locales (con `reducedMotion: "reduce"` ya configurado, la cortina
  no interfiere). Los flujos clave de negocio (contacto end-to-end, admin login) ya existen.
- **Unit nuevos** (TDD): helpers de alternates/metadata, JSON-LD y generación de sitemap.

## Fase 4d — Extras y cierre

- **Vercel Analytics**: `@vercel/analytics` montado solo en el layout `(site)` (el admin no
  se mide). Sin configuración extra — el plan hobby lo incluye.
- **`/admin/help`**: página estática del route group `(panel)` (sidebar la linkea), en inglés.
  Contenido: login y cambio de contraseña, cargar álbumes y fotos (orden por campo numérico,
  starred), reviews, collabs, qué textos edita él (`site_content`: about_intro/about_body/
  contact_intro) vs. cuáles son estáticos (los manda y los aplica Lauti), bandeja de mensajes de
  contacto, y tips de imágenes (formato/peso, límite 15MB). CSS `@media print` para que
  imprimir → PDF genere la guía de cortesía desde la misma fuente.
- **Dominio** (entregables no-código): lista de 2–3 candidatos con disponibilidad para que Lauti
  se la pase a Micka + runbook de activación (alta en Vercel, DNS, `NEXT_PUBLIC_SITE_URL`,
  redeploy, verificación de canonicals/sitemap) listo para ejecutar cuando el cliente compre.
- **Docs**: actualizar `CLAUDE.md` (Estado actual + changelog), spec maestro (sección Stage 4 →
  puntero a este spec) y Status del vault al cierre.

## Manejo de errores

- Sitemap y JSON-LD degradan silenciosamente si falta data de PocketBase (nunca rompen build ni
  render) — mismo criterio de resiliencia que las queries del data layer.
- El job e2e del CI no bloquea si faltan secrets (skip con aviso), pero el job "checks" es
  siempre obligatorio.

## Fuera de alcance

- Compra y activación del dominio (condicionado a Micka; runbook queda listo).
- Migración de imágenes a R2/CDN (sigue descartada salvo que crezca el tráfico).
- Upload múltiple / drag-reorder de fotos y WYSIWYG del admin (mejoras futuras ya documentadas).
- Cualquier medición o validación visual/browser por parte del agente (convención del proyecto).

## Criterios de cierre del stage

1. Verde completo: `tsc` + ESLint + unit (todos) + `next build`.
2. CI corriendo en GitHub con el job "checks" obligatorio (y e2e activo si los secrets están).
3. Validación visual de Lauti/cliente sobre el preview de Vercel (og-cards chequeadas con un
   validador externo — links en el plan).
4. `/admin/help` publicada y PDF generado.
5. Analytics reportando datos en el dashboard de Vercel.
6. Propuesta de dominios enviada a Micka + runbook de activación escrito.
7. Docs y vault actualizados. Merge ff a `master` + deploy READY.

## Riesgos

- **hreflang/canonicals con next-intl**: la combinación App Router + next-intl tiene sus mañas
  (rutas localizadas, default locale sin prefijo redirigido). Mitigación: helper único testeado
  por unit tests y verificación e2e del HTML final.
- **E2e en CI contra el PocketBase real**: el CI escribe datos reales (contacto). Ya existe
  cleanup en los e2e; el plan lo revisa antes de activar el job.
- **og-image**: es diseño visual hecho por el agente — riesgo de iteración con el cliente, igual
  que el toggle de idioma en su momento. Mitigación: validarla temprano en la fase 4a vía preview.
