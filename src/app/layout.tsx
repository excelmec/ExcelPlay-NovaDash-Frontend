import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pixeBoy = localFont({
  src: "../assets/fonts/Pixeboy.ttf",
  variable: "--font-pixeboy",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Excel Play Games",
  description: "Online gaming platform from Excel 2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixeBoy.variable} antialiased`}>{children}</body>
    </html>
  );
}
