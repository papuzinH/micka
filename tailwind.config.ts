import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#000000",
          gray: "#202020",
          "gray-bg": "#212121",
          "gray-light": "#373636",
          white: "#ffffff",
          violet: "#a020f0",
          "violet-dark": "#8315c8",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      // Escala tipográfica del Figma (Syne titulares / Inter body).
      // line-height 1 en titulares = 100% del Figma; body a 1.5 por legibilidad.
      fontSize: {
        h1: ["45px", { lineHeight: "1", fontWeight: "800" }],
        h2: ["30px", { lineHeight: "1", fontWeight: "700" }],
        card: ["20px", { lineHeight: "1", fontWeight: "700" }],
        h3: ["16px", { lineHeight: "1", fontWeight: "700" }],
        h4: ["14px", { lineHeight: "1", fontWeight: "700" }],
        body: ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-semibold": ["14px", { lineHeight: "1.5", fontWeight: "600" }],
      },
      boxShadow: {
        button: "0 4px 4px 0 #00000040",
      },
    },
  },
  plugins: [],
} satisfies Config;
