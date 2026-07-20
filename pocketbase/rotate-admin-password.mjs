// pocketbase/rotate-admin-password.mjs
// Rota la clave del superuser de servicio (admin@micka.com) a una clave fuerte
// aleatoria y actualiza POCKETBASE_ADMIN_PASSWORD en .env.local in-place.
// NO imprime la clave nueva (vive solo en .env.local, gitignoreado).
//
// Uso (desde la raíz): node pocketbase/rotate-admin-password.mjs

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import PocketBase from "pocketbase";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("No existe .env.local");
  process.exit(1);
}
let envText = fs.readFileSync(envPath, "utf8");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;
const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const CURRENT = process.env.POCKETBASE_ADMIN_PASSWORD;
if (!URL || !EMAIL || !CURRENT) {
  console.error("Faltan variables en .env.local");
  process.exit(1);
}

const newPassword = crypto.randomBytes(18).toString("base64url");

const pb = new PocketBase(URL);
pb.autoCancellation(false);

async function main() {
  const auth = await pb.collection("_superusers").authWithPassword(EMAIL, CURRENT);
  const id = auth.record.id;

  await pb.collection("_superusers").update(id, {
    oldPassword: CURRENT,
    password: newPassword,
    passwordConfirm: newPassword,
  });

  if (/^\s*POCKETBASE_ADMIN_PASSWORD\s*=.*$/m.test(envText)) {
    envText = envText.replace(
      /^\s*POCKETBASE_ADMIN_PASSWORD\s*=.*$/m,
      `POCKETBASE_ADMIN_PASSWORD=${newPassword}`,
    );
  } else {
    envText += `\nPOCKETBASE_ADMIN_PASSWORD=${newPassword}\n`;
  }
  fs.writeFileSync(envPath, envText, "utf8");

  console.log("✓ Clave de admin@micka.com rotada y .env.local actualizado.");
  console.log("  (La clave nueva no se imprime; vive solo en .env.local.)");
}

main().catch((err) => {
  console.error("\n✗ Error:", err?.message ?? err);
  if (err?.response?.data) {
    console.error(JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
