# Stage 4 — Optimización, testing, SEO y lanzamiento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el proyecto Micka: SEO técnico completo, afinación de imágenes, CI en GitHub Actions con e2e, Vercel Analytics, guía de admin `/admin/help` y runbook de dominio — todo parametrizado por `NEXT_PUBLIC_SITE_URL` para que el dominio del cliente no bloquee nada.

**Architecture:** Rama `stage-4-launch` desde `master`, fases 4a (SEO) → 4b (imágenes) → 4c (CI/testing) → 4d (extras y cierre). La lógica SEO vive en helpers puros en `src/lib/seo/` (TDD); las páginas y los metadata files de App Router (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `icon.tsx`) solo los consumen.

**Tech Stack:** Next.js 16 App Router (metadata files, `ImageResponse` de `next/og`), next-intl, Vitest, Playwright, GitHub Actions, `@vercel/analytics`.

## Global Constraints

- **Spec fuente:** `docs/superpowers/specs/2026-07-23-stage-4-launch-design.md`.
- **PROHIBIDO al agente correr tests visuales/browser** (`npx playwright test`, chrome-devtools, capturas). Los e2e se ESCRIBEN acá y los corre CI o Lauti. Verificación del agente: `npx tsc --noEmit` + `npm run lint` + `npm run test` + `npx next build`.
- TDD para toda lógica pura; commits frecuentes (mínimo uno por task).
- Todo acceso a PocketBase pasa por `src/lib/pocketbase` (nunca el SDK directo).
- URLs públicas: **nunca hardcodear** — siempre `getSiteUrl()` (Task 1). Fallback: `https://micka-plum.vercel.app`.
- Credenciales/env: nunca commiteadas; `.env.local.example` documenta sin valores sensibles.
- Textos del sitio público localizados en/fr (`src/messages/`); textos del admin en inglés.
- Design tokens: violeta `#a020f0`, violeta oscuro `#8315c8`, gris fondo `#212121`, negro `#000000`, blanco `#ffffff`. Fuentes Syne (display) / Inter (body).
- Branding: **"Don Micka de la Vega"** (nunca "Micka Photo" ni variantes).

---

### Task 0: Rama del stage

**Files:** ninguno (solo git).

- [x] **Step 1: Crear la rama desde master actualizado**

```bash
git checkout master
git pull --ff-only
git checkout -b stage-4-launch
```

Expected: rama `stage-4-launch` creada sobre el último `master`.

---

## Fase 4a — SEO técnico

### Task 1: Helper `getSiteUrl()` + env var `NEXT_PUBLIC_SITE_URL`

**Files:**
- Create: `src/lib/seo/site.ts`
- Test: `src/lib/seo/__tests__/site.test.ts`
- Modify: `.env.local.example`

**Interfaces:**
- Produces: `getSiteUrl(): string` — URL pública absoluta sin trailing slash. La consumen Tasks 2, 4, 5, 6.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/seo/__tests__/site.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { getSiteUrl } from "../site";

describe("getSiteUrl", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("devuelve el fallback de Vercel si NEXT_PUBLIC_SITE_URL no está seteada", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://micka-plum.vercel.app");
  });

  it("devuelve la env var cuando está seteada", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://donmickadelavega.com");
    expect(getSiteUrl()).toBe("https://donmickadelavega.com");
  });

  it("normaliza el trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://donmickadelavega.com/");
    expect(getSiteUrl()).toBe("https://donmickadelavega.com");
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/__tests__/site.test.ts`
Expected: FAIL — module `../site` not found.

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/seo/site.ts
/**
 * URL pública canónica del sitio, sin trailing slash.
 * Mientras el cliente no compre su dominio, el fallback es el deploy de Vercel;
 * al activarlo solo cambia NEXT_PUBLIC_SITE_URL en Vercel (cero código).
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://micka-plum.vercel.app";
  return url.replace(/\/+$/, "");
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/__tests__/site.test.ts`
Expected: 3/3 PASS.

- [x] **Step 5: Documentar la env var**

En `.env.local.example`, agregar al final:

```
# URL pública canónica (SEO: canonicals, sitemap, og). Opcional en dev.
# En Vercel: setearla cuando el cliente active su dominio propio.
NEXT_PUBLIC_SITE_URL=
```

- [x] **Step 6: Commit**

```bash
git add src/lib/seo .env.local.example
git commit -m "feat(seo): getSiteUrl helper with NEXT_PUBLIC_SITE_URL and Vercel fallback"
```

---

### Task 2: Helper `pageAlternates()` (canonical + hreflang)

**Files:**
- Create: `src/lib/seo/alternates.ts`
- Test: `src/lib/seo/__tests__/alternates.test.ts`

**Interfaces:**
- Consumes: `getSiteUrl()` de Task 1.
- Produces: `pageAlternates(path: string, locale: string): Metadata["alternates"]` — `path` es la ruta SIN locale (`""` para Home, `"/portfolio"`, `"/portfolio/mi-slug"`). La consumen Task 3 (páginas) y nadie más.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/seo/__tests__/alternates.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { pageAlternates } from "../alternates";

