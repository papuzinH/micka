import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToggleLanguage } from "../ToggleLanguage";

describe("ToggleLanguage", () => {
  it("muestra el código del idioma actual", () => {
    render(<ToggleLanguage locale="en" />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("el botón anuncia el idioma destino (el otro locale)", () => {
    render(<ToggleLanguage locale="en" />);
    expect(screen.getByRole("button")).toHaveAccessibleName(/FR/);
  });

  it("en francés muestra FR y apunta a EN", () => {
    render(<ToggleLanguage locale="fr" />);
    expect(screen.getByText("FR")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveAccessibleName(/EN/);
  });
});
