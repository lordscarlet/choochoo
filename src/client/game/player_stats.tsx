import { useMemo } from "react";
import { CURRENT_PLAYER, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { useUsers } from "../root/user_cache";
import { useInjectedState } from "../utils/execution_context";
import { PlayerColor, PlayerData } from "../../engine/state/player";
import { UserApi } from "../../api/user";
import * as styles from './active_game.module.css';
import { assertNever } from "../../utils/validate";
import { PHASE } from "../../engine/game/phase";
import { TURN_ORDER_STATE } from "../../engine/turn_order/state";
import { injectState } from "../../engine/framework/execution_context";
import { Phase } from "../../engine/state/phase";
import { getSelectedActionString } from "../../engine/state/action";


export function PlayerStats() {
  const playerData = useInjectedState(PLAYERS);
  const playerOrder = useInjectedState(TURN_ORDER);
  const currentPlayer = useInjectedState(CURRENT_PLAYER);
  const playerUsers = useUsers(playerData.map((player) => player.playerId));
  const players = useMemo<Array<{player: PlayerData, user?: UserApi}>>(() => playerOrder.map(color => {
    const player = playerData.find((player) => player.color === color)!;
    const user = playerUsers?.find(user => user.id === player.playerId);
    return {player, user};
  }), [playerOrder, playerData, playerUsers]);
  const columns: ColumnRenderer[] = useMemo(() => [new BidRenderer()], [1]);
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
      </tr>
    </thead>
    <tbody>
      {players.map(({player, user}) =>
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

  isEnabled(): boolean {
    return injectState(PHASE)() === Phase.TURN_ORDER;
  }

  calculator(player: PlayerData): string {
    const state = injectState(TURN_ORDER_STATE)();
    const turnOrder = state.nextTurnOrder.indexOf(player.color) + 1 + injectState(TURN_ORDER)().length - state.nextTurnOrder.length;
    return state.nextTurnOrder.includes(player.color) ? `Passed: ${turnOrder}` :
        state.previousBids.has(player.color) ? `$${state.previousBids.get(player.color)}` : 'N/A';
  }
}


export function getPlayerColor(playerColor?: PlayerColor): 'red'|'yellow'|'green'|'purple'|'black'|'blue'|'brown' {
  switch (playerColor) {
    case PlayerColor.RED:
      return 'red';
    case PlayerColor.YELLOW:
      return 'yellow';
    case PlayerColor.GREEN:
      return 'green';
    case PlayerColor.PURPLE:
      return 'purple';
    case PlayerColor.BLACK:
      return 'black';
    case PlayerColor.BLUE:
      return 'blue';
    case PlayerColor.BROWN:
      return 'brown';
    case undefined:
      return 'black';
    default:
      assertNever(playerColor);
  }
}


function toNet(number: number): string {
  return number >= 0 ? `+$${number}` : `-$${-number}`;
}
