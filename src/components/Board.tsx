import { BOARD_SIZE, coordsEqual, isDarkSquare } from "../game/engine";
import type { Coord, GameState } from "../game/types";
import { Square } from "./Square";

type BoardProps = {
  state: GameState;
  selectable: Coord[];
  onSquareClick: (coord: Coord) => void;
};

export function Board({ state, selectable, onSquareClick }: BoardProps) {
  const rows = Array.from({ length: BOARD_SIZE }, (_, row) => row);

  return (
    <div
      className="board"
      role="grid"
      aria-label="Checkers board"
      data-turn={state.turn}
    >
      <div className="board__frame">
        <div className="board__grid">
          {rows.map((row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const coord = { row, col };
              const piece = state.board[row][col];
              const selected = coordsEqual(state.selected, coord);
              const target = state.legalTargets.some((t) =>
                coordsEqual(t, coord),
              );
              const canSelect = selectable.some((c) => coordsEqual(c, coord));
              const lastFrom = coordsEqual(state.lastMove?.from ?? null, coord);
              const lastTo = coordsEqual(state.lastMove?.to ?? null, coord);

              return (
                <Square
                  key={`${row}-${col}`}
                  row={row}
                  col={col}
                  dark={isDarkSquare(row, col)}
                  piece={piece}
                  selected={selected}
                  target={target}
                  selectable={canSelect}
                  lastFrom={lastFrom}
                  lastTo={lastTo}
                  onClick={onSquareClick}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
