import { Link } from "react-router-dom";
import { isNotNull } from "../../utils/functions";
import { useUsers, useUserUnsuspended } from "../services/user";
import * as styles from "./username.module.css";

interface UsernameProps {
  userId: number | string;
  useAt?: boolean;
  useLink?: boolean;
  suspense?: boolean;
}

export function Username({ userId, useAt, useLink }: UsernameProps) {
  // For string player IDs (hotseat players), render directly without API call
  if (typeof userId === "string") {
    return <>{(useAt ? "@" : "") + userId}</>;
  }

  // For numeric user IDs, fetch from API
  const { data, isPending } = useUserUnsuspended(userId);

  return (
    <>
      {isPending ? (
        "<Loading>"
      ) : data?.body.user.username != null ? (
        <MaybeLink
          username={data.body.user.username}
          userId={userId}
          useAt={useAt}
          useLink={useLink}
        />
      ) : (
        "<Unknown>"
      )}
    </>
  );
}

interface MaybeLinkProps {
  username: string;
  userId: number;
  useAt?: boolean;
  useLink?: boolean;
}

function MaybeLink({ username, userId, useAt, useLink }: MaybeLinkProps) {
  const content = (useAt ? "@" : "") + username;
  if (!useLink) {
    return <>{content}</>;
  }
  return (
    <Link to={`/app/users/${userId}`} className={styles.link}>
      {content}
    </Link>
  );
}

interface UsernameListProps {
  userIds: (number | string)[];
  useLink?: boolean;
}

export function UsernameList({ userIds, useLink }: UsernameListProps) {
  // Separate numeric and string IDs for useUsers query
  const numericIds = userIds.filter((id): id is number => typeof id === "number");

  const users = useUsers(numericIds);

  // Combine users and string IDs in original order
  const allNames = userIds.map((id) => {
    if (typeof id === "string") {
      return { id, username: id, isString: true };
    } else {
      const user = users.find((u) => u?.id === id);
      return user ? { ...user, isString: false } : null;
    }
  }).filter(isNotNull);

  return (
    <>
      {allNames.map(({ id, username, isString }, index) => (
        <span key={`${id}-${username}`}>
          {index !== 0 && ", "}
          {isString ? (
            <>{username}</>
          ) : (
            <MaybeLink username={username} userId={id as number} useLink={useLink} />
          )}
        </span>
      ))}
    </>
  );
}
