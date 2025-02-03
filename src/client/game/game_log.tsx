import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Fab, Tooltip } from "@mui/material";
import {
  FormEvent,
  Fragment,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { timeFormat } from "../../utils/functions";
import { useMessages, useSendChat } from "../services/message";
import { useTextInputState } from "../utils/form_state";
import * as styles from "./game_log.module.css";

// @ts-expect-error This doesn't inject properly.
import useStayScrolled from "react-stay-scrolled";
import { Username } from "../components/username";

interface GameLogProps {
  gameId?: number;
}

export function GameLog({ gameId }: GameLogProps) {
  const { messages, isLoading, fetchNextPage, hasNextPage } =
    useMessages(gameId);
  const ref = useRef<HTMLDivElement | null>(null);
  const [canScrollToBottom, setCanScrollToBottom] = useState(false);
  const [newMessage, setNewMessage, setNewMessageRaw] = useTextInputState("");
  const { sendChat, isPending } = useSendChat(gameId);

  const { stayScrolled, isScrolled, scrollBottom } = useStayScrolled(ref);

  const onScroll = useCallback(() => {
    setCanScrollToBottom(!isScrolled());
  }, [isScrolled, setCanScrollToBottom]);

  useLayoutEffect(() => {
    // Tell the user to scroll down to see the newest messages if the element wasn't scrolled down
    stayScrolled();
    setCanScrollToBottom(!isScrolled());
  }, [isScrolled, setCanScrollToBottom, messages.length]);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      sendChat(newMessage, () => setNewMessageRaw(""));
    },
    [newMessage],
  );

  return (
    <div>
      <div className={styles["log-container"]}>
        <div className={styles["log-list"]} ref={ref} onScroll={onScroll}>
          {hasNextPage && (
            <button
              onClick={fetchNextPage}
              disabled={isLoading}
              className={styles.loadMoreButton}
            >
              Load More
            </button>
          )}
          {messages.map((log, index) => {
            const dateString = log.date.toLocaleDateString();
            const isNewDay =
              index == 0 ||
              dateString !== messages[index - 1].date.toLocaleDateString();
            return (
              <Fragment key={log.id}>
                {isNewDay && <p>-- {dateString} --</p>}
                <p className={styles.logLine}>
                  <span className={styles["time"]}>{timeFormat(log.date)}</span>{" "}
                  {log.userId != null && (
                    <>
                      <span className={styles["username"]}>
                        <Username userId={log.userId} />
                      </span>
                      :
                    </>
                  )}{" "}
                  <span className={styles["message"]}>
                    <LogMessage message={log.message} />
                  </span>
                </p>
              </Fragment>
            );
          })}
        </div>
        {canScrollToBottom && (
          <div className={styles["scroll-to-bottom-container"]}>
            <Tooltip title="Scroll to bottom">
              <Fab
                color="primary"
                size="small"
                className={styles["scroll-to-bottom"]}
                onClick={scrollBottom}
              >
                <ArrowDownwardIcon />
              </Fab>
            </Tooltip>
          </div>
        )}
      </div>
      <form onSubmit={onSubmit} className={styles["submit-form"]}>
        <input
          type="text"
          maxLength={256}
          placeholder="Send message"
          value={newMessage}
          onChange={setNewMessage}
          disabled={isPending}
        />
        <input type="submit" value="Send" disabled={isPending} />
      </form>
    </div>
  );
}

const MESSAGE_PARSER = /<@user-(\d+)>/g;

function LogMessage({ message }: { message: string }) {
  const messageParsed = useMemo(() => {
    const parts: Array<string | number> = [];
    let lastIndex = 0;
    for (const match of message.matchAll(MESSAGE_PARSER)) {
      parts.push(message.substring(lastIndex, match.index));
      parts.push(Number(match[1]));
      lastIndex = match.index + match[0].length;
    }
    parts.push(message.substring(lastIndex));
    return parts;
  }, [message]);

  return (
    <>
      {messageParsed.map((part, index) => (
        <span key={index}>
          {typeof part === "string" ? part : <Username userId={part} />}
        </span>
      ))}
    </>
  );
}
