import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");
  return <main className="p-8 font-display text-3xl">{t("siteName")}</main>;
}
