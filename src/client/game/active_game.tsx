import { Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { GameStatus } from "../../api/game";
import { inject, injectState } from "../../engine/framework/execution_context";
import { PHASE } from "../../engine/game/phase";
import { PlayerHelper } from "../../engine/game/player";
import { PLAYERS } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { MOVE_STATE } from "../../engine/move/state";
import { Phase } from "../../engine/state/phase";
import { isNumber } from "../../utils/validate";
import { GameMap } from "../grid/game_map";
import { useAction, useGame, useRetryAction, useUndoAction } from "../services/game";
import { useUsers } from "../services/user";
import { InjectionContextProvider, useActiveGameState, useInject, useInjectedState } from "../utils/injection_context";
import { AvailableCities } from "./available_cities";
import { BiddingInfo } from "./bidding_info";
import { Editor } from "./editor";
import { GameLog } from "./game_log";
import { GoodsTable } from "./goods_table";
import { MapInfo } from "./map_info";
import { MapSpecificMetadata } from "./map_specific_metadata";
import { PlayerStats } from "./player_stats";
import { SelectAction } from "./select_action";
import { SwitchToActive, SwitchToUndo } from "./switch";


export function ActiveGame() {
  const game = useGame();
  return <InjectionContextProvider game={game}>
    <InternalActiveGame />
  </InjectionContextProvider>;
}

function InternalActiveGame() {
  const { canEmit } = useAction(ProductionAction);
  const game = useGame();
  const [searchParams] = useSearchParams();
  const undoOnly = searchParams.get('undoOnly') != null;

  return <div>
    <h2>{game.name}</h2>
    <GameLog gameId={game.id} />
    <Editor />
    <UndoButton />
    <SwitchToActive />
    <SwitchToUndo />
    {!undoOnly && <SelectAction />}
    {!undoOnly && canEmit && <GoodsTable />}
    {!undoOnly && <BiddingInfo />}
    <RetryButton />
    {!undoOnly && <CurrentPhase />}
    {!undoOnly && <MapSpecificMetadata />}
    {!undoOnly && <PlayerStats />}
    {!undoOnly && <GameMap />}
    {!undoOnly && !canEmit && <GoodsTable />}
    {!undoOnly && <AvailableCities />}
    <MapInfo gameKey={game.gameKey} />
  </div>;
}

export function CurrentPhase() {
  const game = useGame();
  const phase = useActiveGameState(PHASE);
  return <div>
    {game.status === GameStatus.enum.ENDED && <GameOver />}
    {game.summary && <p>{game.summary}</p>}
    {phase === Phase.MOVING && <MovingMetadata />}
  </div>;
}

export function GameOver() {
  const winnerIds = useInject(() => {
    const helper = inject(PlayerHelper);
    const players = injectState(PLAYERS);
    const scores = players().map((player) => [player.playerId, helper.getScore(player)] as const);
    const bestScore = Math.max(...scores.map(([_, score]) => score).filter(isNumber));
    return scores.filter(([_, score]) => score === bestScore).map(([id]) => id);
  }, []);
  const winners = useUsers(winnerIds);
  return <>
    <p>Game over.</p>
    <p>
      {winners.length === 0 ? 'No one wins.' :
        winners.length === 1 ? `${winners[0]?.username ?? 'Unknown'} wins!` :
          `Winners: ${winners.map((u) => u?.username ?? 'Unknown').join(', ')}`
      }
    </p>
  </>;
}

export function MovingMetadata() {
  const state = useInjectedState(MOVE_STATE);
  return <p>Move round #{state.moveRound + 1}</p>;
}

export function UndoButton() {
  const { undo, canUndo, isPending } = useUndoAction();
  if (!canUndo) {
    return <></>;
  }
  return <Button onClick={undo} disabled={isPending}>Undo</Button>;
}

export function RetryButton() {
  const { retry, canRetry, isPending } = useRetryAction();
  if (!canRetry) {
    return <></>;
  }
  return <Button onClick={retry} disabled={isPending}>Retry</Button>;
}