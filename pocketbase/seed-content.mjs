// Carga contenido de PRUEBA en el CMS (categorías, álbumes, fotos, reviews,
// collabs, site_content), subiendo las imágenes placeholder de
// `public/placeholders` a los campos `file`. El cliente reemplaza esto por su
// contenido real desde el admin (Fase 2c).
//
// Uso (desde la raíz del proyecto):
//   node pocketbase/seed-content.mjs
//
// Requiere en .env.local (gitignoreado):
//   NEXT_PUBLIC_POCKETBASE_URL=https://micka.lhstudio.com.ar
//   POCKETBASE_ADMIN_EMAIL=...
//   POCKETBASE_ADMIN_PASSWORD=...
//
// Es idempotente: hace upsert por clave natural (slug/key/author/name) y NO
// re-sube archivos si el registro ya los tiene. Las fotos se saltean por álbum
// si el álbum ya tiene fotos.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// --- carga simple de .env.local ---
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
  console.error(
    "Faltan variables en .env.local: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD",
  );
  process.exit(1);
}

const pb = new PocketBase(URL);
pb.autoCancellation(false);

// --- helpers de archivos ---
const PLACEHOLDERS = path.join(root, "public", "placeholders");
function fileFrom(name) {
  const buf = fs.readFileSync(path.join(PLACEHOLDERS, name));
  const ext = path.extname(name).toLowerCase();
  const type = ext === ".png" ? "image/png" : "image/jpeg";
  return new File([buf], name, { type });
}

