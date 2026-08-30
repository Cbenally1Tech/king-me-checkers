import type { GameState, Player } from "../game/types";

type PanelProps = {
  state: GameState;
  onReset: () => void;
};

function playerLabel(player: Player): string {
  return player === "red" ? "Crimson" : "Ivory";
}

export function Panel({ state, onReset }: PanelProps) {
  const statusText =
    state.status === "playing"
      ? state.mustContinue
        ? `${playerLabel(state.turn)} must keep jumping`
        : `${playerLabel(state.turn)} to move`
      : state.status === "red-wins"
        ? "Crimson wins"
        : "Ivory wins";

  return (
    <aside className="panel">
      <div className="panel__brand">
        <p className="panel__mark">King Me</p>
        <h1 className="panel__title">Checkers</h1>
        <p className="panel__tagline">
          Capture every piece. Crown on the far row. Forced jumps.
        </p>
      </div>

      <div className="panel__status" data-status={state.status}>
        <span className={`panel__dot panel__dot--${state.turn}`} />
        <p className="panel__status-text">{statusText}</p>
      </div>

      <div className="panel__scores">
        <div className="panel__score">
          <span className="panel__score-label">Crimson taken</span>
          <span className="panel__score-value">{state.capturedCount.red}</span>
        </div>
        <div className="panel__score">
          <span className="panel__score-label">Ivory taken</span>
          <span className="panel__score-value">{state.capturedCount.white}</span>
        </div>
      </div>

      <button type="button" className="panel__reset" onClick={onReset}>
        New game
      </button>
    </aside>
  );
}
