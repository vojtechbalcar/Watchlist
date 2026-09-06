import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}<footer className="site-footer"><span>Market snapshot &nbsp; / &nbsp; Aug 25, 15:58 ET</span><span>Demo data &nbsp; · &nbsp; Prices in USD</span></footer></body>
    </html>
  );
}
