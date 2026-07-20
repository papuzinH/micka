# Cuentas admin separadas + cambio de contraseña — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar al cliente (Micka) una cuenta superuser propia y una página de "cambiar contraseña" en el admin, dejando `admin@micka.com` como cuenta de servicio/dev de Lauti.

**Architecture:** El admin custom ya autentica contra `_superusers` de PocketBase y reconstruye el cliente PB desde la cookie de sesión del usuario logueado (`requireAdminPb()`). Se agrega (1) una página `/admin/account` con una Server Action `changePassword` que actualiza la clave del superuser logueado y fuerza re-login, y (2) dos scripts `.mjs` de operación (crear el superuser del cliente, rotar la clave de servicio) que manejan las claves sin dejarlas en logs.

**Tech Stack:** Next.js 16 (App Router, Server Actions, `useActionState`), PocketBase JS SDK 0.27, Vitest, Node scripts (`.mjs`).

## Global Constraints

- Todo acceso a PocketBase pasa por `src/lib/pocketbase` (los scripts `.mjs` son la excepción existente del repo: usan el SDK directo, siguiendo el patrón de `seed-*.mjs`).
- UI del admin en **inglés** (el cliente es EN/FR). Ningún string user-facing en español.
- Sin em-dash (`—`) en ningún texto; usar `-`.
- Verificación no visual únicamente: `npx tsc --noEmit && npm run lint && npm run test && npx next build`. **Prohibido** correr Playwright/e2e o herramientas de browser (lo valida el cliente).
- Claves de PocketBase / credenciales → nunca en el repo ni en logs/stdout. `.env.local` está gitignoreado.
- TDD donde aplique (funciones puras); commits frecuentes (uno por task).
- El middleware vive en `src/proxy.ts` (no aplica acá pero es convención del repo).

---

## Setup (antes de la Task 1)

- [ ] **Crear la rama de feature** (estamos en `master`):

```bash
git checkout -b feat/admin-separate-accounts
```

---

### Task 1: Validación pura del cambio de contraseña

**Files:**
- Create: `src/lib/admin/password.ts`
- Test: `src/lib/admin/__tests__/password.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `validatePasswordChange(input: PasswordChangeInput): string | null` y la interfaz `PasswordChangeInput { oldPassword: string; newPassword: string; confirmPassword: string }`. Devuelve un mensaje de error (inglés, user-facing) o `null` si es válido. Lo consume la Server Action de la Task 2.

- [ ] **Step 1: Escribir el test que falla**

```ts
// src/lib/admin/__tests__/password.test.ts
import { describe, it, expect } from "vitest";
import { validatePasswordChange } from "../password";

