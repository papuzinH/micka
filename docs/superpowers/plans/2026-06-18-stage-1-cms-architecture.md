# Stage 1 — CMS Architecture & Structure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dejar el entorno Next.js, el backend PocketBase (datos + auth + storage R2), el modelo de datos y el login admin funcionando, como base para construir el sitio en stages posteriores.

**Architecture:** Next.js (App Router) en Vercel consume una instancia de PocketBase alojada en el VPS `lhstudio.com.ar` vía su SDK REST. PocketBase guarda los archivos en Cloudflare R2 (S3). El front es bilingüe (`/en` default, `/fr`) con next-intl. El data layer tipado aísla todo acceso a PocketBase.

**Tech Stack:** Next.js 15+ (App Router, TypeScript), Tailwind CSS, next-intl, PocketBase + PocketBase JS SDK, Cloudflare R2, Vitest, Playwright.

## Global Constraints

- Next.js App Router (no Pages Router); TypeScript estricto.
- i18n con next-intl, rutas localizadas; locales `en` (default) y `fr`.
- Todo acceso a PocketBase pasa por `src/lib/pocketbase` (ningún componente importa el SDK directo).
- Campos de texto de contenido en PocketBase tienen variantes `_en` y `_fr`.
- PocketBase expuesto en `https://micka.lhstudio.com.ar` con SSL.
- Storage de archivos de PocketBase: Cloudflare R2 (S3-compatible). El VPS no sirve archivos.
- Design tokens (Figma): colores Negro `#000000`, Gris `#202020`, Gris fondo `#212121`, Gris claro `#373636`, Blanco `#ffffff`, Violeta `#a020f0`, Violeta oscuro `#8315c8`. Fuentes: Syne (titulares, bold), Inter (body).
- URL de PocketBase y credenciales viven en variables de entorno (`.env.local`, nunca commiteadas).
- Commits frecuentes, uno por tarea como mínimo.

---

## File Structure

```
Micka/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # layout localizado (fuentes, html lang)
│   │   │   └── page.tsx            # placeholder Home (real en Stage 2)
│   │   ├── admin/
│   │   │   ├── login/page.tsx      # login admin
│   │   │   └── page.tsx            # dashboard protegido (placeholder)
│   │   └── globals.css
│   ├── lib/
│   │   ├── pocketbase/
│   │   │   ├── client.ts           # factory del cliente PB (server/browser)
│   │   │   ├── types.ts            # tipos de colecciones
│   │   │   └── auth.ts             # helpers login/logout/sesión admin
│   │   └── i18n/
│   │       ├── routing.ts          # locales + routing next-intl
│   │       └── request.ts          # config de request next-intl
│   ├── middleware.ts               # middleware next-intl
│   └── messages/
│       ├── en.json
│       └── fr.json
├── pocketbase/
│   └── pb_schema.json              # export de colecciones (importable)
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── docs/superpowers/...
```

---

## Task 1: Scaffold Next.js + Tailwind + tooling + design tokens

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/globals.css`, `vitest.config.ts`
- Create: `.env.local.example`, `.gitignore` (extender el existente)

**Interfaces:**
- Consumes: nada (primera tarea).
- Produces: proyecto Next.js ejecutable; tokens Tailwind `colors.brand.*` y fuentes `font-display` (Syne) / `font-body` (Inter); script `npm run test` (Vitest) y `npm run build`.

- [ ] **Step 1: Scaffold el proyecto Next.js en la carpeta actual**

Run (PowerShell, en `C:\Users\Adriel\Documents\Proyectos\Micka`):
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" --no-turbopack
```
Cuando pregunte por sobrescribir archivos existentes (`docs/`, `.git`), elegir conservarlos / continuar. Expected: estructura `src/app/` creada, `npm run dev` disponible.

- [ ] **Step 2: Verificar que el dev server arranca**

Run: `npm run dev` y abrir `http://localhost:3000`. Expected: página default de Next.js. Cortar con Ctrl+C.

