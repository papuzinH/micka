import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "../FormField";

describe("FormField", () => {
  it("muestra el texto de ayuda de un campo file", () => {
    render(
      <FormField
        field={{
          name: "home_hero",
          label: "Home — hero background",
          type: "file",
          help: "The full-width photo behind your name.",
        }}
      />,
    );
    expect(
      screen.getByText("The full-width photo behind your name."),
    ).toBeInTheDocument();
  });

  it("muestra el label del campo file", () => {
    render(
      <FormField
        field={{ name: "home_hero", label: "Home — hero background", type: "file" }}
      />,
    );
    expect(screen.getByText("Home — hero background")).toBeInTheDocument();
  });
});