describe("validatePasswordChange", () => {
  const ok = {
    oldPassword: "current123",
    newPassword: "brandNewPass1",
    confirmPassword: "brandNewPass1",
  };

  it("acepta un cambio válido", () => {
    expect(validatePasswordChange(ok)).toBeNull();
  });

  it("rechaza si falta la clave actual", () => {
    expect(validatePasswordChange({ ...ok, oldPassword: "" })).toBe(
      "Enter your current password",
    );
  });

  it("rechaza una clave nueva corta (< 10)", () => {
    expect(
      validatePasswordChange({ ...ok, newPassword: "short", confirmPassword: "short" }),
    ).toBe("New password must be at least 10 characters");
  });

  it("rechaza si la confirmación no coincide", () => {
    expect(
      validatePasswordChange({ ...ok, confirmPassword: "different12345" }),
    ).toBe("New passwords do not match");
  });

  it("rechaza si la nueva es igual a la actual", () => {
    expect(
      validatePasswordChange({
        oldPassword: "samePass12345",
        newPassword: "samePass12345",
        confirmPassword: "samePass12345",
      }),
    ).toBe("New password must be different from the current one");
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/admin/__tests__/password.test.ts`
Expected: FAIL (`validatePasswordChange` no existe / no se puede importar).

- [ ] **Step 3: Implementar la función mínima**

```ts
// src/lib/admin/password.ts
export interface PasswordChangeInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Valida un cambio de contraseña del admin. Devuelve un mensaje de error
 *  (inglés, user-facing) o `null` si es válido. El mínimo de 10 caracteres
 *  se alinea con los superusers de PocketBase; si PB fuera más estricto, su
 *  error se propaga igual desde la Server Action. */
export function validatePasswordChange(input: PasswordChangeInput): string | null {
  if (!input.oldPassword) return "Enter your current password";
  if (input.newPassword.length < 10) {
    return "New password must be at least 10 characters";
  }
  if (input.newPassword !== input.confirmPassword) {
    return "New passwords do not match";
  }
  if (input.newPassword === input.oldPassword) {
    return "New password must be different from the current one";
  }
  return null;
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/admin/__tests__/password.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/password.ts src/lib/admin/__tests__/password.test.ts
git commit -m "feat(admin): pure validator for admin password change"
```

---

### Task 2: Server Action `changePassword` + página `/admin/account` + link en el sidebar

**Files:**
- Modify: `src/app/(admin)/admin/actions.ts` (agregar `changePassword` + tipo `ChangePasswordState`)
- Create: `src/app/(admin)/admin/(panel)/account/page.tsx`
- Modify: `src/components/admin/Sidebar.tsx` (link "Account")

**Interfaces:**
- Consumes: `validatePasswordChange` / `PasswordChangeInput` (Task 1); `requireAdminPb()` de `@/lib/pocketbase/admin`; `ADMIN_COOKIE` de `@/lib/pocketbase/auth`.
- Produces: `changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState>` y `ChangePasswordState { error?: string }`, importados por la página de account.

**Nota de routing:** `(panel)/account/page.tsx` (segmento estático) tiene prioridad sobre `(panel)/[collection]/page.tsx` (segmento dinámico) para `/admin/account`, así que no colisiona con el CRUD (y "account" no es slug de ninguna colección). El guard ya lo aplica `(panel)/layout.tsx` vía `requireAdminPb()`.

- [ ] **Step 1: Agregar la Server Action a `actions.ts`**

Agregar imports arriba (junto a los existentes):

```ts
import { requireAdminPb } from "@/lib/pocketbase/admin";
import { validatePasswordChange } from "@/lib/admin/password";
```

Agregar al final del archivo:

```ts
export interface ChangePasswordState {
  error?: string;
}

/** Cambia la contraseña del superuser logueado. PocketBase invalida los tokens
 *  al cambiar la clave, así que borramos la cookie y forzamos re-login. */
export async function changePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const oldPassword = String(formData.get("oldPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const validationError = validatePasswordChange({
    oldPassword,
    newPassword,
    confirmPassword,
  });
  if (validationError) return { error: validationError };

  const pb = await requireAdminPb();
  const id = pb.authStore.record?.id;
  if (!id) return { error: "Session expired. Please log in again." };

  try {
    await pb.collection("_superusers").update(id, {
      oldPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });
  } catch {
    return {
      error: "Could not update password. Check your current password and try again.",
    };
  }

  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
```

- [ ] **Step 2: Crear la página de account**

```tsx
// src/app/(admin)/admin/(panel)/account/page.tsx
"use client";

import { useActionState } from "react";
import { changePassword, type ChangePasswordState } from "@/app/(admin)/admin/actions";

const inputCls = "w-full rounded bg-brand-gray-bg p-2 text-brand-white";
const labelCls = "mb-1 block text-sm text-brand-white/70";

export default function AccountPage() {
  const [state, action, pending] = useActionState(
    changePassword,
    {} as ChangePasswordState,
  );

  return (
    <div className="max-w-md">
      <h1 className="mb-6 font-display text-2xl uppercase text-brand-white">Account</h1>
      <form action={action} className="space-y-4">
        <label className="block">
          <span className={labelCls}>Current password</span>
          <input name="oldPassword" type="password" required className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>New password</span>
          <input name="newPassword" type="password" required className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Confirm new password</span>
          <input name="confirmPassword" type="password" required className={inputCls} />
        </label>
        {state?.error ? (
          <p role="alert" className="text-sm text-brand-violet">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-brand-violet px-5 py-2.5 font-display text-h4 uppercase text-white shadow-button transition-colors hover:bg-brand-violet-dark disabled:opacity-50"
        >
          {pending ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Agregar el link "Account" al sidebar**

En `src/components/admin/Sidebar.tsx`, dentro del `<nav>`, después del bloque `{COLLECTIONS.map(...)}` y antes de cerrar `</nav>`, agregar:

```tsx
        <div className="my-2 h-px bg-brand-light-gray" />
        <Link
          href="/admin/account"
          className={linkCls(pathname === "/admin/account")}
        >
          Account
        </Link>
```

- [ ] **Step 4: Verificar (tsc + lint + build)**

Run: `npx tsc --noEmit && npm run lint && npx next build`
Expected: sin errores; la ruta `/admin/account` aparece en el output del build.
(No hay test unit del action ni de la página — el action toca PB/cookies y sigue el patrón de los actions existentes del repo, no testeados unit; la lógica pura ya está cubierta en la Task 1. No se corre Playwright.)

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/admin/actions.ts "src/app/(admin)/admin/(panel)/account/page.tsx" src/components/admin/Sidebar.tsx
git commit -m "feat(admin): change-password page + Account sidebar link"
```

---

### Task 3: Script para crear el superuser del cliente (+ .gitignore)

**Files:**
- Create: `pocketbase/create-client-superuser.mjs`
- Modify: `.gitignore` (ignorar el archivo temporal de credenciales)

**Interfaces:**
- Consumes: `.env.local` (`NEXT_PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`).
- Produces: un superuser `donmickadelavega@gmail.com` en PocketBase + el archivo `pocketbase/.tmp-micka-credentials.txt` con la clave temporal. No es consumido por otro código; se ejecuta en el rollout.

- [ ] **Step 1: Agregar el ignore del archivo temporal**

En `.gitignore`, agregar al final:

```
# credenciales temporales de scripts de pocketbase (nunca commitear)
/pocketbase/.tmp-*
```

- [ ] **Step 2: Crear el script**

```js
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
    // no existe → seguimos
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
```

- [ ] **Step 3: Verificar sintaxis (sin tocar producción)**

Run: `node --check pocketbase/create-client-superuser.mjs`
Expected: sin salida (exit 0). La ejecución real contra PB es un paso de rollout, con OK explícito de Lauti.

- [ ] **Step 4: Commit**

```bash
git add pocketbase/create-client-superuser.mjs .gitignore
git commit -m "feat(pocketbase): script to create client superuser (temp pass to gitignored file)"
```

---

### Task 4: Script para rotar la clave de la cuenta de servicio

**Files:**
- Create: `pocketbase/rotate-admin-password.mjs`

**Interfaces:**
- Consumes: `.env.local` (`NEXT_PUBLIC_POCKETBASE_URL`, `POCKETBASE_ADMIN_EMAIL`, `POCKETBASE_ADMIN_PASSWORD`).
- Produces: rota la clave de `admin@micka.com` en PocketBase y reescribe `POCKETBASE_ADMIN_PASSWORD` en `.env.local` in-place. Se ejecuta en el rollout.

- [ ] **Step 1: Crear el script**

```js
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
```

- [ ] **Step 2: Verificar sintaxis**

Run: `node --check pocketbase/rotate-admin-password.mjs`
Expected: sin salida (exit 0).

- [ ] **Step 3: Commit**

```bash
git add pocketbase/rotate-admin-password.mjs
git commit -m "feat(pocketbase): script to rotate service superuser password in place"
```

---

## Verificación integral (antes del rollout)

- [ ] Correr la suite no visual completa y confirmar verde:

```bash
npx tsc --noEmit && npm run lint && npm run test && npx next build
```

Expected: tsc limpio, ESLint limpio, Vitest verde (los 76 previos + los 5 nuevos de la Task 1 = 81), build OK con la ruta `/admin/account`.

---

## Rollout (operativo, fuera del código — orden importa)

Estos pasos mutan el PocketBase de producción del cliente; se ejecutan con OK explícito de Lauti en el momento.

1. **Merge + deploy** de la rama a `master` (Vercel deploya solo). La página `/admin/account` debe estar online antes de que Micka intente cambiar su clave.
2. **Rotar la clave de servicio:** `node pocketbase/rotate-admin-password.mjs` → actualiza `.env.local`. (La clave débil `adminmicka123` deja de servir; los scripts/e2e siguen andando con la nueva del `.env.local`.)
3. **Crear el superuser de Micka:** `node pocketbase/create-client-superuser.mjs` → clave temporal en `pocketbase/.tmp-micka-credentials.txt`. Lauti abre el archivo, carga la clave en un one-time secret (onetimesecret.com / Bitwarden Send) y **borra el archivo**.
4. **Reescribir el borrador del mail** (hilo "Portfolio development", con CC a Micaela, guiones normales): en vez de apuntar a las creds del 7-jul, decirle que se le creó una cuenta personal (`donmickadelavega@gmail.com`), pasarle la temporal por el link one-time, e indicarle entrar a **Account → Change password** ni bien ingrese. Descartar los borradores viejos.

## Documentación a actualizar al cierre

- `CLAUDE.md`: sección "Estado actual" + changelog (cuentas separadas, página de cambio de clave, rotación hecha).
- `.env.local.example`: si documenta `POCKETBASE_ADMIN_*`, aclarar que es la cuenta de servicio/dev.
- Status del vault (via session-close): pendientes de seguridad cerrados (contraseña rotada), acceso admin del cliente resuelto.
