import { useMemo } from "react";
import { UserApi } from "../../api/user";
import { inject, injectState } from "../../engine/framework/execution_context";
import { PHASE } from "../../engine/game/phase";
import { PlayerHelper } from "../../engine/game/player";
import { CURRENT_PLAYER, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { getSelectedActionString } from "../../engine/state/action";
import { Phase } from "../../engine/state/phase";
import { getPlayerColor, PlayerData } from "../../engine/state/player";
import { TURN_ORDER_STATE } from "../../engine/turn_order/state";
import { useUsers } from "../services/user";
import { useInject, useInjected, useInjectedState } from "../utils/injection_context";
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
  const columns: ColumnRenderer[] = useInject(() => [inject(BidRenderer)], []);
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
        {columns.filter(c => c.isEnabled()).map((c) => <th key={c.title}>{c.title}</th>)}
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
          {columns.filter(c => c.isEnabled()).map((c) => <td key={c.title}>{c.calculator(player)}</td>)}
          <td>{helper.getScore(player)}</td>
          <td><LoginButton playerId={player.playerId}>Switch</LoginButton></td>
        </tr>)}
    </tbody>
  </table>;
}

interface ColumnRenderer {
  readonly title: string;
  isEnabled(): boolean;
  calculator(player: PlayerData): string;
}

class BidRenderer {
  readonly title = 'Bid';
  private readonly phase = injectState(PHASE);
  private readonly turnOrderState = injectState(TURN_ORDER_STATE);
  private readonly turnOrder = injectState(TURN_ORDER);

  isEnabled(): boolean {
    return this.phase() === Phase.TURN_ORDER;
  }

  calculator(player: PlayerData): string {
    const state = this.turnOrderState();
    const turnOrder = state.nextTurnOrder.indexOf(player.color) + 1 + this.turnOrder().length - state.nextTurnOrder.length;
    return state.nextTurnOrder.includes(player.color) ? `Passed: ${turnOrder}` :
      state.previousBids.has(player.color) ? `$${state.previousBids.get(player.color)}` : 'N/A';
  }
}


function toNet(number: number): string {
  return number >= 0 ? `+$${number}` : `-$${-number}`;
}
