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
import {
  MessageType,
  containsMentionOfUser,
  detectMessageType,
  getAllMessageTypes,
} from "../../utils/message_types";
import { PlayerColor } from "../../engine/state/player";
import { useMessages, useSendChat } from "../services/message";
import { useMe } from "../services/me";
import { useLocalStorage } from "../services/local_storage";
import { useTextInputState } from "../utils/form_state";
import { FilterControls } from "./filter_controls";
import * as styles from "./game_log.module.css";

// @ts-expect-error This doesn't inject properly.
import useStayScrolled from "react-stay-scrolled";
import { Button, Form, Icon, Input, Popup } from "semantic-ui-react";
import { GameHistoryApi } from "../../api/history";
import { MessageApi } from "../../api/message";
import { getPlayerColorCss } from "../components/player_color";
import { Username } from "../components/username";
import { isGameHistory, useGame } from "../services/game";

export function GameLog() {
  const game = useGame();
  if (isGameHistory(game)) {
    return <GameHistoryLog history={game} />;
  }
  return <ChatLog gameId={game.id} />;
}

function GameHistoryLog({ history }: { history: GameHistoryApi }) {
  const me = useMe();
  return <LogMessages messages={history.logs} currentUserId={me?.id} />;
}

interface ChatLogProps {
  gameId?: number;
}

export function ChatLog({ gameId }: ChatLogProps) {
  const { messages, isLoading, fetchNextPage, hasNextPage } =
    useMessages(gameId);
  const [newMessage, setNewMessage, setNewMessageRaw] = useTextInputState("");
  const { sendChat, isPending } = useSendChat(gameId);
  const me = useMe();

  // Filter state with localStorage persistence
  const [storedFilters, setStoredFilters] = useLocalStorage<MessageType[]>(
    "chat-filters",
  );
  const [activeFilters, setActiveFilters] = useState<Set<MessageType>>(() => {
    if (storedFilters && storedFilters.length > 0) {
      return new Set(storedFilters);
    }
    // Default: all filters enabled
    return new Set(getAllMessageTypes());
  });

  // Toggle filter handler
  const handleToggleFilter = useCallback(
    (type: MessageType) => {
      setActiveFilters((prev) => {
        const next = new Set(prev);
        if (next.has(type)) {
          next.delete(type);
        } else {
          next.add(type);
        }
        // Persist to localStorage
        setStoredFilters(Array.from(next));
        return next;
      });
    },
    [setStoredFilters],
  );

  // Filter messages by active types
  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        const type = detectMessageType(message);
        return activeFilters.has(type);
      }),
    [messages, activeFilters],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      sendChat(newMessage, () => setNewMessageRaw(""));
    },
    [newMessage, sendChat, setNewMessageRaw],
  );

  return (
    <div className={styles.chat}>
      <FilterControls
        activeFilters={activeFilters}
        onToggle={handleToggleFilter}
      />
      <LogMessages
        messages={filteredMessages}
        allMessages={messages}
        fetchNextPage={hasNextPage ? fetchNextPage : undefined}
        disableNextPage={isLoading}
        currentUserId={me?.id}
      />
      <Form onSubmit={onSubmit} className={styles.submitForm}>
        <Input
          fluid
          className={styles.submitInput}
          type="text"
          maxLength={255}
          placeholder="Send message"
          value={newMessage}
          onChange={setNewMessage}
          disabled={isPending}
        />
        <Button
          primary
          style={{ marginLeft: "1em" }}
          size="mini"
          type="submit"
          disabled={isPending}
        >
          Send
        </Button>
      </Form>
    </div>
  );
}

const USER_MESSAGE_PARSER = /<@(user|game)-(\d+)>/g;
const PLAYER_COLOR_PARSER = /\((red|yellow|green|purple|black|blue|brown|white|pink)\)/gi;

const PLAYER_COLOR_LOOKUP: Record<string, PlayerColor> = {
  red: PlayerColor.RED,
  yellow: PlayerColor.YELLOW,
  green: PlayerColor.GREEN,
  purple: PlayerColor.PURPLE,
  black: PlayerColor.BLACK,
  blue: PlayerColor.BLUE,
  brown: PlayerColor.BROWN,
  white: PlayerColor.WHITE,
  pink: PlayerColor.PINK,
};

interface Container {
  type: string;
  id: number;
}

interface PlayerColorContainer {
  type: "playerColor";
  colorName: string;
  playerColor: PlayerColor;
}

function parseColorsInText(text: string): Array<string | PlayerColorContainer> {
  const parts: Array<string | PlayerColorContainer> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(PLAYER_COLOR_PARSER)) {
    const colorName = match[1].toLowerCase();
    const playerColor = PLAYER_COLOR_LOOKUP[colorName];
    if (playerColor == null) {
      continue;
    }

    parts.push(text.substring(lastIndex, match.index));
    parts.push({
      type: "playerColor",
      colorName,
      playerColor,
    });
    lastIndex = match.index + match[0].length;
  }

  parts.push(text.substring(lastIndex));
  return parts;
}

