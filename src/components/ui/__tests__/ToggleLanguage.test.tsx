import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ToggleLanguage,
  TOGGLE_TIMING,
  TOGGLE_TOTAL,
} from "../ToggleLanguage";

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

describe("ToggleLanguage — timing", () => {
  it("navega antes de que la animación termine (no en serie)", () => {
    // La razón de ser del fix: si la navegación volviera a dispararse al
    // final del timeline, el costo de traer la página nueva se sumaría a la
    // animación entera y el switch se sentiría pesado otra vez.
    expect(TOGGLE_TIMING.navigateAt).toBeLessThan(TOGGLE_TOTAL);
  });

  it("navega recién cuando el thumb ya arrancó a deslizar, no antes", () => {
    // Si navegara antes del slide, el usuario vería el cambio de bandera sin
    // que el thumb se haya movido; si navegara después de terminarlo, no
    // habría solapamiento alguno.
    const slideEnd = TOGGLE_TIMING.slideAt + TOGGLE_TIMING.slideDuration;
    expect(TOGGLE_TIMING.navigateAt).toBeGreaterThan(TOGGLE_TIMING.slideAt);
    expect(TOGGLE_TIMING.navigateAt).toBeLessThan(slideEnd);
  });

  it("la animación completa se mantiene dentro del presupuesto", () => {
    // Presupuesto deliberado: el timeline previo duraba 0.46s y se sentía
    // lento. Este test evita que vuelva a crecer sin una decisión explícita.
    expect(TOGGLE_TOTAL).toBeLessThanOrEqual(0.35);
  });
});
