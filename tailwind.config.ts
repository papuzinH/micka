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
      boxShadow: {
        button: "0 4px 4px 0 #00000040",
      },
    },
  },
  plugins: [],
} satisfies Config;
