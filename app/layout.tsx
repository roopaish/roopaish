import BreakpointsChecker from "@/components/breakpoints-checker";
import ContactFormModal from "@/components/contact-form-modal";
import EasterEggs from "@/components/fun";
import SmoothScroll from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Ephesis, Inter, Manrope } from "next/font/google";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontManrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fontPlayful = Ephesis({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-playful",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rupesh Budhathoki | Full Stack Developer",
  description:
    "Minimal portfolio for a full stack developer with 5+ years of experience building modern web products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("scroll-smooth")}>
      <body
        className={`
          ${fontInter.variable}
          ${fontInter.className}
          ${fontManrope.variable}
          ${fontPlayful.variable}
          antialiased`}
      >
        <SmoothScroll />
        {/*<ScrollToTop />*/}
        {/* <Header /> */}
        <main className="min-h-svh bg-white">{children}</main>
        {/*<Footer />*/}
        <EasterEggs />
        <BreakpointsChecker enabled={process.env.NODE_ENV === "development"} />
        <ContactFormModal />
      </body>
    </html>
  );
}
