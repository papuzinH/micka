import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { HelpContent } from "../HelpContent";

describe("HelpContent", () => {
  it("cubre las secciones clave de la guía", () => {
    render(<HelpContent />);
    for (const heading of [
      "Getting started",
      "Albums & photos",
      "Reviews & collabs",
      "Site texts",
      "Site images",
      "Contact messages",
      "Image guidelines",
    ]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
  });

  it("menciona el límite de 15MB por imagen", () => {
    render(<HelpContent />);
    expect(screen.getByText(/15\s?MB/i)).toBeInTheDocument();
  });

  it("explica que las imágenes sin cargar muestran una foto provisoria", () => {
    render(<HelpContent />);
    expect(screen.getByText(/placeholder/i)).toBeInTheDocument();
  });
});
