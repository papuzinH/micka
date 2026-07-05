import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToggleLanguage } from "../ToggleLanguage";

describe("ToggleLanguage", () => {
  it("muestra solo el código del idioma activo (no ambos a la vez)", () => {
    render(<ToggleLanguage locale="en" />);
    expect(screen.getByText("EN")).toBeInTheDocument();
    expect(screen.queryByText("FR")).not.toBeInTheDocument();
  });

  it("es un switch con aria-checked=false cuando el locale activo es en", () => {
    render(<ToggleLanguage locale="en" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("el switch anuncia el idioma destino (el otro locale)", () => {
    render(<ToggleLanguage locale="en" />);
    expect(screen.getByRole("switch")).toHaveAccessibleName(/FR/);
  });

  it("en francés aria-checked es true y el switch apunta a EN", () => {
    render(<ToggleLanguage locale="fr" />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("switch")).toHaveAccessibleName(/EN/);
  });
});
