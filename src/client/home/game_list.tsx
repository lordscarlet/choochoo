import { Button } from "@mui/material";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GameApi } from "../../api/game";
import { useCreateGame, useGameList } from "../services/game";

export function GameList() {
  const games = useGameList();
  const navigate = useNavigate();
  const { createGame } = useCreateGame();

  const goToGame = useCallback((game: GameApi) => {
    navigate(`/games/${game.id}`);
  }, [navigate]);

  const createEasyGame = useCallback(async () => {
    const name = 'game - ' + Date.now();
    if (name == null) return;
    createGame({ name, gameKey: 'rust-belt' });
  }, []);

  return <div>
    <h2>Select game</h2>
    <button onClick={createEasyGame}>Create Game</button>
    {games.map((game) => <div key={game.id}>
      {game.name}
      <Button onClick={() => goToGame(game)}>View</Button>
    </div>)}
  </div>;
}