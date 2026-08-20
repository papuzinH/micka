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
