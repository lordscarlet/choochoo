import { useEffect, useState } from "react";
import { User } from "./user";
import { GameSelector } from "./game_selector";
import { Game } from "./game";
import { MyUserApi } from "../../api/user";
import { GameApi } from "../../api/game";
import { userClient } from "../services/user";
import { assert } from "../../utils/validate";
import { UserCacheProvider } from "./user_cache";

export function App() {
  const [user, setUser] = useState<{user?: MyUserApi}|undefined>();
  const [game, setGame] = useState<GameApi|undefined>(undefined);

  useEffect(() => {
    userClient.getMe().then(({body, status}) => {
      assert(status === 200);
      setUser({user: body.user});
    });
  }, [1]);
  return <UserCacheProvider>
    <div>
      <h1>Steam Age</h1>
      {user && <User user={user.user} setUser={(user) => setUser({user})} />}
      {user && <GameSelector game={game} setGame={setGame}/>}
      {user?.user && game && <Game user={user.user} gameId={game.id} />}
      {!user && <div>Loading...</div>}
    </div>
  </UserCacheProvider>;
}

export function Loaded() {

}