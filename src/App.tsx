import { Board } from "./components/Board";
import { Panel } from "./components/Panel";
import { useCheckers } from "./game/useCheckers";
import "./App.css";

export default function App() {
  const { state, selectable, onSquareClick, reset } = useCheckers();

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />
      <main className="app__layout">
        <Panel state={state} onReset={reset} />
        <Board
          state={state}
          selectable={selectable}
          onSquareClick={onSquareClick}
        />
      </main>
    </div>
  );
}
