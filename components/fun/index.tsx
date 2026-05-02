"use client";

import { useEffect, useRef, useState } from "react";
import { MatchGame } from "./match-easter-egg";
import { SnakeGame } from "./snake-easter-egg";
import { TetrisGame } from "./tetris-easter-egg";
import { TileGame } from "./tile-easter-egg";

type GameId = "snake" | "match" | "tile" | "tetris";

const SEQUENCES: Array<{ gameId: GameId; sequence: string }> = [
  { gameId: "snake", sequence: "SNAKE" },
  { gameId: "match", sequence: "MATCH" },
  { gameId: "tile", sequence: "TILE" },
  { gameId: "tetris", sequence: "TETRIS" },
];

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName;

  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

export default function EasterEggs() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const sequenceRef = useRef("");

  useEffect(() => {
    const maxSequenceLength = Math.max(
      ...SEQUENCES.map(({ sequence }) => sequence.length),
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (activeGame) {
        return;
      }

      if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey) {
        return;
      }

      if (event.key.length !== 1 || !/[a-z]/i.test(event.key)) {
        return;
      }

      sequenceRef.current =
        `${sequenceRef.current}${event.key.toUpperCase()}`.slice(
          -maxSequenceLength,
        );

      for (const { gameId, sequence } of SEQUENCES) {
        if (sequenceRef.current.endsWith(sequence)) {
          sequenceRef.current = "";
          setActiveGame(gameId);
          break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeGame]);

  return (
    <>
      <SnakeGame
        isOpen={activeGame === "snake"}
        onClose={() => setActiveGame(null)}
      />
      <MatchGame
        isOpen={activeGame === "match"}
        onClose={() => setActiveGame(null)}
      />
      <TileGame
        isOpen={activeGame === "tile"}
        onClose={() => setActiveGame(null)}
      />
      <TetrisGame
        isOpen={activeGame === "tetris"}
        onClose={() => setActiveGame(null)}
      />
    </>
  );
}
