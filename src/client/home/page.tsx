import { GameList } from "./game_list";
import { useMe } from "../services/me";


export function HomePage() {
  const user = useMe();

  return <div>
    <h1>Steam Age</h1>
    <GameList />
  </div>;
}