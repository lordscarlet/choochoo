import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRightTwoTone';
import Circle from '@mui/icons-material/Circle';
import { useMemo } from "react";
import { GameStatus } from '../../api/game';
import { PlayerHelper } from "../../engine/game/player";
import { CURRENT_PLAYER, injectAllPlayersUnsafe, TURN_ORDER } from "../../engine/game/state";
import { ProfitHelper } from '../../engine/income_and_expenses/helper';
import { MoveHelper } from '../../engine/move/helper';
import { getSelectedActionString } from "../../engine/state/action";
import { PlayerColor, PlayerData } from "../../engine/state/player";
import { Incinerator } from '../../maps/sweden/incinerator';
import { SwedenRecyclingMapSettings } from '../../maps/sweden/settings';
import { getPlayerColorCss } from '../components/player_color';
import { Username } from '../components/username';
import { useGame } from '../services/game';
import { useActiveGameState, useInject, useInjected, useInjectedState } from "../utils/injection_context";
import { FinalOverview } from './final_overview';
import { LoginButton } from "./login_button";
import * as styles from './player_stats.module.css';


export function PlayerStats() {
  const playerData = useInject(() => injectAllPlayersUnsafe()(), []);
  const playerOrder = useInjectedState(TURN_ORDER);
  const currentPlayer = useActiveGameState(CURRENT_PLAYER);
  const profitHelper = useInjected(ProfitHelper);
  const moveHelper = useInjected(MoveHelper);
  const helper = useInjected(PlayerHelper);
  const outOfGamePlayers = playerData.filter((p) => p.outOfGame).map((p) => p.color);
  const players = useMemo<PlayerData[]>(() => playerOrder.concat(outOfGamePlayers).map(color => {
    return playerData.find((player) => player.color === color)!;
  }), [playerOrder, playerData]);
  const game = useGame();
  const gameKey = game.gameKey;
  const incinerator = useInjected(Incinerator);

  if (game.status === GameStatus.enum.ENDED) return <FinalOverview />;

  return <div className={styles.playerStats}>
    <h2>Player overview</h2>
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
          {gameKey === SwedenRecyclingMapSettings.key && <th className={styles.expanded}>Garbage</th>}
          <th className={styles.expanded}>Score</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {players.map((player) =>
          <tr key={player.playerId} className={styles.tableRow}>
            <td>
              <PlayerColorIndicator playerColor={player.color} currentTurn={player.color === currentPlayer} />
            </td>
            <td>
              <Username userId={player.playerId} />
            </td>
            <td className={styles.collapsed}>
              Action:<br />
              Money:<br />
              Income:<br />
              Shares:<br />
              Loco:<br />
              {gameKey === SwedenRecyclingMapSettings.key && <>Garbage:<br /></>}
              Score:<br />
            </td>
            <td className={styles.collapsed}>
              {getSelectedActionString(player.selectedAction)}<br />
              ${player.money} ({toNet(profitHelper.getProfit(player))})<br />
              ${player.income}<br />
              {player.shares}<br />
              {moveHelper.getLocomotiveDisplay(player)}<br />
              {gameKey === SwedenRecyclingMapSettings.key && <>{incinerator.getGarbageCountForUser(player.color)}<br /></>}
              {helper.getScore(player)}<br />
            </td>
            <td className={styles.expanded}>{getSelectedActionString(player.selectedAction)}</td>
            <td className={styles.expanded}>${player.money} ({toNet(profitHelper.getProfit(player))})</td>
            <td className={styles.expanded}>${player.income}</td>
            <td className={styles.expanded}>{player.shares}</td>
            <td className={styles.expanded}>{moveHelper.getLocomotiveDisplay(player)}</td>
            {gameKey === SwedenRecyclingMapSettings.key && <td className={styles.expanded}>{incinerator.getGarbageCountForUser(player.color)}</td>}
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
