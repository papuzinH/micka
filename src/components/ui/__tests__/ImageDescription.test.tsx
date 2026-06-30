import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageDescription } from "../ImageDescription";

describe("ImageDescription", () => {
  it("renderiza el título y la imagen con su alt", () => {
    render(
      <ImageDescription src="/p.jpg" alt="Ciclista en ruta" title="THE PELOTON" />
    );
    expect(screen.getByText("THE PELOTON")).toBeInTheDocument();
    expect(screen.getByAltText("Ciclista en ruta")).toBeInTheDocument();
  });

  it("envuelve la card en un link cuando recibe href", () => {
    render(
      <ImageDescription src="/p.jpg" alt="x" title="T" href="/portfolio/peloton" />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/portfolio/peloton"
    );
  });
});
