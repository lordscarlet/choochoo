import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ActionApi, GameApi } from "../../api/game";
import { MyUserApi, UserApi } from "../../api/user";
import { useUsers } from "../root/user_cache";
import { Engine } from "../../engine/framework/engine";
import { Grid } from "../../engine/map/grid";
import { inject, injectState } from "../../engine/framework/execution_context";
import { HexGrid } from "./hex_grid";
import { useInjected, useInjectedState } from "../utils/execution_context";
import { CURRENT_PLAYER, currentPlayer, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { PlayerColor, PlayerData } from "../../engine/state/player";
import { gameClient } from "../services/game";
import { assert, assertNever } from "../../utils/validate";
import { SelectAction } from "./select_action";
import { GameContext, GameData } from "../services/context";
import { ActionConstructor, PHASE } from "../../engine/game/phase";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ExecutionContextProvider } from "../utils/execution_context";
import { getPhaseString } from "../../engine/state/phase";
import { PlayerStats } from "./player_stats";
import { ROUND, RoundEngine } from "../../engine/game/round";


interface LoadedGameProps {
  game: GameApi;
  user: MyUserApi;
  setGame: (game: GameApi) => void;
  setUser: (user: MyUserApi) => void;
}

export function ActiveGame({user, game, setGame, setUser}: LoadedGameProps) {
  const [previousAction, setPreviousAction] = useState<ActionApi|undefined>(undefined);
  return <ExecutionContextProvider gameKey={game.gameKey} gameState={game.gameData!}>
    <GameContextProvider game={game} user={user} setPreviousAction={setPreviousAction} setGame={setGame}>
      <h2>{game.name}</h2>
      <SelectAction setUser={setUser} />
      <UndoButton />
      <CurrentPhase />
      <PlayerStats />
      <TurnOrder/>
      <HexGrid />
      <Goods/>
      {previousAction && <PreviousAction previousAction={previousAction} />}
    </GameContextProvider>
  </ExecutionContextProvider>;
}

export function CurrentPhase() {
  const round = useInjectedState(ROUND);
  const roundHelper = useInjected(RoundEngine)
  const phase = useInjectedState(PHASE);
  return <div>Round: {round}/{roundHelper.maxRounds()}. Phase: {getPhaseString(phase)}.</div>;
}

interface GameContext {
  game: GameApi;
  user: MyUserApi;
  children: ReactNode;
  setPreviousAction(p: ActionApi|undefined): void;
  setGame(game: GameApi): void;
}

export function GameContextProvider({game, user, children, setPreviousAction, setGame}: GameContext) {
  const users = useUsers(game.playerIds);
  const gameContext = useMemo(() => {
    const userCache = new Map((users ?? []).map((user) => [user.id, user]));
    return new GameData(user, game, userCache, setPreviousAction, setGame);
  }, [user, game, users?.map((user) => user.id).join('|')]);
  return <GameContext.Provider value={gameContext}>
    {children}
  </GameContext.Provider>;
}

export function UndoButton() {
  const ctx = useContext(GameContext)!;
  const undo = useCallback(() => {
    gameClient.undoAction({params: {gameId: ctx.game.id}, body: {version: ctx.game.version - 1}}).then(({status, body}) => {
      assert(status === 200);
      ctx.setGame(body.game);
    })
  }, [ctx.game]);
  if (ctx.game.undoPlayerId !== ctx.user.id) {
    return <></>;
  }
  return <button onClick={undo}>Undo</button>
}

export function PreviousAction({previousAction}: {previousAction: ActionApi}) {
  const gameContext = useContext(GameContext);
  const retry = useCallback(() => {
    gameContext!.attemptAction(previousAction);
  }, [previousAction]);
  return <button onClick={retry}>Retry action {previousAction.actionName}</button>
}

export function TurnOrder() {
  return <div>Shares</div>;
}

export function Goods() {
  return <div>Shares</div>;
}