import { Button } from "@mui/material";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GameApi } from "../../api/game";
import { assert } from "../../utils/validate";
import { gameClient, useGameList } from "../services/game";

export function GameList() {
  const games = useGameList();
  const navigate = useNavigate();

  const goToGame = useCallback((game: GameApi) => {
    navigate(`/games/${game.id}`);
  }, [navigate]);

  const createGame = useCallback(async () => {
    const name = 'game - ' + Date.now();
    if (name == null) return;
    gameClient.create({ body: { name, gameKey: 'rust-belt' } }).then(({ body, status }) => {
      assert(status === 201);
      goToGame(body.game);
    });
  }, []);

  return <div>
    <h2>Select game</h2>
    <button onClick={createGame}>Create Game</button>
    {games.map((game) => <div key={game.id}>
      {game.name}
      <Button onClick={() => goToGame(game)}>View</Button>
    </div>)}
  </div>;


}