import { useCallback, useState } from "react";
import { GameApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { Game } from "../root/game";
import { GameSelector } from "../root/game_selector";
import { User } from "../root/user";
import { tsr } from "../services/client";
import { useMe } from "../services/me";


export function HomePage() {

  const tsrQueryClient = tsr.useQueryClient();

  const [game, setGame] = useState<GameApi | undefined>(undefined);

  const user = useMe();

  const setUser = useCallback((user: MyUserApi | undefined) => {
    // tsrQueryClient.users.getMe.setQueryData(QUERY_KEY, (r) => {
    //   assert(r != null);
    //   return { ...r, status: 200 as const, body: { user } };
    // });
  }, []);

  return <div>
    <h1>Steam Age</h1>
    Username: {user?.username}
    {user && <User user={user} setUser={setUser} />}
    {user && <GameSelector game={game} setGame={setGame} />}
    {user && user != null && game && <Game user={user} gameId={game.id} setUser={setUser} />}
  </div>;
}