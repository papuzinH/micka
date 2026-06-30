import PocketBase from "pocketbase";

export function getPocketBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_POCKETBASE_URL no está definida");
  return url;
}

export function createPocketBase(): PocketBase {
  const pb = new PocketBase(getPocketBaseUrl());
  // En SSR/SSG las páginas se renderizan en paralelo (p. ej. /en y /fr a la
  // vez); con auto-cancelación las requests idénticas colisionan y se cancelan.
  // Server-side la desactivamos para que cada query corra hasta el final.
  pb.autoCancellation(false);
  return pb;
}
