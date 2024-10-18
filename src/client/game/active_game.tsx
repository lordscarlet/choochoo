import { useCallback, useEffect, useMemo, useState } from "react";
import { GameApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { useUsers } from "../root/user_cache";
import { Engine } from "../../engine/framework/engine";
import { Grid } from "../../engine/map/grid";
import { inject, injectState } from "../../engine/framework/execution_context";
import { HexGrid } from "./hex_grid";
import { useInjectedState } from "../utils/execution_context";
import { CURRENT_PLAYER, currentPlayer, PLAYERS } from "../../engine/game/state";
import { PlayerColor } from "../../engine/state/player";
import * as styles from './active_game.module.css';
import { gameClient } from "../services/game";
import { assert } from "../../utils/validate";
import { SelectAction } from "./select_action";
import { GameContext, GameData } from "../services/context";
import { ActionConstructor } from "../../engine/game/phase";
import { PhaseDelegator } from "../../engine/game/phase_delegator";
import { ExecutionContextProvider } from "../utils/execution_context";


interface LoadedGameProps {
  game: GameApi;
  user: MyUserApi;
  setGame: (game: GameApi) => void;
}

export function ActiveGame({user, game, setGame}: LoadedGameProps) {
  const gameContext = useMemo(() =>
    new GameData(user, game, setGame), [user, game]);
  return <ExecutionContextProvider gameKey={game.gameKey} gameState={game.gameData!}>
    <GameContext.Provider value={gameContext}>
      <h2>{game.name}</h2>
      <SelectAction />
      <PlayerData />
      <TurnOrder/>
      <HexGrid />
      <Goods/>
    </GameContext.Provider>
  </ExecutionContextProvider>;
}

export function PlayerData() {
  const players = useInjectedState(PLAYERS);
  const playerUsers = useUsers(players.map((player) => player.playerId));
  return <table>
    <thead>
      <tr>
        <th></th>
        <th>Player</th>
        <th>Money</th>
        <th>Income</th>
        <th>Shares</th>
        <th>Locomotive</th>
      </tr>
    </thead>
    <tbody>
      {players.map((player, index) =>
        <tr key={player.playerId}>
          <td className={[styles.user, toStyle(player.color)].join(' ')}></td>
          <td>{playerUsers?.[index]?.username}</td>
          <td>${player.money} ({toNet(player.income - player.shares - player.locomotive)})</td>
          <td>${player.income}</td>
          <td>{player.shares}</td>
          <td>{player.locomotive}</td>
        </tr>)}
    </tbody>
  </table>;
}

function toStyle(playerColor: PlayerColor): string {
  switch (playerColor) {
    case PlayerColor.RED:
      return styles['red'];
    case PlayerColor.YELLOW:
      return styles['yellow'];
    case PlayerColor.GREEN:
      return styles['green'];
    case PlayerColor.PURPLE:
      return styles['purple'];
    case PlayerColor.BLACK:
      return styles['black'];
    case PlayerColor.BLUE:
      return styles['blue'];
    case PlayerColor.BROWN:
      return styles['brown'];
      
  }
}

function toNet(number: number): string {
  return number >= 0 ? `+$${number}` : `-$${-number}`;
}

export function TurnOrder() {
  return <div>Shares</div>;
}

export function Goods() {
  return <div>Shares</div>;
}