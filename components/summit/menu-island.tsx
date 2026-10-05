"use client";

import { ArrowUpRight } from "lucide-react";

export type MenuItem = { label: string; id?: string; href?: string };

/**
 * The phone menu, in the spirit of a dynamic island. Closed, it is a small
 * pill in the header's corner. Open, the pill springs out to the left and
 * down into a pane of liquid glass (it grows from the right edge), and the links slide
 * in one after another with a little overshoot. The same button toggles it. Closed, the button has no
 * background at all, just dark bars; the glass appears as it opens.
 */
export function MenuIsland({ open, onToggle, onGo, items, revealClass, revealStyle }: { open: boolean; onToggle: () => void; onGo: (id: string) => void; items: MenuItem[]; revealClass?: string; revealStyle?: React.CSSProperties }) {
  return (
    <div className={`island md:hidden ${revealClass ?? ""}`} style={revealStyle} data-open={open}>
      <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={onToggle} className="island-toggle">
        <span className="flex w-5 flex-col gap-[6px]">
          <span className={`block h-[2px] w-full rounded-full transition-[transform,background-color] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] bg-foreground`} style={{ transform: open ? "translateY(4px) rotate(45deg)" : "none" }} />
          <span className={`block h-[2px] w-full rounded-full transition-[transform,background-color] duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] bg-foreground`} style={{ transform: open ? "translateY(-4px) rotate(-45deg)" : "none" }} />
        </span>
      </button>
      <nav className="island-links" aria-label="Menu" aria-hidden={!open}>
        {items.map((item, index) => {
          const content = (
            <>
              <span className="flex-1 font-story text-[1.65rem] leading-none">{item.label}</span>
              {item.href && <ArrowUpRight className="h-5 w-5 text-foreground/55" />}
            </>
          );
          const common = { className: "island-link", style: { "--i": index } as React.CSSProperties, tabIndex: open ? 0 : -1 };
          return item.href ? (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" {...common}>
              {content}
            </a>
          ) : (
            <button key={item.label} type="button" onClick={() => item.id && onGo(item.id)} {...common}>
              {content}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
