import { GameLog } from "../game/game_log";
import { useMe } from "../services/me";
import { GameList } from "./game_list";


export function HomePage() {
  const user = useMe();

  return <div>
    <h1>Choo Choo Games</h1>
    <GameLog />
    <GameList />
  </div>;
}