/**
 * Configuración declarativa de las colecciones del CMS. Dirige el sidebar, las
 * listas, los formularios y la validación del admin (CRUD config-driven), para
 * cubrir las 7 colecciones con una sola implementación.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "editor"
  | "number"
  | "bool"
  | "date"
  | "email"
  | "url"
  | "select"
  | "relation"
  | "file";

export interface FieldConfig {
  /** Para campos localizados es el nombre base (se expande a `_en`/`_fr`). */
  name: string;
  label: string;
  type: FieldType;
  /** El valor se guarda en variantes `_en` y `_fr`. */
  localized?: boolean;
  required?: boolean;
  /** Para `relation`: colección destino + campo a mostrar. */
  relation?: { collection: string; labelField: string };
  /** Para `select`: valores posibles. */
  options?: string[];
  /** Para `file`: thumb de preview y si acepta imágenes. */
  thumb?: string;
  help?: string;
}

export interface CollectionConfig {
  name: string;
  slug: string;
  label: string;
  labelSingular: string;
  /** Campo usado como título en la lista (base, si es localizado). */
  titleField: string;
  titleLocalized?: boolean;
  fields: FieldConfig[];
  defaultSort: string;
  /** contact_messages no se crea desde el admin (bandeja de entrada). */
  canCreate?: boolean;
  canEdit?: boolean;
  /** Colección de un solo registro: el listado redirige directo a su form. */
  singleton?: boolean;
}

export const COLLECTIONS: CollectionConfig[] = [
  {
    name: "albums",
    slug: "albums",
    label: "Albums",
    labelSingular: "Album",
    titleField: "title",
    titleLocalized: true,
    defaultSort: "order",
    fields: [
      { name: "title", label: "Title", type: "text", localized: true, required: true },
      { name: "slug", label: "Slug", type: "text", required: true, help: "Unique URL identifier, e.g. start-of-the-race" },
      { name: "category", label: "Category", type: "relation", relation: { collection: "categories", labelField: "name_en" } },
      { name: "cover", label: "Cover image", type: "file", thumb: "600x0" },
      { name: "description", label: "Description", type: "editor", localized: true },
      { name: "date", label: "Date", type: "date" },
      { name: "order", label: "Order", type: "number" },
      { name: "starred", label: "Starred (Home)", type: "bool" },
      { name: "published", label: "Published", type: "bool" },
    ],
  },
  {
    name: "photos",
    slug: "photos",
    label: "Photos",
    labelSingular: "Photo",
    titleField: "alt",
    titleLocalized: true,
    defaultSort: "order",
    fields: [
      { name: "album", label: "Album", type: "relation", relation: { collection: "albums", labelField: "title_en" }, required: true },
      { name: "image", label: "Image", type: "file", thumb: "600x0", required: true },
      { name: "alt", label: "Alt text", type: "text", localized: true },
      { name: "caption", label: "Caption", type: "text", localized: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    name: "categories",
    slug: "categories",
    label: "Categories",
    labelSingular: "Category",
    titleField: "name",
    titleLocalized: true,
    defaultSort: "order",
    fields: [
      { name: "name", label: "Name", type: "text", localized: true, required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    name: "reviews",
    slug: "reviews",
    label: "Reviews",
    labelSingular: "Review",
    titleField: "author",
    defaultSort: "order",
    fields: [
      { name: "author", label: "Author", type: "text", required: true },
      { name: "role", label: "Role", type: "text" },
      { name: "quote", label: "Quote", type: "textarea", localized: true, required: true },
      { name: "avatar", label: "Avatar", type: "file", thumb: "200x200" },
      { name: "order", label: "Order", type: "number" },
      { name: "published", label: "Published", type: "bool" },
    ],
  },
  {
    name: "collabs",
    slug: "collabs",
    label: "Collabs",
    labelSingular: "Collab",
    titleField: "name",
    defaultSort: "order",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logo", label: "Logo", type: "file", thumb: "400x0" },
      { name: "url", label: "URL", type: "url" },
      { name: "description", label: "Description", type: "textarea", localized: true },
      { name: "order", label: "Order", type: "number" },
      { name: "published", label: "Published", type: "bool" },
    ],
  },
  {
    name: "site_content",
    slug: "site-content",
    label: "Site content",
    labelSingular: "Site content entry",
    titleField: "key",
    defaultSort: "key",
    fields: [
      { name: "key", label: "Key", type: "text", required: true, help: "Identifier used by the site, e.g. about_intro" },
      { name: "value", label: "Value", type: "textarea", localized: true },
    ],
  },
  {
    name: "contact_messages",
    slug: "messages",
    label: "Messages",
    labelSingular: "Message",
    titleField: "name",
    defaultSort: "-created",
    canCreate: false,
    canEdit: false,
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "message", label: "Message", type: "textarea", required: true },
      { name: "locale", label: "Locale", type: "select", options: ["en", "fr"] },
    ],
  },
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
];

export function getCollection(slug: string): CollectionConfig | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
