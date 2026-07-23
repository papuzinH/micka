/**
 * URL pública canónica del sitio, sin trailing slash.
 * Mientras el cliente no compre su dominio, el fallback es el deploy de Vercel;
 * al activarlo solo cambia NEXT_PUBLIC_SITE_URL en Vercel (cero código).
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || "https://micka-plum.vercel.app";
  return url.replace(/\/+$/, "");
}