describe("pageAlternates", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("genera canonical del locale actual y languages en/fr + x-default", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(pageAlternates("/portfolio", "fr")).toEqual({
      canonical: "https://example.com/fr/portfolio",
      languages: {
        en: "https://example.com/en/portfolio",
        fr: "https://example.com/fr/portfolio",
        "x-default": "https://example.com/en/portfolio",
      },
    });
  });

  it("maneja el Home (path vacío)", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(pageAlternates("", "en")).toEqual({
      canonical: "https://example.com/en",
      languages: {
        en: "https://example.com/en",
        fr: "https://example.com/fr",
        "x-default": "https://example.com/en",
      },
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/__tests__/alternates.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/seo/alternates.ts
import type { Metadata } from "next";
import { routing } from "@/lib/i18n/routing";
import { getSiteUrl } from "./site";

/**
 * Canonical + hreflang para una ruta del sitio público.
 * `path` va SIN prefijo de locale ("" para el Home, "/portfolio", etc.).
 * x-default apunta al defaultLocale (en).
 */
export function pageAlternates(path: string, locale: string): Metadata["alternates"] {
  const site = getSiteUrl();
  const url = (l: string) => `${site}/${l}${path}`;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, url(l)]));
  return {
    canonical: url(locale),
    languages: { ...languages, "x-default": url(routing.defaultLocale) },
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/__tests__/alternates.test.ts`
Expected: 2/2 PASS.

- [x] **Step 5: Commit**

```bash
git add src/lib/seo
git commit -m "feat(seo): pageAlternates helper (canonical + hreflang en/fr + x-default)"
```

---

### Task 3: metadataBase, title template, Open Graph defaults y alternates en todas las páginas

**Files:**
- Modify: `src/app/(site)/[locale]/layout.tsx`
- Modify: `src/app/(site)/[locale]/page.tsx` (Home — nuevo `generateMetadata`)
- Modify: `src/app/(site)/[locale]/portfolio/page.tsx`, `src/app/(site)/[locale]/portfolio/[slug]/page.tsx`, `src/app/(site)/[locale]/about/page.tsx`, `src/app/(site)/[locale]/reviews/page.tsx`, `src/app/(site)/[locale]/collabs/page.tsx`, `src/app/(site)/[locale]/contact/page.tsx`
- Modify: `src/messages/en.json`, `src/messages/fr.json` (namespace `meta` nuevo)

**Interfaces:**
- Consumes: `getSiteUrl()` (Task 1), `pageAlternates(path, locale)` (Task 2).
- Produces: nada consumido por tasks posteriores (el layout hereda `metadataBase`/OG a todo `(site)`).

- [x] **Step 1: Agregar el namespace `meta` a los mensajes**

En `src/messages/en.json` (nivel raíz):

```json
"meta": {
  "title": "Don Micka de la Vega — Sports Photographer",
  "description": "Sports photography portfolio of Don Micka de la Vega. Women's cycling captured with an editorial, cinematic eye."
}
```

En `src/messages/fr.json`:

```json
"meta": {
  "title": "Don Micka de la Vega — Photographe sportif",
  "description": "Portfolio de photographie sportive de Don Micka de la Vega. Le cyclisme féminin capturé avec un regard éditorial et cinématographique."
}
```

(Los textos FR son razonables pero el cliente los está revisando en general — si los reescribe, se actualizan como el resto de `fr.json`.)

- [x] **Step 2: `generateMetadata` en el layout `(site)`**

En `src/app/(site)/[locale]/layout.tsx`, agregar (imports: `type { Metadata }` de `next`, `getTranslations` de `next-intl/server`, `getSiteUrl` de `@/lib/seo/site`):

```ts
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: t("title"), template: "%s — Don Micka de la Vega" },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: "Don Micka de la Vega",
      locale: locale === "fr" ? "fr_FR" : "en_US",
    },
    twitter: { card: "summary_large_image" },
  };
}
```

- [x] **Step 3: `generateMetadata` del Home**

En `src/app/(site)/[locale]/page.tsx`, agregar (el Home hoy no tiene metadata propio):

```ts
import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo/alternates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates("", locale) };
}
```

- [x] **Step 4: `alternates` en las 5 subpáginas y el detalle de álbum**

En cada `generateMetadata` existente, agregar la key `alternates` al objeto retornado:

- `portfolio/page.tsx`: `alternates: pageAlternates("/portfolio", locale)`
- `about/page.tsx`: `alternates: pageAlternates("/about", locale)`
- `reviews/page.tsx`: `alternates: pageAlternates("/reviews", locale)`
- `collabs/page.tsx`: `alternates: pageAlternates("/collabs", locale)`
- `contact/page.tsx`: `alternates: pageAlternates("/contact", locale)`
- `portfolio/[slug]/page.tsx` (dentro del branch en que `album` existe): `alternates: pageAlternates(`/portfolio/${slug}`, locale)`

Import en cada archivo: `import { pageAlternates } from "@/lib/seo/alternates";`

- [x] **Step 5: Verificación**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: todo verde; el build muestra las rutas sin errores de metadata.

- [x] **Step 6: Commit**

```bash
git add src/app src/messages src/lib/seo
git commit -m "feat(seo): metadataBase, title template, OG defaults and hreflang on all pages"
```

---

### Task 4: og-image con branding (`opengraph-image.tsx`)

**Files:**
- Create: `src/assets/fonts/Syne-ExtraBold.ttf` (descargado, ver Step 1)
- Create: `src/app/(site)/[locale]/opengraph-image.tsx`

**Interfaces:**
- Consumes: nada de otras tasks (el asset de fuente lo reusa Task 7).
- Produces: `src/assets/fonts/Syne-ExtraBold.ttf` (lo reusa Task 7 para los icons). Next inyecta `og:image`/`twitter:image` automáticamente en todo el árbol `(site)/[locale]`.

- [x] **Step 1: Descargar el TTF estático de Syne ExtraBold**

Google Fonts sirve TTF estáticos (no variables — satori no los soporta) cuando el user-agent no soporta woff2:

```bash
mkdir -p src/assets/fonts
curl -s -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Syne:wght@800" -o /tmp/syne.css
# Extraer la URL del ttf del CSS descargado y bajarla:
grep -o "https://fonts.gstatic.com/[^)]*\.ttf" /tmp/syne.css | head -1
curl -s -o src/assets/fonts/Syne-ExtraBold.ttf "<URL_EXTRAIDA>"
```

Verificar: el archivo pesa >50KB y `file src/assets/fonts/Syne-ExtraBold.ttf` (o abrirlo) confirma TrueType. Si el CSS devolviera woff2 en vez de ttf, probar user-agent vacío (`-A ""`). Licencia SIL OFL — commitearlo está OK.

- [x] **Step 2: Crear la og-image**

```tsx
// src/app/(site)/[locale]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Don Micka de la Vega — Sports Photography";

