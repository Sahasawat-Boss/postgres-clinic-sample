import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const font = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-thai",
});

export const metadata: Metadata = {
  title: "CareClinic — ระบบจัดการคลินิก",
  description: "ระบบจัดการคลินิก (ตัวอย่าง Next.js + PostgreSQL)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${font.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-800">{children}</body>
    </html>
  );
}
