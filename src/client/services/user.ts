import { initClient } from "@ts-rest/core";
import { userContract } from "../../api/user";

export const userClient = initClient(userContract, {
  baseUrl: '/api/users',
  baseHeaders: {'Content-Type': 'application/json'},
});
