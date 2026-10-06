"use client";

import { useEffect, useState } from "react";

// The intro plays in order, and the later parts wait for the greeting to be
// typed. The keyboard announces when it is done; the note and the cable listen.
const EVENT = "intro-typed";
let done = false;

export function startTyping() {
  done = false;
}

export function announceTyped() {
  done = true;
  window.dispatchEvent(new Event(EVENT));
}

/** True once the greeting has finished typing. */
export function useIntroTyped() {
  const [typed, setTyped] = useState(false);
  useEffect(() => {
    if (done) {
      setTyped(true);
      return;
    }
    const on = () => setTyped(true);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return typed;
}
