import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Cell = string | null;
type Board = Cell[][];
type Position = {
  x: number;
  y: number;
};
type PieceKey = keyof typeof PIECES;
type ActivePiece = {
  key: PieceKey;
  rotation: number[][];
  color: string;
  position: Position;
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 15;
const TICK_MS = 420;
const STORAGE_KEY = "tetris-high-score";

const PIECES = {
  I: {
    color: "#38bdf8",
    shape: [[1, 1, 1, 1]],
  },
  O: {
    color: "#facc15",
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: "#c084fc",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  L: {
    color: "#fb923c",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  J: {
    color: "#60a5fa",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  S: {
    color: "#4ade80",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  Z: {
    color: "#f87171",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
} satisfies Record<string, { color: string; shape: number[][] }>;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );
}

function rotateShape(shape: number[][]) {
  return (
    shape[0]?.map((_, columnIndex) =>
      shape.map((row) => row[columnIndex] ?? 0).reverse(),
    ) ?? shape
  );
}

function createPiece(key?: PieceKey): ActivePiece {
  const nextKey =
    key ?? (Object.keys(PIECES)[Math.floor(Math.random() * 7)] as PieceKey);
  const piece = PIECES[nextKey];

  return {
    key: nextKey,
    rotation: piece.shape,
    color: piece.color,
    position: {
      x: Math.floor((BOARD_WIDTH - piece.shape[0]!.length) / 2),
      y: 0,
    },
  };
}

function collides(
  board: Board,
  piece: ActivePiece,
  nextPosition = piece.position,
) {
  return piece.rotation.some((row, rowIndex) =>
    row.some((value, columnIndex) => {
      if (!value) {
        return false;
      }

      const x = nextPosition.x + columnIndex;
      const y = nextPosition.y + rowIndex;

      if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
        return true;
      }

      return y >= 0 && board[y]?.[x] !== null;
    }),
  );
}

function stampPiece(board: Board, piece: ActivePiece) {
  const nextBoard = board.map((row) => [...row]);

  piece.rotation.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      if (!value) {
        return;
      }

      const x = piece.position.x + columnIndex;
      const y = piece.position.y + rowIndex;

      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        const boardRow = nextBoard[y];
        if (boardRow) {
          boardRow[x] = piece.color;
        }
      }
    });
  });

  return nextBoard;
}

function clearLines(board: Board) {
  const remainingRows = board.filter((row) =>
    row.some((cell) => cell === null),
  );
  const clearedLines = BOARD_HEIGHT - remainingRows.length;

  while (remainingRows.length < BOARD_HEIGHT) {
    remainingRows.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }

  return {
    board: remainingRows,
    clearedLines,
  };
}

function getDropPosition(board: Board, piece: ActivePiece) {
  let nextY = piece.position.y;

  while (
    !collides(board, piece, {
      x: piece.position.x,
      y: nextY + 1,
    })
  ) {
    nextY += 1;
  }

  return nextY;
}

