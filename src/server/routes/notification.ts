import { createExpressEndpoints, initServer } from "@ts-rest/express";

import express from 'express';
import { notificationsContract } from "../../api/notifications";
import { assert } from "../../utils/validate";
import { UserModel } from "../model/user";
import { emailService } from "../util/email";

export const notificationApp = express();

const router = initServer().router(notificationsContract, {
  async unsubscribe({ body }) {
    const email = await emailService.decryptUnsubscribeCode(body.unsubscribeCode);
    assert(email != null, { invalidInput: true });
    await Promise.all([
      emailService.unsubscribe(email),
      UserModel.unsubscribe(email),
    ]);
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(notificationsContract, router, notificationApp);