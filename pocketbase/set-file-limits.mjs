// Ajusta el tamaño máximo de los campos `file` de las colecciones a 15 MB.
// El default de PocketBase (5 MB) es restrictivo para fotografía profesional;
// el front sirve thumbnails (600x0/1200x0), así que el original puede ser
// pesado sin afectar la performance. Caddy no limita el body → subidas OK.
//
// Uso: node pocketbase/set-file-limits.mjs
// Requiere las mismas variables que los otros scripts en .env.local.

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

const LIMIT = 15 * 1024 * 1024; // 15 MB
const TARGETS = {
  albums: "cover",
  photos: "image",
  reviews: "avatar",
  collabs: "logo",
};

const pb = new PocketBase(URL);
pb.autoCancellation(false);

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser\n");

  for (const [collection, fieldName] of Object.entries(TARGETS)) {
    const col = await pb.collections.getOne(collection);
    const fields = col.fields.map((f) =>
      f.name === fieldName ? { ...f, maxSize: LIMIT } : f,
    );
    await pb.collections.update(col.id, { fields });
    console.log(`✓ ${collection}.${fieldName}: maxSize → ${LIMIT} bytes`);
  }

  console.log("\n✓ Límites de archivo actualizados a 15 MB.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
