import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mineseeker",
  description:
    "Shameless clone of Minesweeper, property of Microsoft. Made by Joaquín de la Iglesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
