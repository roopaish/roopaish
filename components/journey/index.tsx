"use client";

import { flagColors, flagLine, track } from "@/data/journey";
import {
  cssX,
  MIN_UNIT,
  Point,
  smoothPath,
  smoothstep,
  trackSize,
  TrackSize,
} from "@/lib/thread";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { FlagLine } from "./flag-line";
import { buildGeometry, FAR_RANGE_SPEED, HERO_LAYER_SPEED } from "./geometry";
import {
  ClimbPanel,
  HeroPanel,
  HeroPeakLabel,
  StackPanel,
  SummitPanel,
} from "./panels";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const INTRO_MS = 2000;
const PLUCK_RADIUS = 100;
const FLAG_NODES = 30;
/** How far (px) each hero layer shifts with the cursor, far → near. */
const HERO_PARALLAX = [10, 22];

type Revealable = { el: HTMLElement; x: number; shown: boolean };

const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/**
 * Pinned horizontal section, told as a trek. It starts in the foothills of
 * Kathmandu with the Himalaya behind, crosses a valley where the stack is laid
 * out as a timeline, climbs a ridge (jobs are camps, side gigs are detours)
 * and ends with prayer flags on the summit that blow when you move near them.
 * Markers along the way open little chat bubbles on hover.
 */
export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const farRangeRef = useRef<SVGSVGElement>(null);
  const heroLayerRefs = useRef<(HTMLElement | SVGSVGElement | null)[][]>([
    [],
    [],
  ]);
  const routeRef = useRef<SVGPathElement>(null);
  const ridgeRef = useRef<SVGPathElement>(null);
  const hikerRef = useRef<SVGCircleElement>(null);
  const revealRectRef = useRef<SVGRectElement>(null);
  const featherRef = useRef<SVGLinearGradientElement>(null);
  const stringRef = useRef<SVGPathElement>(null);
  const flagRefs = useRef<(SVGGElement | null)[]>([]);

  const [size, setSize] = useState<TrackSize | null>(null);
  const geometry = useMemo(() => (size ? buildGeometry(size) : null), [size]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const measure = () =>
      setSize((current) => {
        const next = trackSize(section.clientWidth, section.clientHeight);
        return current && current.u === next.u && current.h === next.h
          ? current
          : next;
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const trackEl = trackRef.current;
      if (!geometry || !section || !trackEl) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const { u, h } = geometry.size;
      const distance = geometry.width - u;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${distance}`,
        pin: true,
        anticipatePin: 1,
        refreshPriority: 1,
      });
      // Sections below (the work strip) pin too and need re-measuring now
      // that this pin spacer exists.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      const { trail, revealX, ridgeStart, poles } = geometry;
      const total = trail.length;
      const points: Point[] = trail.map((p) => ({ ...p }));
      const offsetX = new Float32Array(total);
      const offsetY = new Float32Array(total);
      const velocityX = new Float32Array(total);
      const velocityY = new Float32Array(total);

      const revealables: Revealable[] = Array.from(
        section.querySelectorAll<HTMLElement>("[data-reveal-a]"),
      ).map((el) => ({
        el,
        x:
          Number(el.dataset.revealA) * u +
          Number(el.dataset.revealB) * Math.max(u, MIN_UNIT),
        shown: false,
      }));
      revealables.forEach(({ el }) => (el.dataset.shown = "false"));

      const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };
      let pointerMoved = false;
      const onPointerMove = (event: PointerEvent) => {
        if (pointer.active) {
          pointer.vx = event.clientX - pointer.x;
          pointer.vy = event.clientY - pointer.y;
        }
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
        pointerMoved = true;
      };
      const onPointerLeave = () => (pointer.active = false);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);

      const flags = new FlagLine(poles[0].top, poles[1].top, FLAG_NODES);
      const parallax = { x: 0, y: 0 };

      // Only play the intro when the page starts at the top.
      const introStart = trigger.progress > 0 ? -Infinity : performance.now();
      const heroFrontier = u * 1.02;
      let lastScrollX = Number.NaN;
      let lastFrontier = Number.NaN;
      let trailIsMoving = true;

      const tick = (time: number) => {
        const sectionRect = section.getBoundingClientRect();
        const scrollX = trigger.progress * distance;
        const scrollChanged =
          Number.isNaN(lastScrollX) || Math.abs(scrollX - lastScrollX) > 0.01;
        if (scrollChanged) {
          trackEl.style.transform = `translate3d(${-scrollX}px,0,0)`;
          lastScrollX = scrollX;
        }

        // The pinned scene is expensive to draw. Once it has settled outside
        // the viewport, keep its last frame and let the rest of the page scroll.
        const visible = sectionRect.bottom > 0 && sectionRect.top < window.innerHeight;
        const introRunning = !reduceMotion && performance.now() - introStart < INTRO_MS;
        if (!visible && !scrollChanged && !introRunning) return;

        const inSection =
          pointer.active &&
          pointer.y >= sectionRect.top &&
          pointer.y <= sectionRect.bottom;
        const screen = inSection
          ? { x: pointer.x - sectionRect.left, y: pointer.y - sectionRect.top }
          : null;
        const local = screen ? { x: screen.x + scrollX, y: screen.y } : null;

        // 1. Distant range drifts slower than the trail, fades in after the
        //    hero and sinks as you climb, so you end up above it.
        if (farRangeRef.current) {
          const sink = smoothstep((scrollX - u) / Math.max(1, distance - u));
          farRangeRef.current.style.transform = `translate3d(${-scrollX * FAR_RANGE_SPEED}px,${sink * h * 0.28}px,0)`;
          farRangeRef.current.style.opacity = String(
            smoothstep((scrollX - u * 0.35) / (u * 0.6)),
          );
        }

        // 2. Hero ranges: slower than the trail, nudged by the cursor and
        //    faded out once the trek leaves the foothills.
        const inHero = !reduceMotion && screen !== null && scrollX < u;
        parallax.x += ((inHero && screen ? screen.x / u - 0.5 : 0) - parallax.x) * 0.06;
        parallax.y += ((inHero && screen ? screen.y / h - 0.5 : 0) - parallax.y) * 0.06;
        const heroFade = 1 - smoothstep((scrollX - u * 0.3) / (u * 0.8));
        heroLayerRefs.current.forEach((els, layer) => {
          const x = -scrollX * HERO_LAYER_SPEED[layer] - parallax.x * HERO_PARALLAX[layer];
          const y = -parallax.y * HERO_PARALLAX[layer] * 0.5;
          for (const el of els) {
            if (!el) continue;
            el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            el.style.opacity = String(heroFade);
            el.style.visibility = heroFade <= 0 ? "hidden" : "visible";
          }
        });

        // 3. The trail wobbles where the cursor touches it, then settles.
        let moving = false;
        for (let i = 0; i < total && !reduceMotion && (pointerMoved || trailIsMoving); i++) {
          const px = trail[i].x + offsetX[i];
          const py = trail[i].y + offsetY[i];
          if (local && pointerMoved) {
            const dx = px - local.x;
            const dy = py - local.y;
            const dist = Math.hypot(dx, dy);
            if (dist < PLUCK_RADIUS && dist > 0.01) {
              const force = (1 - dist / PLUCK_RADIUS) * 2.2;
              velocityX[i] += (dx / dist) * force;
              velocityY[i] += (dy / dist) * force;
            }
          }
          velocityX[i] = (velocityX[i] - offsetX[i] * 0.07) * 0.86;
          velocityY[i] = (velocityY[i] - offsetY[i] * 0.07) * 0.86;
          offsetX[i] += velocityX[i];
          offsetY[i] += velocityY[i];
          moving ||= Math.abs(offsetX[i]) + Math.abs(offsetY[i]) > 0.02;
          points[i].x = trail[i].x + offsetX[i];
          points[i].y = trail[i].y + offsetY[i];
        }
        trailIsMoving = moving;
        pointerMoved = false;

        // 4. Draw up to the hiker: first the route across the map, then
        //    whatever the scroll has reached (a bit further near the end).
        const intro = reduceMotion
          ? 1
          : Math.min(1, (performance.now() - introStart) / INTRO_MS);
        const frontier =
          intro < 1
            ? trail[0].x + (heroFrontier - trail[0].x) * smoothstep(intro)
            : Math.max(
                heroFrontier,
                scrollX + u * (0.7 + trigger.progress ** 6 * 0.45),
              );
        const frontierChanged =
          Number.isNaN(lastFrontier) || Math.abs(frontier - lastFrontier) > 0.01;
        if (frontierChanged) lastFrontier = frontier;
        if (frontierChanged || moving) {
        let k = 1;
        while (k < total && revealX[k] <= frontier) k++;
        let drawn: Point[];
        let hiker: Point;
        if (k < total) {
          const f = (frontier - revealX[k - 1]) / (revealX[k] - revealX[k - 1]);
          hiker = lerpPoint(points[k - 1], points[k], Math.min(1, f));
          drawn = points.slice(0, k);
          drawn.push(hiker);
        } else {
          drawn = points;
          hiker = points[total - 1];
        }
        routeRef.current?.setAttribute(
          "d",
          smoothPath(drawn.slice(0, Math.min(drawn.length, ridgeStart + 1))),
        );
        ridgeRef.current?.setAttribute(
          "d",
          drawn.length > ridgeStart ? smoothPath(drawn.slice(ridgeStart)) : "",
        );
        hikerRef.current?.setAttribute("cx", hiker.x.toFixed(1));
        hikerRef.current?.setAttribute("cy", hiker.y.toFixed(1));
        revealRectRef.current?.setAttribute(
          "width",
          String(Math.max(0, frontier)),
        );
        featherRef.current?.setAttribute("x1", String(frontier - 160));
        featherRef.current?.setAttribute("x2", String(frontier));
        for (const item of revealables) {
          const shown = frontier >= item.x;
          if (shown !== item.shown) {
            item.shown = shown;
            item.el.dataset.shown = String(shown);
          }
        }
        }

        // 5. Prayer flags: only simulated once the summit is close.
        if (scrollX > distance - u * 1.5) {
          const wind =
            local && !reduceMotion
              ? { x: local.x, y: local.y, vx: pointer.vx, vy: pointer.vy }
              : null;
          flags.step(
            poles[0].top,
            poles[1].top,
            wind,
            reduceMotion ? 0 : time * 1000,
          );
          stringRef.current?.setAttribute("d", smoothPath(flags.nodes));
          for (let i = 1; i < FLAG_NODES - 1; i++) {
            const el = flagRefs.current[i - 1];
            if (!el) continue;
            const a = flags.nodes[i];
            const b = flags.nodes[i + 1];
            const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            el.setAttribute(
              "transform",
              `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) rotate(${angle.toFixed(1)})`,
            );
          }
        }
        pointer.vx *= 0.85;
        pointer.vy *= 0.85;
      };

      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener(
          "pointerleave",
          onPointerLeave,
        );
      };
    },
    { dependencies: [geometry], scope: sectionRef, revertOnUpdate: true },
  );

  const sectionStyle = {
    "--u": size ? `${size.u}px` : "100vw",
    "--U": size ? `${size.U}px` : `max(100vw, ${MIN_UNIT}px)`,
  } as CSSProperties;

  return (
    <section
      ref={sectionRef}
      aria-label="About me"
      className="journey relative h-svh overflow-hidden"
      style={sectionStyle}
    >
      {geometry && (
        <svg
          ref={farRangeRef}
          className="pointer-events-none absolute top-0 left-0 opacity-0"
          width={geometry.farRange.width}
          height={geometry.size.h}
          aria-hidden="true"
        >
          <path
            d={geometry.farRange.d}
            fill="currentColor"
            fillOpacity={0.02}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeLinejoin="round"
          />
        </svg>
      )}

      {geometry?.heroLayers.map((layer, index) => (
        <svg
          key={index}
          ref={(el) => {
            heroLayerRefs.current[index][0] = el;
          }}
          className="pointer-events-none absolute top-0 left-0 overflow-visible"
          width={geometry.size.u}
          height={geometry.size.h}
          aria-hidden="true"
        >
          <path
            d={layer.d}
            fill="currentColor"
            fillOpacity={index ? 0.03 : 0.018}
            stroke="currentColor"
            strokeOpacity={index ? 0.22 : 0.14}
            strokeLinejoin="round"
            className="hero-range"
            style={{ animationDelay: `${index * 180}ms` }}
          />
        </svg>
      ))}

      <div
        ref={trackRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: cssX(track.end) }}
      >
        {geometry && (
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={geometry.width}
            height={geometry.size.h}
            aria-hidden="true"
          >
            <defs>
              {/* The mountain gets darker towards the top. */}
              <linearGradient
                id="mountain-fade"
                gradientUnits="userSpaceOnUse"
                x1={0}
                x2={0}
                y1={geometry.size.h * 0.12}
                y2={geometry.size.h}
              >
                <stop offset="0" stopColor="currentColor" stopOpacity={0.035} />
                <stop offset="1" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                ref={featherRef}
                id="journey-feather-gradient"
                gradientUnits="userSpaceOnUse"
                x1={0}
                x2={0}
                y1={0}
                y2={0}
              >
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              <mask id="journey-feather">
                <rect
                  x={0}
                  y={0}
                  width={geometry.width}
                  height={geometry.size.h}
                  fill="url(#journey-feather-gradient)"
                />
              </mask>
              <clipPath id="journey-reveal">
                <rect
                  ref={revealRectRef}
                  x={0}
                  y={0}
                  width={0}
                  height={geometry.size.h}
                />
              </clipPath>
            </defs>

            {/* The ground under the trail feathers out ahead of the hiker. */}
            <path
              d={geometry.mountain}
              fill="url(#mountain-fade)"
              mask="url(#journey-feather)"
            />

            <g clipPath="url(#journey-reveal)">
              {geometry.altitudes.map((line) => (
                <g key={line.altitude}>
                  <line
                    x1={line.x1}
                    x2={line.x2}
                    y1={line.y}
                    y2={line.y}
                    stroke="currentColor"
                    strokeOpacity={0.14}
                    strokeDasharray="2 6"
                  />
                  <text
                    x={line.x1}
                    y={line.y - 6}
                    fontSize={10}
                    fill="currentColor"
                    fillOpacity={0.4}
                    className="font-mono"
                  >
                    {line.altitude.toLocaleString("en-US")} m
                  </text>
                </g>
              ))}
              <path
                d={geometry.detour}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.55}
                strokeWidth={1.4}
                strokeDasharray="6 6"
              />
              {geometry.camps.map((camp, index) => (
                <path
                  key={index}
                  d={`M${camp.x - 8},${camp.y + 1}L${camp.x},${camp.y - 12}L${camp.x + 8},${camp.y + 1}Z`}
                  fill="var(--paper)"
                  stroke="currentColor"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              ))}
              {geometry.poles.map((pole, index) => (
                <line
                  key={index}
                  x1={pole.base.x}
                  y1={pole.base.y}
                  x2={pole.top.x}
                  y2={pole.top.y}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}
              <path
                ref={stringRef}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.6}
                strokeWidth={1}
              />
              {Array.from({ length: FLAG_NODES - 2 }, (_, index) => (
                <g
                  key={index}
                  ref={(el) => {
                    flagRefs.current[index] = el;
                  }}
                >
                  <rect
                    x={1}
                    y={1}
                    width={20}
                    height={26}
                    fill={flagColors[index % flagColors.length]}
                    stroke="currentColor"
                    strokeOpacity={0.15}
                  />
                  {index % 3 === 1 && (
                    <text
                      x={11}
                      y={17}
                      textAnchor="middle"
                      fontSize={6}
                      className="font-mono"
                      fill={index % flagColors.length === 1 ? "#333" : "#fff"}
                    >
                      {
                        flagLine.words[
                          Math.floor(index / 3) % flagLine.words.length
                        ]
                      }
                    </text>
                  )}
                </g>
              ))}
            </g>

            <path
              ref={routeRef}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeDasharray="7 6"
              strokeLinecap="round"
            />
            <path
              ref={ridgeRef}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              ref={hikerRef}
              r={6}
              cx={-20}
              cy={-20}
              fill="#c43a30"
              stroke="var(--paper)"
              strokeWidth={2}
            />
          </svg>
        )}

        <HeroPanel />
        <StackPanel />
        <ClimbPanel />
        <SummitPanel />
      </div>

      {/* Peak names ride on their hero layer but sit above the track. */}
      {geometry?.heroLayers.map((layer, index) => (
        <div
          key={index}
          ref={(el) => {
            heroLayerRefs.current[index][1] = el;
          }}
          className="pointer-events-none absolute inset-0 *:pointer-events-auto"
        >
          {layer.labels.map((label) => (
            <HeroPeakLabel key={label.peak.name} {...label} />
          ))}
        </div>
      ))}

      {/* Soft fade on the right edge, where the hiker is heading. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[6vw] bg-linear-to-l from-(--paper) to-transparent" />
    </section>
  );
}