- [ ] **Step 3: Instalar Vitest y testing libs**

Run:
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 4: Crear `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

Crear `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

Agregar a `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Definir design tokens en `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          gray: "#202020",
          "gray-bg": "#212121",
          "gray-light": "#373636",
          white: "#ffffff",
          violet: "#a020f0",
          "violet-dark": "#8315c8",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        button: "0 4px 4px 0 #00000040",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 6: Escribir test que verifica los tokens de marca**

Create `src/lib/__tests__/tokens.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import tailwindConfig from "../../../tailwind.config";

describe("design tokens", () => {
  it("define los colores de marca del Figma", () => {
    const colors = (tailwindConfig.theme?.extend?.colors as any).brand;
    expect(colors.violet).toBe("#a020f0");
    expect(colors["gray-bg"]).toBe("#212121");
    expect(colors.black).toBe("#000000");
  });
});
```

- [ ] **Step 7: Correr el test (debe pasar) y el build**

Run: `rtk vitest run` → Expected: PASS.
Run: `rtk next build` → Expected: build sin errores.

- [ ] **Step 8: Crear `.env.local.example` y asegurar `.gitignore`**

`.env.local.example`:
```
NEXT_PUBLIC_POCKETBASE_URL=https://micka.lhstudio.com.ar
POCKETBASE_ADMIN_EMAIL=
POCKETBASE_ADMIN_PASSWORD=
```
Verificar que `.gitignore` incluye `.env*.local`. Expected: presente (create-next-app lo agrega).

- [ ] **Step 9: Commit**

```bash
git add -A
rtk git commit -m "feat: scaffold Next.js app with Tailwind, Vitest and brand design tokens"
```

---

## Task 2: i18n con next-intl (/en default, /fr)

**Files:**
- Create: `src/lib/i18n/routing.ts`, `src/lib/i18n/request.ts`, `src/middleware.ts`, `src/messages/en.json`, `src/messages/fr.json`
- Create: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- Modify: `next.config.ts`
- Test: `src/lib/i18n/__tests__/routing.test.ts`, `tests/e2e/locale.spec.ts`

**Interfaces:**
- Consumes: proyecto de Task 1.
- Produces: `routing` con `locales = ["en","fr"]`, `defaultLocale = "en"`; rutas `/en` y `/fr` operativas; helper `Link`/`redirect` localizados desde `@/lib/i18n/routing`.

- [ ] **Step 1: Instalar next-intl**

Run: `npm install next-intl`

- [ ] **Step 2: Escribir el test de configuración de routing (falla)**

Create `src/lib/i18n/__tests__/routing.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { routing } from "../routing";

describe("i18n routing", () => {
  it("soporta en y fr con en por defecto", () => {
    expect(routing.locales).toEqual(["en", "fr"]);
    expect(routing.defaultLocale).toBe("en");
  });
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `rtk vitest run src/lib/i18n/__tests__/routing.test.ts`
Expected: FAIL ("Cannot find module '../routing'").

- [ ] **Step 4: Crear `src/lib/i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 5: Crear `src/lib/i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 6: Crear `src/middleware.ts`**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|admin|.*\\..*).*)"],
};
```

- [ ] **Step 7: Conectar el plugin en `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 8: Crear mensajes y layout/página localizados**

`src/messages/en.json`:
```json
{ "common": { "siteName": "Micka's Photos" } }
```
`src/messages/fr.json`:
```json
{ "common": { "siteName": "Micka's Photos" } }
```

`src/app/[locale]/layout.tsx`:
```tsx
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Syne, Inter } from "next/font/google";
import { routing } from "@/lib/i18n/routing";
import "../globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-brand-black text-brand-white font-body">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`src/app/[locale]/page.tsx`:
```tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");
  return <main className="p-8 font-display text-3xl">{t("siteName")}</main>;
}
```

