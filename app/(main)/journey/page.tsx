import Contact from "@/components/home/contact";
import SiteHeader from "@/components/home/site-header";
import TimePaletteSync from "@/components/home/time-palette-sync";
import Works from "@/components/home/works";
import Journey from "@/components/journey";

// The previous homepage (the Himalaya trek), kept for comparison.
export default function JourneyHome() {
  return (
    <div className="bg-(--paper) text-(--ink) transition-colors duration-700">
      <TimePaletteSync />
      <SiteHeader />
      <Journey />
      <Works />
      <Contact />
    </div>
  );
}
