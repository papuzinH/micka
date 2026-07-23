import createMiddleware from "next-intl/middleware";
import { routing } from "@/lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // icon/apple-icon: metadata files de Next sin extensión — si el middleware
  // los agarra, los redirige a /en/icon (404). Los demás metadata files zafan
  // solos: sitemap.xml/robots.txt tienen punto y opengraph-image vive bajo
  // [locale].
  matcher: ["/((?!api|_next|admin|icon|apple-icon|.*\\..*).*)"],
};
