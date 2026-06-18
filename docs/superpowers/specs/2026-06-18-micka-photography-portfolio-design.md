# Micka Photography Portfolio — Diseño técnico

**Fecha:** 2026-06-18
**Estado:** Aprobado (pendiente de plan de implementación)
**Figma:** https://www.figma.com/design/D1d7pqScYAAPmXHEqkW3Cm/Micka---Photography
**Propuesta:** `Project Proposal Web Development - Micka.pdf`

## Resumen

Portfolio fotográfico deportivo de "Don Micka de la Vega" (ciclismo femenino), con
estética editorial oscura, alto rendimiento y motion design. Sitio público bilingüe
(EN/FR) de 6 páginas + panel de administración custom para que Micka gestione el
contenido sin depender de un programador.

## Stack

- **Frontend + admin:** Next.js (App Router, última estable) + Tailwind CSS + GSAP, deploy en Vercel.
- **Backend/CMS:** PocketBase como 3ª instancia en el VPS existente `lhstudio.com.ar`
  (Ubuntu 24.04, 2.5 GB RAM, 2 cores). Expuesto en un subdominio dedicado
  (ej. `micka-api.lhstudio.com.ar`) con SSL, detrás del reverse proxy actual.
  PocketBase es muy liviano y no compromete los recursos del VPS.
- **Almacenamiento de imágenes:** Cloudflare R2 (S3-compatible) configurado como storage
  de PocketBase. Servidas por CDN — el VPS no sirve archivos pesados. Egress gratis.
- **i18n:** `next-intl` con rutas localizadas (`/en` por defecto, `/fr`). Contenido del CMS bilingüe.
- **Email (contacto):** Resend (o SMTP) vía Server Action.
- **GSAP:** gratuito desde 2025 (incluye ScrollTrigger y demás plugins). Sin costos de licencia.

## Design system (Figma)

- **Colores:** Negro `#000000`, Gris `#202020`, Gris fondo `#212121`, Gris claro `#373636`,
  Blanco `#ffffff`. Acento Violeta `#a020f0` / Violeta oscuro `#8315c8`.
- **Tipografías:** **Syne** Bold para titulares (H2 30px, Card Title 20px, H3 16px, H4 14px);
  **Inter** Regular/Semibold para body (14px).
- **UI Kit:** botones (Default/Hover, Large/Small), Menu Item (Mobile/Desktop + Hover),
  Toggle Language (EN/FR), componente "Image + Description".
- **Sombra de botones:** drop shadow `#00000040`, offset (0,4), radius 4.

## Arquitectura

```
Navegador (visitante / Micka)
  ├── sitio público ──┐
  └── /admin ─────────┤
                      ▼
        Next.js (App Router) en Vercel
        · Público SSG/ISR + i18n (/en, /fr)
        · Panel admin custom (/admin)
        · GSAP (motion) · next/image
        · Server Actions (contacto → email + persist)
                      │ REST + Auth (SDK)        │ imágenes (CDN)
                      ▼                           ▼
        PocketBase (VPS lhstudio.com.ar)   Cloudflare R2
        · SQLite (datos)                   (archivos/fotos)
        · Auth (login admin)        ◀──────  vía S3 API + CDN
        · API REST
```

## Módulos (límites claros)

| Módulo | Responsabilidad | Depende de |
|---|---|---|
| `site/` (público) | 6 páginas localizadas, render SSG/ISR | data layer, motion, i18n |
| `admin/` | CRUD de contenido con UI de marca | data layer, auth |
| `lib/pocketbase` | Cliente SDK tipado + modelos | PocketBase API |
| `lib/motion` | Wrappers GSAP reutilizables (+ `prefers-reduced-motion`) | — |
| `lib/i18n` | Config next-intl, mensajes de UI | — |
| PocketBase | Datos, auth, archivos→R2 | R2 |

Cada unidad expone una interfaz clara y puede entenderse/probarse de forma aislada.

## Modelo de datos (colecciones PocketBase)

Todos los campos de texto visibles tienen variante `_en` y `_fr`.

- **`categories`** — `name_en/fr`, `slug`, `order`
- **`albums`** — `title_en/fr`, `slug`, `category` (rel), `cover` (img), `description_en/fr`,
  `date`, `order`, `starred` (bool, para "Starred albums" del Home), `published`
