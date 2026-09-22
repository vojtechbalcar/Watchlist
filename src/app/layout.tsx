import type { Metadata } from "next";
import { helveticaNeue } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track any stock against the market in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${helveticaNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
