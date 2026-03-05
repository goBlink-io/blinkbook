import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { config } from "@/../blinkbook.config";
import { themes } from "@/config/themes";
import type { ThemeName } from "@/config/themes";
import { Providers } from "@/components/providers";
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

function resolveTheme() {
  if (typeof config.theme === "string") {
    return themes[config.theme as ThemeName] ?? themes.midnight;
  }
  return config.theme;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = resolveTheme();
  const cssVars = {
    "--bb-primary": theme.primary,
    "--bb-secondary": theme.secondary,
    "--bb-background": theme.background,
    "--bb-surface": theme.surface,
    "--bb-border": theme.border,
    "--bb-text-primary": theme.text.primary,
    "--bb-text-secondary": theme.text.secondary,
    "--bb-text-muted": theme.text.muted,
    "--bb-gradient-from": config.logo.gradient.from,
    "--bb-gradient-to": config.logo.gradient.to,
  } as React.CSSProperties;

  return (
    <html lang="en" className="dark" style={cssVars}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
