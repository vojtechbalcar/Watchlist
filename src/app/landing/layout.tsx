import localFont from "next/font/local";

// The light cut sets the landing page's lead paragraphs against its bold headings.
// Declared in this layout so only /landing preloads it.
const helveticaNeueLight = localFont({
  src: "../../fonts/Helvetica Neue/HelveticaNeueCyr-Light.woff2",
  weight: "300",
  style: "normal",
  variable: "--font-helvetica-neue-light",
  display: "swap",
});

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${helveticaNeueLight.variable} contents`}>{children}</div>;
}
