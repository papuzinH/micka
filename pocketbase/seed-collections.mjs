// Crea las colecciones del CMS en PocketBase a partir de pocketbase/pb_schema.json
// usando el SDK (genera los IDs y resuelve relaciones por nombre).
//
// Uso (desde la raíz del proyecto):
//   node pocketbase/seed-collections.mjs
//
// Requiere en .env.local (gitignoreado):
//   NEXT_PUBLIC_POCKETBASE_URL=https://micka.lhstudio.com.ar
//   POCKETBASE_ADMIN_EMAIL=...        (el superuser que creaste)
//   POCKETBASE_ADMIN_PASSWORD=...
//
// Es idempotente: si una colección ya existe, la saltea.

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

const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "pb_schema.json"), "utf8"),
);

const pb = new PocketBase(URL);
pb.autoCancellation(false);

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser\n");

  // mapa: id-placeholder del archivo -> id real de la colección creada/existente
  const idMap = {};

  for (const col of schema) {
    // ¿ya existe?
    let existing = null;
    try {
      existing = await pb.collections.getOne(col.name);
    } catch {
      existing = null;
    }
    if (existing) {
      idMap[col.id] = existing.id;
      console.log(`• ${col.name}: ya existe (skip)`);
      continue;
    }

    // construir fields: quitar el campo system "id" (PB lo agrega solo)
    // y resolver collectionId de relaciones con el id real ya creado.
    const fields = col.fields
      .filter((f) => !(f.system && f.name === "id"))
      .map((f) => {
        if (f.type === "relation" && f.collectionId) {
          const realId = idMap[f.collectionId];
          if (!realId) {
            throw new Error(
              `Relación ${col.name}.${f.name} apunta a ${f.collectionId} que aún no fue creada (revisar orden en pb_schema.json)`,
            );
          }
          return { ...f, collectionId: realId };
        }
        return f;
      });

    const created = await pb.collections.create({
      name: col.name,
      type: col.type,
      fields,
      indexes: col.indexes ?? [],
      listRule: col.listRule ?? null,
      viewRule: col.viewRule ?? null,
      createRule: col.createRule ?? null,
      updateRule: col.updateRule ?? null,
      deleteRule: col.deleteRule ?? null,
    });
    idMap[col.id] = created.id;
    console.log(`✓ ${col.name}: creada (${created.id})`);
  }

  console.log("\n✓ Listo. Colecciones del CMS creadas.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
