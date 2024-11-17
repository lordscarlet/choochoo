import { useMe } from "../services/me";
import { GameList } from "./game_list";


export function HomePage() {
  const user = useMe();

  return <div>
    <h1>Choo Choo Games</h1>
    <GameList />
  </div>;
}