export function TetrisGame({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [activePiece, setActivePiece] = useState<ActivePiece>(() =>
    createPiece(),
  );
  const [nextPiece, setNextPiece] = useState<ActivePiece>(() => createPiece());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lineFlashRows, setLineFlashRows] = useState<number[]>([]);
  const boardAreaRef = useRef<HTMLDivElement | null>(null);
  const [boardPixelHeight, setBoardPixelHeight] = useState<number | null>(null);

  const resetGame = () => {
    const firstPiece = createPiece();
    setBoard(createEmptyBoard());
    setActivePiece(firstPiece);
    setNextPiece(createPiece());
    setScore(0);
    setLines(0);
    setIsGameOver(false);
    setLineFlashRows([]);
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
    if (!isOpen) {
      return;
    }

    const updateBoardSize = () => {
      const element = boardAreaRef.current;

      if (!element) {
        return;
      }

      const nextHeight = Math.max(
        280,
        window.innerHeight - element.offsetTop - 32,
      );
      setBoardPixelHeight(nextHeight - 30);
    };

    updateBoardSize();
    window.addEventListener("resize", updateBoardSize);

    return () => {
      window.removeEventListener("resize", updateBoardSize);
    };
  }, [isOpen]);

  const commitPiece = (pieceToCommit: ActivePiece) => {
    const stampedBoard = stampPiece(board, pieceToCommit);
    const flashingRows = stampedBoard
      .map((row, index) => (row.every(Boolean) ? index : -1))
      .filter((index) => index >= 0);

    if (flashingRows.length > 0) {
      setLineFlashRows(flashingRows);
    }

    const { board: clearedBoard, clearedLines } = clearLines(stampedBoard);
    const points = [0, 100, 300, 500, 800][clearedLines] ?? clearedLines * 250;

    setBoard(clearedBoard);
    setLines((currentLines) => currentLines + clearedLines);
    setScore((currentScore) => {
      const nextScore = currentScore + points;
      setBestScore((currentBest) => {
        const nextBest = Math.max(currentBest, nextScore);
        window.localStorage.setItem(STORAGE_KEY, String(nextBest));
        return nextBest;
      });
      return nextScore;
    });

    const upcomingPiece = {
      ...nextPiece,
      position: {
        x: Math.floor((BOARD_WIDTH - nextPiece.rotation[0]!.length) / 2),
        y: 0,
      },
    };

    if (collides(clearedBoard, upcomingPiece, upcomingPiece.position)) {
      setIsGameOver(true);
    }

    setActivePiece(upcomingPiece);
    setNextPiece(createPiece());
  };

  useEffect(() => {
    if (lineFlashRows.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLineFlashRows([]);
    }, 160);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [lineFlashRows]);

  useEffect(() => {
    if (!isOpen || isGameOver) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextPosition = {
        x: activePiece.position.x,
        y: activePiece.position.y + 1,
      };

      if (collides(board, activePiece, nextPosition)) {
        commitPiece(activePiece);
        return;
      }

      setActivePiece((currentPiece) => ({
        ...currentPiece,
        position: nextPosition,
      }));
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [activePiece, board, isGameOver, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (isGameOver) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          resetGame();
        }
        return;
      }

      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        const nextPosition = {
          x: activePiece.position.x - 1,
          y: activePiece.position.y,
        };
        if (!collides(board, activePiece, nextPosition)) {
          setActivePiece((currentPiece) => ({
            ...currentPiece,
            position: nextPosition,
          }));
        }
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        const nextPosition = {
          x: activePiece.position.x + 1,
          y: activePiece.position.y,
        };
        if (!collides(board, activePiece, nextPosition)) {
          setActivePiece((currentPiece) => ({
            ...currentPiece,
            position: nextPosition,
          }));
        }
      }

      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        event.preventDefault();
        const nextPosition = {
          x: activePiece.position.x,
          y: activePiece.position.y + 1,
        };

        if (collides(board, activePiece, nextPosition)) {
          commitPiece(activePiece);
        } else {
          setActivePiece((currentPiece) => ({
            ...currentPiece,
            position: nextPosition,
          }));
        }
      }

      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        event.preventDefault();
        const rotatedPiece = {
          ...activePiece,
          rotation: rotateShape(activePiece.rotation),
        };

        if (!collides(board, rotatedPiece, rotatedPiece.position)) {
          setActivePiece(rotatedPiece);
        }
      }

      if (event.key === " ") {
        event.preventDefault();
        const dropY = getDropPosition(board, activePiece);
        commitPiece({
          ...activePiece,
          position: {
            x: activePiece.position.x,
            y: dropY,
          },
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePiece, board, isGameOver, isOpen, onClose, nextPiece]);

  const displayBoard = useMemo(() => {
    const nextBoard = board.map((row) => [...row]);

    activePiece.rotation.forEach((row, rowIndex) => {
      row.forEach((value, columnIndex) => {
        if (!value) {
          return;
        }

        const x = activePiece.position.x + columnIndex;
        const y = activePiece.position.y + rowIndex;

        if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
          const boardRow = nextBoard[y];
          if (boardRow) {
            boardRow[x] = activePiece.color;
          }
        }
      });
    });

    return nextBoard;
  }, [activePiece, board]);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10000, background: "#0b1020" }}
      >
        <div className="relative flex h-full w-full max-w-6xl flex-col overflow-y-auto text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full border-2 border-sky-200 bg-slate-950 px-3 py-1 text-xs font-semibold text-sky-100 transition hover:bg-sky-950"
          >
            Esc
          </button>

          <div className="flex flex-1 flex-col gap-4 p-5 md:p-8 md:pb-0">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-200">
                  Easter Egg Unlocked
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">
                  Tetris
                </h2>
                <p className="mt-2 text-xs text-sky-100/80 md:text-sm">
                  Stack clean, clear lines, and keep the board alive.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-left md:min-w-80">
                <div className="rounded-xs border-2 border-sky-300/70 bg-[#13233a] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/70">
                    Score
                  </p>
                  <p className="mt-1 text-2xl font-bold">{score}</p>
                </div>
                <div className="rounded-xs border-2 border-sky-300/70 bg-[#13233a] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/70">
                    Best
                  </p>
                  <p className="mt-1 text-2xl font-bold">{bestScore}</p>
                </div>
                <div className="rounded-xs border-2 border-sky-300/70 bg-[#13233a] p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/70">
                    Lines
                  </p>
                  <p className="mt-1 text-2xl font-bold">{lines}</p>
                </div>
              </div>
            </div>

            <div
              ref={boardAreaRef}
              className="flex flex-1 items-start justify-center gap-6"
            >
              <div
                className="w-full max-w-[420px]"
                style={{
                  maxWidth: boardPixelHeight
                    ? `${(boardPixelHeight * BOARD_WIDTH) / BOARD_HEIGHT}px`
                    : undefined,
                }}
              >
                <div className="relative">
                  <div
                    className="grid grid-cols-10 gap-px bg-[#020617] p-1"
                    style={{
                      height: boardPixelHeight
                        ? `${boardPixelHeight}px`
                        : undefined,
                    }}
                  >
                    {displayBoard.flatMap((row, rowIndex) =>
                      row.map((cell, columnIndex) => (
                        <div
                          key={`${rowIndex}-${columnIndex}`}
                          className={[
                            "aspect-square transition-all duration-100",
                            cell
                              ? "shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                              : "bg-slate-800",
                            lineFlashRows.includes(rowIndex) &&
                              "animate-[tetris-line-flash_180ms_ease-out_1]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={
                            cell
                              ? {
                                  backgroundColor: cell,
                                }
                              : undefined
                          }
                        />
                      )),
                    )}
                  </div>

                  {boardPixelHeight
                    ? lineFlashRows.map((rowIndex) => (
                        <div
                          key={`line-glow-${rowIndex}`}
                          className="pointer-events-none absolute left-0 right-0 animate-[tetris-row-glow_220ms_ease-out_1]"
                          style={{
                            top: `${(boardPixelHeight / BOARD_HEIGHT) * rowIndex}px`,
                            height: `${boardPixelHeight / BOARD_HEIGHT}px`,
                            background:
                              "linear-gradient(90deg, rgba(56,189,248,0), rgba(125,211,252,0.98), rgba(56,189,248,0))",
                            boxShadow:
                              "0 0 24px rgba(125,211,252,0.95), inset 0 0 18px rgba(255,255,255,0.45)",
                          }}
                        />
                      ))
                    : null}
                </div>
              </div>

              <div className="hidden w-44 shrink-0 flex-col gap-4 md:flex">
                <div className="rounded-xs border-2 border-sky-300/70 bg-[#13233a] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/70">
                    Next
                  </p>
                  <div className="mt-3 grid gap-1">
                    {nextPiece.rotation.map((row, rowIndex) => (
                      <div
                        key={`next-row-${rowIndex}`}
                        className="grid grid-cols-4 gap-1"
                      >
                        {Array.from({ length: 4 }, (_, columnIndex) => {
                          const value = row[columnIndex] ?? 0;

                          return (
                            <div
                              key={`next-cell-${rowIndex}-${columnIndex}`}
                              className="aspect-square bg-slate-800"
                              style={
                                value
                                  ? {
                                      backgroundColor: nextPiece.color,
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xs border-2 border-slate-700 bg-slate-950 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-300">
                  Type TETRIS to open. Move with arrows or WASD. Space hard
                  drops.
                </div>
              </div>
            </div>

            {isGameOver ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="rounded-3xl border-2 border-sky-300 bg-[#13233a] px-8 py-6 text-center shadow-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-200">
                    Stack Topped Out
                  </p>
                  <p className="mt-3 text-2xl font-black">Score: {score}</p>
                  <p className="mt-2 text-xs text-sky-100/80">
                    Press Enter or Space to restart.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes tetris-line-flash {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }

          50% {
            transform: scale(1.06);
            filter: brightness(1.9);
            box-shadow: 0 0 18px rgba(125, 211, 252, 0.95);
          }

          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        @keyframes tetris-row-glow {
          0% {
            opacity: 0;
            transform: scaleX(0.2);
          }

          35% {
            opacity: 1;
            transform: scaleX(1);
          }

          100% {
            opacity: 0;
            transform: scaleX(1.03);
          }
        }
      `}</style>
    </>,
    document.body,
  );
}
