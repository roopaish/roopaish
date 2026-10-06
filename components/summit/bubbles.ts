// The cursor's comment bubble stays quiet until something has a reason to
// speak: a moment in the story, or hovering something that has a comment.
export type CursorComment = { id: string; text: string; fade: boolean };

// Only one bubble speaks at a time: "figure-open" tells every other bubble
// (objects, the cutout, the cursor/phone comment) to go quiet.
export const quietOthers = (id: number) =>
  window.dispatchEvent(new CustomEvent<number>("figure-open", { detail: id }));

export const say = (id: string, text: string, fade = true) => {
  quietOthers(-1);
  window.dispatchEvent(
    new CustomEvent<CursorComment>("cursor-comment", { detail: { id, text, fade } }),
  );
};
