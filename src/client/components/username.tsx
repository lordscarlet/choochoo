import { isNotNull } from "../../utils/functions";
import { useUsers, useUserUnsuspended } from "../services/user";

interface UsernameProps {
  userId: number;
  suspense?: boolean;
}

export function Username({ userId }: UsernameProps) {
  const { data, isPending } = useUserUnsuspended(userId);

  return <>
    {isPending ? '<Loading>' : data?.body.user.username != null ? data?.body.user.username : '<Unknown>'}
  </>;
}

interface UsernameListProps {
  userIds: number[];
}

export function UsernameList({ userIds }: UsernameListProps) {
  const users = useUsers(userIds);

  return <>
    {users.filter(isNotNull).map(({ username }, index) => <span key={username}>{index !== 0 && ', '}{username}</span>)}
  </>
}