Borrar `src/app/page.tsx` y `src/app/layout.tsx` que generó create-next-app (el layout raíz pasa a ser `[locale]/layout.tsx`).

- [ ] **Step 9: Correr el test unitario (pasa) y el build**

Run: `rtk vitest run src/lib/i18n/__tests__/routing.test.ts` → Expected: PASS.
Run: `rtk next build` → Expected: build OK con rutas `/en` y `/fr`.

- [ ] **Step 10: Configurar Playwright y escribir e2e de locales**

Run: `npm init playwright@latest` (TypeScript, carpeta `tests/e2e`, no GitHub Actions).
Create `tests/e2e/locale.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("redirige la raíz a /en por defecto", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("main")).toContainText("Micka's Photos");
});

test("sirve la versión francesa en /fr", async ({ page }) => {
  await page.goto("/fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
```
Asegurar en `playwright.config.ts` el `webServer` (`command: "npm run dev"`, `url: "http://localhost:3000"`) y `use.baseURL`.

- [ ] **Step 11: Correr el e2e**

Run: `rtk playwright test tests/e2e/locale.spec.ts` → Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add -A
rtk git commit -m "feat: add next-intl bilingual routing (/en default, /fr)"
```

---

## Task 3: Provisionar PocketBase en el VPS (subdominio + SSL)

> Tarea de infraestructura (manual vía SSH). No lleva test unitario; la verificación es la respuesta HTTP del API.

**Files:**
- Create (en el VPS): `/opt/micka-pb/` (binario + datos), unidad systemd `micka-pb.service`, bloque de reverse proxy para `micka.lhstudio.com.ar`.

**Interfaces:**
- Consumes: VPS `lhstudio.com.ar` con reverse proxy existente (nginx o caddy).
- Produces: API PocketBase accesible en `https://micka.lhstudio.com.ar` y panel admin en `/_/`.

- [ ] **Step 1: Crear el registro DNS del subdominio**

En el panel DNS de `lhstudio.com.ar`, crear `micka` → A/CNAME apuntando al VPS (igual que las instancias actuales). Expected: `nslookup micka.lhstudio.com.ar` resuelve a la IP del VPS.

- [ ] **Step 2: Descargar e instalar PocketBase en el VPS**

SSH al VPS y:
```bash
sudo mkdir -p /opt/micka-pb && cd /opt/micka-pb
PB_VER=$(curl -s https://api.github.com/repos/pocketbase/pocketbase/releases/latest | grep -oP '"tag_name": "v\K[^"]+')
curl -L -o pb.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VER}/pocketbase_${PB_VER}_linux_amd64.zip"
unzip pb.zip && rm pb.zip
```
Expected: binario `pocketbase` presente. Elegir un puerto libre que no choque con las 2 instancias existentes (ej. `8092`).

- [ ] **Step 3: Crear servicio systemd**

`/etc/systemd/system/micka-pb.service`:
```ini
[Unit]
Description=Micka PocketBase
After=network.target

[Service]
Type=simple
User=www-data
ExecStart=/opt/micka-pb/pocketbase serve --http=127.0.0.1:8092
WorkingDirectory=/opt/micka-pb
Restart=always

[Install]
WantedBy=multi-user.target
```
Run:
```bash
sudo chown -R www-data:www-data /opt/micka-pb
sudo systemctl daemon-reload && sudo systemctl enable --now micka-pb
sudo systemctl status micka-pb
```
Expected: `active (running)`.

- [ ] **Step 4: Configurar reverse proxy + SSL para el subdominio**

Agregar el server block del subdominio en el proxy (mismo método que las instancias actuales). Ejemplo nginx:
```nginx
server {
  server_name micka.lhstudio.com.ar;
  client_max_body_size 50M;          # uploads de fotos
  location / { proxy_pass http://127.0.0.1:8092; proxy_set_header Host $host; }
}
```
Run: `sudo nginx -t && sudo systemctl reload nginx` y emitir cert con `sudo certbot --nginx -d micka.lhstudio.com.ar`.
Expected: `nginx -t` OK; certbot emite certificado.

