import { useMessages } from "../services/socket";
import * as styles from "./game_log.module.css";


interface GameLogProps {
  gameId?: string;
}

export function GameLog({ gameId }: GameLogProps) {
  const messages = useMessages(gameId);

  return <div className={styles['log-container']}>
    {messages?.map((log) =>
      <p key={log.id}>[{log.date}] {log.userId ?? 'System'}: {log.message}</p>
    )}
  </div>;
}