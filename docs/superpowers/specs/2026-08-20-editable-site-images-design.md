# Imágenes del sitio editables desde el panel — Diseño técnico

**Fecha:** 2026-08-20
**Estado:** Aprobado · pendiente de plan de implementación
**Origen:** mail de Micka del 2026-08-18 — *"I wanted to add a photo of myself, but I can't figure out how to edit that specific part (I can edit the text, but not the accompanying photo)."*
**Contexto operativo:** `CLAUDE.md` (raíz)

## Problema

Micka no encuentra cómo cambiar su retrato del About porque **la funcionalidad no existe**. Esa imagen está hardcodeada en `src/app/(site)/[locale]/about/page.tsx:50` apuntando a `/placeholders/cyclist-portrait.jpg`, y la colección `site_content` que alimenta los textos de esa página solo tiene `key` + `value_en/value_fr`: no admite archivos de ningún tipo.

No es un caso aislado. Diez slots de imagen del sitio son fotos de stock sin ningún camino de edición:

| Campo nuevo | Dónde vive hoy | `sizes` | Thumb a pedir |
|---|---|---|---|
| `home_hero` | `Hero.tsx:15` | `100vw` | `1920x0` |
| `home_portrait` | `BioBlock.tsx:50` | `160px` | `400x0` |
| `home_strip_1/2/3` | `BioBlock.tsx:89` | `100vw` / `320px` | `800x0` |
| `home_editorial_1/2` | `EditorialIntro.tsx:35,65` | `100vw` / `325px` | `800x0` |
| `home_craft_1/2` | `CraftBlock.tsx:17,36` | `100vw` / `307-309px` | `800x0` |
| `about_portrait` | `about/page.tsx:50` | `100vw` / `480px` | `1200x0` |

**No entran** los arrays `STARRED_FALLBACK` y `FAVES_FALLBACK` de `page.tsx:26-38`: esos ya son solo fallback y se reemplazan solos en cuanto Micka cargue álbumes y fotos. Tampoco entra la og-image (`opengraph-image.tsx:22`), que se genera con `next/og` leyendo del filesystem y merece decidirse aparte.

Esto importa ahora porque Micka ya compró `donmickadelavega.com`: sin este cambio, el sitio se lanza en su dominio propio mostrando fotos de ciclistas que no son suyas.

## Modelo de datos

Colección nueva `site_images` en PocketBase, **de un solo registro**, con diez campos `file` — uno por slot. Sin campos de texto. La definición se agrega a `pocketbase/pb_schema.json`, que es de donde `seed-collections.mjs` crea las colecciones.

Se eligió un registro con diez campos en vez de diez registros `key` + `image` (el patrón de `site_content`) por la UX del panel: `CollectionList.tsx` renderiza solo el `titleField` como texto plano, sin miniatura, y el `help` del CRUD config-driven se define **por campo, no por fila**. Con diez filas Micka vería una lista de keys crudas sin pista de cuál es cuál. Con un registro ve un formulario de diez slots, cada uno con su label, su texto de ayuda y el preview de la foto actual que `FileInput.tsx` ya renderiza.

La rigidez del modelo (sumar un slot pide tocar el schema) no es un costo real: cada slot corresponde a un `<Image>` puesto a mano en un componente, así que sumar uno ya exige tocar código.

Los dos retratos quedan como campos separados. Hoy comparten archivo, pero el del About es vertical grande (3:4) y el del BioBlock es chico (132×220): puede querer fotos distintas, y separarlos no cuesta nada.

**Whitelist de thumbs:** los diez campos declaran el mismo set — `400x0`, `800x0`, `1200x0`, `1920x0`. Uniforme a propósito: pedir un thumb fuera del whitelist hace que PocketBase sirva el original, y eso ya pasó una vez en este proyecto (un `800x0` no declarado sirviendo un original de 15 MB). Con el set completo en todos los campos, ningún slot puede caer en ese pozo.

