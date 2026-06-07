import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevHub",
  description: "A staged backend practice platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