- [ ] **Step 5: Verificar el API por HTTPS**

Run (local): `rtk curl https://micka.lhstudio.com.ar/api/health`
Expected: JSON `{"code":200,"message":"API is healthy."...}`.

- [ ] **Step 6: Crear el superuser (admin de PocketBase)**

En el VPS:
```bash
cd /opt/micka-pb && sudo -u www-data ./pocketbase superuser create admin@micka.local "<password-fuerte>"
```
Expected: confirmación de superuser creado. Guardar credenciales en gestor seguro (no en git).

- [ ] **Step 7: Registrar la URL en entorno local**

Crear `.env.local` (no commiteado) con:
```
NEXT_PUBLIC_POCKETBASE_URL=https://micka.lhstudio.com.ar
```
Expected: variable disponible para Tasks 5–7. (No hay commit de código en esta tarea; documentar el procedimiento en `pocketbase/README.md` y commitearlo.)

- [ ] **Step 8: Documentar y commit**

Create `pocketbase/README.md` con los pasos de provisión (puerto, servicio, proxy, subdominio).
```bash
git add pocketbase/README.md
rtk git commit -m "docs: document PocketBase VPS provisioning for Micka"
```

---

## Task 4: Configurar Cloudflare R2 como storage de PocketBase

> Infra/config. Verificación: un archivo subido aparece en el bucket R2.

**Files:**
- Modify (en el VPS): settings de storage de PocketBase (vía panel admin `/_/`).
- Modify: `pocketbase/README.md` (sección R2).

**Interfaces:**
- Consumes: instancia PocketBase de Task 3; cuenta Cloudflare.
- Produces: archivos de PocketBase persistidos en R2; URLs de archivo servidas por R2.

- [ ] **Step 1: Crear bucket y credenciales R2**

En Cloudflare → R2: crear bucket `micka-media`. Crear API Token R2 (Access Key ID + Secret). Anotar el endpoint S3: `https://<accountid>.r2.cloudflarestorage.com`. Expected: bucket creado, credenciales obtenidas.

- [ ] **Step 2: Configurar S3 storage en PocketBase**

En `https://micka.lhstudio.com.ar/_/` → Settings → Files storage → habilitar "Use S3 storage" con:
- Endpoint: `https://<accountid>.r2.cloudflarestorage.com`
- Bucket: `micka-media`
- Region: `auto`
- Access key / Secret: las del token R2
- Force path style: ON

Click "Test S3 connection". Expected: "Successfully tested...".

- [ ] **Step 3: Verificar subida real**

Subir una imagen de prueba a cualquier colección (o crear un registro temporal) desde el panel admin. Run (Cloudflare dashboard o `rtk curl` con credenciales): confirmar que el objeto aparece en `micka-media`. Expected: archivo presente en R2; borrar el registro de prueba.

- [ ] **Step 4: Documentar y commit**

Actualizar `pocketbase/README.md` con la config de R2 (sin secretos).
```bash
git add pocketbase/README.md
rtk git commit -m "docs: configure Cloudflare R2 storage for PocketBase"
```

---

## Task 5: Definir las colecciones del CMS

