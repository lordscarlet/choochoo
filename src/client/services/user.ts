import { UserApi } from "../../api/user";
import { tsr } from "./client";

export function useUsers(userIds: string[]): UserApi[] | undefined {
  const { data } = tsr.users.get.useQueries({
    queries: userIds.map((userId) => ({
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
  const results = data.map((data) => data?.body.user);
  if (!results.every((r) => r != null)) return undefined;
  return results;
}