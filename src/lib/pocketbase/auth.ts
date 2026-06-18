export const ADMIN_COOKIE = "pb_admin_auth";

export interface AuthCookie { token: string; record: { id: string } }

export function parseAuthCookie(raw: string | undefined): AuthCookie | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === "string") return parsed as AuthCookie;
    return null;
  } catch {
    return null;
  }
}

export function isValidAuth(raw: string | undefined): boolean {
  return parseAuthCookie(raw)?.token ? true : false;
}
