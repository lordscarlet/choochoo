import { GameApi } from "../../api/game";
import { PHASE } from "../../engine/game/phase";
import { ROUND, RoundEngine } from "../../engine/game/round";
import { MOVE_STATE } from "../../engine/move/state";
import { getPhaseString, Phase } from "../../engine/state/phase";
import { HexGrid } from "../grid/hex_grid";
import { useGame, useUndoAction } from "../services/game";
import { ExecutionContextProvider, useInjected, useInjectedState } from "../utils/execution_context";
import { Editor } from "./editor";
import { GameLog } from "./game_log";
import { GoodsTable } from "./goods_table";
import { PlayerStats } from "./player_stats";
import { SelectAction } from "./select_action";


interface LoadedGameProps {
  game: GameApi;
  setGame: (game: GameApi) => void;
}

export function ActiveGame() {
  const game = useGame();
  return <ExecutionContextProvider gameKey={game.gameKey} gameState={game.gameData!}>
    <InternalActiveGame />
  </ExecutionContextProvider>;
}

function InternalActiveGame() {
  const game = useGame();
  return <div>
    <h2>{game.name}</h2>
    <GameLog gameId={game.id} />
    <Editor />
    <SelectAction />
    <UndoButton />
    <CurrentPhase />
    <PlayerStats />
    <HexGrid />
    <GoodsTable />
  </div>;
}

export function CurrentPhase() {
  const round = useInjectedState(ROUND);
  const roundHelper = useInjected(RoundEngine)
  const phase = useInjectedState(PHASE);
  return <div>
    <p>Round: {round}/{roundHelper.maxRounds()}.</p>
    <p>Phase: {getPhaseString(phase)}.</p>
    {phase === Phase.MOVING && <MovingMetadata />}
  </div>;
}

export function MovingMetadata() {
  const state = useInjectedState(MOVE_STATE);
  return <p>Move round #{state.moveRound + 1}</p>;
}

export function UndoButton() {
  const { undo, canUndo } = useUndoAction();
  if (!canUndo) {
    return <></>;
  }
  return <button onClick={undo}>Undo</button>;
}