
import { GameStatus } from "../../api/game";
import { assertNever } from "../../utils/validate";
import { useGame } from "../services/game";
import { ActiveGame } from "./active_game";
import { Lobby } from "./game";

export function GamePage() {
  const game = useGame();

  switch (game.status) {
    case GameStatus.LOBBY:
      return <Lobby />
    case GameStatus.ACTIVE:
    case GameStatus.ENDED:
    case GameStatus.ABANDONED:
      return <ActiveGame />
    default:
      assertNever(game.status);
  }
}