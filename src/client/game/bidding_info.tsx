import { useMemo } from "react";
import { UserApi } from "../../api/user";
import { CURRENT_PLAYER, PLAYERS, TURN_ORDER } from "../../engine/game/state";
import { Phase } from "../../engine/state/phase";
import { getPlayerColor, PlayerColor, PlayerData } from "../../engine/state/player";
import { TURN_ORDER_STATE } from "../../engine/turn_order/state";
import { duplicate } from "../../utils/functions";
import { useUsers } from "../services/user";
import { useInjectedState, usePhaseState } from "../utils/injection_context";
import { captionContainer, colorList, colorListContainer, playerCircle, playerCircleContainer } from './bidding_info.module.css';


export function BiddingInfo() {
  const playerData = useInjectedState(PLAYERS);
  const playerOrder = useInjectedState(TURN_ORDER);
  const currentPlayer = useInjectedState(CURRENT_PLAYER);
  const turnOrderState = usePhaseState(Phase.TURN_ORDER, TURN_ORDER_STATE);
  const playerUsers = useUsers(playerData.map((player) => player.playerId));
  const players = useMemo<Array<{ player: PlayerData, user?: UserApi }>>(() => playerOrder.map(color => {
    const player = playerData.find((player) => player.color === color)!;
    const user = playerUsers?.find(user => user.id === player.playerId);
    return { player, user };
  }), [playerOrder, playerData, playerUsers]);

  const biddingPlayers = useMemo(() =>
    playerOrder.map((color) => turnOrderState != null && !turnOrderState.nextTurnOrder.includes(color) ? ({
      color,
      bid: turnOrderState?.previousBids[color],
      underlined: color === currentPlayer,
    }) : {})
    , [currentPlayer, turnOrderState, players]);
  const passedPlayers = useMemo(() =>
    duplicate<PlayerColor | undefined>(playerOrder.length - (turnOrderState?.nextTurnOrder.length ?? 0), undefined).concat(
      turnOrderState?.nextTurnOrder ?? []).map((color, index) => ({ color, caption: getCaption(index + 1, playerOrder.length) }))
    , [biddingPlayers, players]);

  if (turnOrderState == null) return <></>;

  return <div className={colorListContainer}>
    <div className={colorList}>{biddingPlayers.map((props, index) => <PlayerCircle key={index} {...props} />)}</div>
    <div className={colorList}>{passedPlayers.map((props, index) => <PlayerCircle key={index} {...props} />)}</div>
  </div>;
}

function getCaption(turnOrder: number, totalPlayers: number): string {
  if (totalPlayers === turnOrder) {
    return 'Free';
  }
  if (turnOrder === 1 || turnOrder === 2) {
    return '100%';
  }
  return '50%';
}

interface PlayerCircleProps {
  color?: PlayerColor;
  underlined?: boolean;
  bid?: number;
  caption?: string;
}

function PlayerCircle({ color, bid, underlined, caption }: PlayerCircleProps) {
  const containerStyle = {
    borderBottom: underlined ? 'solid 1px black' : undefined,
  };
  const style = {
    backgroundColor: getPlayerColor(color),
  };
  return <div className={playerCircleContainer} style={containerStyle}>
    <div className={playerCircle} style={style}>{bid && `$${bid}`}</div>
    <div className={captionContainer}>{caption}</div>
  </div>;
}