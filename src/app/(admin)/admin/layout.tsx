import { Syne, Inter } from "next/font/google";
import "../../globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="bg-brand-black text-brand-white font-body">
        {children}
      </body>
    </html>
  );
}
