"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "sending" | "success" | "error";

const fieldClasses =
  "border border-brand-light-gray bg-brand-gray-bg px-4 py-3 font-body text-brand-white placeholder:text-brand-white/30 focus:border-brand-violet focus:outline-none";

/**
 * Formulario de contacto. La UI y los estados (idle/sending/success/error)
 * están completos; la persistencia en `contact_messages` + email (Resend)
 * detrás de env var se conectan vía Server Action en la Fase 2c.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // TODO (Fase 2c): reemplazar por Server Action (Zod → persistir + email).
    await new Promise((r) => setTimeout(r, 700));
    setStatus("success");
  }

  if (status === "success") {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? t("sending") : t("send")}
        </Button>
      </div>

      {status === "error" && (
        <p role="alert" className="font-body text-sm text-brand-violet">
          {t("error")}
        </p>
      )}
    </form>
  );
}
