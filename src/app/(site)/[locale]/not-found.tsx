"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** 404 localizado para rutas dentro de `[locale]` (p. ej. un slug de álbum
 *  inexistente que dispara notFound()). Se renderiza dentro del layout del
 *  sitio (navbar/footer + provider de mensajes). */
export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-360 flex-col items-center justify-center px-5 py-20 text-center">
      <p className="font-display text-h1 text-brand-violet">404</p>
      <h1 className="mt-4 font-display text-h2 uppercase text-brand-white">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md font-body text-brand-white/60">
        {t("message")}
      </p>
      <div className="mt-8">
        <Button href="/">{t("home")}</Button>
      </div>
    </main>
  );
}
