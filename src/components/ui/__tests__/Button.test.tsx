import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renderiza el texto del botón", () => {
    render(<Button>ALL ALBUMS</Button>);
    expect(screen.getByText("ALL ALBUMS")).toBeInTheDocument();
  });

  it("por defecto renderiza un <button>", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renderiza un link localizado cuando recibe href", () => {
    render(<Button href="/portfolio">Ver</Button>);
    expect(screen.getByRole("link", { name: /ver/i })).toHaveAttribute(
      "href",
      "/portfolio"
    );
  });

  it("aplica la altura del tamaño small", () => {
    render(<Button size="sm">X</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-7");
  });

  it("muestra la flecha por defecto y permite ocultarla con iconRight={null}", () => {
    const { rerender } = render(<Button>X</Button>);
    expect(screen.getByTestId("button-arrow")).toBeInTheDocument();
    rerender(<Button iconRight={null}>X</Button>);
    expect(screen.queryByTestId("button-arrow")).not.toBeInTheDocument();
  });
});
