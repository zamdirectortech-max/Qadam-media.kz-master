import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "QADAM MEDIA",
  description: "Create once. AI adapts. Publish everywhere.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