**Files:**
- Create: `pocketbase/pb_schema.json` (export de colecciones, versionado).
- Test: `pocketbase/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: PocketBase de Tasks 3–4.
- Produces: colecciones `categories`, `albums`, `photos`, `reviews`, `collabs`, `site_content`, `contact_messages` con los campos del spec. Estos nombres y campos los consumen Tasks 6–7 y los stages siguientes.

- [ ] **Step 1: Crear las colecciones en el panel admin**

En `/_/` → Collections, crear según el modelo del spec:
- `categories`: `name_en` (text, req), `name_fr` (text, req), `slug` (text, req, único), `order` (number).
- `albums`: `title_en`, `title_fr`, `slug` (único), `category` (relation→categories), `cover` (file, image, single), `description_en` (editor), `description_fr` (editor), `date` (date), `order` (number), `starred` (bool), `published` (bool).
- `photos`: `album` (relation→albums), `image` (file, image, single, req), `alt_en` (text), `alt_fr` (text), `caption_en` (text), `caption_fr` (text), `order` (number).
- `reviews`: `author` (text, req), `role` (text), `quote_en` (text, req), `quote_fr` (text, req), `avatar` (file, image), `order` (number), `published` (bool).
- `collabs`: `name` (text, req), `logo` (file, image), `url` (url), `description_en` (text), `description_fr` (text), `order` (number), `published` (bool).
- `site_content`: `key` (text, req, único), `value_en` (text), `value_fr` (text).
- `contact_messages`: `name` (text, req), `email` (email, req), `message` (text, req), `locale` (select: en, fr).

API rules: lectura pública (`@request.auth.id != "" || published = true` según corresponda; para colecciones de contenido, list/view abiertas filtrando `published = true`); create/update/delete solo para superusers (admin). `contact_messages`: create público, list/view/update/delete solo admin.

- [ ] **Step 2: Exportar el esquema a `pb_schema.json`**

En `/_/` → Settings → Export collections → copiar el JSON a `pocketbase/pb_schema.json`. Expected: archivo con las 7 colecciones.

- [ ] **Step 3: Escribir test que valida el esquema versionado (falla si falta algo)**

Create `pocketbase/__tests__/schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import schema from "../pb_schema.json";

const collections = (schema as any[]).map((c) => c.name);

describe("pb schema", () => {
  it("incluye todas las colecciones del CMS", () => {
    for (const name of [
      "categories", "albums", "photos", "reviews",
      "collabs", "site_content", "contact_messages",
    ]) {
      expect(collections).toContain(name);
    }
  });

  it("albums tiene campos bilingües y starred", () => {
    const albums = (schema as any[]).find((c) => c.name === "albums");
    const fields = albums.fields.map((f: any) => f.name);
    expect(fields).toEqual(expect.arrayContaining(["title_en", "title_fr", "starred", "published"]));
  });
});
```
> Nota: si el export usa `schema` en vez de `fields` según la versión de PocketBase, ajustar el acceso al array de campos en el test.

- [ ] **Step 4: Correr el test**

Run: `rtk vitest run pocketbase/__tests__/schema.test.ts` → Expected: PASS (tras ajustar la clave de campos si hiciera falta).

- [ ] **Step 5: Commit**

```bash
git add pocketbase/pb_schema.json pocketbase/__tests__/schema.test.ts
rtk git commit -m "feat: define and version PocketBase CMS collections schema"
```

---

## Task 6: Data layer tipado (`src/lib/pocketbase`)

**Files:**
- Create: `src/lib/pocketbase/client.ts`, `src/lib/pocketbase/types.ts`
- Test: `src/lib/pocketbase/__tests__/client.test.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_POCKETBASE_URL`; nombres de colecciones de Task 5.
- Produces:
  - `createPocketBase(): PocketBase` — instancia nueva (uso server-side).
  - Tipos `Category`, `Album`, `Photo`, `Review`, `Collab`, `SiteContent`, `ContactMessage`.
  - `getPocketBaseUrl(): string` — lee el env y lanza si falta.

- [ ] **Step 1: Instalar el SDK**

Run: `npm install pocketbase`

- [ ] **Step 2: Escribir el test del factory (falla)**

Create `src/lib/pocketbase/__tests__/client.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { createPocketBase, getPocketBaseUrl } from "../client";

