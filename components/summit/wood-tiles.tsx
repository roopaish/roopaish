// Scrabble-style wooden tiles: one letter per square of wood.
const POINTS: Record<string, number> = { W: 4, O: 1, R: 1, K: 5, S: 1 };
const TILT = [-3, 2, -1.5, 3, -2.5, 1.5, -1];

export function WoodTiles({ word, className }: { word: string; className?: string }) {
  return (
    <p
      aria-label={word}
      className={`flex flex-wrap gap-[0.12em] text-[clamp(2.4rem,8.5vw,8rem)] ${className ?? ""}`}
    >
      {[...word.toUpperCase()].map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className="wood-tile w-[1.5em] font-story"
          style={{ rotate: `${TILT[index % TILT.length]}deg` }}
        >
          <span className="wood-letter text-[1em]">{letter}</span>
          {POINTS[letter] !== undefined && <span className="wood-points">{POINTS[letter]}</span>}
        </span>
      ))}
    </p>
  );
}
