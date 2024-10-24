import { UserApi } from "../../api/user";
import { tsr } from "./client";

export function useUsers(userIds: string[]): UserApi[] {
  const { data } = tsr.users.get.useSuspenseQueries({
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
  return data.map((data) => data.body.user);
}