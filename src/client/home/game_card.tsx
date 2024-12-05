import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { GameLiteApi, GameStatus, gameStatusToString } from "../../api/game";
import { isNotNull } from "../../utils/functions";
import { useJoinGame, useLeaveGame, useStartGame } from "../services/game";
import { useUsers } from "../services/user";
import * as styles from "./game_card.module.css";

interface GameCardProps {
  game: GameLiteApi;
}

export function GameCard({ game }: GameCardProps) {
  const players = useUsers(game.playerIds);

  return <Card className={styles.gameCard}>
    <CardContent>
      <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
        Status: {gameStatusToString(game.status)}
      </Typography>
      <Typography gutterBottom variant="h5" component="div">
        {game.name}
      </Typography>

      {game.activePlayerId && <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Active Player: {players && players.find((player) => player?.id === game.activePlayerId)?.username}
      </Typography>}
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Players: {players && players.filter(isNotNull).map((player) => player.username).join(', ')}
      </Typography>
    </CardContent>
    <CardActions>
      <ViewButton game={game} />
      <LeaveButton game={game} />
      <JoinButton game={game} />
      <StartButton game={game} />
    </CardActions>
  </Card>;
}

interface GameButtonProps {
  game: GameLiteApi;
}

export function ViewButton({ game }: GameButtonProps) {
  if (game.status !== GameStatus.enum.ACTIVE) return <></>;

  return <Button component={Link} to={`/app/games/${game.id}`}>
    View
  </Button>;
}

export function LeaveButton({ game }: GameButtonProps) {
  const { canPerform, perform, isPending } = useLeaveGame(game);
  if (!canPerform) {
    return <></>;
  }

  return <Button disabled={isPending} onClick={perform}>Leave</Button>;
}

export function JoinButton({ game }: GameButtonProps) {
  const { canPerform, perform, isPending } = useJoinGame(game);
  if (!canPerform) {
    return <></>;
  }

  return <Button disabled={isPending} onClick={perform}>Join</Button>;
}

export function StartButton({ game }: GameButtonProps) {
  const { canPerform, perform, isPending } = useStartGame(game);
  if (!canPerform) {
    return <></>;
  }

  return <Button disabled={isPending} onClick={perform}>Start</Button>;
}