const SUBTITLE: Record<string, string> = {
  en: "SPORTS PHOTOGRAPHY — WOMEN'S CYCLING",
  fr: "PHOTOGRAPHIE SPORTIVE — CYCLISME FÉMININ",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [syne, photo] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/fonts/Syne-ExtraBold.ttf")),
    readFile(join(process.cwd(), "public/placeholders/cyclist-road.jpg")),
  ]);
  const bg = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "60px 70px",
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.85) 100%)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Syne" }}>
            <div style={{ fontSize: 92, color: "#a020f0", lineHeight: 1 }}>Don Micka</div>
            <div style={{ fontSize: 92, color: "#ffffff", lineHeight: 1.05 }}>de la Vega</div>
            <div
              style={{
                marginTop: 28,
                width: 160,
                height: 6,
                backgroundColor: "#a020f0",
              }}
            />
            <div style={{ marginTop: 20, fontSize: 28, color: "#ffffff", letterSpacing: 4 }}>
              {SUBTITLE[locale] ?? SUBTITLE.en}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Syne", data: syne, weight: 800, style: "normal" }] },
  );
}
```

- [x] **Step 3: Verificación**

Run: `npx tsc --noEmit && npx next build`
Expected: build OK; en el output aparece `opengraph-image` bajo `[locale]`. (El PNG resultante lo valida Lauti/el cliente en el preview — ver Task 14.)

- [x] **Step 4: Commit**

```bash
git add src/assets src/app
git commit -m "feat(seo): branded og-image via next/og (Syne, wordmark, localized subtitle)"
```

---

### Task 5: Sitemap

**Files:**
- Create: `src/lib/seo/sitemap-entries.ts`
- Create: `src/app/sitemap.ts`
- Test: `src/lib/seo/__tests__/sitemap-entries.test.ts`

**Interfaces:**
- Consumes: `getSiteUrl()` (Task 1), `getAlbums()` de `src/lib/pocketbase/queries` (existente — devuelve `Album[]`, `[]` si PocketBase falla; `Album` tiene `slug: string` y `updated: string`).
- Produces: `buildSitemapEntries(albums: Array<{ slug: string; updated?: string }>, siteUrl: string): MetadataRoute.Sitemap`. La ruta `/sitemap.xml` queda viva (la consume el e2e de Task 9 y `robots.ts` de Task 6 la referencia).

- [x] **Step 1: Write the failing test**

```ts
// src/lib/seo/__tests__/sitemap-entries.test.ts
import { describe, it, expect } from "vitest";
import { buildSitemapEntries } from "../sitemap-entries";

const SITE = "https://example.com";

describe("buildSitemapEntries", () => {
  it("incluye las 6 páginas estáticas por locale con alternates hreflang", () => {
    const entries = buildSitemapEntries([], SITE);
    const urls = entries.map((e) => e.url);
    // 6 páginas (home + 5 subpáginas) × 2 locales
    expect(entries).toHaveLength(12);
    expect(urls).toContain("https://example.com/en");
    expect(urls).toContain("https://example.com/fr/portfolio");
    const home = entries.find((e) => e.url === "https://example.com/en");
    expect(home?.alternates?.languages).toEqual({
      en: "https://example.com/en",
      fr: "https://example.com/fr",
    });
  });

  it("agrega los álbumes por locale con lastModified", () => {
    const entries = buildSitemapEntries(
      [{ slug: "tour-2026", updated: "2026-07-01 10:00:00.000Z" }],
      SITE,
    );
    expect(entries).toHaveLength(14);
    const album = entries.find(
      (e) => e.url === "https://example.com/en/portfolio/tour-2026",
    );
    expect(album?.lastModified).toBeInstanceOf(Date);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/__tests__/sitemap-entries.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/seo/sitemap-entries.ts
import type { MetadataRoute } from "next";
import { routing } from "@/lib/i18n/routing";

const STATIC_PATHS = ["", "/portfolio", "/about", "/reviews", "/collabs", "/contact"];

type AlbumRef = { slug: string; updated?: string };

/** Entradas del sitemap: estáticas + álbumes, por locale, con hreflang. Pura y testeable. */
export function buildSitemapEntries(
  albums: AlbumRef[],
  siteUrl: string,
): MetadataRoute.Sitemap {
  const paths: Array<{ path: string; lastModified?: Date }> = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...albums.map((a) => ({
      path: `/portfolio/${a.slug}`,
      lastModified: a.updated ? new Date(a.updated) : undefined,
    })),
  ];
  return paths.flatMap(({ path, lastModified }) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      ...(lastModified ? { lastModified } : {}),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
        ),
      },
    })),
  );
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/__tests__/sitemap-entries.test.ts`
Expected: 2/2 PASS.

- [x] **Step 5: Crear la ruta `sitemap.ts`**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAlbums } from "@/lib/pocketbase/queries";
import { getSiteUrl } from "@/lib/seo/site";
import { buildSitemapEntries } from "@/lib/seo/sitemap-entries";

// getAlbums() ya es resiliente (devuelve [] si PocketBase no responde):
// el sitemap siempre emite al menos las páginas estáticas.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const albums = await getAlbums();
  return buildSitemapEntries(albums, getSiteUrl());
}
```

