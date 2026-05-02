import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Grid = number[][];
type MoveDirection = "up" | "down" | "left" | "right";
type SpawnedTile = {
  x: number;
  y: number;
  token: number;
};
type MergedTile = {
  x: number;
  y: number;
  token: number;
};

const GRID_SIZE = 4;
const STORAGE_KEY = "tile-best-score";

function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0),
  );
}

function cloneGrid(grid: Grid) {
  return grid.map((row) => [...row]);
}

function addRandomTile(grid: Grid): {
  grid: Grid;
  spawnedTile: SpawnedTile | null;
} {
  const emptyCells: Array<{ x: number; y: number }> = [];

  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 0) {
        emptyCells.push({ x, y });
      }
    });
  });

  if (emptyCells.length === 0) {
    return { grid, spawnedTile: null };
  }

  const nextGrid = cloneGrid(grid);
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  if (!randomCell) {
    return { grid: nextGrid, spawnedTile: null };
  }

  const row = nextGrid[randomCell.y];
  if (!row) {
    return { grid: nextGrid, spawnedTile: null };
  }

  row[randomCell.x] = Math.random() < 0.9 ? 2 : 4;
  return {
    grid: nextGrid,
    spawnedTile: {
      x: randomCell.x,
      y: randomCell.y,
      token: Date.now() + Math.random(),
    },
  };
}

function createInitialGrid() {
  const firstSpawn = addRandomTile(createEmptyGrid());
  return addRandomTile(firstSpawn.grid).grid;
}

function slideLine(line: number[]) {
  const compact = line.filter((value): value is number => value !== 0);
  const nextLine: number[] = [];
  const mergedIndices: number[] = [];
  let score = 0;

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index];
    const next = compact[index + 1];

    if (current === undefined) {
      continue;
    }

    if (current !== 0 && current === next) {
      const mergedValue = current * 2;
      nextLine.push(mergedValue);
      mergedIndices.push(nextLine.length - 1);
      score += mergedValue;
      index += 1;
    } else {
      nextLine.push(current);
    }
  }

  while (nextLine.length < GRID_SIZE) {
    nextLine.push(0);
  }

  return { line: nextLine, score, mergedIndices };
}

function moveGrid(grid: Grid, direction: MoveDirection) {
  const nextGrid = createEmptyGrid();
  const mergedTiles: Array<{ x: number; y: number }> = [];
  let moved = false;
  let score = 0;

  const applyLine = (line: number[], rowIndex: number, isColumn: boolean) => {
    const workingLine =
      direction === "right" || direction === "down"
        ? [...line].reverse()
        : line;
    const {
      line: sliddenLine,
      score: gainedScore,
      mergedIndices,
    } = slideLine(workingLine);
    const restoredLine =
      direction === "right" || direction === "down"
        ? [...sliddenLine].reverse()
        : sliddenLine;

    score += gainedScore;

    mergedIndices.forEach((mergedIndex) => {
      const restoredIndex =
        direction === "right" || direction === "down"
          ? GRID_SIZE - 1 - mergedIndex
          : mergedIndex;

      mergedTiles.push(
        isColumn
          ? { x: rowIndex, y: restoredIndex }
          : { x: restoredIndex, y: rowIndex },
      );
    });

    restoredLine.forEach((value, cellIndex) => {
      if (isColumn) {
        const row = nextGrid[cellIndex];
        if (row) {
          row[rowIndex] = value;
        }
      } else {
        const row = nextGrid[rowIndex];
        if (row) {
          row[cellIndex] = value;
        }
      }

      if (value !== line[cellIndex]) {
        moved = true;
      }
    });
  };

  if (direction === "left" || direction === "right") {
    grid.forEach((row, rowIndex) => applyLine(row, rowIndex, false));
  } else {
    for (let columnIndex = 0; columnIndex < GRID_SIZE; columnIndex += 1) {
      const column = grid.map((row) => row[columnIndex] ?? 0);
      applyLine(column, columnIndex, true);
    }
  }

  return { grid: nextGrid, moved, score, mergedTiles };
}

function hasAvailableMoves(grid: Grid) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const value = grid[y]?.[x] ?? 0;

      if (
        value === 0 ||
        grid[y]?.[x + 1] === value ||
        grid[y + 1]?.[x] === value
      ) {
        return true;
      }
    }
  }

  return false;
}

function getTileStyles(value: number) {
  const styles: Record<number, string> = {
    0: "bg-[#1e293b] text-transparent border-slate-700",
    2: "bg-[#fef3c7] text-slate-950 border-amber-200",
    4: "bg-[#fde68a] text-slate-950 border-amber-300",
    8: "bg-[#fb923c] text-white border-orange-300",
    16: "bg-[#f97316] text-white border-orange-400",
    32: "bg-[#ef4444] text-white border-rose-300",
    64: "bg-[#dc2626] text-white border-rose-400",
    128: "bg-[#a855f7] text-white border-fuchsia-300",
    256: "bg-[#9333ea] text-white border-fuchsia-400",
    512: "bg-[#7c3aed] text-white border-violet-300",
    1024: "bg-[#4f46e5] text-white border-indigo-300",
    2048: "bg-[#22c55e] text-white border-lime-200",
  };

  return styles[value] ?? "bg-cyan-500 text-white border-cyan-200";
}

