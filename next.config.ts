import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "micka.lhstudio.com.ar",
        pathname: "/api/files/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // El default de Next (1 MB) rechaza cualquier subida real: todo el
      // admin sube archivos vía Server Action (`saveRecord`) y las fotos
      // profesionales del cliente pesan 8-10 MB. Los campos ya aceptan hasta
      // 15 MB en PocketBase (`set-file-limits.mjs`); este límite solo evita
      // que Next corte la request antes de que llegue al backend.
      bodySizeLimit: "16mb",
    },
  },
};

export default withNextIntl(nextConfig);
