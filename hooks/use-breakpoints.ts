"use client";

import { useEffect, useState } from "react";

const MD_BREAKPOINT_QUERY = "(min-width: 768px)";

export function useBreakpoints() {
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MD_BREAKPOINT_QUERY);

    const updateMatch = () => {
      setIsMdUp(mediaQuery.matches);
    };

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);

    return () => {
      mediaQuery.removeEventListener("change", updateMatch);
    };
  }, []);

  return {
    isMdUp,
  };
}
