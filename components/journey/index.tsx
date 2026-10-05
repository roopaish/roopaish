"use client";

import { flagColors, flagLine } from "@/data/journey";
import {
  closedSmoothPath,
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
import { altitudeAt, buildGeometry, FAR_RANGE_SPEED } from "./geometry";
import {
  ClimbPanel,
  Gear,
  HeroPanel,
  PackingPanel,
  PeakLabels,
  SummitPanel,
} from "./panels";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const INTRO_MS = 2000;
const PLUCK_RADIUS = 100;
const BULGE_RADIUS = 160;
const GPS_POINTS = 70;
const FLAG_NODES = 30;

type Revealable = { el: HTMLElement; x: number; shown: boolean };
type Drifter = { el: HTMLElement; drift: number };

const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/**
 * Pinned horizontal section, told as a trek. It starts on a topographic map
 * of the hills around Kathmandu that bends under your cursor, the route
 * becomes the ridge of the climb (jobs are camps, side gigs are detours) and
 * it ends with prayer flags on the summit that blow when you move near them.
 */
export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const farRangeRef = useRef<SVGSVGElement>(null);
  const topoRef = useRef<SVGGElement>(null);
  const peakLabelsRef = useRef<HTMLDivElement>(null);
  const contourRefs = useRef<(SVGPathElement | null)[]>([]);
  const gpsRef = useRef<SVGPathElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
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
      });

      const { trail, revealX, ridgeStart, peaks, poles } = geometry;
      const total = trail.length;
      const points: Point[] = trail.map((p) => ({ ...p }));
      const offsetX = new Float32Array(total);
      const offsetY = new Float32Array(total);
      const velocityX = new Float32Array(total);
      const velocityY = new Float32Array(total);

      const contours = peaks.flatMap((peak) => peak.contours);
      const ringOf = peaks.flatMap((peak) =>
        peak.contours.map((_, ring) => ring),
      );
      const bent = contours.map((contour) =>
        contour.base.map((p) => ({ ...p })),
      );

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

      const drifters: Drifter[] = Array.from(
        section.querySelectorAll<HTMLElement>("[data-drift]"),
      ).map((el) => ({ el, drift: Number(el.dataset.drift) }));

      const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false };
      const onPointerMove = (event: PointerEvent) => {
        if (pointer.active) {
          pointer.vx = event.clientX - pointer.x;
          pointer.vy = event.clientY - pointer.y;
        }
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      };
      const onPointerLeave = () => (pointer.active = false);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);

      const flags = new FlagLine(poles[0].top, poles[1].top, FLAG_NODES);
      const gps: Point[] = [];
      let idleFrames = 0;
      const bulge = { x: u / 2, y: h / 2, strength: 0 };
      let topoState = "";

      // Only play the intro when the page starts at the top.
      const introStart = trigger.progress > 0 ? -Infinity : performance.now();
      const heroFrontier = u * 1.02;

      const tick = (time: number) => {
        const sectionRect = section.getBoundingClientRect();
        const scrollX = trigger.progress * distance;
        trackEl.style.transform = `translate3d(${-scrollX}px,0,0)`;

        const inSection =
          pointer.active &&
          pointer.y >= sectionRect.top &&
          pointer.y <= sectionRect.bottom;
        const screen = inSection
          ? { x: pointer.x - sectionRect.left, y: pointer.y - sectionRect.top }
          : null;
        const local = screen ? { x: screen.x + scrollX, y: screen.y } : null;

        // Distant range drifts slower than the trail and fades in after the map.
        if (farRangeRef.current) {
          farRangeRef.current.style.transform = `translate3d(${-scrollX * FAR_RANGE_SPEED}px,0,0)`;
          farRangeRef.current.style.opacity = String(
            smoothstep((scrollX - u * 0.35) / (u * 0.6)),
          );
        }

        // 1. Topographic map: the terrain swells under the cursor and the
        //    contour layers lift away as the trek starts.
        const lift = smoothstep(scrollX / (u * 0.8));
        if (lift < 1) {
          const onMap = !reduceMotion && local !== null && local.x < u;
          if (local) {
            bulge.x += (local.x - bulge.x) * 0.16;
            bulge.y += (local.y - bulge.y) * 0.16;
          }
          bulge.strength += ((onMap ? 1 : 0) - bulge.strength) * 0.08;

          const state = `${bulge.x | 0},${bulge.y | 0},${bulge.strength.toFixed(3)},${lift.toFixed(3)}`;
          if (state !== topoState) {
            topoState = state;
            const sigma2 = 2 * (BULGE_RADIUS * 0.55) ** 2;
            contours.forEach((contour, c) => {
              const ring = bent[c];
              for (let i = 0; i < contour.base.length; i++) {
                const p = contour.base[i];
                const dx = p.x - bulge.x;
                const dy = p.y - bulge.y;
                const d2 = dx * dx + dy * dy;
                const d = Math.sqrt(d2) || 1;
                const push =
                  bulge.strength * BULGE_RADIUS * 0.42 * Math.exp(-d2 / sigma2);
                ring[i].x = p.x + (dx / d) * push;
                ring[i].y = p.y + (dy / d) * push - lift * ringOf[c] * 7;
              }
              contourRefs.current[c]?.setAttribute("d", closedSmoothPath(ring));
            });
          }
        }
        if (topoRef.current) topoRef.current.style.opacity = String(1 - lift);
        if (peakLabelsRef.current) {
          peakLabelsRef.current.style.opacity = String(1 - lift);
          peakLabelsRef.current.style.transform = `translate3d(0,${-lift * 60}px,0)`;
        }

        // 2. GPS track + live coordinates behind the cursor while on the map.
        const showReadout =
          !reduceMotion && local !== null && scrollX < u * 0.5 && local.x < u;
        if (showReadout && local) {
          const last = gps[gps.length - 1];
          if (!last || Math.hypot(local.x - last.x, local.y - last.y) > 4) {
            gps.push({ x: local.x, y: local.y });
            if (gps.length > GPS_POINTS) gps.shift();
            idleFrames = 0;
          } else {
            idleFrames++;
          }
        } else {
          idleFrames++;
        }
        if (idleFrames > 10 && gps.length) gps.shift();
        gpsRef.current?.setAttribute(
          "d",
          gps.length > 1 ? smoothPath(gps) : "",
        );

        const readout = readoutRef.current;
        if (readout) {
          readout.style.opacity = showReadout ? "1" : "0";
          if (showReadout && screen && local) {
            readout.style.transform = `translate3d(${screen.x + 18}px,${screen.y + 18}px,0)`;
            const lat = 27.8 - (local.y / h) * 0.18;
            const lon = 85.2 + (local.x / u) * 0.25;
            const altitude = altitudeAt(local, peaks);
            readout.textContent = `${lat.toFixed(4)}° N  ${lon.toFixed(4)}° E  ·  ${altitude.toLocaleString("en-US")} m`;
          }
        }

        // 3. The trail wobbles where the cursor touches it, then settles.
        for (let i = 0; i < total; i++) {
          if (reduceMotion) break;
          const px = trail[i].x + offsetX[i];
          const py = trail[i].y + offsetY[i];
          if (local) {
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
          points[i].x = trail[i].x + offsetX[i];
          points[i].y = trail[i].y + offsetY[i];
        }

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

        // 6. Gear drifts at its own pace for a bit of depth.
        const parallaxX = screen ? screen.x / u - 0.5 : 0;
        const parallaxY = screen ? screen.y / h - 0.5 : 0;
        for (const { el, drift } of drifters) {
          el.style.transform = `translate3d(${(scrollX * drift + parallaxX * drift * 120).toFixed(1)}px,${(parallaxY * drift * 80).toFixed(1)}px,0)`;
        }
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

  let contourIndex = 0;

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
            fillOpacity={0.035}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeLinejoin="round"
          />
        </svg>
      )}

      <div
        ref={trackRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: "calc(var(--u) * 2 + var(--U) * 2.8)" }}
      >
        {geometry && (
          <svg
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={geometry.width}
            height={geometry.size.h}
            aria-hidden="true"
          >
            <defs>
              {/* Fade the mountain in from the valley instead of a hard edge. */}
              <linearGradient
                id="ridge-fade"
                gradientUnits="userSpaceOnUse"
                x1={geometry.ridgeFill.startX}
                x2={geometry.ridgeFill.startX + geometry.size.u * 0.3}
                y1={0}
                y2={0}
              >
                <stop offset="0" stopColor="currentColor" stopOpacity={0} />
                <stop offset="1" stopColor="currentColor" stopOpacity={0.05} />
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

            <g ref={topoRef}>
              {geometry.peaks.map((peak) =>
                peak.contours.map((contour, ring) => {
                  const index = contourIndex++;
                  return (
                    <path
                      key={`${peak.name}-${ring}`}
                      ref={(el) => {
                        contourRefs.current[index] = el;
                      }}
                      d={closedSmoothPath(contour.base)}
                      fill="none"
                      stroke="currentColor"
                      strokeOpacity={contour.index ? 0.32 : 0.14}
                      strokeWidth={contour.index ? 1.2 : 1}
                      className="topo-contour"
                      style={{
                        animationDelay: `${(peak.contours.length - ring) * 70}ms`,
                      }}
                    />
                  );
                }),
              )}
            </g>

            <path
              ref={gpsRef}
              fill="none"
              stroke="#c43a30"
              strokeOpacity={0.7}
              strokeWidth={1.4}
              strokeDasharray="2 5"
              strokeLinecap="round"
            />

            {/* The mountain body feathers out ahead of the hiker. */}
            <path
              d={geometry.ridgeFill.d}
              fill="url(#ridge-fade)"
              mask="url(#journey-feather)"
            />

            <g clipPath="url(#journey-reveal)">

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

        {geometry && (
          <div ref={peakLabelsRef} className="absolute inset-0">
            <PeakLabels
              peaks={geometry.peaks.map((peak) => ({
                name: peak.name,
                altitude: peak.altitude,
                x: peak.center.x,
                y: peak.center.y,
              }))}
            />
          </div>
        )}

        <HeroPanel />
        <Gear />
        <PackingPanel />
        <ClimbPanel />
        <SummitPanel />
      </div>

      {/* Live coordinates that follow the cursor on the map. */}
      <div
        ref={readoutRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-sm bg-(--ink) px-2 py-1 font-mono text-[10px] whitespace-pre text-(--paper) opacity-0 transition-opacity duration-200"
      />

      {/* Soft fade on the right edge, where the hiker is heading. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[6vw] bg-linear-to-l from-(--paper) to-transparent" />
    </section>
  );
}
