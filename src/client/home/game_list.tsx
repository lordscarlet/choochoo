import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { ListGamesApi } from "../../api/game";
import { useGameList } from "../services/game";

interface GameListProps {
  query: ListGamesApi;
  title: string;
}

export function GameList({ query, title }: GameListProps) {
  const { games, nextPage, prevPage, hasPrevPage, hasNextPage } = useGameList(query);

  if (games == null || games.length === 0) return <></>;

  return <div>
    <h2>{title}</h2>
    {games?.map((game) => <div key={game.id}>
      {game.name}
      <Button component={Link} to={`/app/games/${game.id}`}>View</Button>
    </div>)}
    {hasPrevPage && <Button onClick={prevPage} >Prev</Button>}
    {hasNextPage && <Button onClick={nextPage} disabled={games == null}>Next</Button>}
  </div>;
}