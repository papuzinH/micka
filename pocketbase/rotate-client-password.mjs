// pocketbase/rotate-client-password.mjs
// Rota la clave del superuser del cliente (donmickadelavega@gmail.com) a una
// clave fuerte aleatoria, usando la cuenta de servicio para autenticar.
// NO imprime la clave: la escribe a un archivo local gitignoreado para no
// dejarla en logs/transcripts. El cliente la cambia desde /admin/account.
//
// Uso (desde la raíz): node pocketbase/rotate-client-password.mjs
// Requiere en .env.local: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL,
// POCKETBASE_ADMIN_PASSWORD (la cuenta de servicio admin@micka.com).
//
// Complementa create-client-superuser.mjs, que solo sirve la primera vez
// (aborta si la cuenta ya existe).

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

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
if (!PB_URL || !EMAIL || !PASSWORD) {
  console.error("Faltan variables en .env.local");
  process.exit(1);
}

// El panel del cliente es el /admin del sitio Next.js, no el de PocketBase.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://micka-plum.vercel.app";
const CLIENT_EMAIL = "donmickadelavega@gmail.com";
const newPassword = crypto.randomBytes(18).toString("base64url");
const outFile = path.join(__dirname, ".tmp-micka-credentials.txt");

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

async function main() {
  await pb.collection("_superusers").authWithPassword(EMAIL, PASSWORD);
  console.log("✓ Autenticado como superuser de servicio\n");

  const record = await pb
    .collection("_superusers")
    .getFirstListItem(`email="${CLIENT_EMAIL}"`);

  await pb.collection("_superusers").update(record.id, {
    password: newPassword,
    passwordConfirm: newPassword,
  });

  fs.writeFileSync(
    outFile,
    `PocketBase: clave del cliente rotada.\n\n` +
      `Login: ${SITE_URL}/admin/login\n` +
      `Email: ${CLIENT_EMAIL}\n` +
      `Clave nueva: ${newPassword}\n\n` +
      `Cargá esta clave en un one-time secret y borrá este archivo.\n`,
    "utf8",
  );

  console.log(`✓ Clave de ${CLIENT_EMAIL} rotada.`);
  console.log(
    "✓ Clave nueva escrita en pocketbase/.tmp-micka-credentials.txt (gitignoreado).",
  );
  console.log("  Cargala en el one-time secret y borrá el archivo.");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
