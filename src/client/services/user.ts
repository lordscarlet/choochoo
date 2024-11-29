import { useCallback, useMemo, useState } from "react";
import { ListUsersApi, UserApi, UserPageCursor } from "../../api/user";
import { tsr } from "./client";
import { handleError } from "./network";

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

export function useUserList() {
  const queryWithLimit: ListUsersApi = { pageSize: 20 };
  const queryKeyFromFilter =
    Object.entries(queryWithLimit)
      .sort((a, b) => a[0] > b[0] ? 1 : -1).map(([key, value]) => `${key}:${value}`).join(',');
  const queryKey = ['userList', queryKeyFromFilter];
  const { data, isLoading, error, fetchNextPage, hasNextPage } = tsr.users.list.useInfiniteQuery({
    queryKey,
    queryData: ({ pageParam }) => ({
      query: { ...queryWithLimit, pageCursor: pageParam },
    }),
    initialPageParam: (undefined as (UserPageCursor | undefined)),
    getNextPageParam: ({ status, body }): UserPageCursor | undefined => {
      if (status !== 200) return undefined;
      return body.nextPageCursor;
    },
  });

  handleError(isLoading, error);

  const [page, setPage] = useState(0);

  const users = data?.pages[page]?.body.users;

  const isOnLastPage = data != null && !hasNextPage && data.pages.length - 1 === page;
  const nextPage = useCallback(() => {
    if (isLoading || isOnLastPage) return;
    setPage(page + 1);
    if (data != null && hasNextPage && data.pages.length - 1 === page) {
      fetchNextPage();
    }
  }, [isLoading, setPage, page, hasNextPage, data]);

  const hasPrevPage = page > 0;
  const prevPage = useCallback(() => {
    if (!hasPrevPage) return;
    setPage(page - 1);
  }, [page, setPage, page]);

  return { users, hasNextPage: !isOnLastPage, nextPage, hasPrevPage, prevPage, isLoading };
}