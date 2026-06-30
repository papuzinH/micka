"use client";

import { useActionState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { submitContact, type ContactState } from "@/lib/contact/action";
import { Button } from "@/components/ui/Button";

const fieldClasses =
  "border border-brand-light-gray bg-brand-gray-bg px-4 py-3 font-body text-brand-white placeholder:text-brand-white/30 focus:border-brand-violet focus:outline-none";

/**
 * Formulario de contacto. Envía vía Server Action (`submitContact`): valida con
 * Zod, persiste en `contact_messages` y manda email por Resend si está
 * configurado (si no, solo persiste). Honeypot anti-spam.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [state, action, pending] = useActionState(submitContact, {
    status: "idle",
  } as ContactState);

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="border-l-2 border-brand-violet bg-brand-gray-bg p-6 font-body text-brand-white"
      >
        {t("success")}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {/* honeypot: invisible para humanos, atractivo para bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <label className="flex flex-col gap-2">
        <span className="font-display text-h4 uppercase text-brand-white">
          {t("name")}
        </span>
        <input
          name="name"
          type="text"
          required
          placeholder={t("namePlaceholder")}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-display text-h4 uppercase text-brand-white">
          {t("email")}
        </span>
        <input
          name="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          className={fieldClasses}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="font-display text-h4 uppercase text-brand-white">
          {t("message")}
        </span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder={t("messagePlaceholder")}
          className={`${fieldClasses} resize-y`}
        />
      </label>

      <div className="mt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("sending") : t("send")}
        </Button>
      </div>

      {state.status === "error" && (
        <p role="alert" className="font-body text-sm text-brand-violet">
          {t("error")}
        </p>
      )}
    </form>
  );
}