- [x] **Step 6: Verificación**

Run: `npx tsc --noEmit && npm run test && npx next build`
Expected: verde; `/sitemap.xml` listado en el build output.

- [x] **Step 7: Commit**

```bash
git add src/lib/seo src/app/sitemap.ts
git commit -m "feat(seo): sitemap with static+album routes per locale and hreflang alternates"
```

---

### Task 6: robots.ts + noindex del admin

**Files:**
- Create: `src/app/robots.ts`
- Test: `src/lib/seo/__tests__/robots.test.ts` (testea la ruta importándola directo)
- Modify: `src/app/(admin)/admin/layout.tsx`

**Interfaces:**
- Consumes: `getSiteUrl()` (Task 1).
- Produces: ruta `/robots.txt` (la consume el e2e de Task 9).

- [x] **Step 1: Write the failing test**

```ts
// src/lib/seo/__tests__/robots.test.ts
import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "@/app/robots";

describe("robots", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("permite todo salvo /admin y referencia el sitemap absoluto", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/admin" },
      sitemap: "https://example.com/sitemap.xml",
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/__tests__/robots.test.ts`
Expected: FAIL — `@/app/robots` not found.

- [x] **Step 3: Write minimal implementation**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/__tests__/robots.test.ts`
Expected: PASS.

- [x] **Step 5: noindex explícito en el layout del admin**

En `src/app/(admin)/admin/layout.tsx`, agregar arriba del componente:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Micka",
  robots: { index: false, follow: false },
};
```

- [x] **Step 6: Verificación y commit**

Run: `npx tsc --noEmit && npm run test && npx next build`
Expected: verde; `/robots.txt` en el build output.

```bash
git add src/app src/lib/seo
git commit -m "feat(seo): robots.txt (disallow /admin) + explicit noindex on admin layout"
```

---

### Task 7: JSON-LD (Person + WebSite) en el Home

**Files:**
- Create: `src/lib/seo/jsonld.ts`
- Test: `src/lib/seo/__tests__/jsonld.test.ts`
- Modify: `src/app/(site)/[locale]/page.tsx`

**Interfaces:**
- Consumes: `getSiteUrl()` (Task 1).
- Produces: `personJsonLd(siteUrl: string): object`, `websiteJsonLd(siteUrl: string): object`.

- [x] **Step 1: Write the failing test**

```ts
// src/lib/seo/__tests__/jsonld.test.ts
import { describe, it, expect } from "vitest";
import { personJsonLd, websiteJsonLd } from "../jsonld";

describe("jsonld", () => {
  it("Person con el branding correcto", () => {
    const p = personJsonLd("https://example.com");
    expect(p).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Don Micka de la Vega",
      url: "https://example.com",
    });
  });

  it("WebSite con ambos idiomas", () => {
    const w = websiteJsonLd("https://example.com");
    expect(w).toMatchObject({
      "@type": "WebSite",
      name: "Don Micka de la Vega",
      inLanguage: ["en", "fr"],
    });
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/seo/__tests__/jsonld.test.ts`
Expected: FAIL — module not found.

- [x] **Step 3: Write minimal implementation**

```ts
// src/lib/seo/jsonld.ts
/** Builders puros de JSON-LD. Sin datos dinámicos: nunca rompen el render. */
export function personJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Don Micka de la Vega",
    jobTitle: "Sports Photographer",
    url: siteUrl,
    knowsAbout: ["Sports photography", "Women's cycling"],
  };
}

export function websiteJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Don Micka de la Vega",
    url: siteUrl,
    inLanguage: ["en", "fr"],
  };
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/seo/__tests__/jsonld.test.ts`
Expected: 2/2 PASS.

- [x] **Step 5: Inyectarlo en el Home**

En `src/app/(site)/[locale]/page.tsx`, imports:

```ts
import { getSiteUrl } from "@/lib/seo/site";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
```

Dentro del JSX retornado, como primer hijo de `<main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify([personJsonLd(getSiteUrl()), websiteJsonLd(getSiteUrl())]),
  }}
/>
```

- [x] **Step 6: Verificación y commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: verde.

```bash
git add src/lib/seo "src/app/(site)/[locale]/page.tsx"
git commit -m "feat(seo): Person + WebSite JSON-LD on home"
```

---

