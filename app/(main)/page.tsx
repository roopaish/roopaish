import TimePaletteSync from "@/components/home/time-palette-sync";
import SummitHome from "@/components/summit";
import { Tiro_Devanagari_Hindi } from "next/font/google";

const fontDeva = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-deva-face",
  display: "swap",
});

export default function Home() {
  return (
    <div className={`summit-theme ${fontDeva.variable}`}>
      <TimePaletteSync />
      <SummitHome />
    </div>
  );
}
