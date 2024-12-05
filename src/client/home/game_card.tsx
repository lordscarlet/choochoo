import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { GameLiteApi, GameStatus, gameStatusToString } from "../../api/game";
import { MapRegistry } from "../../maps";
import { isNotNull } from "../../utils/functions";
import { assertNever } from "../../utils/validate";
import { useJoinGame, useLeaveGame, useStartGame } from "../services/game";
import { useMe } from "../services/me";
import { useUsers } from "../services/user";
import * as styles from "./game_card.module.css";

interface GameCardProps {
  game: GameLiteApi;
  hideStatus?: boolean;
}

export function GameCard({ game, hideStatus }: GameCardProps) {
  const me = useMe();
  const players = useUsers(game.playerIds);

  return <Card className={styles.gameCard}>
    <CardHeader title={game.name}
      className={`${gameStatusToStyle(game.status)} ${game.activePlayerId === me?.id ? styles.activePlayer : ''}`}
      subheader={hideStatus ? '' : `Status: ${gameStatusToString(game.status)}`} />
    <CardContent>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Game: {MapRegistry.singleton.get(game.gameKey)!.name}
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

function gameStatusToStyle(status: GameStatus): string {
  switch (status) {
    case GameStatus.enum.LOBBY: return styles.lobby;
    case GameStatus.enum.ABANDONED: return styles.abandoned;
    case GameStatus.enum.ENDED: return styles.ended;
    case GameStatus.enum.ACTIVE: return styles.active;
    default:
      assertNever(status);
  }
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