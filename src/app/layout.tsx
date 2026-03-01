import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { config } from "@/../blinkbook.config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cssVars = {
    "--bb-primary": config.theme.primary,
    "--bb-secondary": config.theme.secondary,
    "--bb-background": config.theme.background,
    "--bb-surface": config.theme.surface,
    "--bb-border": config.theme.border,
    "--bb-text-primary": config.theme.text.primary,
    "--bb-text-secondary": config.theme.text.secondary,
    "--bb-text-muted": config.theme.text.muted,
    "--bb-gradient-from": config.logo.gradient.from,
    "--bb-gradient-to": config.logo.gradient.to,
  } as React.CSSProperties;

  return (
    <html lang="en" className="dark" style={cssVars}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
