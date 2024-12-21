import { createExpressEndpoints, initServer } from "@ts-rest/express";

import express from 'express';
import { notificationsContract } from "../../api/notifications";
import { assert } from "../../utils/validate";
import { UserModel } from "../model/user";
import { emailService } from "../util/email";
import { enforceRole } from "../util/enforce_role";
import { sendTestMessage } from "../util/turn_notification";

export const notificationApp = express();

const router = initServer().router(notificationsContract, {
  async get({ req }) {
    await enforceRole(req);
    const user = await UserModel.findByPk(req.session.userId);

    assert(user != null);
    return { status: 200, body: { preferences: user.notificationPreferences } };
  },
  async update({ req, body }) {
    await enforceRole(req);
    const user = await UserModel.findByPk(req.session.userId);

    assert(user != null);
    await user.setNotificationPreferences(body.preferences);

    return { status: 200, body: { preferences: user.notificationPreferences } };
  },
  async test({ req, body }) {
    await enforceRole(req);
    await sendTestMessage(req.session.userId!, body.preferences.turnNotifications[0]);
    return { status: 200, body: { success: true } };
  },
  async unsubscribe({ body }) {
    const email = await emailService.decryptUnsubscribeCode(body.unsubscribeCode);
    assert(email != null, { invalidInput: true });
    await UserModel.unsubscribe(email);
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(notificationsContract, router, notificationApp);