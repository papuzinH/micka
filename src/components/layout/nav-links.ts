/** Links de navegación del sitio (compartidos por Navbar y Footer).
 *  `key` referencia el namespace i18n `nav`; `href` es la ruta localizada. */
export const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "portfolio", href: "/portfolio" },
  { key: "about", href: "/about" },
  { key: "reviews", href: "/reviews" },
  { key: "collabs", href: "/collabs" },
  { key: "contact", href: "/contact" },
] as const;
