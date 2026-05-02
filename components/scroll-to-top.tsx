"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 500;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY >= SHOW_AFTER_PX);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={handleScrollToTop}
      data-visible={isVisible}
      className={
        "fixed bottom-5 right-5 z-40 inline-flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-black hover:text-white data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-4 data-[visible=false]:opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 md:bottom-8 md:right-8"
      }
    >
      <ArrowUp size={18} strokeWidth={2.25} />
    </button>
  );
}