describe("pocketbase client", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_POCKETBASE_URL = "https://micka.lhstudio.com.ar";
  });

  it("getPocketBaseUrl devuelve la URL del env", () => {
    expect(getPocketBaseUrl()).toBe("https://micka.lhstudio.com.ar");
  });

  it("createPocketBase usa baseURL del env", () => {
    const pb = createPocketBase();
    expect(pb.baseURL).toBe("https://micka.lhstudio.com.ar");
  });

  it("lanza si falta la env var", () => {
    delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
    expect(() => getPocketBaseUrl()).toThrow(/POCKETBASE_URL/);
  });
});
```

- [ ] **Step 3: Correr el test y verificar que falla**

Run: `rtk vitest run src/lib/pocketbase/__tests__/client.test.ts`
Expected: FAIL ("Cannot find module '../client'").

- [ ] **Step 4: Crear `src/lib/pocketbase/types.ts`**

```ts
export interface Category { id: string; name_en: string; name_fr: string; slug: string; order: number; }
export interface Album {
  id: string; title_en: string; title_fr: string; slug: string; category: string;
  cover: string; description_en: string; description_fr: string; date: string;
  order: number; starred: boolean; published: boolean;
}
export interface Photo {
  id: string; album: string; image: string; alt_en: string; alt_fr: string;
  caption_en: string; caption_fr: string; order: number;
}
export interface Review {
  id: string; author: string; role: string; quote_en: string; quote_fr: string;
  avatar: string; order: number; published: boolean;
}
export interface Collab {
  id: string; name: string; logo: string; url: string;
  description_en: string; description_fr: string; order: number; published: boolean;
}
export interface SiteContent { id: string; key: string; value_en: string; value_fr: string; }
export interface ContactMessage { id: string; name: string; email: string; message: string; locale: "en" | "fr"; }
```

- [ ] **Step 5: Crear `src/lib/pocketbase/client.ts`**

```ts
import PocketBase from "pocketbase";

export function getPocketBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_POCKETBASE_URL no está definida");
  return url;
}

export function createPocketBase(): PocketBase {
  return new PocketBase(getPocketBaseUrl());
}
```

- [ ] **Step 6: Correr el test (pasa)**

Run: `rtk vitest run src/lib/pocketbase/__tests__/client.test.ts` → Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/pocketbase
rtk git commit -m "feat: add typed PocketBase client and collection types"
```

---

## Task 7: Pantalla de login del administrador

**Files:**
- Create: `src/lib/pocketbase/auth.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/actions.ts`
- Test: `src/lib/pocketbase/__tests__/auth.test.ts`, `tests/e2e/admin-login.spec.ts`

**Interfaces:**
- Consumes: `createPocketBase` de Task 6; superuser de Task 3.
- Produces: Server Action `loginAdmin(formData)` que autentica contra PocketBase y setea cookie de sesión; `getAdminSession()` que devuelve la sesión o `null`; redirección a `/admin/login` si no hay sesión.

- [ ] **Step 1: Escribir el test de los helpers de auth (falla)**

Create `src/lib/pocketbase/__tests__/auth.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { parseAuthCookie, isValidAuth } from "../auth";

describe("admin auth helpers", () => {
  it("isValidAuth es false con cookie vacía", () => {
    expect(isValidAuth("")).toBe(false);
  });

  it("parseAuthCookie devuelve null con valor inválido", () => {
    expect(parseAuthCookie("no-es-json")).toBeNull();
  });

  it("parseAuthCookie extrae el token de un cookie válido", () => {
    const cookie = JSON.stringify({ token: "abc", record: { id: "1" } });
    expect(parseAuthCookie(cookie)?.token).toBe("abc");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `rtk vitest run src/lib/pocketbase/__tests__/auth.test.ts`
Expected: FAIL ("Cannot find module '../auth'").

- [ ] **Step 3: Crear `src/lib/pocketbase/auth.ts`**

```ts
export const ADMIN_COOKIE = "pb_admin_auth";

export interface AuthCookie { token: string; record: { id: string } }

