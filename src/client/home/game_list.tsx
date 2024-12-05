import { Button } from "@mui/material";
import { ListGamesApi } from "../../api/game";
import { useGameList } from "../services/game";
import { GameCard } from "./game_card";
import * as styles from './game_list.module.css';

interface GameListProps {
  query: ListGamesApi;
  title: string;
}

export function GameList({ query, title }: GameListProps) {
  const { games, nextPage, prevPage, hasPrevPage, hasNextPage } = useGameList(query);

  if (games == null || games.length === 0) return <></>;

  return <div className={styles.gameListCard}>
    <h2>{title}</h2>

    <div className={styles.gameList}>
      {games?.map((game) => <GameCard game={game} key={game.id} />)}
    </div>
    {hasPrevPage && <Button onClick={prevPage} >Prev</Button>}
    {hasNextPage && <Button onClick={nextPage} disabled={games == null}>Next</Button>}
  </div>;
}