"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded bg-brand-violet px-4 py-2 font-body text-sm text-white transition-colors hover:bg-brand-violet-dark print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
