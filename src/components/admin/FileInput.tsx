"use client";

import { useState } from "react";

/** Techo real de una subida por el panel. No lo pone PocketBase (sus campos
 *  aceptan 15 MB) sino Vercel, que corta el body de sus funciones cerca de los
 *  4,5 MB; como toda subida del admin viaja por un Server Action, un archivo
 *  más pesado se rechaza con un 413 antes de llegar al backend y la pantalla
 *  entera muere con "This page couldn't load". Se ataja acá, al elegir el
 *  archivo, que es cuando todavía se le puede explicar al usuario. */
const MAX_BYTES = 4 * 1024 * 1024;

const enMB = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/** Input de archivo con preview: muestra la imagen actual (en edición) y, al
 *  elegir una nueva, su preview en vivo. Si no se elige nada, el archivo
 *  existente se conserva (la mutación no toca el campo file vacío). */
export function FileInput({
  name,
  currentUrl,
}: {
  name: string;
  currentUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = preview ?? currentUrl ?? null;

  return (
    <div>
      <div className="flex items-center gap-4">
        {shown && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="size-20 rounded border border-brand-light-gray object-cover"
          />
        )}
        <input
          name={name}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > MAX_BYTES) {
              setError(
                `That file is ${enMB(file.size)} MB. Please keep images under 4 MB — export at around 2000-2500 px on the long edge.`,
              );
              setPreview(null);
              // Descartar la selección: así el formulario no la envía y la
              // subida no llega a romperse del lado del servidor.
              e.target.value = "";
              return;
            }
            setError(null);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="font-body text-sm text-brand-white/70 file:mr-3 file:rounded file:border-0 file:bg-brand-violet file:px-3 file:py-1.5 file:font-body file:text-sm file:text-white hover:file:bg-brand-violet-dark"
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-brand-violet">
          {error}
        </p>
      )}
    </div>
  );
}
