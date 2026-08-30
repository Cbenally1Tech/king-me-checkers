export type Player = "red" | "white";

export type Piece = {
  id: string;
  player: Player;
  king: boolean;
};

export type Coord = { row: number; col: number };

export type Move = {
  from: Coord;
  to: Coord;
  captured?: Coord;
};

export type GameStatus = "playing" | "red-wins" | "white-wins";

export type GameState = {
  board: (Piece | null)[][];
  turn: Player;
  status: GameStatus;
  selected: Coord | null;
  legalTargets: Coord[];
  mustContinue: Coord | null;
  lastMove: Move | null;
  capturedCount: Record<Player, number>;
};
