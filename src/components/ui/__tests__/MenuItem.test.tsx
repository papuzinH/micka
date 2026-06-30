import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuItem } from "../MenuItem";

describe("MenuItem", () => {
  it("renderiza el label con un href localizado", () => {
    render(<MenuItem href="/portfolio" label="Portfolio" />);
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
      "href",
      "/portfolio"
    );
  });

  it("marca aria-current='page' cuando está activo", () => {
    render(<MenuItem href="/" label="Home" active />);
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("no marca aria-current cuando no está activo", () => {
    render(<MenuItem href="/about" label="About" />);
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-current");
  });
});
