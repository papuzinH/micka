/** Une clases condicionales filtrando valores vacíos (clsx mínimo, sin dependencia). */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
