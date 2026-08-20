# Imágenes del sitio editables — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que Micka pueda reemplazar desde `/admin` las diez fotos del sitio que hoy están hardcodeadas a `/placeholders`.

**Architecture:** Una colección `site_images` de un solo registro con diez campos `file`. El sitio la lee con `getSiteImages()` y resuelve cada slot con `siteImageUrl()`, que cae al placeholder local cuando no hay archivo cargado. Los cuatro componentes de la Home pasan a recibir las URLs por props, siguiendo el patrón que la página ya usa con `StarredAlbums` y `FavesGallery`.

**Tech Stack:** Next.js 16 (App Router, server components), PocketBase 0.39.4, TypeScript, Vitest + Testing Library, Tailwind.

**Spec:** `docs/superpowers/specs/2026-08-20-editable-site-images-design.md`

## Global Constraints

- **Rama de trabajo:** `feat/editable-site-images` (ya creada, con la spec commiteada).
- **Entorno de verificación:** Node 24 / npm 11 — es el entorno del CI. Si `node -v` devuelve 22.x, avisar antes de seguir: el proyecto ya tuvo un bug de lockfile que el CI no vio por correr en otra versión de npm.
- **Verificación de cada task:** `npx tsc --noEmit && npm run lint && npm test`. La build (`npm run build`) se corre en la task final.
- **Idioma:** el código y los textos del panel van en **inglés** (los ve el cliente). Los comentarios del código van en **español**, como el resto del repo.
- **Límite de archivo:** 15 MB = `15728640` bytes.
- **Whitelist de thumbs:** exactamente `["400x0", "800x0", "1200x0", "1920x0"]` en los diez campos. Un thumb fuera del whitelist hace que PocketBase sirva el original sin avisar.
- **Nombres de los diez campos:** `home_hero`, `home_portrait`, `home_strip_1`, `home_strip_2`, `home_strip_3`, `home_editorial_1`, `home_editorial_2`, `home_craft_1`, `home_craft_2`, `about_portrait`.
- **Ningún placeholder de `public/placeholders/` se borra**: son el fallback.

---

### Task 1: Colección `site_images` en el esquema

**Files:**
- Modify: `pocketbase/pb_schema.json` (agregar la colección al final del array, después de `contact_messages`)
- Modify: `pocketbase/set-file-limits.mjs:36-43` (TARGETS y su loop)
- Test: `pocketbase/__tests__/schema.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: la colección `site_images` con diez campos `file`, consumida por las tasks 2, 5 y 11.

- [ ] **Step 1: Escribir el test que falla**

Agregar a `pocketbase/__tests__/schema.test.ts`:

```typescript
const SITE_IMAGE_FIELDS = [
  "home_hero",
  "home_portrait",
  "home_strip_1",
  "home_strip_2",
  "home_strip_3",
  "home_editorial_1",
  "home_editorial_2",
  "home_craft_1",
  "home_craft_2",
  "about_portrait",
];

