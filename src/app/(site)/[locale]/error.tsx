"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** Error boundary localizado del sitio. Se monta dentro del layout `[locale]`,
 *  así que tiene acceso al provider de mensajes. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-360 flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="font-display text-h2 uppercase text-brand-white">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md font-body text-brand-white/60">
        {t("message")}
      </p>
      <div className="mt-8">
        <Button onClick={reset} iconRight={null}>
          {t("retry")}
        </Button>
      </div>
    </main>
  );
}
