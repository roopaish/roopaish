"use client";

import { Fragment, useEffect, useState, type CSSProperties } from "react";

// A cat chewing on a laptop, in characters. Every frame is the same
// size (50 x 17), so nothing shifts as it plays. The cat watches the build,
// leans in, chomps the lid a few times (the screen glitches), then backs off,
// tongue out, leaving tooth marks behind.
//
// `art` holds the characters and `mask` is the same grid with one letter per
// cell naming its colour (see PALETTE); keys without a colour stay plain.
const FRAMES = [
  {
    ms: 700,
    art: `                /\\             /\\
                / \\___________/ \\
                /   (o)   (o)   \\
             ---(     =^.^=     )---
             ---\\      \\_/      /---
                 \`-.___   ___.-'
          .----------------------------.
          | $ npm run build            |
          | > compiling...             |
          | > ########.... 62%         |
          |                            |
          | > warnings: 0              |
          | > errors:   0              |
          | $ _                        |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
                 fffffffffffffff
          llllllllllllllllllllllllllllll
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 450,
    art: `                /\\             /\\
                / \\___________/ \\
                /   (O)   (O)   \\
             ---(     =^.^=     )---
             ---\\      \\v/      /---
                 \`-.__VVVVVV-'
          .----------------------------.
          | $ npm run build            |
          | > compiling...             |
          | > ########.... 62%         |
          |                            |
          | > warnings: 0              |
          | > errors:   0              |
          | $ _                        |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
                 fffffffftttff
          llllllllllllllllllllllllllllll
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 330,
    art: `               *   '   .   *   '   .
                /\\             /\\
                / \\___________/ \\
                /   (>)   (<)   \\
             ===(     =^.^=     )===
             ===\\      \\_/      /===
          .(_)---\`-.VVVVVVVVV.-'----(_).
          | $ npm run bu_              |
          | > CHOMP!                   |
          | > ####%@!.... ERR          |
          |                            |
          | > warnings: ???            |
          | > errors:   !!!            |
          | $ _                        |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `             sssssssssssssssssssssss
                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
          lfffllltttttttttttttttllllfffl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 330,
    art: `              '   *   .   '   *   .
                /\\             /\\
                / \\___________/ \\
                /   (>)   (<)   \\
             ===(     =^.^=     )===
             ===\\      \\_/      /===
          .(_)---\`-.vVvVvVvVv.-'----(_).
          | $ npm run b#@%             |
          | > !?#@ segfault            |
          | > ####%@!...  ERR          |
          |                            |
          | > warnings: ???            |
          | > errors:   !!!            |
          | $ ###                      |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `             ssssssssssssssssssssssss
                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
          lfffllltttttttttttttttllllfffl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 330,
    art: `               *   '   .   *   '   .
                /\\             /\\
                / \\___________/ \\
                /   (>)   (<)   \\
             ===(     =^.^=     )===
             ===\\      \\_/      /===
          .(_)---\`-.VVVVVVVVV.-'----(_).
          | $ npm run bu_              |
          | > CHOMP!                   |
          | > ####%@!.... ERR          |
          |                            |
          | > warnings: ???            |
          | > errors:   !!!            |
          | $ _                        |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `             sssssssssssssssssssssss
                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
          lfffllltttttttttttttttllllfffl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 330,
    art: `              '   *   .   '   *   .
                /\\             /\\
                / \\___________/ \\
                /   (>)   (<)   \\
             ===(     =^.^=     )===
             ===\\      \\_/      /===
          .(_)---\`-.vVvVvVvVv.-'----(_).
          | $ npm run b#@%             |
          | > !?#@ segfault            |
          | > ####%@!...  ERR          |
          |                            |
          | > warnings: ???            |
          | > errors:   !!!            |
          | $ ###                      |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `             ssssssssssssssssssssssss
                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mmm      fwww
          lfffllltttttttttttttttllllfffl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
  {
    ms: 1000,
    art: `                /\\             /\\
                / \\___________/ \\
                /   (^)   (^)   \\
             ---(     =^.^=     )---
             ---\\      \\P/      /---
                 \`-.___   ___.-'
          .---:: ::-----:: ::---------.
          | $ npm run b#@%             |
          | > !?#@ segfault            |
          | > ####%@!...  ERR          |
          | > (the cat did it)         |
          |                            |
          | > errors:   1              |
          | $ _                        |
          '----------------------------'
       ____\\__________________________/____
      /____________________________________\\`,
    mask: `                fffffffffffffffff
                fffffffffffffffff
                ffffeee   eeeffff
             wwwf     wnnnw     fwww
             wwwf      mnm      fwww
                 fffffffffffffff
          llllxxlxxlllllxxlxxllllllllll
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          lrrrrrrrrrrrrrrrrrrrrrrrrrrrrl
          lggggggggggggggggggggggggggggl
          llllllllllllllllllllllllllllll
       llllllllllllllllllllllllllllllllllll
      llllllllllllllllllllllllllllllllllllll`,
  },
];

// Only the laptop's screen text is coloured; everything else stays plain.
const PALETTE: Record<string, CSSProperties> = {
  g: { color: "#2f9e5a" }, // screen text
  r: { color: "#d6453d" }, // screen text, errors
};

// Split each row into runs of one colour.
const FRAMES_RUNS = FRAMES.map(({ ms, art, mask }) => {
  const maskRows = mask.split("\n");
  return {
    ms,
    rows: art.split("\n").map((line, row) => {
      const colours = maskRows[row] ?? "";
      const text = line.padEnd(colours.length, " ");
      const runs: { text: string; key: string }[] = [];
      for (let i = 0; i < text.length; i += 1) {
        const key = colours[i] ?? " ";
        const last = runs[runs.length - 1];
        if (last && last.key === key) last.text += text[i];
        else runs.push({ text: text[i]!, key });
      }
      return runs;
    }),
  };
});

/** The ASCII cat-bites-laptop animation, looping. */
export function AsciiCat({ className }: { className?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let index = 0;
    let timer = 0;
    const next = () => {
      setFrame(index);
      timer = window.setTimeout(next, FRAMES_RUNS[index]!.ms);
      index = (index + 1) % FRAMES_RUNS.length;
    };
    next();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <pre role="img" aria-label="a cat chewing on a laptop" className={`font-mono text-[8px] font-semibold leading-[1.1] text-foreground sm:text-[9px] ${className ?? ""}`}>
      {FRAMES_RUNS[frame]!.rows.map((runs, row) => (
        <Fragment key={row}>
          {row > 0 && "\n"}
          {runs.map((run, i) => (PALETTE[run.key] ? <span key={i} style={PALETTE[run.key]}>{run.text}</span> : run.text))}
        </Fragment>
      ))}
    </pre>
  );
}
