import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { ListGamesApi } from "../../api/game";
import { useGameList } from "../services/game";

interface GameListProps {
  query: ListGamesApi;
  title: string;
}

export function GameList({ query, title }: GameListProps) {
  const games = useGameList(query);

  return <div>
    <h2>{title}</h2>
    {games.map((game) => <div key={game.id}>
      {game.name}
      <Button component={Link} to={`/app/games/${game.id}`}>View</Button>
    </div>)}
  </div>;
}