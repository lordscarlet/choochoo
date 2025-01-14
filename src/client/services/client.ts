import { ApiFetcherArgs, ClientArgs, initClient, initContract, tsRestFetchApi } from '@ts-rest/core';
import { initTsrReactQuery } from '@ts-rest/react-query/v5';
import { feedbackContract } from '../../api/feedback';
import { gameContract } from '../../api/game';
import { messageContract } from '../../api/message';
import { notificationsContract } from '../../api/notifications';
import { userContract } from '../../api/user';
import { ErrorCode } from '../../utils/error_code';
import { environment } from './environment';
import { isErrorBody, isNetworkError } from './network';
import { autoActionContract } from '../../api/auto_action';

const c = initContract();

export const contract = c.router({
  games: gameContract,
  messages: messageContract,
  users: userContract,
  feedback: feedbackContract,
  notifications: notificationsContract,
  autoActions: autoActionContract,
}, {
  validateResponse: true,
  commonResponses: {
    400: c.type<{ error: string }>(),
  },
});

let xsrfToken = generateXsrfToken();

async function generateXsrfToken(): Promise<string> {
  const result = await fetch(`${environment.apiHost}/api/xsrf`, { credentials: 'include' });
  const response = await result.json();
  return response.xsrfToken;
}

export const clientArgs: ClientArgs = {
  baseUrl: `${environment.apiHost}/api`,
  baseHeaders: {
    'x-app-source': 'ts-rest',
  },
  credentials: 'include',
  async api(args: ApiFetcherArgs) {
    const response = await attemptApi(args);
    if (!isNetworkError(response)) return response;
    if (!isErrorBody(response.body)) return response;
    if (response.body.code !== ErrorCode.INVALID_XSRF_TOKEN) return response;

    xsrfToken = generateXsrfToken();
    return attemptApi(args);
  }
};

async function attemptApi(args: ApiFetcherArgs): Promise<ReturnType<typeof tsRestFetchApi>> {
  args.headers['xsrf-token'] = await xsrfToken;
  return tsRestFetchApi(args);
}

export const networkClient = initClient(contract, clientArgs);

export const tsr = initTsrReactQuery(contract, clientArgs);