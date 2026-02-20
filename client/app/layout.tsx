import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Sales Bot | SocialManager",
  description: "Automated Social Media Sales Agent — Manage Facebook & Instagram auto-reply rules powered by AI",
  keywords: "AI sales bot, social media automation, Facebook auto reply, Instagram automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="scanline antialiased">
        {children}
      </body>
    </html>
  );
}
