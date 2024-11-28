import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { GameStatus } from "../../api/game";
import { GameLog } from "../game/game_log";
import { useMe } from "../services/me";
import { GameList } from "./game_list";


export function HomePage() {
  const user = useMe();

  return <div>
    <h1>Choo Choo Games</h1>
    <GameLog />
    <Button component={Link} to="/app/games/create" variant="contained">Create Game</Button>
    {user && <GameList title="Your Games" query={{ status: [GameStatus.Enum.LOBBY, GameStatus.Enum.ACTIVE], userId: user.id, order: ['id', 'DESC'] }} />}
    <GameList title="New Games" query={{ status: [GameStatus.enum.LOBBY], order: ['id', 'DESC'] }} />
    <GameList title="Active Games" query={{ status: [GameStatus.enum.ACTIVE], order: ['updatedAt', 'DESC'] }} />
    <GameList title="Ended Games" query={{ status: [GameStatus.enum.ENDED], order: ['updatedAt', 'DESC'] }} />
  </div>;
}