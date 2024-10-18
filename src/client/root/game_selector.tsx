import { useEffect, useState } from "react";
import { GameApi } from "../../api/game";
import { gameClient } from "../services/game";
import { assert } from "../../utils/validate";

interface GameSelectorProps {
  game?: GameApi;
  setGame(game: GameApi|undefined): void;
}
export function GameSelector({game, setGame}: GameSelectorProps) {
  const [games, setGames] = useState<Array<GameApi>|undefined>();
  useEffect(() => {
    gameClient.list().then(({body, status}) => {
      assert(status === 200);
      setGames(body.games);
      setGame(body.games[0]);
    });
  }, [1]);
  return <div>
    <h2>Select game</h2>
    <select value={game?.id} onChange={(e) => setGame(games!.find(({id}) => id === e.target.value))}>
      <option value={undefined}></option>
      {games?.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
    </select>
    <button onClick={createGame}>Create Game</button>
  </div>;

  async function createGame() {
    const name = prompt('game name?');
    if (name == null) return;
    gameClient.create({body: {name, gameKey: 'rust-belt'}}).then(({body, status}) => {
      assert(status === 201);
      assert(games != null);
      console.log('here', [body.game, ...games]);
      setGames([body.game, ...games]);
      setGame(body.game);
    });
  }
}