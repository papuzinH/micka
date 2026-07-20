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
