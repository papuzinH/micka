import PocketBase from "pocketbase";

export function getPocketBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_POCKETBASE_URL no está definida");
  return url;
}

export function createPocketBase(): PocketBase {
  return new PocketBase(getPocketBaseUrl());
}