export function TileGame({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [grid, setGrid] = useState<Grid>(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [fallingTile, setFallingTile] = useState<SpawnedTile | null>(null);
  const [mergedTiles, setMergedTiles] = useState<MergedTile[]>([]);

  const won = useMemo(
    () => grid.some((row) => row.some((value) => value >= 2048)),
    [grid],
  );

  const resetGame = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setIsGameOver(false);
    setFallingTile(null);
    setMergedTiles([]);
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
    if (isOpen) {
      resetGame();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!fallingTile) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFallingTile((currentTile) =>
        currentTile?.token === fallingTile.token ? null : currentTile,
      );
    }, 240);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [fallingTile]);

  useEffect(() => {
    if (mergedTiles.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setMergedTiles([]);
    }, 320);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [mergedTiles]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      const directionMap: Record<string, MoveDirection | undefined> = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
      };

      const direction = directionMap[event.key.toLowerCase()];

      if (!direction) {
        if ((event.key === "Enter" || event.key === " ") && isGameOver) {
          event.preventDefault();
          resetGame();
        }
        return;
      }

      event.preventDefault();

      setGrid((currentGrid) => {
        const {
          grid: movedGrid,
          moved,
          score: gainedScore,
          mergedTiles: nextMergedTiles,
        } = moveGrid(currentGrid, direction);

        if (!moved) {
          return currentGrid;
        }

        const { grid: nextGrid, spawnedTile } = addRandomTile(movedGrid);
        setFallingTile(spawnedTile);
        setMergedTiles(
          nextMergedTiles.map((tile) => ({
            ...tile,
            token: Date.now() + Math.random(),
          })),
        );
        setScore((currentScore) => {
          const nextScore = currentScore + gainedScore;

          setBestScore((currentBest) => {
            const nextBest = Math.max(currentBest, nextScore);
            window.localStorage.setItem(STORAGE_KEY, String(nextBest));
            return nextBest;
          });

          return nextScore;
        });

        if (!hasAvailableMoves(nextGrid)) {
          setIsGameOver(true);
        }

        return nextGrid;
      });
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isGameOver, isOpen, onClose]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 10000, background: "#0f172a" }}
    >
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-y-auto text-white">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border-2 border-cyan-200 bg-slate-950 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-950"
        >
          Esc
        </button>

        <div className="flex flex-1 flex-col gap-4 p-5 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-200">
                Easter Egg Unlocked
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">
                Tile
              </h2>
              <p className="mt-2 text-xs text-cyan-100/80 md:text-sm">
                Slide tiles together and chase 2048.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left md:min-w-64">
              <div className="rounded-xs border-2 border-cyan-300/70 bg-[#132739] p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">
                  Score
                </p>
                <p className="mt-1 text-2xl font-bold">{score}</p>
              </div>
              <div className="rounded-xs border-2 border-cyan-300/70 bg-[#132739] p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/70">
                  Best
                </p>
                <p className="mt-1 text-2xl font-bold">{bestScore}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[520px]">
              <div className="grid grid-cols-4 gap-3 rounded-xl bg-[#020617] p-4">
                {grid
                  .flatMap((row) => row)
                  .map((value, index) => (
                    <div
                      key={index}
                      className={[
                        "flex aspect-square items-center justify-center rounded-xs border-2 text-xl font-black shadow-sm transition-all duration-200 sm:text-3xl",
                        getTileStyles(value),
                      ].join(" ")}
                      style={(() => {
                        const x = index % GRID_SIZE;
                        const y = Math.floor(index / GRID_SIZE);
                        const isFalling =
                          fallingTile?.x === x && fallingTile?.y === y;
                        const isMerged = mergedTiles.some(
                          (tile) => tile.x === x && tile.y === y,
                        );

                        if (!isFalling && !isMerged) {
                          return undefined;
                        }

                        return {
                          transform: isFalling
                            ? "translateY(-18px) scale(0.9)"
                            : "scale(1)",
                          opacity: isFalling ? 0 : 1,
                          animation: [
                            isFalling
                              ? "tile-drop 220ms ease-out forwards"
                              : null,
                            isMerged
                              ? "tile-merge-glow 280ms ease-out forwards"
                              : null,
                          ]
                            .filter(Boolean)
                            .join(", "),
                        };
                      })()}
                    >
                      {value === 0 ? "" : value}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-xs border-2 border-slate-700 bg-slate-950 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
            Type TILEGG anywhere to open. Arrows or WASD to slide.
          </div>

          {isGameOver || won ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="rounded-3xl border-2 border-cyan-300 bg-[#132739] px-8 py-6 text-center shadow-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
                  {won ? "2048 Reached" : "No Moves Left"}
                </p>
                <p className="mt-3 text-2xl font-black">Score: {score}</p>
                <p className="mt-2 text-xs text-cyan-100/80">
                  Press Enter or Space to start again.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <style jsx global>{`
        @keyframes tile-drop {
          0% {
            transform: translateY(-18px) scale(0.9);
            opacity: 0;
          }

          65% {
            transform: translateY(4px) scale(1.03);
            opacity: 1;
          }

          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes tile-merge-glow {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 rgba(103, 232, 249, 0);
            filter: brightness(1);
          }

          55% {
            transform: scale(1.12);
            box-shadow: 0 0 28px rgba(103, 232, 249, 0.9);
            filter: brightness(1.25);
          }

          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(103, 232, 249, 0);
            filter: brightness(1);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
}
