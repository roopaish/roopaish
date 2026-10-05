"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { announceTyped, startTyping } from "./intro-state";
import { PAUSE_AFTER_TYPING_MS } from "./timing";

// A QWERTY layout. `indent` shifts a row right, in key widths.
const ROWS = [
  { keys: "1234567890", indent: 0.25 },
  { keys: "qwertyuiop", indent: 0.5 },
  { keys: "asdfghjkl", indent: 0.75 },
  { keys: "zxcvbnm,.", indent: 1.25 },
];

// Deterministic "random" in [0, 1), so the typing rhythm is human but repeatable.
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * A minimal QWERTY keyboard. Given a `message` it types it out once, key by
 * key, on the little display along its top edge, then rests. The cable leaves
 * from the middle of the top edge (the point `kb-port` marks). Without a
 * `message` it is just a still keyboard.
 */
export function TypingKeyboard({ className, message, startDelay = 450 }: { className?: string; message?: string; startDelay?: number }) {
  const [typed, setTyped] = useState("");
  const [down, setDown] = useState<string | null>(null);
  // Keys held on the visitor's real keyboard light up their match here.
  const [held, setHeld] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const isEditable = (target: EventTarget | null) =>
      target instanceof HTMLElement && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));
    const update = (key: string, on: boolean) =>
      setHeld((current) => {
        if (current.has(key) === on) return current;
        const next = new Set(current);
        if (on) next.add(key);
        else next.delete(key);
        return next;
      });
    const onDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
      update(event.key.toLowerCase(), true);
    };
    const onUp = (event: KeyboardEvent) => update(event.key.toLowerCase(), false);
    const release = () => setHeld(new Set());
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", release);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", release);
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(message);
      announceTyped();
      return;
    }
    setTyped("");
    startTyping();
    const timers: number[] = [];
    let index = 0;
    const step = () => {
      const letter = message[index]!.toLowerCase();
      setTyped(message.slice(0, index + 1));
      setDown(letter);
      timers.push(window.setTimeout(() => setDown(null), 55));
      index += 1;
      if (index < message.length) timers.push(window.setTimeout(step, 36 + hash(index) * 48));
      else timers.push(window.setTimeout(announceTyped, PAUSE_AFTER_TYPING_MS));
    };
    // startDelay counts from page load, so a slow start never adds to it.
    timers.push(window.setTimeout(step, Math.max(0, startDelay - performance.now())));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [message, startDelay]);

  return (
    <div aria-hidden="true" className={`kb relative ${className ?? ""}`}>
      <span className="kb-port" />
      {message !== undefined && (
        <div className="kb-screen">
          <span>
            {[...typed].map((letter, index) => (
              <span key={index} className="kb-char">
                {letter}
              </span>
            ))}
          </span>
          <span className="kb-caret" />
        </div>
      )}
      <div className="flex flex-col gap-[1.6%]">
        {ROWS.map((row) => (
          <div key={row.keys} className="kb-row" style={{ "--indent": row.indent } as CSSProperties}>
            {[...row.keys].map((letter) => (
              <span key={letter} className="kb-key" data-down={down === letter || held.has(letter)}>
                {letter}
              </span>
            ))}
          </div>
        ))}
        <div className="kb-row" style={{ "--indent": 3 } as CSSProperties}>
          <span className="kb-key kb-space" data-down={down === " " || held.has(" ")} />
        </div>
      </div>
    </div>
  );
}
