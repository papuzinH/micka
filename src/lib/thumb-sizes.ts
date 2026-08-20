/**
 * Tamaños de thumb (`?thumb=`) que sirve PocketBase para las imágenes del
 * proyecto, centralizados para que el compilador atrape un typo en
 * cualquiera de los dos lugares que los declaran: `FieldConfig.thumb`
 * (preview del admin, en `admin/collections.ts`) y `SiteImageSlot.thumb`
 * (URL pública del sitio, en `pocketbase/site-images.ts`). Sin esto, un
 * typo en cualquiera de los dos hace que PocketBase sirva el original sin
 * resize — el bug que ya quemó a este proyecto una vez.
 *
 * Vive en `src/lib/` (no en `admin/` ni en `pocketbase/`) para que ninguno
 * de esos dos módulos —config del admin y capa de datos del sitio, dos
 * responsabilidades separadas— tenga que importar al otro.
 */
export const THUMB_SIZES = [
  "200x200",
  "400x0",
  "600x0",
  "800x0",
  "1200x0",
  "1920x0",
] as const;

export type ThumbSize = (typeof THUMB_SIZES)[number];
