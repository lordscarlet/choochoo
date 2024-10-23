import { initClient } from "@ts-rest/core";
import { gameContract } from "../../api/game";

export const gameClient = initClient(gameContract, {
  baseUrl: '/api',
  baseHeaders: { 'Content-Type': 'application/json' },
});
