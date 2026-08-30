import type { Coord, GameState, GameStatus, Move, Piece, Player } from "./types";

export const BOARD_SIZE = 8;

export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function coordsEqual(a: Coord | null, b: Coord | null): boolean {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}

function createPiece(player: Player, row: number, col: number): Piece {
  return {
    id: `${player}-${row}-${col}`,
    player,
    king: false,
  };
}

export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!isDarkSquare(row, col)) continue;
      if (row < 3) board[row][col] = createPiece("white", row, col);
      if (row > 4) board[row][col] = createPiece("red", row, col);
    }
  }

  return board;
}

export function createInitialState(): GameState {
  return {
    board: createInitialBoard(),
    turn: "red",
    status: "playing",
    selected: null,
    legalTargets: [],
    mustContinue: null,
    lastMove: null,
    capturedCount: { red: 0, white: 0 },
  };
}

function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function forwardDir(player: Player): number {
  return player === "red" ? -1 : 1;
}

function moveDirs(piece: Piece): number[] {
  return piece.king ? [-1, 1] : [forwardDir(piece.player)];
}

function getSimpleMoves(board: (Piece | null)[][], from: Coord): Move[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Move[] = [];
  for (const dRow of moveDirs(piece)) {
    for (const dCol of [-1, 1]) {
      const to = { row: from.row + dRow, col: from.col + dCol };
      if (!inBounds(to.row, to.col)) continue;
      if (!isDarkSquare(to.row, to.col)) continue;
      if (board[to.row][to.col]) continue;
      moves.push({ from, to });
    }
  }
  return moves;
}

function getCaptureMoves(board: (Piece | null)[][], from: Coord): Move[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];

  const moves: Move[] = [];
  for (const dRow of moveDirs(piece)) {
    for (const dCol of [-1, 1]) {
      const mid = { row: from.row + dRow, col: from.col + dCol };
      const to = { row: from.row + dRow * 2, col: from.col + dCol * 2 };
      if (!inBounds(to.row, to.col)) continue;
      if (!isDarkSquare(to.row, to.col)) continue;
      const jumped = board[mid.row]?.[mid.col];
      if (!jumped || jumped.player === piece.player) continue;
      if (board[to.row][to.col]) continue;
      moves.push({ from, to, captured: mid });
    }
  }
  return moves;
}

export function getAllCaptureMoves(
  board: (Piece | null)[][],
  player: Player,
  onlyFrom?: Coord | null,
): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;
      if (onlyFrom && (onlyFrom.row !== row || onlyFrom.col !== col)) continue;
      moves.push(...getCaptureMoves(board, { row, col }));
    }
  }
  return moves;
}

export function getLegalMovesForPiece(
  state: GameState,
  from: Coord,
): Move[] {
  const piece = state.board[from.row][from.col];
  if (!piece || piece.player !== state.turn) return [];
  if (state.mustContinue && !coordsEqual(state.mustContinue, from)) return [];

  const captures = getAllCaptureMoves(
    state.board,
    state.turn,
    state.mustContinue,
  );
  if (captures.length > 0) {
    return captures.filter((m) => coordsEqual(m.from, from));
  }

  if (state.mustContinue) return [];
  return getSimpleMoves(state.board, from);
}

export function getSelectableCoords(state: GameState): Coord[] {
  if (state.status !== "playing") return [];
  if (state.mustContinue) return [state.mustContinue];

  const captures = getAllCaptureMoves(state.board, state.turn);
  if (captures.length > 0) {
    const seen = new Set<string>();
    const coords: Coord[] = [];
    for (const move of captures) {
      const key = `${move.from.row},${move.from.col}`;
      if (seen.has(key)) continue;
      seen.add(key);
      coords.push(move.from);
    }
    return coords;
  }

  const coords: Coord[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = state.board[row][col];
      if (!piece || piece.player !== state.turn) continue;
      if (getSimpleMoves(state.board, { row, col }).length > 0) {
        coords.push({ row, col });
      }
    }
  }
  return coords;
}

function shouldCrown(piece: Piece, row: number): boolean {
  if (piece.king) return false;
  return piece.player === "red" ? row === 0 : row === BOARD_SIZE - 1;
}

function playerHasAnyMove(board: (Piece | null)[][], player: Player): boolean {
  if (getAllCaptureMoves(board, player).length > 0) return true;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;
      if (getSimpleMoves(board, { row, col }).length > 0) return true;
    }
  }
  return false;
}

function countPieces(board: (Piece | null)[][], player: Player): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.player === player) count++;
    }
  }
  return count;
}

export function applyMove(state: GameState, to: Coord): GameState {
  if (state.status !== "playing" || !state.selected) return state;

  const from = state.selected;
  const legal = getLegalMovesForPiece(state, from);
  const move = legal.find((m) => coordsEqual(m.to, to));
  if (!move) return state;

  const board = cloneBoard(state.board);
  const piece = board[from.row][from.col];
  if (!piece) return state;

  board[from.row][from.col] = null;
  board[to.row][to.col] = piece;

  const capturedCount = { ...state.capturedCount };
  if (move.captured) {
    const capturedPiece = board[move.captured.row][move.captured.col];
    if (capturedPiece) {
      capturedCount[capturedPiece.player]++;
    }
    board[move.captured.row][move.captured.col] = null;
  }

  const crowned = shouldCrown(piece, to.row);
  if (crowned) {
    board[to.row][to.col] = { ...piece, king: true };
  }

  // Multi-jump: only continue if this was a capture and more captures exist
  // Crowning ends the turn in American checkers when landing on king row mid-jump
  // (common house rule varies; American tournament: crowning ends turn)
  const moreJumps =
    move.captured &&
    !crowned &&
    getCaptureMoves(board, to).length > 0;

  if (moreJumps) {
    return {
      ...state,
      board,
      selected: to,
      legalTargets: getCaptureMoves(board, to).map((m) => m.to),
      mustContinue: to,
      lastMove: move,
      capturedCount,
    };
  }

  const nextTurn: Player = state.turn === "red" ? "white" : "red";
  let status: GameStatus = state.status;

  if (countPieces(board, nextTurn) === 0 || !playerHasAnyMove(board, nextTurn)) {
    status = state.turn === "red" ? "red-wins" : "white-wins";
  }

  return {
    board,
    turn: nextTurn,
    status,
    selected: null,
    legalTargets: [],
    mustContinue: null,
    lastMove: move,
    capturedCount,
  };
}

export function selectSquare(state: GameState, coord: Coord): GameState {
  if (state.status !== "playing") return state;

  // If continuing a multi-jump, only allow landing on legal targets
  if (state.mustContinue) {
    if (state.legalTargets.some((t) => coordsEqual(t, coord))) {
      return applyMove(state, coord);
    }
    return state;
  }

  // Click a legal target while a piece is selected
  if (
    state.selected &&
    state.legalTargets.some((t) => coordsEqual(t, coord))
  ) {
    return applyMove(state, coord);
  }

  const piece = state.board[coord.row][coord.col];
  const selectable = getSelectableCoords(state);

  if (piece && selectable.some((c) => coordsEqual(c, coord))) {
    const moves = getLegalMovesForPiece(state, coord);
    return {
      ...state,
      selected: coord,
      legalTargets: moves.map((m) => m.to),
    };
  }

  // Deselect if clicking elsewhere
  return {
    ...state,
    selected: null,
    legalTargets: [],
  };
}
