import { useCallback, useEffect, useState } from "react";
import { GameApi, GameStatus } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { useUsers } from "./user_cache";
import { gameClient } from "../services/game";
import { assert, assertNever } from "../../utils/validate";
import { ActiveGame } from "../game/active_game";
import { userClient } from "../services/user";

interface GameProps {
  gameId: string;
  user: MyUserApi;
  setUser(user: MyUserApi): void;
}

export function Game({user, gameId, setUser}: GameProps) {
  const [game, setGame] = useState<GameApi|undefined>();
  useEffect(() => {
    gameClient.get({params: {gameId}}).then(({status, body}) => {
      assert(status === 200);
      const game = body.game;
      if (game.id !== gameId) return;
      setGame(game);
    });
  }, [gameId]);
  return game ? <LoadedGame user={user} game={game} setGame={setGame} setUser={setUser} /> : <div>Loading....</div>;
}

interface LoadedGameProps {
  game: GameApi;
  user: MyUserApi;
  setGame: (game: GameApi) => void;
  setUser: (user: MyUserApi) => void;
}

export function LoadedGame({user, game, setGame, setUser}: LoadedGameProps) {
  switch (game.status) {
    case GameStatus.LOBBY:
      return <Lobby game={game} user={user} setGame={setGame} setUser={setUser} />
    case GameStatus.ACTIVE:
    case GameStatus.ENDED:
    case GameStatus.ABANDONED:
      return <ActiveGame game={game} user={user} setUser={setUser} setGame={setGame} />
    default:
      assertNever(game.status);
  }
}

export function Lobby({user, game, setGame}: LoadedGameProps) {
  const players = useUsers(game.playerIds);
  return <div>
    <h2>{game.name}</h2>
    <p>
      Players: {players && players.map((player) => player.username).join(', ')}
      {game.playerIds.includes(user.id) ? <LeaveButton gameId={game.id} setGame={setGame} /> : <JoinButton gameId={game.id} setGame={setGame} /> }
      {game.playerIds[0] === user.id && <StartButton gameId={game.id} setGame={setGame} />}
    </p>
  </div>;
}

interface GameMutator {
  gameId: string;
  setGame: (game: GameApi) => void;
}

export function LeaveButton({gameId, setGame}: GameMutator) {
  const [disabled, setDisabled] = useState(false);
  const leaveGame = useCallback(() => {
    setDisabled(true);
    gameClient.leave({params: {gameId}}).then(({body, status}) => {
      setDisabled(false);
      assert(status === 200);
      if (body.game.id !== gameId) return;
      setGame(body.game);
    });
    return () => {
      setDisabled(false);
    };
  }, [gameId]);

  return <button disabled={disabled} onClick={leaveGame}>Leave</button>;
}

export function StartButton({gameId, setGame}: GameMutator) {
  const [disabled, setDisabled] = useState(false);
  const startGame = useCallback(() => {
    setDisabled(true);
    gameClient.start({params: {gameId}}).then(({body, status}) => {
      setDisabled(false);
      assert(status === 200);
      if (body.game.id !== gameId) return;
      setGame(body.game);
    });
    return () => {
      setDisabled(false);
    };
  }, [gameId]);

  return <button disabled={disabled} onClick={startGame}>Start</button>;
}

export function JoinButton({gameId, setGame}: GameMutator) {
  const [disabled, setDisabled] = useState(false);
  const joinGame = useCallback(() => {
    setDisabled(true);
    gameClient.join({params: {gameId}}).then(({body, status}) => {
      setDisabled(false);
      assert(status === 200);
      if (body.game.id !== gameId) return;
      setGame(body.game);
    });
    return () => {
      setDisabled(false);
    };
  }, [gameId]);

  return <button disabled={disabled} onClick={joinGame}>Join</button>;
}