import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const helveticaNeue = localFont({
  src: [
    {
      path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Track any stock against the market in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${helveticaNeue.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
