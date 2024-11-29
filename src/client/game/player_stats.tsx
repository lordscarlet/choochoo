import { useMemo } from "react";
import { UserApi } from "../../api/user";
import { PlayerHelper } from "../../engine/game/player";
import { CURRENT_PLAYER, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { getSelectedActionString } from "../../engine/state/action";
import { getPlayerColor, PlayerData } from "../../engine/state/player";
import { useUsers } from "../services/user";
import { useInjected, useInjectedState } from "../utils/injection_context";
import * as styles from './active_game.module.css';
import { LoginButton } from "./login_button";


export function PlayerStats() {
  const playerData = useInjectedState(PLAYERS);
  const playerOrder = useInjectedState(TURN_ORDER);
  const currentPlayer = useInjectedState(CURRENT_PLAYER);
  const helper = useInjected(PlayerHelper);
  const playerUsers = useUsers(playerData.map((player) => player.playerId));
  const outOfGamePlayers = playerData.filter((p) => p.outOfGame).map((p) => p.color);
  const players = useMemo<Array<{ player: PlayerData, user?: UserApi }>>(() => playerOrder.concat(outOfGamePlayers).map(color => {
    const player = playerData.find((player) => player.color === color)!;
    const user = playerUsers?.find(user => user.id === player.playerId);
    return { player, user };
  }), [playerOrder, playerData, playerUsers]);
  return <table>
    <thead>
      <tr>
        <th></th>
        <th></th>
        <th>Player</th>
        <th>Selected Action</th>
        <th>Money</th>
        <th>Income</th>
        <th>Shares</th>
        <th>Locomotive</th>
        <th>Score</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {players.map(({ player, user }) =>
        <tr key={player.playerId}>
          <td>{player.color === currentPlayer ? '→' : ''}</td>
          <td className={[styles.user, styles[getPlayerColor(player.color)]].join(' ')}></td>
          <td>{user?.username}</td>
          <td>{getSelectedActionString(player.selectedAction)}</td>
          <td>${player.money} ({toNet(player.income - player.shares - player.locomotive)})</td>
          <td>${player.income}</td>
          <td>{player.shares}</td>
          <td>{player.locomotive}</td>
          <td>{helper.getScore(player)}</td>
          <td><LoginButton playerId={player.playerId}>Switch</LoginButton></td>
        </tr>)}
    </tbody>
  </table>;
}


function toNet(number: number): string {
  return number >= 0 ? `+$${number}` : `-$${-number}`;
}
