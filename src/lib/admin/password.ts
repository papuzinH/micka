export interface PasswordChangeInput {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Valida un cambio de contraseña del admin. Devuelve un mensaje de error
 *  (inglés, user-facing) o `null` si es válido. El mínimo de 10 caracteres
 *  se alinea con los superusers de PocketBase; si PB fuera más estricto, su
 *  error se propaga igual desde la Server Action. */
export function validatePasswordChange(input: PasswordChangeInput): string | null {
  if (!input.oldPassword) return "Enter your current password";
  if (input.newPassword.length < 10) {
    return "New password must be at least 10 characters";
  }
  if (input.newPassword !== input.confirmPassword) {
    return "New passwords do not match";
  }
  if (input.newPassword === input.oldPassword) {
    return "New password must be different from the current one";
  }
  return null;
}
