"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { quietOthers } from "./bubbles";

export const figureSizes = { fill: "h-full w-full", sm: "h-28 w-28 lg:h-36 lg:w-36", md: "h-36 w-36 lg:h-44 lg:w-44", lg: "h-44 w-44 lg:h-52 lg:w-52" };

// Each object keeps its own little confession. It types itself out on hover and
// springs back into hiding the moment the cursor leaves. With `autoAt` (the
// canvas x, in vw, the thread must reach) or `autoOpen` (on a phone: once the
// thread has drawn down to it) it also says it once by itself as the trail
// arrives, then stays quiet until hovered. The object tilts toward
// the pointer and floats above a soft ground shadow so it reads as 3D.
export function Figure({ src, alt, label, className, delay, size = "md", still = false, hang = false, labelBelow = false, labelStyle, autoAt, autoOpen = false }: { src: string; alt: string; label?: string | undefined; className?: string; delay?: string; size?: keyof typeof figureSizes | undefined; still?: boolean; hang?: boolean; labelBelow?: boolean | undefined; labelStyle?: CSSProperties; autoAt?: number | undefined; autoOpen?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [typed, setTyped] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // On phones, objects near an edge open their bubble toward the middle of
  // the screen instead of centred, so the words never run off-screen.
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const hideTimer = useRef(0);
  // The one automatic opening: spent once it has happened or the object has
  // been hovered, so it never opens by itself again.
  const autoDone = useRef(false);
  const pointerInside = useRef(false);
  const autoTimer = useRef(0);

  const open = (el: HTMLElement) => {
    quietOthers(id.current);
    setHovered(true);
    if (window.innerWidth >= 768) return;
    const r = el.getBoundingClientRect();
    const middle = r.left + r.width / 2;
    setAlign(middle < 140 ? "left" : middle > window.innerWidth - 140 ? "right" : "center");
  };

  useEffect(() => () => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(autoTimer.current);
  }, []);

  // Only one confession at a time: opening this one closes any other.
  const id = useRef(Math.random());
  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== id.current) setHovered(false);
    };
    window.addEventListener("figure-open", close);
    return () => window.removeEventListener("figure-open", close);
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);

  // Says its line once, then closes by itself unless the pointer is on it.
  const sayOnce = () => {
    const el = rootRef.current;
    if (autoDone.current || !el) return;
    autoDone.current = true;
    open(el);
    autoTimer.current = window.setTimeout(() => {
      if (!pointerInside.current) setHovered(false);
    }, 3400);
  };

  // Desktop: the scroll loop marks this object data-shown the moment the
  // thread's tip reaches it.
  useEffect(() => {
    const el = rootRef.current;
    if (autoAt === undefined || !el) return;
    const check = () => {
      if (el.hasAttribute("data-shown")) sayOnce();
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(el, { attributes: true, attributeFilter: ["data-shown"] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAt]);

  // Phone: the thread is drawn down to ~70% of the screen, so say it once the
  // object has scrolled up that far.
  useEffect(() => {
    const el = rootRef.current;
    if (!autoOpen || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        sayOnce();
        observer.disconnect();
      },
      { rootMargin: "0px 0px -30% 0px", threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  // A tap anywhere else closes the confession.
  useEffect(() => {
    if (!hovered) return;
    const away = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !rootRef.current?.contains(e.target as Node)) setHovered(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [hovered]);

  useEffect(() => {
    if (!hovered || !label) {
      setTyped("");
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(label.slice(0, index));
      if (index >= label.length) window.clearInterval(timer);
    }, 26);
    return () => window.clearInterval(timer);
  }, [hovered, label]);

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0 [perspective:900px]", figureSizes[size], className)}
      data-at={autoAt}
      data-mode={autoAt === undefined ? undefined : "thread"}
      onPointerEnter={(e) => {
        pointerInside.current = true;
        autoDone.current = true;
        window.clearTimeout(autoTimer.current);
        if (e.pointerType !== "touch") open(e.currentTarget);
      }}
      // A tap opens the confession and keeps it up for a moment; a touch
      // "leaves" as soon as the finger lifts, so it can't rely on hover.
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        open(e.currentTarget);
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setHovered(false), 2500);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={(e) => {
        pointerInside.current = false;
        if (e.pointerType === "touch") return;
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <div aria-hidden="true" className="absolute bottom-[6%] left-1/2 h-4 w-1/2 rounded-[50%] bg-foreground/20 blur-md transition-all duration-500" style={{ transform: `translateX(-50%) scale(${hovered ? 0.8 : 1})`, opacity: hovered ? 0.6 : 1 }} />
      <div className={cn("h-full w-full", hang ? "animate-hang" : !still && "animate-float-object")} style={{ animationDelay: delay }}>
        <img
          src={src}
          alt={alt}
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ transform: `rotateY(${tilt.x * 16}deg) rotateX(${-tilt.y * 14}deg) scale(${hovered ? 1.08 : 1}) translateZ(0)`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
          className="h-full w-full select-none object-contain transition-transform duration-500"
        />
      </div>
      {label && (
        <div
          aria-hidden="true"
          style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)", ...labelStyle }}
          className={cn(
            "pointer-events-none absolute z-40 w-max max-w-[min(16rem,calc(100vw-2rem))] whitespace-pre-line",
            align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
            labelBelow ? "top-[calc(100%+4px)] rounded-[5px_18px_18px_18px]" : align === "right" ? "bottom-[calc(100%+4px)] rounded-[18px_18px_5px_18px]" : "bottom-[calc(100%+4px)] rounded-[18px_18px_18px_5px]",
            " border border-cursor-border bg-cursor px-4 py-2 text-sm text-cursor-foreground shadow-lg transition-all duration-300",
            hovered ? "translate-y-0 scale-100 opacity-100" : cn(labelBelow ? "-translate-y-3" : "translate-y-3", "scale-90 opacity-0"),
          )}
        >
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  );
}

export function SceneObject({ src, alt, label, style, delay, size, labelBelow, autoAt }: { src: string; alt: string; label?: string | undefined; style: CSSProperties; delay: string; size?: keyof typeof figureSizes; labelBelow?: boolean; autoAt?: number }) {
  return <div className="absolute" style={style}><Figure src={src} alt={alt} label={label} delay={delay} size={size} labelBelow={labelBelow} autoAt={autoAt} /></div>;
}
