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
import { injectAllPlayersUnsafe } from "../../engine/game/state";
import { PlayerColor, playerColorToString } from "../../engine/state/player";
import { useMessages, useSendChat } from "../services/message";
import { useMe } from "../services/me";
import { useLocalStorage } from "../services/local_storage";
import { useTextInputState } from "../utils/form_state";
import { useInject } from "../utils/injection_context";
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
  const userColorLookup = useInject(() => {
    const lookup: Record<number, PlayerColor> = {};
    injectAllPlayersUnsafe()().forEach((player) => {
      lookup[player.playerId] = player.color;
    });
    return lookup;
  }, [game.id]);

  if (isGameHistory(game)) {
    return <GameHistoryLog history={game} userColorLookup={userColorLookup} />;
  }
  return <ChatLog gameId={game.id} userColorLookup={userColorLookup} />;
}

function GameHistoryLog({
  history,
  userColorLookup,
}: {
  history: GameHistoryApi;
  userColorLookup: Record<number, PlayerColor>;
}) {
  const me = useMe();
  return (
    <LogMessages
      messages={history.logs}
      currentUserId={me?.id}
      userColorLookup={userColorLookup}
    />
  );
}

interface ChatLogProps {
  gameId?: number;
  userColorLookup: Record<number, PlayerColor>;
}

export function ChatLog({ gameId, userColorLookup }: ChatLogProps) {
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
        userColorLookup={userColorLookup}
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

type ParsedMessagePart = string | Container | PlayerColorContainer;

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

function moveColorChipBeforeUser(parts: ParsedMessagePart[]): ParsedMessagePart[] {
  const reordered: ParsedMessagePart[] = [];

  for (let index = 0; index < parts.length; index++) {
    const current = parts[index];
    if (typeof current === "string" || current.type !== "user") {
      reordered.push(current);
      continue;
    }

    const next = parts[index + 1];
    const nextNext = parts[index + 2];

    if (
      typeof next === "string" &&
      /^\s+$/.test(next) &&
      typeof nextNext !== "string" &&
      nextNext.type === "playerColor"
    ) {
      reordered.push(nextNext, next, current);
      index += 2;
      continue;
    }

    if (typeof next !== "string" && next?.type === "playerColor") {
      reordered.push(next, " ", current);
      index += 1;
      continue;
    }

    reordered.push(current);
  }

  return reordered;
}

function LogMessage({
  message,
  currentUserId,
  userColorLookup,
}: {
  message: string;
  currentUserId?: number;
  userColorLookup: Record<number, PlayerColor>;
}) {
  const messageParsed = useMemo(() => {
    const parts: ParsedMessagePart[] = [];
    let lastIndex = 0;
    for (const match of message.matchAll(USER_MESSAGE_PARSER)) {
      parts.push(...parseColorsInText(message.substring(lastIndex, match.index)));
      parts.push({ type: match[1], id: Number(match[2]) });
      lastIndex = match.index + match[0].length;
    }
    parts.push(...parseColorsInText(message.substring(lastIndex)));
    return moveColorChipBeforeUser(parts);
  }, [message]);

  return (
    <>
      {messageParsed.map((part, index) => {
        const isMentionedUser = typeof part !== "string" && part.type === "user" && part.id === currentUserId;
        const previousPart = messageParsed[index - 1];
        const nextPart = messageParsed[index + 1];
        const previousPreviousPart = messageParsed[index - 2];
        const nextNextPart = messageParsed[index + 2];
        const previousIsWhitespace =
          typeof previousPart === "string" && /^\s+$/.test(previousPart);
        const nextIsWhitespace =
          typeof nextPart === "string" && /^\s+$/.test(nextPart);
        const hasAdjacentColorToken =
          (typeof previousPart !== "string" && previousPart?.type === "playerColor") ||
          (typeof nextPart !== "string" && nextPart?.type === "playerColor") ||
          (previousIsWhitespace &&
            typeof previousPreviousPart !== "string" &&
            previousPreviousPart?.type === "playerColor") ||
          (nextIsWhitespace &&
            typeof nextNextPart !== "string" &&
            nextNextPart?.type === "playerColor");
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
              <ReferencedUser
                userId={part.id}
                showColorChip={!hasAdjacentColorToken}
                playerColor={userColorLookup[part.id]}
              />
            )}
          </span>
        );
      })}
    </>
  );
}

function ReferencedUser({
  userId,
  showColorChip,
  playerColor,
}: {
  userId: number;
  showColorChip: boolean;
  playerColor?: PlayerColor;
}) {
  return (
    <>
      {showColorChip && playerColor != null && (
        <span
          className={styles.playerColorToken}
          role="img"
          aria-label={`player color ${playerColorToString(playerColor)}`}
          title={`Player color: ${playerColorToString(playerColor)}`}
        >
          <Icon
            name="circle"
            className={`${styles.playerColorCircle} ${getPlayerColorCss(playerColor)}`}
            aria-hidden="true"
          />
        </span>
      )}
      <Username userId={userId} useAt={true} useLink={true} />
    </>
  );
}

interface LogMessagesProps {
  messages: MessageApi[];
  allMessages?: MessageApi[];
  fetchNextPage?: () => void;
  disableNextPage?: boolean;
  currentUserId?: number;
  userColorLookup: Record<number, PlayerColor>;
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
  userColorLookup,
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
                    <LogMessage
                      message={log.message}
                      currentUserId={currentUserId}
                      userColorLookup={userColorLookup}
                    />
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
