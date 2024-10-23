import { ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { ActionApi, GameApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { PHASE } from "../../engine/game/phase";
import { ROUND, RoundEngine } from "../../engine/game/round";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { Grid } from "../../engine/map/grid";
import { MOVE_STATE } from "../../engine/move/state";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { getPhaseString, Phase } from "../../engine/state/phase";
import { OnRoll } from "../../engine/state/roll";
import { iterate } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { GoodBlock } from "../grid/good";
import { HexGrid } from "../grid/hex_grid";
import { GameContext, GameData } from "../services/context";
import { gameClient } from "../services/game";
import { useUsers } from "../services/user";
import { ExecutionContextProvider, ignoreInjectedState, useInjected, useInjectedState } from "../utils/execution_context";
import { GameLog } from "./game_log";
import { PlayerStats } from "./player_stats";
import { SelectAction } from "./select_action";


interface LoadedGameProps {
  game: GameApi;
  user: MyUserApi;
  setGame: (game: GameApi) => void;
  setUser: (user: MyUserApi) => void;
}

export function ActiveGame({ user, game, setGame, setUser }: LoadedGameProps) {
  const [previousAction, setPreviousAction] = useState<ActionApi | undefined>(undefined);
  return <ExecutionContextProvider gameKey={game.gameKey} gameState={game.gameData!}>
    <GameContextProvider game={game} user={user} setPreviousAction={setPreviousAction} setGame={setGame}>
      <h2>{game.name}</h2>
      <GameLog gameId={game.id} />
      <SelectAction setUser={setUser} />
      <UndoButton />
      <CurrentPhase />
      <PlayerStats />
      <HexGrid />
      <Goods />
      {previousAction && <PreviousAction previousAction={previousAction} />}
    </GameContextProvider>
  </ExecutionContextProvider>;
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

interface GameContext {
  game: GameApi;
  user: MyUserApi;
  children: ReactNode;
  setPreviousAction(p: ActionApi | undefined): void;
  setGame(game: GameApi): void;
}

export function GameContextProvider({ game, user, children, setPreviousAction, setGame }: GameContext) {
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
    gameClient.undoAction({ params: { gameId: ctx.game.id }, body: { version: ctx.game.version - 1 } }).then(({ status, body }) => {
      assert(status === 200);
      ctx.setGame(body.game);
    })
  }, [ctx.game]);
  if (ctx.game.undoPlayerId !== ctx.user.id) {
    return <></>;
  }
  return <button onClick={undo}>Undo</button>
}

export function PreviousAction({ previousAction }: { previousAction: ActionApi }) {
  const gameContext = useContext(GameContext);
  const retry = useCallback(() => {
    gameContext!.attemptAction(previousAction);
  }, [previousAction]);
  return <button onClick={retry}>Retry action {previousAction.actionName}</button>
}

export function Goods() {
  const ctx = useContext(GameContext);
  const grid = useInjected(Grid);
  const availableCities = useInjectedState(AVAILABLE_CITIES);
  const cities = useMemo(() => {
    const cities = grid.findAllCities();
    const regularCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    const urbanizedCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    for (const city of cities) {
      const map = city.isUrbanized() ? urbanizedCities : regularCities;
      map.get(city.group())![city.onRoll()[0]] = city.getUpcomingGoods()[0];
    }
    for (const availableCity of availableCities) {
      urbanizedCities.get(availableCity.group)![availableCity.onRoll[0]] = availableCity.upcomingGoods;
    }
    return { regularCities, urbanizedCities };
  }, [grid, availableCities]);

  const phase = useInjectedState(PHASE);
  const productionState = phase === Phase.GOODS_GROWTH ? useInjectedState(GOODS_GROWTH_STATE) : ignoreInjectedState();

  const good = useMemo(() => {
    if (productionState == null) return undefined;
    return productionState.goods[0];
  }, [productionState]);

  const onClick = useCallback((urbanized: boolean, cityGroup: CityGroup, onRoll: OnRoll) => {
    if (!ctx?.isActiveUser() || !ctx.canEmit(ProductionAction)) return;
    assert(good != null);
    ctx.emit(ProductionAction, { urbanized, onRoll, cityGroup, good })
  }, [ctx, good]);
  return <table>
    <thead>
      <tr>
        <th colSpan={6}>White</th>
        <th colSpan={6}>Black</th>
      </tr>
      <tr>
        {iterate(12, (i) => <th key={i}>{i % 6 + 1}</th>)}
      </tr>
    </thead>
    <tbody>
      {iterate(3, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.regularCities.get(cityGroup)?.[onRoll];
          const good = city?.[2 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(false, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
      <tr>
        {iterate(12, (i) => <td key={i}>{i < 2 || i >= 10 ? '' : toLetter(i - 2)}</td>)}
      </tr>
      {iterate(2, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.urbanizedCities.get(cityGroup)?.[onRoll];
          const good = city?.[1 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(true, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
    </tbody>
  </table>;
}

function toLetter(i: number) {
  return String.fromCharCode('A'.charCodeAt(0) + i);
}