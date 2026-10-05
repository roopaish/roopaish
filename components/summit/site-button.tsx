"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { useEffect, useRef, type ButtonHTMLAttributes } from "react";
import { addMagnet } from "./magnet";

const siteButton = cva(
  "inline-flex h-12 items-center justify-center border px-7 [text-shadow:none] text-sm font-medium transition-[background-color,color,transform] duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ink: "border-foreground bg-foreground text-background hover:bg-foreground/85",
        paper:
          "border-foreground bg-background text-foreground hover:bg-muted",
        // Liquid glass pills (see .glass-button in summit.css).
        glass: "glass-button rounded-full px-8 text-foreground",
        glassDark: "glass-button glass-dark rounded-full px-8",
        // Plain text buttons: header links, and the quiet back-to-top.
        link: "h-auto border-transparent bg-transparent px-0 text-foreground",
        quiet: "h-auto border-transparent bg-transparent px-0 text-xs font-normal text-muted-foreground/70 hover:text-foreground",
        // A sewn-on shirt button (the glyph inside is drawn by the caller).
        shirt: "size-14 rounded-full border-0 bg-transparent p-0 text-foreground shadow-[0_3px_0_rgb(0_0_0/0.35),0_8px_12px_rgb(0_0_0/0.4)] transition-[rotate] duration-300 hover:rotate-[24deg]",
        // A paper cut-out arrow (the shape is drawn by the caller).
        cutout: "h-12 w-16 border-0 bg-transparent p-0 text-foreground drop-shadow-[0_3px_3px_rgb(0_0_0/0.4)] transition-[rotate,filter] duration-300 hover:drop-shadow-[0_6px_6px_rgb(0_0_0/0.45)]",
        // Filter chips: glass, and smoked glass while active.
        filter: "glass-button h-9 rounded-full px-4 text-foreground data-[active=true]:text-white",
      },
      size: {
        default: "",
        icon: "h-10 w-10 px-0",
        // Wide pills for the footer links: label left, arrow right.
        pill: "h-12 justify-between gap-8 px-6 text-[1.05rem]",
        pillSm: "h-11 justify-between gap-8 px-6 text-[1.05rem]",
      },
    },
    defaultVariants: { variant: "ink", size: "default" },
  },
);

type SiteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof siteButton> & { asChild?: boolean };

// How strongly each kind of button is pulled toward the cursor (see magnet.ts).
const PULL = { ink: 0.45, paper: 0.45, glass: 0.5, glassDark: 0.5, filter: 0.4, shirt: 0.4, cutout: 0.4, link: 0.22, quiet: 0.18 } as const;

export function SiteButton({
  className,
  variant,
  size,
  asChild,
  type,
  ...props
}: SiteButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const ref = useRef<HTMLButtonElement>(null);
  const strength = PULL[variant ?? "ink"] * (size === "icon" ? 0.8 : 1);

  useEffect(() => {
    const el = ref.current;
    return el ? addMagnet(el, strength) : undefined;
  }, [strength]);

  return (
    <Comp
      ref={ref}
      className={cn(siteButton({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}
