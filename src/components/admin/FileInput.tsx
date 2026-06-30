"use client";

import { useState } from "react";

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
  const shown = preview ?? currentUrl ?? null;

  return (
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
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
        className="font-body text-sm text-brand-white/70 file:mr-3 file:rounded file:border-0 file:bg-brand-violet file:px-3 file:py-1.5 file:font-body file:text-sm file:text-white hover:file:bg-brand-violet-dark"
      />
    </div>
  );
}