- **`photos`** — `album` (rel), `image` (file→R2), `alt_en/fr`, `caption_en/fr`, `order`
- **`reviews`** — `author`, `role` (club/atleta), `quote_en/fr`, `avatar` (opc.), `order`, `published`
- **`collabs`** — `name` (marca/club), `logo`, `url`, `description_en/fr`, `order`, `published`
- **`site_content`** — pares clave/valor localizados para textos editables del Home y About
  (hero, bio, frases). Permite editar textos sin tocar código.
- **`contact_messages`** — `name`, `email`, `message`, `locale`, `created`
- **auth (admin):** un usuario admin para Micka (PocketBase Auth).

## Páginas y rutas

| Ruta | Contenido |
|---|---|
| `/[locale]` | Home inmersiva con animaciones GSAP (hero, starred albums, bloques editoriales, CTA) |
| `/[locale]/portfolio` | Galería por categorías/álbumes |
| `/[locale]/portfolio/[slug]` | Detalle de álbum (grilla de fotos, lazy-load) |
| `/[locale]/about` | Bio, estándares de contraste/legibilidad (inclusión) |
| `/[locale]/reviews` | Testimonios |
| `/[locale]/collabs` | Marcas/clubes/colaboraciones |
| `/[locale]/contact` | Formulario → email (Resend) + persistencia en CMS |
| `/admin/**` | Login + CRUD (álbumes, fotos, reviews, collabs, textos, mensajes) |

## Motion, performance, SEO y errores

- **Motion:** capa de wrappers GSAP/ScrollTrigger; animaciones de entrada y transiciones
  scroll-based según Figma; respeta `prefers-reduced-motion`.
- **Performance:** SSG/ISR con revalidación (el contenido cambia poco), `next/image` con
  loader de R2, lazy-loading de fotos, compresión adaptativa.
- **SEO:** metadata por página/idioma, `hreflang` EN/FR, `sitemap.xml`, `robots.txt`,
  JSON-LD (`Person` / `ImageGallery`), estructura semántica.
- **Errores:** validación con Zod en el formulario; manejo de fallos de upload; contenido
  cacheado como fallback si PocketBase no responde; páginas 404/500 localizadas.

## Testing

- **Playwright:** flujos clave (navegación localizada, envío de contacto, login admin, CRUD básico).
- **Vitest:** utilidades del data layer e i18n.

## Plan de implementación — 4 stages (Phase 2 de la propuesta)

El plan respeta los tiempos y los milestones de la propuesta. Cada stage requiere
aprobación expresa del cliente antes de avanzar al siguiente.

### Stage 1 — Arquitectura y estructura del CMS (Semana 1)
- Configuración del entorno Next.js (App Router, Tailwind, next-intl, estructura de módulos).
- 3ª instancia de PocketBase en el VPS + subdominio + SSL.
- Configuración de storage S3 → Cloudflare R2.
- Modelado de colecciones (categories, albums, photos, reviews, collabs, site_content, contact_messages).
- Data layer tipado (`lib/pocketbase`).
- Pantalla de login del administrador.

### Stage 2 — Layout de Home y subpáginas (Semana 2)
- Home pixel-perfect (Desktop & Mobile) según Figma y UI Kit.
- Las 5 subpáginas (Portfolio, About Me, Reviews, Collabs, Contact) con el design system.
- Interconexión con datos del CMS (contenido real desde PocketBase).
- Panel admin custom con CRUD de contenido.
- Formulario de contacto (email + persistencia).

### Stage 3 — Motion Engineering con GSAP (Semana 3)
- Animaciones de entrada y transiciones suaves entre secciones.
- Efectos scroll-based (ScrollTrigger) acordes a la identidad de fotografía deportiva.
- Respeto de `prefers-reduced-motion`.

### Stage 4 — Optimización, testing y lanzamiento (Semana 4)
- Optimización de carga y compresión adaptativa de imágenes (lazy-loading).
- Tests de usabilidad y visualización en distintos dispositivos.
- Tests automatizados (Playwright/Vitest) de flujos clave.
- SEO técnico final (sitemap, hreflang, JSON-LD, metadata).
- Delegación de DNS, configuración segura y publicación en producción.

## Fuera de alcance (según propuesta)

- Costo anual de dominio.
- Costos de infraestructura de servidor más allá de free tiers (Vercel, R2).
- Redacción de contenido, textos legales o nueva producción fotográfica/audiovisual.
- Carga/edición de contenido nuevo fuera de lo especificado.
- Mantenimiento del sitio (cubierto por la suscripción mensual de soporte aparte).
