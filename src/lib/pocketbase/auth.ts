export const ADMIN_COOKIE = "pb_admin_auth";

// record is typed broadly so it is assignable to PocketBase's RecordModel (which uses [key: string]: any)
export interface AuthCookie { token: string; record: Record<string, unknown> & { id: string } }

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
  return Boolean(parseAuthCookie(raw)?.token);
}
