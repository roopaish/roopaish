import type Lenis from "lenis";

// Shared handle to the page's Lenis instance so components can scroll smoothly.
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function scrollToY(top: number) {
  if (instance) {
    instance.scrollTo(top, { duration: 1.4 });
    return;
  }
  window.scrollTo({ top, behavior: "smooth" });
}

export function scrollToElement(element: HTMLElement | null) {
  if (!element) return;
  scrollToY(element.getBoundingClientRect().top + window.scrollY);
}
