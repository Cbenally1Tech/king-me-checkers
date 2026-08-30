import { useCallback, useState } from "react";
import {
  applyMove,
  createInitialState,
  getSelectableCoords,
  selectSquare,
} from "./engine";
import type { Coord, GameState } from "./types";

export function useCheckers() {
  const [state, setState] = useState<GameState>(createInitialState);

  const onSquareClick = useCallback((coord: Coord) => {
    setState((prev) => selectSquare(prev, coord));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  const selectable = getSelectableCoords(state);

  return {
    state,
    selectable,
    onSquareClick,
    reset,
    applyMove,
  };
}
