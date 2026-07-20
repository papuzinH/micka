import { describe, it, expect } from "vitest";
import { validatePasswordChange } from "../password";

describe("validatePasswordChange", () => {
  const ok = {
    oldPassword: "current123",
    newPassword: "brandNewPass1",
    confirmPassword: "brandNewPass1",
  };

  it("acepta un cambio válido", () => {
    expect(validatePasswordChange(ok)).toBeNull();
  });

  it("rechaza si falta la clave actual", () => {
    expect(validatePasswordChange({ ...ok, oldPassword: "" })).toBe(
      "Enter your current password",
    );
  });

  it("rechaza una clave nueva corta (< 10)", () => {
    expect(
      validatePasswordChange({ ...ok, newPassword: "short", confirmPassword: "short" }),
    ).toBe("New password must be at least 10 characters");
  });

  it("rechaza si la confirmación no coincide", () => {
    expect(
      validatePasswordChange({ ...ok, confirmPassword: "different12345" }),
    ).toBe("New passwords do not match");
  });

  it("rechaza si la nueva es igual a la actual", () => {
    expect(
      validatePasswordChange({
        oldPassword: "samePass12345",
        newPassword: "samePass12345",
        confirmPassword: "samePass12345",
      }),
    ).toBe("New password must be different from the current one");
  });
});
