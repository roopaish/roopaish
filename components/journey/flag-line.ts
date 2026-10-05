import type { Point } from "@/lib/thread";

const GRAVITY = 0.35;
const FRICTION = 0.97;
const ITERATIONS = 10;

/**
 * A verlet rope pinned at both ends (the prayer flag string). The cursor acts
 * like wind: nodes near it are pushed along the direction it's moving.
 */
export class FlagLine {
  readonly nodes: Point[];
  private prev: Point[];
  private segment: number;

  constructor(
    from: Point,
    to: Point,
    private count = 30,
    sag = 1.03,
  ) {
    this.segment =
      (Math.hypot(to.x - from.x, to.y - from.y) * sag) / (count - 1);
    this.nodes = Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
      };
    });
    this.prev = this.nodes.map((node) => ({ ...node }));
  }

  step(
    from: Point,
    to: Point,
    wind: { x: number; y: number; vx: number; vy: number } | null,
    time: number,
  ) {
    const { nodes, prev } = this;
    const last = this.count - 1;

    for (let i = 1; i < last; i++) {
      const node = nodes[i];
      let vx = (node.x - prev[i].x) * FRICTION;
      let vy = (node.y - prev[i].y) * FRICTION;
      // A gentle breeze so the flags never fully stop.
      vx += Math.sin(time * 0.0016 + i * 0.5) * 0.03;
      if (wind) {
        const dist = Math.hypot(node.x - wind.x, node.y - wind.y);
        if (dist < 140) {
          const strength = (1 - dist / 140) * 0.08;
          vx += wind.vx * strength;
          vy += wind.vy * strength;
        }
      }
      prev[i].x = node.x;
      prev[i].y = node.y;
      node.x += vx;
      node.y += vy + GRAVITY;
    }

    for (let k = 0; k < ITERATIONS; k++) {
      nodes[0].x = from.x;
      nodes[0].y = from.y;
      nodes[last].x = to.x;
      nodes[last].y = to.y;
      for (let i = 0; i < last; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - this.segment) / dist;
        const ox = dx * diff * 0.5;
        const oy = dy * diff * 0.5;
        if (i !== 0) {
          a.x += ox;
          a.y += oy;
        }
        if (i + 1 !== last) {
          b.x -= ox;
          b.y -= oy;
        }
      }
    }
  }
}
