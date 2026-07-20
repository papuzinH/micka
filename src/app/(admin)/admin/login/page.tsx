"use client";

import { useActionState } from "react";
import { loginAdmin } from "../actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" } as { error?: string });
  return (
    <main className="min-h-screen flex items-center justify-center bg-brand-gray-bg text-brand-white">
      <form action={action} className="w-80 space-y-4">
        <h1 className="font-display text-2xl">Admin</h1>
        <input name="email" type="email" placeholder="Email" required
          className="w-full bg-brand-gray-bg p-2 rounded" />
        <input name="password" type="password" placeholder="Password" required
          className="w-full bg-brand-gray-bg p-2 rounded" />
        {state?.error ? <p className="text-brand-violet text-sm">{state.error}</p> : null}
        <button type="submit" disabled={pending}
          className="w-full bg-brand-violet shadow-button rounded p-2 disabled:opacity-50">
          {pending ? "..." : "Log in"}
        </button>
      </form>
    </main>
  );
}
