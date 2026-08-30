import {
  applyMove,
  createInitialState,
  getAllCaptureMoves,
  getLegalMovesForPiece,
  getSelectableCoords,
  selectSquare,
} from "./engine";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function run() {
  let state = createInitialState();
  assert(state.turn === "red", "red moves first");
  assert(state.board[5][0]?.player === "red", "red piece on row 5");
  assert(state.board[2][1]?.player === "white", "white piece on row 2");

  state = selectSquare(state, { row: 5, col: 0 });
  assert(state.selected?.row === 5 && state.selected?.col === 0, "selected");
  assert(state.legalTargets.length === 1, "one forward move");
  state = selectSquare(state, { row: 4, col: 1 });
  assert(state.turn === "white", "turn flips after move");
  assert(state.board[4][1]?.player === "red", "piece moved");
  assert(state.board[5][0] === null, "origin empty");

  state = createInitialState();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) state.board[r][c] = null;
  }
  state.board[4][1] = { id: "r", player: "red", king: false };
  state.board[3][2] = { id: "w", player: "white", king: false };
  state.turn = "red";

  const captures = getAllCaptureMoves(state.board, "red");
  assert(captures.length === 1, "one capture available");
  assert(getSelectableCoords(state).length === 1, "only capturing piece selectable");

  state = selectSquare(state, { row: 4, col: 1 });
  state = applyMove(state, { row: 2, col: 3 });
  assert(state.board[3][2] === null, "captured removed");
  assert(state.board[2][3]?.player === "red", "jumper landed");
  assert(state.capturedCount.white === 1, "white captured count");
  assert(state.turn === "white", "turn after capture");

  state = createInitialState();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) state.board[r][c] = null;
  }
  state.board[1][2] = { id: "r2", player: "red", king: false };
  state.turn = "red";
  state = selectSquare(state, { row: 1, col: 2 });
  const moves = getLegalMovesForPiece(state, { row: 1, col: 2 });
  assert(moves.some((m) => m.to.row === 0), "can move to king row");
  const crownTo = moves.find((m) => m.to.row === 0)!.to;
  state = applyMove(state, crownTo);
  assert(state.board[0][crownTo.col]?.king === true, "crowned");

  console.log("All engine checks passed.");
}

run();