// escapa comillas dobles para los filtros de PocketBase
const esc = (s) => String(s).replace(/"/g, '\\"');

/**
 * Upsert por clave natural. `data` puede incluir instancias de File; si el
 * registro ya existe y ya tiene ese archivo, no se re-sube.
 */
async function upsert(collection, keyField, keyValue, data) {
  let existing = null;
  try {
    existing = await pb
      .collection(collection)
      .getFirstListItem(`${keyField} = "${esc(keyValue)}"`);
  } catch {
    existing = null;
  }

  if (existing) {
    const patch = {};
    for (const [k, v] of Object.entries(data)) {
      if (v instanceof File && existing[k]) continue; // no re-subir archivos
      patch[k] = v;
    }
    const rec = await pb.collection(collection).update(existing.id, patch);
    console.log(`  ↻ ${collection}: ${keyValue}`);
    return rec;
  }

  const rec = await pb.collection(collection).create(data);
  console.log(`  ✓ ${collection}: ${keyValue}`);
  return rec;
}

// ---------- DATOS ----------

const CATEGORIES = [
  { name_en: "Racing", name_fr: "Course", slug: "racing", order: 1 },
  { name_en: "Training", name_fr: "Entraînement", slug: "training", order: 2 },
  { name_en: "Portraits", name_fr: "Portraits", slug: "portraits", order: 3 },
];

const ALBUMS = [
  {
    slug: "start-of-the-race",
    title_en: "Start of the race",
    title_fr: "Départ de la course",
    category: "racing",
    cover: "cyclist-pack.jpg",
    description_en:
      "The tension before the gun. Bodies coiled, eyes forward, the peloton holding its breath.",
    description_fr:
      "La tension avant le départ. Les corps tendus, le regard fixe, le peloton retient son souffle.",
    date: "2025-04-12",
    order: 1,
    starred: true,
  },
  {
    slug: "mid-race-intensity",
    title_en: "Mid-race intensity",
    title_fr: "Intensité en course",
    category: "racing",
    cover: "cyclist-bw-race.jpg",
    description_en:
      "The hour of truth. Where strategy dissolves into pure effort and the race breaks apart.",
    description_fr:
      "L'heure de vérité. Où la stratégie se dissout dans l'effort pur et la course se disloque.",
    date: "2025-05-03",
    order: 2,
    starred: true,
  },
  {
    slug: "the-final-sprint",
    title_en: "The final sprint",
    title_fr: "Le sprint final",
    category: "racing",
    cover: "cyclist-peloton.png",
    description_en:
      "Everything decided in seconds. Raw power, instinct, and the line that separates them.",
    description_fr:
      "Tout se joue en quelques secondes. Puissance brute, instinct, et la ligne qui les sépare.",
    date: "2025-05-03",
    order: 3,
    starred: true,
  },
  {
    slug: "training-grounds",
    title_en: "Training grounds",
    title_fr: "Terrains d'entraînement",
    category: "training",
    cover: "cyclist-road.jpg",
    description_en:
      "The unseen miles. Long roads, grey mornings, the quiet work that builds champions.",
    description_fr:
      "Les kilomètres invisibles. Longues routes, matins gris, le travail discret qui forge les championnes.",
    date: "2025-03-20",
    order: 4,
    starred: false,
  },
  {
    slug: "portraits-of-grit",
    title_en: "Portraits of grit",
    title_fr: "Portraits de ténacité",
    category: "portraits",
    cover: "cyclist-portrait.jpg",
    description_en:
      "The athlete beyond the result. Focus, fatigue, and resolve captured up close.",
    description_fr:
      "L'athlète au-delà du résultat. Concentration, fatigue et détermination saisies de près.",
    date: "2025-02-15",
    order: 5,
    starred: false,
  },
];

// fotos por slug de álbum (rotando los placeholders disponibles)
const PHOTOS_BY_ALBUM = {
  "start-of-the-race": [
    { image: "cyclist-pack.jpg", alt_en: "Peloton at the start line", alt_fr: "Peloton sur la ligne de départ", caption_en: "First pedal strokes", caption_fr: "Premiers coups de pédale", order: 1 },
    { image: "cyclist-duo.jpg", alt_en: "Two riders side by side", alt_fr: "Deux coureuses côte à côte", caption_en: "Holding position", caption_fr: "Tenir sa place", order: 2 },
    { image: "cyclist-road.jpg", alt_en: "Riders on an open road", alt_fr: "Coureuses sur route ouverte", caption_en: "Settling the pace", caption_fr: "Trouver le rythme", order: 3 },
  ],
  "mid-race-intensity": [
    { image: "cyclist-bw-race.jpg", alt_en: "Rider in black and white effort", alt_fr: "Coureuse à l'effort en noir et blanc", caption_en: "The hour of truth", caption_fr: "L'heure de vérité", order: 1 },
    { image: "cyclist-pack.jpg", alt_en: "Tight pack mid-race", alt_fr: "Peloton serré en pleine course", caption_en: "No room to breathe", caption_fr: "Pas un souffle d'avance", order: 2 },
    { image: "cyclist-portrait.jpg", alt_en: "Close portrait under strain", alt_fr: "Portrait rapproché sous l'effort", caption_en: "Eyes on the gap", caption_fr: "Le regard sur l'écart", order: 3 },
  ],
  "the-final-sprint": [
    { image: "cyclist-peloton.png", alt_en: "Sprint out of the peloton", alt_fr: "Sprint hors du peloton", caption_en: "Everything at once", caption_fr: "Tout d'un coup", order: 1 },
    { image: "cyclist-duo.jpg", alt_en: "Two riders contesting the line", alt_fr: "Deux coureuses se disputant la ligne", caption_en: "Decided in inches", caption_fr: "Décidé au centimètre", order: 2 },
  ],
  "training-grounds": [
    { image: "cyclist-road.jpg", alt_en: "Solo rider on a long road", alt_fr: "Coureuse seule sur une longue route", caption_en: "The unseen miles", caption_fr: "Les kilomètres invisibles", order: 1 },
    { image: "cyclist-bw-race.jpg", alt_en: "Training effort in monochrome", alt_fr: "Effort d'entraînement en monochrome", caption_en: "Quiet work", caption_fr: "Travail discret", order: 2 },
  ],
  "portraits-of-grit": [
    { image: "cyclist-portrait.jpg", alt_en: "Athlete portrait, focused", alt_fr: "Portrait d'athlète, concentrée", caption_en: "Resolve", caption_fr: "Détermination", order: 1 },
    { image: "cyclist-duo.jpg", alt_en: "Two athletes after the line", alt_fr: "Deux athlètes après la ligne", caption_en: "Shared effort", caption_fr: "Effort partagé", order: 2 },
  ],
};

const REVIEWS = [
  {
    author: "Équipe Cycliste Lyon",
    role: "Team Manager",
    quote_en:
      "Micka captures what the result sheet never shows — the effort, the doubt, the triumph. Our riders feel seen.",
    quote_fr:
      "Micka capture ce que la feuille de résultats ne montre jamais — l'effort, le doute, le triomphe. Nos coureuses se sentent vues.",
    avatar: "cyclist-portrait.jpg",
    order: 1,
    published: true,
  },
  {
    author: "Camille Moreau",
    role: "Professional Cyclist",
    quote_en:
      "Every frame feels like it understands the sport from the inside. These are the images I want representing my career.",
    quote_fr:
      "Chaque image semble comprendre le sport de l'intérieur. Ce sont les photos que je veux pour représenter ma carrière.",
    avatar: "cyclist-duo.jpg",
    order: 2,
    published: true,
  },
  {
    author: "Sophie Laurent",
    role: "Sports Director",
    quote_en:
      "A rare eye for women's cycling. Editorial, intense, and never generic. Working with Micka raised our whole visual standard.",
    quote_fr:
      "Un œil rare pour le cyclisme féminin. Éditorial, intense, jamais générique. Travailler avec Micka a élevé tout notre standard visuel.",
    order: 3,
    published: true,
  },
];

const COLLABS = [
  {
    name: "VéloSport",
    url: "https://example.com/velosport",
    description_en: "Performance apparel for the women's peloton.",
    description_fr: "Équipement de performance pour le peloton féminin.",
    order: 1,
    published: true,
  },
  {
    name: "Peloton Magazine",
    url: "https://example.com/peloton-magazine",
    description_en: "Editorial features on women's professional racing.",
    description_fr: "Reportages éditoriaux sur le cyclisme féminin professionnel.",
    order: 2,
    published: true,
  },
  {
    name: "AeroGear",
    url: "https://example.com/aerogear",
    description_en: "Aerodynamic equipment tested at race speed.",
    description_fr: "Équipement aérodynamique testé à vitesse de course.",
    order: 3,
    published: true,
  },
];

const SITE_CONTENT = [
  {
    key: "about_intro",
    value_en:
      "I am Don Micka de la Vega, a performance photographer focused on women's cycling.",
    value_fr:
      "Je suis Don Micka de la Vega, photographe de performance spécialisé dans le cyclisme féminin.",
  },
  {
    key: "about_body",
    value_en:
      "My work stands at the intersection of sport and art direction. I don't document the race — I construct its image, frame by frame, with intent and precision. Discipline, endurance and rigor translated into strong, editorial photography.",
    value_fr:
      "Mon travail se situe à l'intersection du sport et de la direction artistique. Je ne documente pas la course — j'en construis l'image, plan par plan, avec intention et précision. Discipline, endurance et rigueur traduites en une photographie forte et éditoriale.",
  },
  {
    key: "contact_intro",
    value_en:
      "Looking for imagery that matches your level of ambition? Tell me about your team, brand or project.",
    value_fr:
      "Vous cherchez des images à la hauteur de votre ambition ? Parlez-moi de votre équipe, votre marque ou votre projet.",
  },
];

// ---------- EJECUCIÓN ----------

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser\n");

  console.log("Categorías:");
  const catId = {};
  for (const c of CATEGORIES) {
    const rec = await upsert("categories", "slug", c.slug, c);
    catId[c.slug] = rec.id;
  }

  console.log("\nÁlbumes:");
  const albumId = {};
  for (const a of ALBUMS) {
    const { cover, category, ...rest } = a;
    const data = {
      ...rest,
      category: catId[category],
      published: true,
      cover: fileFrom(cover),
    };
    const rec = await upsert("albums", "slug", a.slug, data);
    albumId[a.slug] = rec.id;
  }

  console.log("\nFotos:");
  for (const [slug, photos] of Object.entries(PHOTOS_BY_ALBUM)) {
    const id = albumId[slug];
    if (!id) continue;
    const existing = await pb
      .collection("photos")
      .getList(1, 1, { filter: `album = "${id}"` });
    if (existing.totalItems > 0) {
      console.log(`  • ${slug}: ya tiene fotos (skip)`);
      continue;
    }
    for (const p of photos) {
      const { image, ...rest } = p;
      await pb
        .collection("photos")
        .create({ ...rest, album: id, image: fileFrom(image) });
    }
    console.log(`  ✓ ${slug}: ${photos.length} fotos`);
  }

  console.log("\nReviews:");
  for (const r of REVIEWS) {
    const { avatar, ...rest } = r;
    const data = avatar ? { ...rest, avatar: fileFrom(avatar) } : rest;
    await upsert("reviews", "author", r.author, data);
  }

  console.log("\nCollabs:");
  for (const c of COLLABS) {
    await upsert("collabs", "name", c.name, c);
  }

  console.log("\nSite content:");
  for (const s of SITE_CONTENT) {
    await upsert("site_content", "key", s.key, s);
  }

  console.log("\n✓ Listo. Contenido de prueba cargado.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
