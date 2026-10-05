"use client";

import { Fragment, type CSSProperties } from "react";
import { useIntroTyped } from "./intro-state";

const LETTER_STEP_MS = 30;

// The hand-drawn arrow, then its head, each drawn along its own stroke.
const ARROW = "M38 4 C24 6 12 14 4 24";
const HEAD = "M4 24 L13 22 M4 24 L7 15";

/**
 * The note beside the keyboard. It arrives together with the cable, once the
 * keyboard has finished typing: the arrow draws itself along its stroke (head
 * last) and the words fade in letter by letter, left to right.
 */
export function IntroNote({ text, arrowClassName }: { text: string; arrowClassName: string }) {
  const typed = useIntroTyped();
  let count = 0;
  const draw = (delay: number, duration: number): CSSProperties => ({
    strokeDashoffset: 1,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
  });
  const drawClass = typed ? "animate-draw-string" : undefined;
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 40 30" className={arrowClassName}>
        <path className={drawClass} style={draw(0, 650)} pathLength="1" strokeDasharray="1" d={ARROW} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path className={drawClass} style={draw(600, 250)} pathLength="1" strokeDasharray="1" d={HEAD} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>
        {text.split(" ").map((word, wordIndex) => (
          <Fragment key={wordIndex}>
            {wordIndex > 0 && " "}
            <span className="inline-block whitespace-nowrap">
              {[...word].map((letter) => (
                <span key={count} className={typed ? "kb-char" : "inline-block opacity-0"} style={{ animationDelay: `${count++ * LETTER_STEP_MS}ms` }}>
                  {letter}
                </span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
