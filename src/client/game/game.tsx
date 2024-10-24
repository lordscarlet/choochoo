import { useGame, useJoinGame, useLeaveGame, useStartGame } from "../services/game";
import { useMe } from "../services/me";
import { useUsers } from "../services/user";

export function Lobby() {
  const user = useMe();
  const game = useGame();
  const players = useUsers(game.playerIds);
  return <div>
    <h2>{game.name}</h2>
    <p>
      Players: {players && players.map((player) => player.username).join(', ')}
      <LeaveButton />
      <JoinButton />
      <StartButton />
    </p>
  </div>;
}

export function LeaveButton() {
  const { canPerform, perform, isPending } = useLeaveGame();
  if (!canPerform) {
    return <></>;
  }

  return <button disabled={isPending} onClick={perform}>Leave</button>;
}

export function JoinButton() {
  const { canPerform, perform, isPending } = useJoinGame();
  if (!canPerform) {
    return <></>;
  }

  return <button disabled={isPending} onClick={perform}>Join</button>;
}

export function StartButton() {
  const { canPerform, perform, isPending } = useStartGame();
  if (!canPerform) {
    return <></>;
  }

  return <button disabled={isPending} onClick={perform}>Start</button>;
}