import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Card = {
  id: string;
  emoji: string;
  matched: boolean;
};

const ALL_EMOJIS = [
  "🍎",
  "🍌",
  "🍇",
  "🍉",
  "🍓",
  "🍒",
  "🥝",
  "🍍",
  "🥑",
  "🥕",
  "🌽",
  "🍄",
  "🐶",
  "🐱",
  "🐼",
  "🦊",
  "🐸",
  "🐵",
  "🚗",
  "🚀",
  "✈️",
  "🚁",
  "🚲",
  "🚢",
  "⚽",
  "🏀",
  "🎾",
  "🎯",
  "🏓",
  "🥊",
  "🎸",
  "🎧",
  "🎹",
  "🥁",
  "🎺",
  "🎻",
  "⭐",
  "🌙",
  "☀️",
  "⚡",
  "🔥",
  "❄️",
];

function shuffleCards() {
  const EMOJIS = ALL_EMOJIS.slice() // copy array
    .sort(() => Math.random() - 0.5) // shuffle
    .slice(0, 6); // take first 6

  const cards = [...EMOJIS, ...EMOJIS]
    .map((emoji, index) => ({
      id: `${emoji}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      emoji,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5);

  return cards;
}

export function MatchGame({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [cards, setCards] = useState<Card[]>(() => shuffleCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  const won = useMemo(() => cards.every((card) => card.matched), [cards]);

  const resetGame = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMoves(0);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if ((event.key === "Enter" || event.key === " ") && won) {
        event.preventDefault();
        resetGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose, won]);

  useEffect(() => {
    if (flipped.length !== 2) {
      return;
    }

    const [firstIndex, secondIndex] = flipped;
    if (firstIndex === undefined || secondIndex === undefined) {
      setFlipped([]);
      return;
    }

    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];

    if (!firstCard || !secondCard) {
      setFlipped([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      if (firstCard.emoji === secondCard.emoji) {
        setCards((currentCards) =>
          currentCards.map((card, index) =>
            index === firstIndex || index === secondIndex
              ? { ...card, matched: true }
              : card,
          ),
        );
      }

      setFlipped([]);
    }, 550);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [cards, flipped]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 10000, background: "#111827" }}
    >
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-y-auto text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border-2 border-fuchsia-200 bg-slate-950 px-3 py-1 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-950"
        >
          Esc
        </button>

        <div className="flex flex-1 flex-col gap-4 p-5 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200">
                Easter Egg Unlocked
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">
                Match
              </h2>
              <p className="mt-2 text-xs text-fuchsia-100/80 md:text-sm">
                Flip cards, find pairs, and clear the board.
              </p>
            </div>

            <div className="rounded-xs border-2 border-fuchsia-300/70 bg-[#2a153c] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-100/70">
                Moves
              </p>
              <p className="mt-1 text-2xl font-bold">{moves}</p>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="grid w-full max-w-3xl grid-cols-4 gap-3 sm:grid-cols-4">
              {cards.map((card, index) => {
                const isFlipped = flipped.includes(index) || card.matched;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (isFlipped || flipped.length === 2) {
                        return;
                      }

                      setFlipped((currentFlipped) => [
                        ...currentFlipped,
                        index,
                      ]);
                      setMoves((currentMoves) => currentMoves + 1);
                    }}
                    className={[
                      "aspect-square rounded-[1.5rem] border-2 text-4xl transition-all duration-200",
                      isFlipped
                        ? "scale-[1.03] border-fuchsia-100 bg-fuchsia-300 text-slate-950 shadow-[0_0_25px_rgba(244,114,182,0.45)]"
                        : "border-fuchsia-200/30 bg-[#231235] text-transparent hover:border-fuchsia-200/60 hover:bg-[#31184b]",
                    ].join(" ")}
                  >
                    {card.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xs border-2 border-slate-700 bg-slate-950 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
            Type MATCHGG anywhere to open. Click to flip.
          </div>

          {won ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="rounded-3xl border-2 border-fuchsia-300 bg-[#2a153c] px-8 py-6 text-center shadow-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-fuchsia-200">
                  Board Cleared
                </p>
                <p className="mt-3 text-2xl font-black">Moves: {moves}</p>
                <p className="mt-2 text-xs text-fuchsia-100/80">
                  Press Enter or Space to shuffle again.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
