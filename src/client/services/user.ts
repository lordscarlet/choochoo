import { useMemo } from "react";
import { UserApi } from "../../api/user";
import { tsr } from "./client";

export function useUsers(userIds: number[]): UserApi[] {
  const deduplicate = useMemo(() => [...new Set(userIds)], [userIds])
  const { data } = tsr.users.get.useSuspenseQueries({
    queries: deduplicate.map((userId) => ({
      queryKey: ['users', userId],
      queryData: { params: { userId } },
    })),
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      }
    },
  });
  return useMemo(() => {
    const users = data.map(({ body }) => body.user);
    return userIds.map(userId => users.find(({ id }) => id === userId)!);
  }, [userIds, data]);
}