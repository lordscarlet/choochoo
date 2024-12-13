import { Button } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { PHASE } from "../../engine/game/phase";
import { ROUND, RoundEngine } from "../../engine/game/round";
import { ProductionAction } from "../../engine/goods_growth/production";
import { MOVE_STATE } from "../../engine/move/state";
import { getPhaseString, Phase } from "../../engine/state/phase";
import { GameMap } from "../grid/game_map";
import { useAction, useGame, useRetryAction, useUndoAction } from "../services/game";
import { InjectionContextProvider, useInjected, useInjectedState } from "../utils/injection_context";
import { AvailableCities } from "./available_cities";
import { BiddingInfo } from "./bidding_info";
import { Editor } from "./editor";
import { GameLog } from "./game_log";
import { GoodsTable } from "./goods_table";
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
    {!undoOnly && <PlayerStats />}
    {!undoOnly && <GameMap />}
    {!undoOnly && !canEmit && <GoodsTable />}
    {!undoOnly && <AvailableCities />}
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
  const { undo, canUndo , isPending } = useUndoAction();
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