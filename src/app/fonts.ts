import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    { path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Roman.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Helvetica Neue/HelveticaNeueCyr-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});
