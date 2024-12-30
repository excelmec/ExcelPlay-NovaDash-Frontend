import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const Pixeboy = localFont({
  src: "../../public/fonts/Pixeboy.ttf",
  variable: "--font-pixeboy",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Excel Play 2024",
  description: "Online gaming platform from Excel 2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Pixeboy.variable} antialiased`}>{children}</body>
    </html>
  );
}
