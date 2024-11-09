import { Button } from "@mui/material";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GameApi } from "../../api/game";
import { useGameList } from "../services/game";

export function GameList() {
  const games = useGameList();
  const navigate = useNavigate();

  const goToGame = useCallback((game: GameApi) => {
    navigate(`/app/games/${game.id}`);
  }, [navigate]);

  return <div>
    <h2>Select game</h2>
    <Button component={Link} to="/app/games/create">Create Game</Button>
    {games.map((game) => <div key={game.id}>
      {game.name}
      <Button component={Link} to={`/app/games/${game.id}`}>View</Button>
    </div>)}
  </div>;
}