import { initClient } from "@ts-rest/core";
import { messageContract } from "../../api/message";

export const messageClient = initClient(messageContract, {
  baseUrl: '/api',
  baseHeaders: { 'Content-Type': 'application/json' },
});
