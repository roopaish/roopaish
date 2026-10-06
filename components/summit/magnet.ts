// Magnetic buttons: a little gravity toward the cursor.
//
// One shared loop serves every registered button. When the cursor is inside a
// button it is pulled toward it on a spring (it overshoots and wobbles a bit
// as it settles). Getting away is deliberately harder than getting there: the
// button keeps its grip until the cursor is LEAVE px outside it.

type Magnet = { el: HTMLElement; strength: number; x: number; y: number; vx: number; vy: number; engaged: boolean };

// The cursor must be inside the button to catch it, but it keeps its grip until
// the cursor is LEAVE px outside, so slipping away takes a deliberate pull.
const LEAVE = 44;
/** Furthest a button is pulled from where it rests, in px (before strength). */
const MAX_PULL = 16;
/** A touch of lift while held, so it feels picked up. */
const LIFT = 2;
const STIFFNESS = 0.2;
const DAMPING = 0.76;

const magnets = new Set<Magnet>();
const pointer = { x: -9999, y: -9999, active: false };
let frame = 0;
let last = 0;
let listening = false;

function onMove(event: PointerEvent) {
  if (event.pointerType === "touch") return;
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  wake();
}

function onLeavePage() {
  pointer.active = false;
  wake();
}

function wake() {
  if (!frame) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

function tick(now: number) {
  const dt = last ? Math.min(now - last, 40) / 16.7 : 1;
  last = now;
  let moving = false;

  for (const m of magnets) {
    const rect = m.el.getBoundingClientRect();
    if (rect.width === 0) continue;
    // Where the button rests: its box minus the pull we are applying.
    const cx = rect.left + rect.width / 2 - m.x;
    const cy = rect.top + rect.height / 2 - m.y;
    const gapX = Math.max(Math.abs(pointer.x - cx) - rect.width / 2, 0);
    const gapY = Math.max(Math.abs(pointer.y - cy) - rect.height / 2, 0);
    const dist = pointer.active ? Math.hypot(gapX, gapY) : Infinity;
    m.engaged = m.engaged ? dist <= LEAVE : dist === 0;

    let tx = 0;
    let ty = 0;
    if (m.engaged) {
      const closeness = 1 - Math.min(dist, LEAVE) / LEAVE;
      const pull = 0.3 + 0.35 * closeness;
      const dx = (pointer.x - cx) * pull;
      const dy = (pointer.y - cy) * pull;
      const length = Math.hypot(dx, dy) || 1;
      const reach = Math.min(length, MAX_PULL * m.strength);
      tx = (dx / length) * reach;
      ty = (dy / length) * reach - LIFT * m.strength;
    }

    m.vx = (m.vx + (tx - m.x) * STIFFNESS * dt) * Math.pow(DAMPING, dt);
    m.vy = (m.vy + (ty - m.y) * STIFFNESS * dt) * Math.pow(DAMPING, dt);
    m.x += m.vx * dt;
    m.y += m.vy * dt;

    const alive = m.engaged || Math.abs(m.x) + Math.abs(m.y) + Math.abs(m.vx) + Math.abs(m.vy) > 0.06;
    if (alive) {
      m.el.style.translate = `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`;
      moving = true;
    } else if (m.x !== 0 || m.y !== 0) {
      m.x = m.y = m.vx = m.vy = 0;
      m.el.style.translate = "";
    }
  }

  frame = moving ? requestAnimationFrame(tick) : 0;
}

/** Make `el` magnetic. `strength` scales how far it is pulled (about 0.2 to 0.5). */
export function addMagnet(el: HTMLElement, strength: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const magnet: Magnet = { el, strength, x: 0, y: 0, vx: 0, vy: 0, engaged: false };
  magnets.add(magnet);
  if (!listening) {
    listening = true;
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeavePage);
  }
  return () => {
    magnets.delete(magnet);
    el.style.translate = "";
    if (magnets.size === 0 && listening) {
      listening = false;
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeavePage);
    }
  };
}
