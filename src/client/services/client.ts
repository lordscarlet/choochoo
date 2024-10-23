import { AppRoute, ClientArgs, initClient, initContract } from '@ts-rest/core';
import { initTsrReactQuery, QueryHooks, UseSuspenseQueryOptions } from '@ts-rest/react-query/v5';
import { v4 as uuid } from 'uuid';
import { gameContract } from '../../api/game';
import { messageContract } from '../../api/message';
import { userContract } from '../../api/user';
import { assert } from '../../utils/validate';

const c = initContract();

export const contract = c.router({
  games: gameContract,
  messages: messageContract,
  users: userContract,
});

export const clientArgs = {
  baseUrl: '/api',
  baseHeaders: {
    'x-app-source': 'ts-rest',
  },
};

export const networkClient = initClient(contract, clientArgs);

export const tsr = initTsrReactQuery(contract, clientArgs);

interface BaseGetter { }

interface NetworkResponse<T> {
  status: 200 | 201;
  body: T;
  headers: Headers;
}

interface ErrorResponse {
  status: number; body: unknown; headers: Headers;
}

interface NetworkGetResponse<T> {
  status: 200 | 201;
  body: T;
}

interface LoadedNetworkGetResponse {
  isLoading: false;
  response: undefined;
}


export function useNetworkGet<TAppRoute extends AppRoute, TClientArgs extends ClientArgs, TData>(getter: QueryHooks<TAppRoute, TClientArgs>, input: Omit<UseSuspenseQueryOptions<TAppRoute, TClientArgs, NetworkGetResponse<TData>>, 'queryKey'>): TData {
  const QUERY_KEY = [uuid()];
  // useSuspenseQuery<TData = TQueryFnData>(options: UseSuspenseQueryOptions<TAppRoute, TClientArgs, TData>, queryClient?: QueryClient): UseSuspenseQueryResult<TAppRoute, TData, TError>;

  const query = { ...input, queryKey: QUERY_KEY } as UseSuspenseQueryOptions<TAppRoute, TClientArgs, NetworkGetResponse<TData>>;

  const { data, isFetching, error } = getter.useSuspenseQuery(query);

  if (error != null && !isFetching) {
    throw error;
  }

  const { status, body } = data;

  assert(status === 200);

  return body;
}

// const user: MyUserApi = useNetworkGet(tsr.users.getMe, {});