describe("site_images", () => {
  const col = () =>
    (schema as Array<Record<string, unknown>>).find(
      (c) => c.name === "site_images",
    ) as {
      fields: Array<{
        name: string;
        type: string;
        maxSize?: number;
        thumbs?: string[];
      }>;
      listRule: string | null;
      viewRule: string | null;
      createRule: string | null;
    };

  it("existe y declara los diez campos de imagen", () => {
    const fields = col().fields.filter((f) => f.type === "file");
    expect(fields.map((f) => f.name)).toEqual(SITE_IMAGE_FIELDS);
  });

  it("cada campo acepta 15MB y declara el whitelist completo de thumbs", () => {
    for (const f of col().fields.filter((f) => f.type === "file")) {
      expect(f.maxSize).toBe(15728640);
      expect(f.thumbs).toEqual(["400x0", "800x0", "1200x0", "1920x0"]);
    }
  });

  it("es de lectura pública y no se puede crear ni borrar desde la API", () => {
    expect(col().listRule).toBe("");
    expect(col().viewRule).toBe("");
    expect(col().createRule).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run pocketbase/__tests__/schema.test.ts`
Expected: FAIL — `col()` devuelve `undefined` y rompe al leer `.fields`.

- [ ] **Step 3: Agregar la colección a `pb_schema.json`**

Al final del array (después del objeto de `contact_messages`). Los diez campos `file` son idénticos salvo el `name` — repetir el bloque cambiando solo esa clave, en el orden de `SITE_IMAGE_FIELDS`:

```json
{
  "id": "col_siteimages001",
  "name": "site_images",
  "type": "base",
  "system": false,
  "fields": [
    {
      "type": "text",
      "name": "id",
      "system": true,
      "required": true,
      "primaryKey": true,
      "min": 15,
      "max": 15,
      "pattern": "^[a-z0-9]+$",
      "autogeneratePattern": "[a-z0-9]{15}"
    },
    {
      "type": "file",
      "name": "home_hero",
      "required": false,
      "maxSelect": 1,
      "maxSize": 15728640,
      "mimeTypes": ["image/jpeg", "image/png", "image/webp", "image/avif"],
      "thumbs": ["400x0", "800x0", "1200x0", "1920x0"],
      "protected": false
    },
    {
      "type": "autodate",
      "name": "created",
      "onCreate": true,
      "onUpdate": false
    },
    {
      "type": "autodate",
      "name": "updated",
      "onCreate": true,
      "onUpdate": true
    }
  ],
  "indexes": [],
  "listRule": "",
  "viewRule": "",
  "createRule": null,
  "updateRule": null,
  "deleteRule": null
}
```

Los diez campos `file` van seguidos entre `id` y `created`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run pocketbase/__tests__/schema.test.ts`
Expected: PASS

- [ ] **Step 5: Sumar `site_images` a `set-file-limits.mjs`**

La estructura actual mapea una colección a **un** campo. Cambiarla a lista de campos, reemplazando `TARGETS`:

```javascript
const TARGETS = {
  albums: ["cover"],
  photos: ["image"],
  reviews: ["avatar"],
  collabs: ["logo"],
  site_images: [
    "home_hero",
    "home_portrait",
    "home_strip_1",
    "home_strip_2",
    "home_strip_3",
    "home_editorial_1",
    "home_editorial_2",
    "home_craft_1",
    "home_craft_2",
    "about_portrait",
  ],
};
```

Y el loop dentro de `main()`:

```javascript
for (const [collection, fieldNames] of Object.entries(TARGETS)) {
  const col = await pb.collections.getOne(collection);
  const fields = col.fields.map((f) =>
    fieldNames.includes(f.name) ? { ...f, maxSize: LIMIT } : f,
  );
  await pb.collections.update(col.id, { fields });
  console.log(`✓ ${collection}: ${fieldNames.join(", ")} → maxSize ${LIMIT}`);
}
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde. El script no se ejecuta todavía (eso es la Task 12).

- [ ] **Step 7: Commit**

```bash
git add pocketbase/pb_schema.json pocketbase/set-file-limits.mjs pocketbase/__tests__/schema.test.ts
git commit -m "feat(pocketbase): add site_images collection for CMS-editable site photos"
```

---

### Task 2: Config del panel y flag `singleton`

**Files:**
- Modify: `src/lib/admin/collections.ts` (interface `CollectionConfig` + entrada nueva al final de `COLLECTIONS`, antes del cierre `];`)
- Test: `src/lib/admin/__tests__/collections.test.ts` (crear)

**Interfaces:**
- Consumes: los nombres de campo de la Task 1.
- Produces: `CollectionConfig.singleton?: boolean` (lo usa la Task 3) y la entrada `site_images` con `slug: "site-images"`.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/admin/__tests__/collections.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { COLLECTIONS, getCollection } from "../collections";

describe("site_images", () => {
  const col = () => getCollection("site-images")!;

  it("está registrada y es singleton de solo edición", () => {
    expect(col()).toBeDefined();
    expect(col().singleton).toBe(true);
    expect(col().canCreate).toBe(false);
  });

  it("declara los diez slots como campos file, todos con label y ayuda", () => {
    const fields = col().fields;
    expect(fields).toHaveLength(10);
    for (const f of fields) {
      expect(f.type).toBe("file");
      expect(f.label).toBeTruthy();
      expect(f.help).toBeTruthy();
      expect(f.thumb).toBeTruthy();
    }
  });

  it("ninguna otra colección es singleton", () => {
    const others = COLLECTIONS.filter((c) => c.slug !== "site-images");
    expect(others.every((c) => !c.singleton)).toBe(true);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/admin/__tests__/collections.test.ts`
Expected: FAIL — `getCollection("site-images")` devuelve `undefined`.

- [ ] **Step 3: Agregar el flag a la interface**

En `CollectionConfig`, junto a `canCreate` / `canEdit`:

```typescript
  /** Colección de un solo registro: el listado redirige directo a su form. */
  singleton?: boolean;
```

- [ ] **Step 4: Agregar la entrada a `COLLECTIONS`**

Como último elemento del array (después de `contact_messages`). El `titleField` apunta a `id` porque la colección no tiene campos de texto — no llega a usarse, porque el listado nunca se muestra (Task 3):

```typescript
  {
    name: "site_images",
    slug: "site-images",
    label: "Site images",
    labelSingular: "Site images",
    titleField: "id",
    defaultSort: "created",
    canCreate: false,
    singleton: true,
    fields: [
      { name: "home_hero", label: "Home — hero background", type: "file", thumb: "1920x0", help: "The full-width photo behind your name at the top of the Home page. Landscape works best." },
      { name: "home_portrait", label: "Home — portrait", type: "file", thumb: "400x0", help: "The small portrait of you next to your name on the Home page. Portrait orientation." },
      { name: "home_strip_1", label: "Home — strip photo 1", type: "file", thumb: "800x0", help: "First of the three photos beside the Home heading. The widest of the three." },
      { name: "home_strip_2", label: "Home — strip photo 2", type: "file", thumb: "800x0", help: "Second of the three photos beside the Home heading." },
      { name: "home_strip_3", label: "Home — strip photo 3", type: "file", thumb: "800x0", help: "Third of the three photos beside the Home heading." },
      { name: "home_editorial_1", label: "Home — editorial photo 1", type: "file", thumb: "800x0", help: "Left photo in the four-column text-and-image band on the Home page." },
      { name: "home_editorial_2", label: "Home — editorial photo 2", type: "file", thumb: "800x0", help: "Right photo in the four-column text-and-image band on the Home page." },
      { name: "home_craft_1", label: "Home — craft photo 1", type: "file", thumb: "800x0", help: "Left photo in the band below your featured albums." },
      { name: "home_craft_2", label: "Home — craft photo 2", type: "file", thumb: "800x0", help: "Right photo in the band below your featured albums." },
      { name: "about_portrait", label: "About — portrait", type: "file", thumb: "1200x0", help: "The large portrait on the About page. Can be the same photo as the Home portrait, but this one is shown much bigger." },
    ],
  },
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/admin/__tests__/collections.test.ts`
Expected: PASS

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/collections.ts src/lib/admin/__tests__/collections.test.ts
git commit -m "feat(admin): register site_images as a singleton collection"
```

---

### Task 3: El listado de una colección singleton redirige a su formulario

**Files:**
- Create: `src/lib/admin/singleton.ts`
- Create: `src/lib/admin/__tests__/singleton.test.ts`
- Modify: `src/app/(admin)/admin/(panel)/[collection]/page.tsx`

**Interfaces:**
- Consumes: `CollectionConfig.singleton` (Task 2).
- Produces: `singletonTarget(collection: CollectionConfig, records: { id: string }[]): string | null` — la ruta a la que redirigir, o `null` si no hay que redirigir.

Sin esto, Micka entra a "Site images" y ve una fila cuyo título es el id crudo del registro (`recordTitle()` cae a `r.id` porque la colección no tiene campos de texto).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/admin/__tests__/singleton.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import type { CollectionConfig } from "../collections";
import { singletonTarget } from "../singleton";

const base: CollectionConfig = {
  name: "site_images",
  slug: "site-images",
  label: "Site images",
  labelSingular: "Site images",
  titleField: "id",
  defaultSort: "created",
  fields: [],
};

describe("singletonTarget", () => {
  it("devuelve la ruta del único registro de una colección singleton", () => {
    expect(
      singletonTarget({ ...base, singleton: true }, [{ id: "abc123" }]),
    ).toBe("/admin/site-images/abc123");
  });

  it("devuelve null si la colección no es singleton", () => {
    expect(singletonTarget(base, [{ id: "abc123" }])).toBeNull();
  });

  it("devuelve null si todavía no hay registro (hay que correr el seed)", () => {
    expect(singletonTarget({ ...base, singleton: true }, [])).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/admin/__tests__/singleton.test.ts`
Expected: FAIL — `Cannot find module '../singleton'`.

- [ ] **Step 3: Implementar el helper**

Crear `src/lib/admin/singleton.ts`:

```typescript
import type { CollectionConfig } from "./collections";

/**
 * Ruta del formulario del único registro de una colección `singleton`, para
 * saltearle a quien edita un listado de una sola fila. Devuelve `null` cuando
 * la colección es normal o cuando el registro todavía no existe (falta correr
 * el seed): en ese caso el listado se muestra como siempre.
 */
export function singletonTarget(
  collection: CollectionConfig,
  records: { id: string }[],
): string | null {
  if (!collection.singleton) return null;
  const only = records[0];
  return only ? `/admin/${collection.slug}/${only.id}` : null;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/admin/__tests__/singleton.test.ts`
Expected: PASS

- [ ] **Step 5: Usarlo en la página de listado**

En `src/app/(admin)/admin/(panel)/[collection]/page.tsx`, cambiar el import de navegación y sumar el del helper:

```typescript
import { notFound, redirect } from "next/navigation";
import { singletonTarget } from "@/lib/admin/singleton";
```

Y después de traer los records:

```typescript
  const records = await pb
    .collection(collection.name)
    .getFullList({ sort: collection.defaultSort });

  const target = singletonTarget(collection, records);
  if (target) redirect(target);
```

- [ ] **Step 6: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/singleton.ts src/lib/admin/__tests__/singleton.test.ts "src/app/(admin)/admin/(panel)/[collection]/page.tsx"
git commit -m "feat(admin): send singleton collections straight to their form"
```

---

### Task 4: Mostrar el texto de ayuda en los campos de archivo

**Files:**
- Modify: `src/components/admin/FormField.tsx:118-128` (la rama `field.type === "file"`)
- Test: `src/components/admin/__tests__/FormField.test.tsx` (crear)

**Interfaces:**
- Consumes: `FieldConfig.help` (ya existe).
- Produces: nada nuevo.

La rama `file` de `FormField` no renderiza `field.help` — las otras dos ramas sí. Los diez textos de ayuda de la Task 2 hoy no se verían.

- [ ] **Step 1: Escribir el test que falla**

Crear `src/components/admin/__tests__/FormField.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "../FormField";

describe("FormField", () => {
  it("muestra el texto de ayuda de un campo file", () => {
    render(
      <FormField
        field={{
          name: "home_hero",
          label: "Home — hero background",
          type: "file",
          help: "The full-width photo behind your name.",
        }}
      />,
    );
    expect(
      screen.getByText("The full-width photo behind your name."),
    ).toBeInTheDocument();
  });

  it("muestra el label del campo file", () => {
    render(
      <FormField
        field={{ name: "home_hero", label: "Home — hero background", type: "file" }}
      />,
    );
    expect(screen.getByText("Home — hero background")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/components/admin/__tests__/FormField.test.tsx`
Expected: FAIL en el primer test — el texto de ayuda no está en el DOM.

- [ ] **Step 3: Renderizar el help**

Reemplazar la rama `file` completa por:

```tsx
  if (field.type === "file") {
    return (
      <div>
        <span className={labelCls}>{field.label}</span>
        <div className="mt-2">
          <FileInput name={field.name} currentUrl={fileUrl} />
        </div>
        {field.help && (
          <p className="mt-1 text-xs text-brand-white/40">{field.help}</p>
        )}
      </div>
    );
  }
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/components/admin/__tests__/FormField.test.tsx`
Expected: PASS (los dos)

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/FormField.tsx src/components/admin/__tests__/FormField.test.tsx
git commit -m "fix(admin): render field help text on file inputs"
```

---

### Task 5: Capa de datos — `getSiteImages()` y `siteImageUrl()`

**Files:**
- Modify: `src/lib/pocketbase/types.ts` (agregar `SiteImages` al final)
- Create: `src/lib/pocketbase/site-images.ts`
- Modify: `src/lib/pocketbase/queries.ts` (agregar `getSiteImages` al final; sumar `SiteImages` al import de tipos)
- Create: `src/lib/pocketbase/__tests__/site-images.test.ts`

**Interfaces:**
- Consumes: `fileUrl()` de `src/lib/pocketbase/files.ts`; los nombres de campo de la Task 1.
- Produces:
  - `interface SiteImages` con `id` y los diez campos `string`.
  - `SITE_IMAGE_SLOTS` y `type SiteImageSlotName`, con los slots en camelCase: `homeHero`, `homePortrait`, `homeStrip1`, `homeStrip2`, `homeStrip3`, `homeEditorial1`, `homeEditorial2`, `homeCraft1`, `homeCraft2`, `aboutPortrait`.
  - `siteImageUrl(record: SiteImages | null, slot: SiteImageSlotName): string`
  - `getSiteImages(): Promise<SiteImages | null>`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/lib/pocketbase/__tests__/site-images.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { siteImageUrl, SITE_IMAGE_SLOTS } from "../site-images";
import type { SiteImages } from "../types";

const BASE = "https://micka.lhstudio.com.ar";

const empty: SiteImages = {
  id: "rec123",
  home_hero: "",
  home_portrait: "",
  home_strip_1: "",
  home_strip_2: "",
  home_strip_3: "",
  home_editorial_1: "",
  home_editorial_2: "",
  home_craft_1: "",
  home_craft_2: "",
  about_portrait: "",
};

describe("siteImageUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_POCKETBASE_URL = BASE;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_POCKETBASE_URL;
  });

  it("devuelve la URL del CMS con el thumb del slot cuando hay archivo", () => {
    const rec = { ...empty, about_portrait: "micka.jpg" };
    expect(siteImageUrl(rec, "aboutPortrait")).toBe(
      `${BASE}/api/files/site_images/rec123/micka.jpg?thumb=1200x0`,
    );
  });

  it("pide 1920x0 para el hero, que se sirve a pantalla completa", () => {
    const rec = { ...empty, home_hero: "bg.jpg" };
    expect(siteImageUrl(rec, "homeHero")).toContain("thumb=1920x0");
  });

  it("cae al placeholder local cuando el slot está vacío", () => {
    expect(siteImageUrl(empty, "aboutPortrait")).toBe(
      "/placeholders/cyclist-portrait.jpg",
    );
  });

  it("cae al placeholder cuando el backend no devolvió registro", () => {
    expect(siteImageUrl(null, "homeHero")).toBe(
      "/placeholders/cyclist-road.jpg",
    );
  });

  it("cubre los diez slots y todos apuntan a un placeholder existente", () => {
    const slots = Object.values(SITE_IMAGE_SLOTS);
    expect(slots).toHaveLength(10);
    for (const slot of slots) {
      expect(slot.fallback).toMatch(/^\/placeholders\/[\w-]+\.(jpg|png)$/);
      expect(["400x0", "800x0", "1200x0", "1920x0"]).toContain(slot.thumb);
    }
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/pocketbase/__tests__/site-images.test.ts`
Expected: FAIL — `Cannot find module '../site-images'`.

- [ ] **Step 3: Agregar el tipo**

Al final de `src/lib/pocketbase/types.ts`:

```typescript
export interface SiteImages {
  id: string;
  home_hero: string; home_portrait: string;
  home_strip_1: string; home_strip_2: string; home_strip_3: string;
  home_editorial_1: string; home_editorial_2: string;
  home_craft_1: string; home_craft_2: string;
  about_portrait: string;
}
```

- [ ] **Step 4: Implementar el módulo de slots**

Crear `src/lib/pocketbase/site-images.ts`:

```typescript
import { fileUrl } from "./files";
import type { SiteImages } from "./types";

/** Un slot de imagen del sitio: el campo en `site_images`, el thumb que pide
 *  el componente que la muestra y el placeholder que se usa mientras el
 *  cliente no haya subido la suya. */
export interface SiteImageSlot {
  field: keyof Omit<SiteImages, "id">;
  thumb: string;
  fallback: string;
}

/** Los fallbacks replican exactamente lo que el sitio muestra hoy: mientras
 *  `site_images` esté vacía, la Home y el About no cambian ni un pixel. */
export const SITE_IMAGE_SLOTS = {
  homeHero: { field: "home_hero", thumb: "1920x0", fallback: "/placeholders/cyclist-road.jpg" },
  homePortrait: { field: "home_portrait", thumb: "400x0", fallback: "/placeholders/cyclist-portrait.jpg" },
  homeStrip1: { field: "home_strip_1", thumb: "800x0", fallback: "/placeholders/cyclist-duo.jpg" },
  homeStrip2: { field: "home_strip_2", thumb: "800x0", fallback: "/placeholders/cyclist-road.jpg" },
  homeStrip3: { field: "home_strip_3", thumb: "800x0", fallback: "/placeholders/cyclist-bw-race.jpg" },
  homeEditorial1: { field: "home_editorial_1", thumb: "800x0", fallback: "/placeholders/cyclist-duo.jpg" },
  homeEditorial2: { field: "home_editorial_2", thumb: "800x0", fallback: "/placeholders/cyclist-bw-race.jpg" },
  homeCraft1: { field: "home_craft_1", thumb: "800x0", fallback: "/placeholders/cyclist-pack.jpg" },
  homeCraft2: { field: "home_craft_2", thumb: "800x0", fallback: "/placeholders/cyclist-portrait.jpg" },
  aboutPortrait: { field: "about_portrait", thumb: "1200x0", fallback: "/placeholders/cyclist-portrait.jpg" },
} as const satisfies Record<string, SiteImageSlot>;

export type SiteImageSlotName = keyof typeof SITE_IMAGE_SLOTS;

/** URL a mostrar para un slot: la del CMS si el cliente subió una imagen, el
 *  placeholder local si no (o si el backend no respondió). */
export function siteImageUrl(
  record: SiteImages | null,
  slot: SiteImageSlotName,
): string {
  const { field, thumb, fallback } = SITE_IMAGE_SLOTS[slot];
  const filename = record?.[field];
  if (!filename) return fallback;
  return fileUrl({ collectionName: "site_images", id: record!.id }, filename, {
    thumb,
  });
}
```

- [ ] **Step 5: Agregar la query**

En `src/lib/pocketbase/queries.ts`, sumar `SiteImages` a la lista de tipos importados y agregar al final:

```typescript
/**
 * El registro único de `site_images`. Devuelve `null` si no existe todavía
 * (falta correr el seed) o si el backend no respondió: `siteImageUrl` resuelve
 * ese caso cayendo a los placeholders locales.
 */
export async function getSiteImages(): Promise<SiteImages | null> {
  const pb = createPocketBase();
  const items = await safeList(() =>
    pb.collection("site_images").getFullList<SiteImages>(),
  );
  return items[0] ?? null;
}
```

- [ ] **Step 6: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/pocketbase/__tests__/site-images.test.ts`
Expected: PASS (los cinco)

- [ ] **Step 7: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 8: Commit**

```bash
git add src/lib/pocketbase/types.ts src/lib/pocketbase/site-images.ts src/lib/pocketbase/queries.ts src/lib/pocketbase/__tests__/site-images.test.ts
git commit -m "feat(cms): read site images from PocketBase with placeholder fallback"
```

---

### Task 6: `Hero` y `BioBlock` reciben sus imágenes por props

**Files:**
- Modify: `src/components/home/Hero.tsx:11-21`
- Modify: `src/components/home/BioBlock.tsx:14-36,44-58,84-96`

**Interfaces:**
- Consumes: nada en runtime (reciben strings ya resueltos).
- Produces:
  - `Hero({ bgSrc }: { bgSrc: string })`
  - `BioBlock({ portrait, strip }: { portrait: string; strip: readonly [string, string, string] })`

**Nota sobre tests:** estos cuatro componentes (tasks 6 y 7) no llevan test de render. No existe suite para `src/components/home/` y montarlos exige el provider de `next-intl` que hoy ningún test arma; el comportamiento nuevo —elegir CMS o fallback— vive entero en `siteImageUrl()`, cubierto por la Task 5. La verificación acá es `tsc` (que ataja las firmas mal cableadas) + lint + la suite existente.

- [ ] **Step 1: Cambiar la firma de `Hero`**

```tsx
export function Hero({ bgSrc }: { bgSrc: string }) {
```

Y su `<Image>`:

```tsx
        <Image
          src={bgSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
```

- [ ] **Step 2: Cambiar `BioBlock`**

`SIDE_PHOTOS` deja de nombrar archivos: se queda solo con la geometría. Reemplazar la constante por:

```tsx
// Proporciones y offsets replican el Figma (Group 13, 2413:248): la foto 1 es
// la más grande (~4:3), 2 y 3 más chicas (~5:4) y escalonadas verticalmente.
// `depth` da profundidades de parallax distintas por foto (efecto de tira).
const SIDE_LAYOUT = [
  { ratio: "aspect-[4/3]", grow: "md:flex-[307]", offset: "", depth: 0.04 },
  { ratio: "aspect-[5/4]", grow: "md:flex-[210]", offset: "md:mt-[61px]", depth: 0.08 },
  { ratio: "aspect-[5/4]", grow: "md:flex-[212]", offset: "md:mt-2", depth: 0.12 },
] as const;
```

La firma:

```tsx
export function BioBlock({
  portrait,
  strip,
}: {
  portrait: string;
  strip: readonly [string, string, string];
}) {
```

El retrato:

```tsx
            <Image
              src={portrait}
              alt={t("portraitAlt")}
              fill
              sizes="160px"
              className="object-cover"
            />
```

Y la tira — la key pasa a ser el índice porque ya no hay nombre de archivo:

```tsx
            {SIDE_LAYOUT.map(({ ratio, grow, offset, depth }, i) => (
              <Parallax
                key={i}
                speed={depth}
                className={cn("relative overflow-hidden", ratio, grow, offset)}
              >
                <Image
                  src={strip[i]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </Parallax>
            ))}
```

- [ ] **Step 3: Verificar que `tsc` marca la Home rota**

Run: `npx tsc --noEmit`
Expected: FAIL en `src/app/(site)/[locale]/page.tsx` — `<Hero />` y `<BioBlock />` ahora exigen props. Es la señal esperada; la Task 8 lo cablea.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Hero.tsx src/components/home/BioBlock.tsx
git commit -m "refactor(home): take Hero and BioBlock images as props"
```

---

### Task 7: `EditorialIntro` y `CraftBlock` reciben sus imágenes por props

**Files:**
- Modify: `src/components/home/EditorialIntro.tsx:11,30-40,59-70`
- Modify: `src/components/home/CraftBlock.tsx:7,12-22,27-40`

**Interfaces:**
- Consumes: nada en runtime.
- Produces:
  - `EditorialIntro({ images }: { images: readonly [string, string] })`
  - `CraftBlock({ images }: { images: readonly [string, string] })`

Aplica la misma nota sobre tests de la Task 6.

- [ ] **Step 1: Cambiar `EditorialIntro`**

```tsx
export function EditorialIntro({
  images,
}: {
  images: readonly [string, string];
}) {
```

El primer `<Image>` (hoy `src="/placeholders/cyclist-duo.jpg"`) pasa a `src={images[0]}`; el segundo (hoy `src="/placeholders/cyclist-bw-race.jpg"`) pasa a `src={images[1]}`. El resto de cada `<Image>` (alt, fill, sizes, className) queda igual.

- [ ] **Step 2: Cambiar `CraftBlock`**

```tsx
export function CraftBlock({
  images,
}: {
  images: readonly [string, string];
}) {
```

El primer `<Image>` (hoy `src="/placeholders/cyclist-pack.jpg"`) pasa a `src={images[0]}`; el segundo (hoy `src="/placeholders/cyclist-portrait.jpg"`) pasa a `src={images[1]}`. El resto queda igual.

- [ ] **Step 3: Verificar que `tsc` sigue marcando solo la Home**

Run: `npx tsc --noEmit`
Expected: FAIL únicamente en `src/app/(site)/[locale]/page.tsx`, ahora con los cuatro componentes.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/EditorialIntro.tsx src/components/home/CraftBlock.tsx
git commit -m "refactor(home): take EditorialIntro and CraftBlock images as props"
```

---

### Task 8: Cablear la Home

**Files:**
- Modify: `src/app/(site)/[locale]/page.tsx:19-21,57-60,85-95`

**Interfaces:**
- Consumes: `getSiteImages()` y `siteImageUrl()` (Task 5); las firmas de las tasks 6 y 7.
- Produces: nada.

- [ ] **Step 1: Sumar los imports**

```typescript
import { getStarredAlbums, getFavePhotos, getSiteImages, localized } from "@/lib/pocketbase/queries";
import { siteImageUrl } from "@/lib/pocketbase/site-images";
```

- [ ] **Step 2: Traer el registro junto al resto**

```typescript
  const [starredAlbums, favePhotos, siteImages] = await Promise.all([
    getStarredAlbums(),
    getFavePhotos(5),
    getSiteImages(),
  ]);
```

- [ ] **Step 3: Pasar las URLs a los cuatro componentes**

En el `return`, reemplazar las cuatro etiquetas sin props:

```tsx
      <Hero bgSrc={siteImageUrl(siteImages, "homeHero")} />
      <BioBlock
        portrait={siteImageUrl(siteImages, "homePortrait")}
        strip={[
          siteImageUrl(siteImages, "homeStrip1"),
          siteImageUrl(siteImages, "homeStrip2"),
          siteImageUrl(siteImages, "homeStrip3"),
        ]}
      />
      <Marquee />
      <EditorialIntro
        images={[
          siteImageUrl(siteImages, "homeEditorial1"),
          siteImageUrl(siteImages, "homeEditorial2"),
        ]}
      />
```

y más abajo:

```tsx
      <CraftBlock
        images={[
          siteImageUrl(siteImages, "homeCraft1"),
          siteImageUrl(siteImages, "homeCraft2"),
        ]}
      />
```

Los arrays `STARRED_FALLBACK` y `FAVES_FALLBACK` **no se tocan**: son el fallback de álbumes y fotos, no de estos slots.

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde — los errores de las tasks 6 y 7 desaparecen.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/[locale]/page.tsx"
git commit -m "feat(home): serve home images from the CMS"
```

---

### Task 9: Cablear el About

**Files:**
- Modify: `src/app/(site)/[locale]/about/page.tsx:10,32,44-56`

**Interfaces:**
- Consumes: `getSiteImages()` y `siteImageUrl()` (Task 5).
- Produces: nada.

Es el slot que Micka pidió por mail.

- [ ] **Step 1: Sumar los imports**

```typescript
import { getSiteContent, getSiteImages, localized } from "@/lib/pocketbase/queries";
import { siteImageUrl } from "@/lib/pocketbase/site-images";
```

- [ ] **Step 2: Traer contenido e imágenes en paralelo**

Reemplazar `const content = await getSiteContent();` por:

```typescript
  const [content, siteImages] = await Promise.all([
    getSiteContent(),
    getSiteImages(),
  ]);
```

- [ ] **Step 3: Usar el slot en el retrato**

```tsx
            <Image
              src={siteImageUrl(siteImages, "aboutPortrait")}
              alt={t("role")}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
```

- [ ] **Step 4: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/[locale]/about/page.tsx"
git commit -m "feat(about): serve the About portrait from the CMS"
```

---

### Task 10: Documentar los slots en la guía del panel

**Files:**
- Modify: `src/components/admin/HelpContent.tsx` (nueva sección entre "Site texts" y "Contact messages")
- Modify: `src/components/admin/__tests__/HelpContent.test.tsx`

**Interfaces:**
- Consumes: los labels de la Task 2.
- Produces: nada.

Es la guía a la que se derivó a Micka por mail; si el cambio no está acá, no lo encuentra.

- [ ] **Step 1: Escribir el test que falla**

En `src/components/admin/__tests__/HelpContent.test.tsx`, agregar `"Site images"` al array de headings del primer test (entre `"Site texts"` y `"Contact messages"`), y sumar este test:

```typescript
  it("explica que las imágenes sin cargar muestran una foto provisoria", () => {
    render(<HelpContent />);
    expect(screen.getByText(/placeholder/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/components/admin/__tests__/HelpContent.test.tsx`
Expected: FAIL — no existe el heading "Site images".

- [ ] **Step 3: Agregar la sección**

En `HelpContent.tsx`, entre la sección "Site texts" y la de "Contact messages", usando el mismo markup que las secciones vecinas (`h2` con la clase `h2` para el título, párrafos abajo):

```tsx
      <h2 className={h2}>Site images</h2>
      <p>
        <strong>Site images</strong> holds the fixed photos of the Home and
        About pages — the ones that are not part of an album: the big photo at
        the top of the Home, your portrait, and the photos in the bands between
        the text.
      </p>
      <p>
        Each slot is labelled with where it appears, and shows the photo that is
        live right now. Pick a file and press Save to replace it. Any slot you
        leave empty keeps showing a placeholder photo until you upload yours.
      </p>
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/components/admin/__tests__/HelpContent.test.tsx`
Expected: PASS

- [ ] **Step 5: Verificar**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: todo verde.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/HelpContent.tsx src/components/admin/__tests__/HelpContent.test.tsx
git commit -m "docs(admin): document the site images section in the help guide"
```

---

### Task 11: Script de seed del registro único

**Files:**
- Create: `pocketbase/seed-site-images.mjs`

**Interfaces:**
- Consumes: la colección de la Task 1.
- Produces: el registro único de `site_images`, sin el cual la Task 3 no tiene a dónde redirigir.

- [ ] **Step 1: Escribir el script**

Crear `pocketbase/seed-site-images.mjs`. La carga de `.env.local` es la misma que usan sus hermanos (`set-file-limits.mjs`), copiada tal cual:

```javascript
// Crea el registro único de `site_images` (vacío) en PocketBase.
// La colección es de un solo registro: el panel redirige a su formulario, así
// que sin este registro "Site images" no tiene a dónde ir. Los diez campos
// quedan vacíos a propósito — el sitio cae a los placeholders locales hasta
// que el cliente suba sus fotos.
//
// Uso: node pocketbase/seed-site-images.mjs
// Requiere las mismas variables que los otros scripts en .env.local.
//
// Es idempotente: si el registro ya existe, no hace nada.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
if (!URL || !EMAIL || !PASSWORD) {
  console.error("Faltan variables en .env.local");
  process.exit(1);
}

const pb = new PocketBase(URL);
pb.autoCancellation(false);

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser\n");

  const existing = await pb.collection("site_images").getFullList();
  if (existing.length > 0) {
    console.log(`• site_images: ya existe el registro ${existing[0].id} (skip)`);
    return;
  }

  const rec = await pb.collection("site_images").create({});
  console.log(`✓ site_images: registro ${rec.id} creado (diez slots vacíos)`);
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
```

- [ ] **Step 2: Verificar**

Run: `npm run lint`
Expected: verde. El script no se ejecuta todavía — eso es la Task 12.

- [ ] **Step 3: Commit**

```bash
git add pocketbase/seed-site-images.mjs
git commit -m "chore(pocketbase): add a seed script for the site_images record"
```

---

### Task 12: Rollout y verificación end-to-end

**Files:**
- Modify: `CLAUDE.md` (changelog del repo, siguiendo el formato de las entradas anteriores)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la funcionalidad andando contra el PocketBase de producción.

⚠️ Los pasos 2 a 4 escriben en **producción** (`micka.lhstudio.com.ar`). Requieren `.env.local` con `NEXT_PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL` y `POCKETBASE_ADMIN_PASSWORD` (la clave de servicio está en el password manager). Si alguno falla por credenciales, parar y avisar — no improvisar un reset.

- [ ] **Step 1: Verificación completa antes de tocar producción**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: los cuatro verdes. Anotar el número de tests que pasan.

- [ ] **Step 2: Crear la colección**

Run: `node pocketbase/seed-collections.mjs`
Expected: `✓ site_images` creada; las otras siete reportan "ya existe (skip)".

- [ ] **Step 3: Aplicar los límites de archivo**

Run: `node pocketbase/set-file-limits.mjs`
Expected: una línea por colección, incluyendo `site_images` con los diez campos.

- [ ] **Step 4: Crear el registro único**

Run: `node pocketbase/seed-site-images.mjs`
Expected: `✓ site_images: registro <id> creado (diez slots vacíos)`.

- [ ] **Step 5: Verificar el panel a mano**

Run: `npm run dev`, entrar a `http://localhost:3000/admin/site-images`
Expected: redirige al formulario del registro único, con los diez slots etiquetados y su texto de ayuda debajo de cada uno.

- [ ] **Step 6: Probar el ciclo completo con una imagen**

Subir una imagen cualquiera al slot **About — portrait**, guardar, y abrir `http://localhost:3000/en/about`.
Expected: la página muestra la imagen nueva. Verificar en el inspector que la URL lleva `?thumb=1200x0` y **no** es el original. Después volver al panel, dejar el campo vacío y guardar de nuevo: el archivo subido debe conservarse (`form.ts:71` ignora los file vacíos), no borrarse.

- [ ] **Step 7: Verificar el fallback**

Con los otros nueve slots vacíos, abrir `http://localhost:3000/en`.
Expected: la Home se ve exactamente igual que antes del cambio — todos los placeholders en su lugar.

- [ ] **Step 8: Actualizar el changelog del repo**

Sumar la entrada a `CLAUDE.md` siguiendo el formato de las anteriores: qué se agregó (colección `site_images` de un registro con diez slots), el fallback a placeholders, el fix del help en campos file, y los tres scripts a correr en un entorno nuevo.

- [ ] **Step 9: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: record the CMS-editable site images change"
```

- [ ] **Step 10: Reportar**

Informar: número de tests que pasan, el id del registro creado, y confirmación de que la Home se ve igual con los slots vacíos. **No mergear a `master` sin validación visual de Lauti** — es el gate que este proyecto usa siempre antes de que un cambio llegue a producción.
