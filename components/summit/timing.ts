// The intro plays in order: the page text fades in, then the keyboard, then it
// types its greeting. Once the last letter lands (plus a short pause) the note
// and the cable appear (see intro-state.ts). Times are ms.
// Typing starts as the keyboard fades in (it starts fading at 250ms), counted
// from page load, so it never waits on top of a slow start.
export const TYPING_START_MS = 450;
export const PAUSE_AFTER_TYPING_MS = 350;
// The cable draws steadily from the keyboard, like a pen line (no fast start).
export const CABLE_DRAW_MS = 2200;
