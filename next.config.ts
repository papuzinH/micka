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
};

export default withNextIntl(nextConfig);
