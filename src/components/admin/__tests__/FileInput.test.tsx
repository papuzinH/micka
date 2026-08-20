import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FileInput } from "../FileInput";

/** File del tamaño pedido, sin reservar la memoria de verdad. */
function archivoDe(mb: number): File {
  const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
  Object.defineProperty(file, "size", { value: Math.round(mb * 1024 * 1024) });
  return file;
}

function elegir(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("FileInput", () => {
  it("rechaza un archivo por encima del techo de subida y dice cuánto pesa", () => {
    const { container } = render(<FileInput name="about_portrait" />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;

    elegir(input, archivoDe(6.2));

    const aviso = screen.getByRole("alert");
    expect(aviso).toHaveTextContent(/6\.2 MB/);
    expect(aviso).toHaveTextContent(/under 4 MB/i);
    // Sin preview: la selección no se tomó, así que el form no manda el archivo
    // y el Server Action nunca recibe un body que Vercel corta con un 413.
    expect(container.querySelector("img")).toBeNull();
  });

  it("acepta un archivo por debajo del techo, sin aviso", () => {
    const { container } = render(<FileInput name="about_portrait" />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;

    elegir(input, archivoDe(2));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // Y muestra el preview del archivo elegido, que es lo que obliga a que
    // `URL.createObjectURL` exista en el entorno de test (jsdom no lo trae y
    // Node dejó de exponerlo en la v24).
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("un archivo válido después de uno rechazado limpia el aviso", () => {
    const { container } = render(<FileInput name="about_portrait" />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;

    elegir(input, archivoDe(6.2));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    elegir(input, archivoDe(1.5));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
