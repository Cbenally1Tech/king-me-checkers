import type { Coord, Piece as PieceType } from "../game/types";

type PieceProps = {
  piece: PieceType;
  selected: boolean;
  selectable: boolean;
};

export function Piece({ piece, selected, selectable }: PieceProps) {
  return (
    <div
      className={[
        "piece",
        `piece--${piece.player}`,
        piece.king ? "piece--king" : "",
        selected ? "piece--selected" : "",
        selectable ? "piece--selectable" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${piece.player}${piece.king ? " king" : ""} piece`}
    >
      {piece.king && <span className="piece__crown" aria-hidden="true" />}
    </div>
  );
}

type SquareProps = {
  row: number;
  col: number;
  dark: boolean;
  piece: PieceType | null;
  selected: boolean;
  target: boolean;
  selectable: boolean;
  lastFrom: boolean;
  lastTo: boolean;
  onClick: (coord: Coord) => void;
};

export function Square({
  row,
  col,
  dark,
  piece,
  selected,
  target,
  selectable,
  lastFrom,
  lastTo,
  onClick,
}: SquareProps) {
  return (
    <button
      type="button"
      className={[
        "square",
        dark ? "square--dark" : "square--light",
        selected ? "square--selected" : "",
        target ? "square--target" : "",
        lastFrom || lastTo ? "square--last" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick({ row, col })}
      aria-label={`Square ${row + 1}, ${col + 1}`}
    >
      {target && !piece && <span className="square__hint" />}
      {piece && (
        <Piece piece={piece} selected={selected} selectable={selectable} />
      )}
      {target && piece && <span className="square__capture-ring" />}
    </button>
  );
}
