import { useTranslations } from "next-intl";

/** Franja con textura de puntos violeta y el lema "Nothing is left to chance". */
export function NothingBar() {
  const t = useTranslations("home.nothingBar");
  return (
    <div className="relative overflow-hidden bg-brand-gray py-10 md:py-7">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,#a020f0_1.5px,transparent_1.5px)] bg-size-[16px_16px]"
      />
      <p className="relative mx-auto max-w-[12ch] text-center font-display text-h2 leading-tight text-brand-white md:max-w-none">
        {t("text")}
      </p>
    </div>
  );
}