**Límite de tamaño:** `site_images` se suma a `TARGETS` en `pocketbase/set-file-limits.mjs` para heredar los 15 MB. Sin eso rige el default de 5 MB de PocketBase, que rechaza fotografía profesional sin explicar por qué.

## Capa de datos

`getSiteImages()` en `src/lib/pocketbase/queries.ts`, hermana de `getSiteContent()` y con el mismo `safeList` resiliente: devuelve el registro único, o `null` si el backend no responde.

Un helper `siteImageUrl(record, field, fallback, { thumb })` resuelve cada slot: si el campo tiene archivo cargado devuelve la URL de PocketBase con su thumb (vía el `fileUrl()` que ya existe); si no, devuelve el placeholder local. **El fallback es la pieza clave del diseño**: el sitio no cambia ni un pixel hasta que Micka suba algo, así que el lanzamiento del dominio no queda bloqueado esperando fotos, y una caída del backend no deja huecos en la Home.

## Componentes

`Hero`, `BioBlock`, `EditorialIntro` y `CraftBlock` pasan de no recibir props a recibir las URLs ya resueltas, siguiendo el patrón que la Home ya usa con `StarredAlbums` y `FavesGallery`: la página hace el fetch y reparte, el componente solo pinta. La Home llama a `getSiteImages()` una vez para los nueve slots que le tocan; `about/page.tsx` hace lo suyo para el suyo.

Los `alt` se quedan donde están. Ocho de los diez slots son decorativos con `alt=""`, y los dos retratos usan textos (`t("portraitAlt")`, `t("role")`) que siguen siendo correctos con cualquier foto que suba. Sumar `alt_en/alt_fr` a la colección sería peso muerto en el formulario.

## Panel de administración

Una entrada más en `COLLECTIONS` (`src/lib/admin/collections.ts`) con `canCreate: false` y los diez campos `file`, cada uno con `label` y `help` en inglés — el CRUD config-driven se encarga del resto.

Se suma un flag `singleton: true` a `CollectionConfig`: en `src/app/(admin)/admin/(panel)/[collection]/page.tsx`, una colección singleton redirige directo al formulario de su único registro en lugar de mostrar una lista de una fila. Sin eso, `recordTitle()` cae a `r.id` y Micka vería una fila titulada con un identificador crudo.

Se suma la sección correspondiente a `/admin/help` (`HelpContent.tsx`), que es la guía a la que se lo derivó por mail y donde va a buscar cómo se hace.

## Testing

- `pocketbase/__tests__/schema.test.ts`: la colección existe, tiene los diez campos `file`, con el whitelist de thumbs y el límite de 15 MB.
- Unit del helper: con archivo cargado devuelve la URL del CMS con el thumb pedido; sin archivo, el placeholder; con el registro en `null`, el placeholder.
- Unit de la config: `site_images` declara `canCreate: false`, `singleton: true` y diez campos.
- Los e2e no se tocan.

## Rollout

1. `node pocketbase/seed-collections.mjs` crea la colección desde `pb_schema.json` (es idempotente).
2. `node pocketbase/seed-site-images.mjs` (nuevo) crea el registro único vacío — sin él, el singleton no tiene a dónde redirigir. Idempotente como sus hermanos: si el registro ya existe, no hace nada.
3. `node pocketbase/set-file-limits.mjs` aplica los 15 MB.

Contra el PocketBase de producción (`micka.lhstudio.com.ar`), con la clave de servicio del password manager. No hay datos que migrar.

## Riesgos

- **Thumbs de originales pesados.** PocketBase genera el thumb on-demand y lo cachea; la primera carga de un `1920x0` sobre un original de 15 MB puede tardar. Aceptable: pasa una vez por imagen.
- **Cambio de firma en cuatro componentes.** Son server components sin estado y sus tests actuales los renderizan directo, así que el cambio es mecánico, pero toca cuatro archivos de la Home a la vez.
