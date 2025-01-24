import { createExpressEndpoints, initServer } from "@ts-rest/express";

import express from "express";
import {
  NotificationMethod,
  notificationsContract,
} from "../../api/notifications";
import { assert } from "../../utils/validate";
import { emailService } from "../util/email";
import { assertRole } from "../util/enforce_role";
import { sendTestMessage } from "../util/turn_notification";
import { UserDao } from "./dao";

export const notificationApp = express();

const router = initServer().router(notificationsContract, {
  async get({ req }) {
    await assertRole(req);
    const user = await UserDao.findByPk(req.session.userId);

    assert(user != null);
    return { status: 200, body: { preferences: user.notificationPreferences } };
  },
  async update({ req, body }) {
    await assertRole(req);

    // For now, prevent email.
    assert(body.preferences.turnNotifications.length <= 1);
    assert(
      body.preferences.turnNotifications[0]?.method !==
        NotificationMethod.EMAIL,
    );

    const user = await UserDao.findByPk(req.session.userId);

    assert(user != null);
    await user.setNotificationPreferences(body.preferences);

    return { status: 200, body: { preferences: user.notificationPreferences } };
  },
  async test({ req, body }) {
    await assertRole(req);
    await sendTestMessage(
      req.session.userId!,
      body.preferences.turnNotifications[0],
    );
    return { status: 200, body: { success: true } };
  },
  async unsubscribe({ body }) {
    const email = await emailService.decryptUnsubscribeCode(
      body.unsubscribeCode,
    );
    assert(email != null, { invalidInput: true });
    await UserDao.unsubscribe(email);
    return { status: 200, body: { success: true } };
  },
});

createExpressEndpoints(notificationsContract, router, notificationApp);
