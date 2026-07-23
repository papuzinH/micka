import type { Metadata } from "next";
import { HelpContent } from "@/components/admin/HelpContent";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata: Metadata = { title: "Help — Panel Micka" };

export default function HelpPage() {
  return (
    <div className="p-8 print:bg-white print:p-0">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <HelpContent />
    </div>
  );
}
