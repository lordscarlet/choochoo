import { CURRENT_PLAYER, PLAYERS } from "../../engine/game/state";
import { useGame } from "../services/game";
import { useInjectedState } from "../utils/injection_context";
import { LoginButton } from "./login_button";


export function SwitchToUndo() {
  const game = useGame();
  if (game.undoPlayerId == null) return <></>;
  return <LoginButton playerId={game.undoPlayerId}>Switch to undo user</LoginButton>;
}

export function SwitchToActive() {
  const currentPlayerColor = useInjectedState(CURRENT_PLAYER);
  const players = useInjectedState(PLAYERS);
  const currentPlayer = players.find((player) => player.color === currentPlayerColor);
  if (currentPlayer == null) return <></>;
  return <LoginButton playerId={currentPlayer.playerId}>Switch to active user</LoginButton>;
}