### Task 8: Favicon/app icons con branding + limpieza de assets default

**Files:**
- Create: `src/app/icon.tsx`, `src/app/apple-icon.tsx`
- Delete: `src/app/favicon.ico`, `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`

**Interfaces:**
- Consumes: `src/assets/fonts/Syne-ExtraBold.ttf` (creado en Task 4).

- [x] **Step 1: Crear `icon.tsx` (monograma "M." violeta sobre gris)**

```tsx
// src/app/icon.tsx
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const syne = await readFile(join(process.cwd(), "src/assets/fonts/Syne-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#212121",
          color: "#a020f0",
          fontFamily: "Syne",
          fontSize: 40,
        }}
      >
        M.
      </div>
    ),
    { ...size, fonts: [{ name: "Syne", data: syne, weight: 800, style: "normal" }] },
  );
}
```

- [x] **Step 2: Crear `apple-icon.tsx`**

Mismo contenido que `icon.tsx` pero con `size = { width: 180, height: 180 }` y `fontSize: 110`:

```tsx
// src/app/apple-icon.tsx
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const syne = await readFile(join(process.cwd(), "src/assets/fonts/Syne-ExtraBold.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#212121",
          color: "#a020f0",
          fontFamily: "Syne",
          fontSize: 110,
        }}
      >
        M.
      </div>
    ),
    { ...size, fonts: [{ name: "Syne", data: syne, weight: 800, style: "normal" }] },
  );
}
```

- [x] **Step 3: Borrar los defaults del scaffold**

```bash
git rm src/app/favicon.ico public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

(Antes de borrar, verificar con grep que ningún componente referencia esos SVGs: `grep -r "next.svg\|vercel.svg\|file.svg\|globe.svg\|window.svg" src/` debe devolver vacío.)

- [x] **Step 4: Verificación y commit**

Run: `npx tsc --noEmit && npm run lint && npx next build`
Expected: verde; `/icon` y `/apple-icon` en el build output.

```bash
git add src/app
git commit -m "feat(branding): generated favicon/app icons, drop scaffold defaults"
```

---

## Fase 4b — Performance de imágenes

### Task 9: Auditoría y afinación de `next/image`

**Files:**
- Modify (solo si la auditoría lo confirma — lista cerrada de puntos abajo):
  - `src/components/site/PhotoGrid.tsx`
  - `src/app/(site)/[locale]/portfolio/[slug]/page.tsx`
  - `src/app/(site)/[locale]/about/page.tsx`

**Estado ya verificado (2026-07-23, no tocar):** `Hero.tsx` ya tiene `priority` + `sizes="100vw"`; `AlbumCard`, `StarredAlbums` (1200x0 para 440px), `FavesGallery` (600x0 para 220px), `BioBlock`, `EditorialIntro`, `CraftBlock`, `ToggleLanguage`, avatares de Reviews y logos de Collabs ya tienen `sizes`/dimensiones correctos.

- [x] **Step 1: Auditar los 3 puntos abiertos y aplicar solo lo que corresponda**

1. **`PhotoGrid.tsx` (grid del detalle de álbum, 3 columnas desktop):** hoy pide thumb `600x0` (desde `portfolio/[slug]/page.tsx`) con `sizes="(max-width: 768px) 50vw, 33vw"`. En un viewport de 1440px, 33vw ≈ 475px CSS → @2x pide ~950px: el thumb de 600 se sirve upscaleado. Subir el thumb del call site a `800x0`:

```ts
// src/app/(site)/[locale]/portfolio/[slug]/page.tsx — en el map de photos:
src: fileUrl({ collectionName: "photos", id: p.id }, p.image, { thumb: "800x0" }),
```

2. **`PhotoGrid.tsx`:** las primeras 6 fotos hoy van con `loading` default (eager). Está bien para el above-the-fold del grid — no tocar. Confirmar que no haya `priority` (no debe: no es el LCP de la página, el H1 + header cargan antes).

3. **`about/page.tsx`:** retrato con `sizes="(max-width: 768px) 100vw, 480px"` y `fill` — verificar contra el contenedor real del JSX (si el contenedor desktop es ~480px está OK, no tocar).

- [x] **Step 2: Verificación y commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: verde.

```bash
git add src
git commit -m "perf(images): bump album grid thumb to 800x0 (audit: rest already correct)"
```

(Si la auditoría del punto 3 encuentra un mismatch, incluir el fix en este mismo commit y mencionarlo en el mensaje. La medición Lighthouse/PageSpeed la hace Lauti sobre el preview — el agente no corre browser.)

---

## Fase 4c — Testing + CI

### Task 10: E2e de SEO (los corre CI/Lauti, NUNCA el agente)

**Files:**
- Create: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: rutas `/sitemap.xml` (Task 5), `/robots.txt` (Task 6), hreflang en HTML (Task 3).

**Nota de cobertura:** el "smoke de navegación completa en ambos locales" que pide el spec ya está cubierto por los e2e existentes (`tests/e2e/navigation.spec.ts`, `subpages.spec.ts`, `locale.spec.ts`) — no se duplica acá; este spec agrega solo lo nuevo de SEO.

- [x] **Step 1: Escribir el spec**

```ts
// tests/e2e/seo.spec.ts
import { test, expect } from "@playwright/test";