function LogMessage({ message, currentUserId }: { message: string; currentUserId?: number }) {
  const messageParsed = useMemo(() => {
    const parts: Array<string | Container | PlayerColorContainer> = [];
    let lastIndex = 0;
    for (const match of message.matchAll(USER_MESSAGE_PARSER)) {
      parts.push(...parseColorsInText(message.substring(lastIndex, match.index)));
      parts.push({ type: match[1], id: Number(match[2]) });
      lastIndex = match.index + match[0].length;
    }
    parts.push(...parseColorsInText(message.substring(lastIndex)));
    return parts;
  }, [message]);

  return (
    <>
      {messageParsed.map((part, index) => {
        const isMentionedUser = typeof part !== "string" && part.type === "user" && part.id === currentUserId;
        return (
          <span key={index} className={isMentionedUser ? styles.mentionedUser : undefined}>
            {typeof part === "string" ? (
              part
            ) : part.type === "playerColor" ? (
              <span
                className={styles.playerColorToken}
                role="img"
                aria-label={`player color ${part.colorName}`}
                title={`Player color: ${part.colorName}`}
              >
                <Icon
                  name="circle"
                  className={`${styles.playerColorCircle} ${getPlayerColorCss(part.playerColor)}`}
                  aria-hidden="true"
                />
              </span>
            ) : part.type === "game" ? (
              <a href={`/app/games/${part.id}`}>Game #{part.id}</a>
            ) : (
              <Username userId={part.id} useAt={true} useLink={true} />
            )}
          </span>
        );
      })}
    </>
  );
}

interface LogMessagesProps {
  messages: MessageApi[];
  allMessages?: MessageApi[];
  fetchNextPage?: () => void;
  disableNextPage?: boolean;
  currentUserId?: number;
}

// Simple classnames helper
function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function LogMessages({
  messages,
  allMessages,
  fetchNextPage,
  disableNextPage,
  currentUserId,
}: LogMessagesProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [canScrollToBottom, setCanScrollToBottom] = useState(false);
  const { stayScrolled, isScrolled, scrollBottom } = useStayScrolled(ref);

  const onScroll = useCallback(() => {
    setCanScrollToBottom(!isScrolled());
  }, [isScrolled, setCanScrollToBottom]);

  useLayoutEffect(() => {
    // Tell the user to scroll down to see the newest messages if the element wasn't scrolled down
    stayScrolled();
    setCanScrollToBottom(!isScrolled());
  }, [isScrolled, setCanScrollToBottom, messages.length]);

  const hasMessages = messages.length > 0;
  const hasFilteredOutMessages = allMessages && allMessages.length > messages.length;

  return (
    <div className={styles.logContainer}>
      <div className={styles.logList} ref={ref} onScroll={onScroll}>
        {fetchNextPage != null && (
          <button
            onClick={fetchNextPage}
            disabled={disableNextPage}
            className={styles.loadMoreButton}
          >
            Load More
          </button>
        )}
        {hasMessages ? (
          messages.map((log, index) => {
            const dateString = log.date.toLocaleDateString();
            const isNewDay =
              index == 0 ||
              dateString !== messages[index - 1].date.toLocaleDateString();
            
            // Detect message type and mention
            const messageType = detectMessageType(log);
            const isMentioned = messageType === MessageType.CHAT && containsMentionOfUser(log.message, currentUserId);
            const typeClassName = MessageType[messageType];
            
            return (
              <Fragment key={log.id}>
                {isNewDay && <p className={styles.dateChange}>-- {dateString} --</p>}
                <p
                  className={cx(
                    styles.logLine,
                    styles[typeClassName],
                    isMentioned && styles.mentionHighlight,
                  )}
                >
                  <span className={styles.time}>{timeFormat(log.date)}</span>{" "}
                  {log.userId != null && (
                    <>
                      <span className={styles.username}>
                        <Username userId={log.userId} useLink={true} />
                      </span>
                      :
                    </>
                  )}{" "}
                  <span>
                    <LogMessage message={log.message} currentUserId={currentUserId} />
                  </span>
                </p>
              </Fragment>
            );
          })
        ) : hasFilteredOutMessages ? (
          <div className={styles.emptyState}>
            No messages match current filters. Enable more filters to see messages.
          </div>
        ) : null}
      </div>
      {canScrollToBottom && (
        <div className={styles.scrollToBottomContainer}>
          <Popup
            content="Scroll to bottom"
            trigger={
              <Button primary size="small" icon circular onClick={scrollBottom}>
                <Icon name="arrow down" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
