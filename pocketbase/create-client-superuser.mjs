// pocketbase/create-client-superuser.mjs
// Crea un superuser separado para el cliente (Micka) con una clave temporal
// aleatoria. NO imprime la clave: la escribe a un archivo local gitignoreado
// para no dejarla en logs/transcripts. El cliente la cambia al primer login
// desde /admin/account.
//
// Uso (desde la raíz): node pocketbase/create-client-superuser.mjs
// Requiere en .env.local: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL,
// POCKETBASE_ADMIN_PASSWORD (la cuenta de servicio admin@micka.com).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
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

const CLIENT_EMAIL = "donmickadelavega@gmail.com";
const tempPassword = crypto.randomBytes(18).toString("base64url");
const outFile = path.join(__dirname, ".tmp-micka-credentials.txt");

const pb = new PocketBase(URL);
pb.autoCancellation(false);

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser de servicio\n");

  // idempotencia: si ya existe, no duplicar
  try {
    await pb
      .collection("_superusers")
      .getFirstListItem(`email="${CLIENT_EMAIL}"`);
    console.error(`✗ Ya existe un superuser con email ${CLIENT_EMAIL} (skip).`);
    process.exit(1);
  } catch {
    // no existe - seguimos
  }

  await pb.collection("_superusers").create({
    email: CLIENT_EMAIL,
    password: tempPassword,
    passwordConfirm: tempPassword,
  });

  fs.writeFileSync(
    outFile,
    `PocketBase superuser creado para el cliente.\n\n` +
      `Email: ${CLIENT_EMAIL}\n` +
      `Clave temporal: ${tempPassword}\n\n` +
      `Cargá esta clave en un one-time secret y borrá este archivo.\n`,
    "utf8",
  );

  console.log(`✓ Superuser ${CLIENT_EMAIL} creado.`);
  console.log(
    "✓ Clave temporal escrita en pocketbase/.tmp-micka-credentials.txt (gitignoreado).",
  );
  console.log("  Abrí el archivo, cargá la clave en el one-time secret y borralo.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