test.describe("SEO técnico", () => {
  test("sitemap.xml responde y contiene rutas de ambos locales", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/en/portfolio");
    expect(body).toContain("/fr/portfolio");
    expect(body).toContain("<xhtml:link");
  });

  test("robots.txt permite el sitio y bloquea /admin", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");
  });

  test("el Home declara canonical y hreflang", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/en$/,
    );
    await expect(
      page.locator('link[rel="alternate"][hreflang="fr"]'),
    ).toHaveAttribute("href", /\/fr$/);
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]'),
    ).toHaveCount(1);
  });

  test("una subpágina declara hreflang del otro locale", async ({ page }) => {
    await page.goto("/fr/portfolio");
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", /\/en\/portfolio$/);
  });

  test("el Home expone JSON-LD Person", async ({ page }) => {
    await page.goto("/en");
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLd).toContain('"Person"');
    expect(jsonLd).toContain("Don Micka de la Vega");
  });
});
```

- [x] **Step 2: Verificación estática (el agente NO corre Playwright)**

Run: `npx tsc --noEmit`
Expected: limpio (el spec compila). La ejecución real queda para el CI de Task 11 o para Lauti local.

- [x] **Step 3: Commit**

```bash
git add tests/e2e/seo.spec.ts
git commit -m "test(e2e): SEO spec (sitemap, robots, hreflang, json-ld) - runs on CI"
```

---

### Task 11: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: scripts de `package.json` (`lint`, `test`), configs existentes (`playwright.config.ts` ya fuerza `reducedMotion` y `workers:1` en CI).

- [x] **Step 1: Escribir el workflow**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [master]
  pull_request:

env:
  NEXT_PUBLIC_POCKETBASE_URL: https://micka.lhstudio.com.ar
  NEXT_PUBLIC_SITE_URL: https://micka-plum.vercel.app

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test
      - run: npx next build

  e2e:
    runs-on: ubuntu-latest
    needs: checks
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Check secrets
        id: gate
        env:
          PB_EMAIL: ${{ secrets.POCKETBASE_ADMIN_EMAIL }}
        run: |
          if [ -n "$PB_EMAIL" ]; then
            echo "run=true" >> "$GITHUB_OUTPUT"
          else
            echo "run=false" >> "$GITHUB_OUTPUT"
            echo "::notice::E2E skipped - POCKETBASE_* secrets not configured in repo settings"
          fi
      - if: steps.gate.outputs.run == 'true'
        run: npm ci
      - if: steps.gate.outputs.run == 'true'
        run: npx playwright install --with-deps chromium
      - if: steps.gate.outputs.run == 'true'
        env:
          POCKETBASE_ADMIN_EMAIL: ${{ secrets.POCKETBASE_ADMIN_EMAIL }}
          POCKETBASE_ADMIN_PASSWORD: ${{ secrets.POCKETBASE_ADMIN_PASSWORD }}
        run: npx playwright test
      - if: steps.gate.outputs.run == 'true' && failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Notas de diseño: los `secrets` no están disponibles en `jobs.<id>.if`, por eso el gate es un step que expone un output. El job e2e nunca falla por secrets ausentes (skip con notice) — requisito del spec.

- [x] **Step 2: Verificación local del YAML**

Run: `npx tsc --noEmit` (no aplica al YAML) + revisar indentación a ojo o con `node -e "require('js-yaml')"` si está disponible; alcanza con la revisión al pushear (el workflow corre en el push de la rama si hay PR, o al mergear).

- [x] **Step 3: Commit**

```bash
git add .github
git commit -m "ci: GitHub Actions (checks always; e2e gated on PocketBase secrets)"
```

- [x] **Step 4 (MANUAL — Lauti, no bloquea el stage): cargar secrets en GitHub**

En `github.com/papuzinH/<repo-micka>` → Settings → Secrets and variables → Actions → New repository secret:
- `POCKETBASE_ADMIN_EMAIL` = email de la cuenta de servicio (`admin@micka.com`)
- `POCKETBASE_ADMIN_PASSWORD` = la clave de servicio actual (la de `.env.local`)

Hasta que estén, el CI corre solo el job `checks` y avisa que salteó e2e.

---

## Fase 4d — Extras y cierre

### Task 12: Vercel Analytics

**Files:**
- Modify: `package.json` (dependencia nueva), `src/app/(site)/[locale]/layout.tsx`

- [x] **Step 1: Instalar**

```bash
npm install @vercel/analytics
```

- [x] **Step 2: Montarlo solo en el sitio público**

En `src/app/(site)/[locale]/layout.tsx`:

```ts
import { Analytics } from "@vercel/analytics/next";
```

y como último hijo de `<body>` (después de `</NextIntlClientProvider>`):

```tsx
<Analytics />
```

El layout del admin NO lo lleva (decisión del spec: el admin no se mide).

- [x] **Step 3: Verificación y commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: verde.

```bash
git add package.json package-lock.json "src/app/(site)/[locale]/layout.tsx"
git commit -m "feat(analytics): Vercel Analytics on public site layout"
```

(Analytics solo reporta en producción sobre Vercel — la verificación de datos en el dashboard es post-merge, criterio de cierre 5 del spec.)

---

### Task 13: Guía de admin `/admin/help` (imprimible → PDF)

**Files:**
- Create: `src/components/admin/HelpContent.tsx`
- Create: `src/components/admin/PrintButton.tsx`
- Create: `src/app/(admin)/admin/(panel)/help/page.tsx`
- Test: `src/components/admin/__tests__/HelpContent.test.tsx`
- Modify: `src/components/admin/Sidebar.tsx`

**Interfaces:**
- Consumes: guard del route group `(panel)` (existente — el layout ya protege todas sus rutas); patrón de ruta estática sobre `[collection]` ya probado con `account`.
- Produces: ruta `/admin/help`.

- [x] **Step 1: Write the failing test**

```tsx
// src/components/admin/__tests__/HelpContent.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HelpContent } from "../HelpContent";

