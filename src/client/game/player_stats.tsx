import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
import Circle from '@mui/icons-material/Circle';
import { useMemo } from "react";
import { UserApi } from "../../api/user";
import { PlayerHelper } from "../../engine/game/player";
import { CURRENT_PLAYER, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { getSelectedActionString } from "../../engine/state/action";
import { PlayerColor, PlayerData } from "../../engine/state/player";
import { getPlayerColorCss } from '../components/player_color';
import { useUsers } from "../services/user";
import { useInjected, useInjectedState } from "../utils/injection_context";
import { LoginButton } from "./login_button";
import * as styles from './player_stats.module.css';


export function PlayerStats() {
  const playerData = useInjectedState(PLAYERS);
  const playerOrder = useInjectedState(TURN_ORDER);
  const currentPlayer = useInjectedState(CURRENT_PLAYER);
  const helper = useInjected(PlayerHelper);
  const playerUsers = useUsers(playerData.map((player) => player.playerId));
  const outOfGamePlayers = playerData.filter((p) => p.outOfGame).map((p) => p.color);
  const players = useMemo<Array<{ player: PlayerData, user?: UserApi }>>(() => playerOrder.concat(outOfGamePlayers).map(color => {
    const player = playerData.find((player) => player.color === color)!;
    const user = playerUsers.find(user => user?.id === player.playerId);
    return { player, user };
  }), [playerOrder, playerData, playerUsers]);
  return <div className={styles.playerStats}>
    <table>
      <thead>
        <tr className={styles.tableRow}>
          <th></th>
          <th>Player</th>
          <th className={styles.collapsed}>Stats</th>
          <th className={styles.collapsed}></th>
          <th className={styles.expanded}>Selected Action</th>
          <th className={styles.expanded}>Money</th>
          <th className={styles.expanded}>Income</th>
          <th className={styles.expanded}>Shares</th>
          <th className={styles.expanded}>Locomotive</th>
          <th className={styles.expanded}>Score</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {players.map(({ player, user }) =>
          <tr key={player.playerId} className={styles.tableRow}>
            <td>
              <PlayerColorIndicator playerColor={player.color} currentTurn={player.color === currentPlayer} />
            </td>
            <td>
              {user?.username}
            </td>
            <td className={styles.collapsed}>
              Action:<br />
              Money:<br />
              Income:<br />
              Shares:<br />
              Loco:<br />
              Score:<br />
            </td>
            <td className={styles.collapsed}>
              {getSelectedActionString(player.selectedAction)}<br />
              ${player.money} ({toNet(player.income - player.shares - player.locomotive)})<br />
              ${player.income}<br />
              {player.shares}<br />
              {player.locomotive}<br />
              {helper.getScore(player)}<br />
            </td>
            <td className={styles.expanded}>{getSelectedActionString(player.selectedAction)}</td>
            <td className={styles.expanded}>${player.money} ({toNet(player.income - player.shares - player.locomotive)})</td>
            <td className={styles.expanded}>${player.income}</td>
            <td className={styles.expanded}>{player.shares}</td>
            <td className={styles.expanded}>{player.locomotive}</td>
            <td className={styles.expanded}>{helper.getScore(player)}</td>
            <td><LoginButton playerId={player.playerId}>Switch</LoginButton></td>
          </tr>)}
      </tbody>
    </table>
  </div>;
}

interface PlayerColorIndicatorProps {
  playerColor?: PlayerColor;
  currentTurn: boolean;
}

export function PlayerColorIndicator({ playerColor, currentTurn }: PlayerColorIndicatorProps) {
  const className = `${styles.user} ${getPlayerColorCss(playerColor)}`;
  return currentTurn ?
    <ArrowCircleRightIcon fontSize="large" className={className} /> :
    <Circle fontSize="large" className={className} />;
}

function toNet(number: number): string {
  return number >= 0 ? `+$${number}` : `-$${-number}`;
}
