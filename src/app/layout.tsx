import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "music-portfolio",
  description: "音楽名義とソフトウェア開発のポートフォリオ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