export function parseAuthCookie(raw: string | undefined): AuthCookie | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === "string") return parsed as AuthCookie;
    return null;
  } catch {
    return null;
  }
}

export function isValidAuth(raw: string | undefined): boolean {
  return parseAuthCookie(raw)?.token ? true : false;
}
```

- [ ] **Step 4: Correr el test (pasa)**

Run: `rtk vitest run src/lib/pocketbase/__tests__/auth.test.ts` → Expected: PASS.

- [ ] **Step 5: Crear la Server Action de login**

`src/app/admin/actions.ts`:
```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createPocketBase } from "@/lib/pocketbase/client";
import { ADMIN_COOKIE } from "@/lib/pocketbase/auth";

export async function loginAdmin(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const pb = createPocketBase();
  try {
    await pb.collection("_superusers").authWithPassword(email, password);
  } catch {
    return { error: "Credenciales inválidas" };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, pb.authStore.exportToCookie(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
```

- [ ] **Step 6: Crear la página de login**

`src/app/admin/login/page.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { loginAdmin } from "../actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" } as { error?: string });
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-black text-brand-white">
      <form action={action} className="w-80 space-y-4">
        <h1 className="font-display text-2xl">Admin</h1>
        <input name="email" type="email" placeholder="Email" required
          className="w-full bg-brand-gray-bg p-2 rounded" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full bg-brand-gray-bg p-2 rounded" />
        {state?.error ? <p className="text-brand-violet text-sm">{state.error}</p> : null}
        <button type="submit" disabled={pending}
          className="w-full bg-brand-violet shadow-button rounded p-2 disabled:opacity-50">
          {pending ? "..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: Crear el dashboard protegido**

`src/app/admin/page.tsx`:
```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidAuth, ADMIN_COOKIE } from "@/lib/pocketbase/auth";
import { logoutAdmin } from "./actions";

export default async function AdminDashboard() {
  const store = await cookies();
  if (!isValidAuth(store.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return (
    <main className="min-h-screen bg-brand-black text-brand-white p-8">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl">Panel Micka</h1>
        <form action={logoutAdmin}><button className="text-brand-violet">Salir</button></form>
      </div>
      <p className="mt-4 text-brand-gray-light">CRUD de contenido — Stage 2.</p>
    </main>
  );
}
```

- [ ] **Step 8: Escribir e2e de login**

Create `tests/e2e/admin-login.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test("redirige a login si no hay sesión", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("muestra error con credenciales inválidas", async ({ page }) => {
  await page.goto("/admin/login");
  await page.fill('input[name="email"]', "wrong@test.com");
  await page.fill('input[name="password"]', "wrongpass");
  await page.click('button[type="submit"]');
  await expect(page.locator("text=Credenciales inválidas")).toBeVisible();
});
```

- [ ] **Step 9: Correr e2e (requiere PocketBase accesible)**

Run: `rtk playwright test tests/e2e/admin-login.spec.ts` → Expected: PASS.
> Si PocketBase no está accesible desde el entorno de test, el segundo test puede skipearse con `test.skip` documentando el motivo.

- [ ] **Step 10: Commit**

```bash
git add -A
rtk git commit -m "feat: add admin login with PocketBase auth and protected dashboard"
```

---

## Self-Review

**Spec coverage (Stage 1):**
- Entorno Next.js → Task 1 ✓
- i18n /en /fr → Task 2 ✓
- PocketBase en VPS + subdominio + SSL → Task 3 ✓
- Storage R2 → Task 4 ✓
- Modelado de colecciones (datos para imágenes, portfolio, reviews, collabs, textos, contacto) → Task 5 ✓
- Data layer tipado → Task 6 ✓
- Pantalla de login admin → Task 7 ✓

**Pendiente para Stages siguientes (no en este plan):** layout pixel-perfect y subpáginas (Stage 2), CRUD admin completo y formulario de contacto con email (Stage 2), motion GSAP (Stage 3), optimización/SEO/deploy (Stage 4).