describe("HelpContent", () => {
  it("cubre las secciones clave de la guía", () => {
    render(<HelpContent />);
    for (const heading of [
      "Getting started",
      "Albums & photos",
      "Reviews & collabs",
      "Site texts",
      "Contact messages",
      "Image guidelines",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
  });

  it("menciona el límite de 15MB por imagen", () => {
    render(<HelpContent />);
    expect(screen.getByText(/15\s?MB/i)).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/admin/__tests__/HelpContent.test.tsx`
Expected: FAIL — module not found.

- [x] **Step 3: Implementar `HelpContent` (server-safe, sin hooks)**

```tsx
// src/components/admin/HelpContent.tsx
const h2 = "mt-10 font-display text-xl uppercase text-brand-violet print:text-black";
const p = "mt-3 font-body text-sm leading-relaxed text-brand-white/80 print:text-black";
const li = "mt-1.5 font-body text-sm leading-relaxed text-brand-white/80 print:text-black";

export function HelpContent() {
  return (
    <article className="max-w-3xl print:max-w-none print:text-black">
      <h1 className="font-display text-3xl uppercase text-brand-white print:text-black">
        Admin guide
      </h1>
      <p className={p}>
        Everything you need to manage donmickadelavega&apos;s site content. Changes go
        live within 5 minutes (the site refreshes its content cache automatically).
      </p>

      <h2 className={h2}>Getting started</h2>
      <p className={p}>
        Log in at <strong>/admin/login</strong> with your personal account. You can
        change your password anytime in <strong>Account</strong> (left sidebar). After
        changing it you&apos;ll be asked to log in again.
      </p>

      <h2 className={h2}>Albums &amp; photos</h2>
      <ul className="list-disc pl-5">
        <li className={li}>
          <strong>Categories</strong> group albums in the Portfolio page. Create them
          first (name in English and French).
        </li>
        <li className={li}>
          <strong>Albums</strong> need a title (EN/FR), a slug (the URL part, e.g.
          &quot;tour-2026&quot; — lowercase, hyphens, no spaces), a category and a cover
          image. Mark up to 3 as <strong>starred</strong> to feature them on the Home.
        </li>
        <li className={li}>
          <strong>Photos</strong> belong to one album. Upload one photo per record; the
          <strong> order</strong> field (a number) controls the position in the gallery
          — lower numbers first. Mark <strong>fave</strong> to feature a photo in the
          Home &quot;faves&quot; strip.
        </li>
        <li className={li}>
          Published toggle: unpublished records are hidden from the site but kept in
          the panel.
        </li>
      </ul>

      <h2 className={h2}>Reviews &amp; collabs</h2>
      <p className={p}>
        Reviews show on the Reviews page (author, text EN/FR, optional avatar).
        Collabs show logos and links on the Collabs page. Both support the published
        toggle and numeric ordering.
      </p>

      <h2 className={h2}>Site texts</h2>
      <p className={p}>
        The <strong>site_content</strong> collection holds the editable texts: the About
        page intro and body, and the Contact page intro — each in English and French.
        The rest of the site copy (Home sections, menus, form labels) is fixed: send
        corrections to Lautaro and he&apos;ll apply them.
      </p>

      <h2 className={h2}>Contact messages</h2>
      <p className={p}>
        Messages sent through the site&apos;s contact form land in
        <strong> contact_messages</strong> (read-only inbox). Check it periodically —
        email forwarding may also be configured, but the inbox is the source of truth.
      </p>

      <h2 className={h2}>Image guidelines</h2>
      <ul className="list-disc pl-5">
        <li className={li}>Max file size: <strong>15 MB</strong> per image.</li>
        <li className={li}>
          JPG is best for photos. The site generates optimized thumbnails
          automatically — upload your quality originals and don&apos;t worry about
          resizing.
        </li>
        <li className={li}>
          Always fill the <strong>alt</strong> text (EN/FR): it describes the photo for
          accessibility and search engines.
        </li>
      </ul>

      <p className={`${p} mt-10 border-t border-brand-light-gray pt-4 print:border-black`}>
        Questions or fixed-text corrections: contact Lautaro (LH Studio) —
        lhstudio.dev@gmail.com
      </p>
    </article>
  );
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/admin/__tests__/HelpContent.test.tsx`
Expected: 2/2 PASS.

- [x] **Step 5: `PrintButton` (client, se oculta al imprimir)**

```tsx
// src/components/admin/PrintButton.tsx
"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-brand-violet px-4 py-2 font-body text-sm text-white transition-colors hover:bg-brand-violet-dark print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
```

- [x] **Step 6: La página `/admin/help`**

```tsx
// src/app/(admin)/admin/(panel)/help/page.tsx
import type { Metadata } from "next";
import { HelpContent } from "@/components/admin/HelpContent";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata: Metadata = { title: "Help — Panel Micka" };

export default function HelpPage() {
  return (
    <div className="p-8 print:bg-white print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <HelpContent />
    </div>
  );
}
```

(Nota: la ruta estática `help` tiene prioridad sobre la dinámica `[collection]`, igual que `account` — "help" no es slug de ninguna colección. El guard del layout `(panel)` la protege automáticamente. Verificar que el padding/estructura coincida con cómo el layout `(panel)` envuelve a las demás páginas — ajustar el wrapper si el layout ya provee padding.)

- [x] **Step 7: Ocultar el sidebar al imprimir + link Help**

En `src/components/admin/Sidebar.tsx`:
1. Al `className` del `<aside>` raíz, agregar `print:hidden`.
2. Debajo del link "Account", agregar:

```tsx
<Link href="/admin/help" className={linkCls(pathname === "/admin/help")}>
  Help
</Link>
```

- [x] **Step 8: Verificación y commit**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: verde; `/admin/help` como ruta propia en el build output.

```bash
git add src/components/admin src/app
git commit -m "feat(admin): help page with printable admin guide + sidebar link"
```

(El PDF de cortesía: Lauti abre `/admin/help` → Ctrl+P → "Save as PDF". Una sola fuente de verdad, nada que desactualizar.)

---

### Task 14: Runbook de dominio + candidatos

**Files:**
- Create: `docs/domain-launch-runbook.md`

- [x] **Step 1: Escribir el runbook**

```markdown
# Runbook — Activación del dominio propio (Stage 4)

> Ejecutar cuando Micka compre el dominio. Tiempo estimado: 10-15 minutos + propagación DNS.

## 1. Candidatos a proponerle a Micka

(Verificar disponibilidad/precio en Namecheap o Porkbun antes de mandar; él compra
con SU cuenta — el dominio queda a su nombre, como pide la propuesta.)

- `donmickadelavega.com` — el branding completo, primera opción.
- `mickadelavega.com` — más corto, mismo apellido artístico.
- `donmicka.photography` — TLD descriptivo, lindo para tarjeta/IG bio.

## 2. Alta en Vercel (proyecto micka)

1. Vercel → proyecto → Settings → Domains → Add → dominio comprado (y `www.` como redirect).
2. Vercel muestra los DNS records necesarios.

## 3. DNS (en el registrar de Micka, guiarlo por chat/call)

- Apex (`donmickadelavega.com`): registro `A` → `76.76.21.21`.
- `www`: registro `CNAME` → `cname.vercel-dns.com`.
- Esperar propagación (minutos a horas). Vercel valida solo y emite SSL.

## 4. Corte de URL canónica

1. Vercel → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = `https://<dominio>` (Production).
2. Redeploy (Deployments → Redeploy sobre el último de master).

## 5. Verificación post-corte

- `https://<dominio>/en` carga con SSL y el `.vercel.app` redirige (Vercel lo hace solo).
- `view-source`: canonical y hreflang apuntan al dominio nuevo.
- `https://<dominio>/sitemap.xml` y `/robots.txt` usan el dominio nuevo.
- og-card: probar la URL en https://www.opengraph.xyz (y/o el Sharing Debugger de Meta).

## 6. Google Search Console (recomendado, 5 min)

1. Alta de la propiedad `https://<dominio>` (verificación por DNS TXT — mismo registrar).
2. Enviar `https://<dominio>/sitemap.xml` en Sitemaps.
```

- [x] **Step 2: Commit**

```bash
git add docs/domain-launch-runbook.md
git commit -m "docs: domain launch runbook + candidate domains for the client"
```

---

### Task 15: Cierre del stage — verificación integral + docs

**Files:**
- Modify: `CLAUDE.md` (sección "Estado actual" + changelog "Decisiones y cambios")
- Modify: `docs/superpowers/plans/2026-07-23-stage-4-launch.md` (checkboxes)

- [x] **Step 1: Verificación integral final**

Run: `npx tsc --noEmit && npm run lint && npm run test && npx next build`
Expected: TODO verde (los unit nuevos de Tasks 1, 2, 5, 6, 7, 13 incluidos). Registrar el conteo final de unit tests para el changelog.

- [x] **Step 2: Actualizar `CLAUDE.md`**

- "Estado actual": nueva viñeta "✅ STAGE 4 — ..." con el resumen (SEO técnico completo, auditoría de imágenes, CI, analytics, /admin/help, runbook de dominio; dominio pendiente de compra del cliente).
- Changelog: entrada `2026-07-XX` con las decisiones (patrón `getSiteUrl`, og-image con next/og, gate de secrets en CI, help imprimible).

- [x] **Step 3: Commit de docs**

```bash
git add CLAUDE.md docs
git commit -m "docs: stage 4 close (Estado actual + changelog)"
```

- [ ] **Step 4 (MANUAL — Lauti): validación visual sobre el preview de Vercel**

Push de la rama → preview de Vercel → validar: og-card (con https://www.opengraph.xyz), favicon nuevo, `/admin/help` (pantalla + Ctrl+P), sitemap/robots en el browser, y que el sitio se vea idéntico (las tasks no tocan UI pública salvo el favicon). Recién después: merge ff a `master` (usar superpowers:finishing-a-development-branch).

- [ ] **Step 5 (MANUAL — Lauti, post-merge):** verificar Analytics reportando en el dashboard de Vercel, cargar los secrets de CI si no se hizo en Task 11, y mandar a Micka los candidatos de dominio (runbook listo).
