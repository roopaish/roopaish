import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Point = {
  x: number;
  y: number;
};

type Direction = "up" | "down" | "left" | "right";

const BOARD_SIZE = 20;
const SPEED_MS = 125;
const STORAGE_KEY = "snake-high-score";

const DIRECTION_STEP: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function randomFood(snake: Point[]) {
  while (true) {
    const point = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };

    const isOnSnake = snake.some(
      (segment) => segment.x === point.x && segment.y === point.y,
    );

    if (!isOnSnake) {
      return point;
    }
  }
}

function createInitialSnake(): Point[] {
  const center = Math.floor(BOARD_SIZE / 2);

  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

export function SnakeGame({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [snake, setSnake] = useState<Point[]>(() => createInitialSnake());
  const [food, setFood] = useState<Point>(() =>
    randomFood(createInitialSnake()),
  );
  const [direction, setDirection] = useState<Direction>("right");
  const [nextDirection, setNextDirection] = useState<Direction>("right");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [eatPulse, setEatPulse] = useState<{
    index: number;
    maxIndex: number;
    token: number;
  } | null>(null);
  const [severedTail, setSeveredTail] = useState<{
    segments: Point[];
    hiddenCount: number;
    token: number;
    cutPoint: Point;
  } | null>(null);
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  const [boardSize, setBoardSize] = useState<number | null>(null);

  const resetGame = () => {
    const initialSnake = createInitialSnake();
    setSnake(initialSnake);
    setFood(randomFood(initialSnake));
    setDirection("right");
    setNextDirection("right");
    setScore(0);
    setIsGameOver(false);
    setEatPulse(null);
    setSeveredTail(null);
  };

  useEffect(() => {
    setIsMounted(true);
    const storedScore = window.localStorage.getItem(STORAGE_KEY);

    if (storedScore) {
      const parsedScore = Number(storedScore);

      if (!Number.isNaN(parsedScore)) {
        setBestScore(parsedScore);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    resetGame();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      const key = event.key.toLowerCase();
      const directionMap: Record<string, Direction> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      const updatedDirection = directionMap[key];

      if (updatedDirection) {
        event.preventDefault();

        setNextDirection((currentDirection) => {
          const activeDirection = currentDirection ?? direction;

          return OPPOSITE_DIRECTION[activeDirection] === updatedDirection
            ? activeDirection
            : updatedDirection;
        });
      }

      if ((event.key === "Enter" || event.key === " ") && isGameOver) {
        event.preventDefault();
        resetGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [direction, isGameOver, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || isGameOver) {
      return;
    }

    const interval = window.setInterval(() => {
      setSnake((currentSnake) => {
        const activeDirection = nextDirection;
        const head = currentSnake[0];

        if (!head) {
          return currentSnake;
        }

        const movement = DIRECTION_STEP[activeDirection];
        const nextHead = {
          x: (head.x + movement.x + BOARD_SIZE) % BOARD_SIZE,
          y: (head.y + movement.y + BOARD_SIZE) % BOARD_SIZE,
        };

        const collisionIndex = currentSnake.findIndex(
          (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
        );

        if (collisionIndex > 0) {
          const cutSegments = currentSnake.slice(collisionIndex);
          const trimmedSnake = [
            nextHead,
            ...currentSnake.slice(0, collisionIndex),
          ];
          setDirection(activeDirection);
          setEatPulse(null);
          setSeveredTail({
            segments: cutSegments,
            hiddenCount: 0,
            token: Date.now(),
            cutPoint: nextHead,
          });
          setScore(Math.max(0, trimmedSnake.length - 3));
          return trimmedSnake;
        }

        const hasEaten = nextHead.x === food.x && nextHead.y === food.y;
        const updatedSnake = hasEaten
          ? [nextHead, ...currentSnake]
          : [nextHead, ...currentSnake.slice(0, -1)];

        setDirection(activeDirection);

        if (hasEaten) {
          const updatedScore = updatedSnake.length - 3;
          setScore(updatedScore);
          setFood(randomFood(updatedSnake));
          setEatPulse({
            index: 1,
            maxIndex: updatedSnake.length - 1,
            token: Date.now(),
          });
          setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, updatedScore);
            window.localStorage.setItem(STORAGE_KEY, String(nextBest));
            return nextBest;
          });
        }

        return updatedSnake;
      });
    }, SPEED_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [food, isGameOver, isOpen, nextDirection]);

  useEffect(() => {
    if (!severedTail) {
      return;
    }

    if (severedTail.hiddenCount >= severedTail.segments.length) {
      const timeout = window.setTimeout(() => {
        setSeveredTail((currentTail) =>
          currentTail?.token === severedTail.token ? null : currentTail,
        );
      }, 90);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    const timeout = window.setTimeout(() => {
      setSeveredTail((currentTail) => {
        if (!currentTail || currentTail.token !== severedTail.token) {
          return currentTail;
        }

        return {
          ...currentTail,
          hiddenCount: currentTail.hiddenCount + 1,
        };
      });
    }, 48);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [severedTail]);

  useEffect(() => {
    if (!eatPulse) {
      return;
    }

    if (eatPulse.index >= eatPulse.maxIndex) {
      const timeout = window.setTimeout(() => {
        setEatPulse(null);
      }, 70);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    const timeout = window.setTimeout(() => {
      setEatPulse((currentPulse) => {
        if (!currentPulse || currentPulse.token !== eatPulse.token) {
          return currentPulse;
        }

        return {
          ...currentPulse,
          index: currentPulse.index + 1,
        };
      });
    }, 55);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [eatPulse]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const updateBoardSize = () => {
      const element = boardAreaRef.current;

      if (!element) {
        return;
      }

      const nextHeight = window.innerHeight - element.offsetTop - 48;
      const nextWidth = element.clientWidth;
      const nextSize = Math.max(
        220,
        Math.floor(Math.min(nextHeight, nextWidth)),
      );

      setBoardSize(nextSize);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);

    return () => {
      window.removeEventListener("resize", updateBoardSize);
    };
  }, [isOpen]);

  const cells = useMemo(() => {
    const snakeIndexMap = new Map(
      snake.map((segment, index) => [`${segment.x}:${segment.y}`, index]),
    );
    const visibleSeveredSegments =
      severedTail?.segments.slice(severedTail.hiddenCount) ?? [];
    const severedIndexMap = new Map(
      visibleSeveredSegments.map((segment, index) => [
        `${segment.x}:${segment.y}`,
        index,
      ]),
    );
    const head = snake[0];

    return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
      const x = index % BOARD_SIZE;
      const y = Math.floor(index / BOARD_SIZE);
      const key = `${x}:${y}`;
      const isHead = head?.x === x && head?.y === y;
      const isFood = food.x === x && food.y === y;
      const snakeIndex = snakeIndexMap.get(key);
      const isSnake = snakeIndex !== undefined;
      const severedIndex = severedIndexMap.get(key);
      const isSevered = severedIndex !== undefined;
      const isDigesting =
        snakeIndex !== undefined &&
        snakeIndex > 0 &&
        eatPulse?.index === snakeIndex;
      const isCutHead =
        head?.x === x &&
        head?.y === y &&
        severedTail?.cutPoint.x === x &&
        severedTail?.cutPoint.y === y;

      return {
        key,
        isFood,
        isHead,
        isSnake,
        isDigesting,
        isSevered,
        isCutHead,
      };
    });
  }, [eatPulse, food, severedTail, snake]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 10000, background: "#020617" }}
    >
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xs text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border-2 border-emerald-300 bg-slate-950 px-3 py-1 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-950"
        >
          Esc
        </button>

        <div className="flex flex-1 flex-col gap-4 p-5 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-300">
                Easter Egg Unlocked
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-emerald-50 md:text-5xl">
                Snake
              </h2>
              <p className="mt-2 max-w-2xl text-xs text-slate-200 md:text-sm">
                Wrap through walls. Self-bites cut your tail instead of ending
                the run.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left md:min-w-56">
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">
                  Score
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{score}</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200/80">
                  Best
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {bestScore}
                </p>
              </div>
            </div>
          </div>

          <div
            ref={boardAreaRef}
            className="flex min-h-0 flex-1 items-start justify-center"
          >
            <div className="relative flex w-full max-w-[720px] flex-col items-center">
              <div
                className="grid aspect-square bg-[#020617] p-3"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  width: boardSize ? `${boardSize}px` : "100%",
                  height: boardSize ? `${boardSize}px` : undefined,
                  maxWidth: "100%",
                }}
              >
                {cells.map((cell) => (
                  <div
                    key={cell.key}
                    className={[
                      "border-black/20 transition-all duration-150",
                      cell.isHead && "border-lime-100 bg-lime-300",
                      cell.isCutHead &&
                        "animate-[snake-cut-head_210ms_ease-in-out_3] border-rose-100 bg-rose-300",
                      !cell.isHead &&
                        cell.isSnake &&
                        "border-emerald-200 bg-emerald-500",
                      cell.isDigesting &&
                        "scale-[1.18] border-emerald-50 bg-emerald-300 ",
                      cell.isSevered &&
                        "animate-[snake-cut-tail_225ms_ease-in-out_infinite] border-rose-200 bg-rose-500",
                      cell.isFood &&
                        "border-amber-100 bg-amber-300 shadow-[0_0_16px_rgba(252,211,77,0.6)]",
                      !cell.isSnake &&
                        !cell.isSevered &&
                        !cell.isFood &&
                        "bg-slate-800",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  ></div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border-2 border-slate-700 bg-slate-950 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                Type SNAKE anywhere to open. Arrows or WASD to move.
              </div>

              {isGameOver ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] bg-black/75">
                  <div className="rounded-3xl border-2 border-rose-400 bg-[#1f0a0a] px-8 py-6 text-center shadow-xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200">
                      Game Over
                    </p>
                    <p className="mt-3 text-2xl font-black text-white">
                      Final score: {score}
                    </p>
                    <p className="mt-2 text-xs text-slate-200">
                      Press Enter or Space to run it back.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes snake-cut-tail {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(251, 113, 133, 0);
            filter: brightness(1);
          }

          50% {
            transform: scale(1.12);
            box-shadow: 0 0 24px rgba(251, 113, 133, 0.95);
            filter: brightness(1.2);
          }

          100% {
            transform: scale(1);
            box-shadow: 0 0 6px rgba(251, 113, 133, 0.35);
            filter: brightness(1);
          }
        }

        @keyframes snake-cut-head {
          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.14);
          }

          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
