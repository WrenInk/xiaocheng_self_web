import type { Metadata } from "next";
import {
  Inter,
  Source_Serif_4,
  JetBrains_Mono,
  Noto_Sans_SC,
  Noto_Serif_SC,
} from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { ClaudePet } from "@/components/ClaudePet";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  weight: ["400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

// CJK sans — used as fallback after Inter for Chinese glyphs. Browser
// falls through the stack per-character, so Latin still renders in Inter.
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

// CJK serif — used as fallback after Source Serif 4 for blog body text.
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-serif-sc",
  weight: ["400", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Notes & Garden",
  description: "A personal blog and digital garden.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} ${notoSerifSC.variable}`}
    >
      <body>
        <SiteNav />
        <main className="relative z-10">{children}</main>
        <ClaudePet />
      </body>
    </html>
  );
}
