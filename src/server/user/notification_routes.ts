import { createExpressEndpoints, initServer } from "@ts-rest/express";

import axios from "axios";
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
    const myUser = await assertRole(req);
    const user = await UserDao.findByPk(myUser.id);

    assert(user != null);
    return { status: 200, body: { preferences: user.notificationPreferences } };
  },
  async update({ req, body }) {
    const myUser = await assertRole(req);

    const user = await UserDao.findByPk(myUser.id);

    assert(user != null);
    await user.setNotificationPreferences(body.preferences);

    return { status: 200, body: { preferences: user.notificationPreferences } };
  },

  async linkDiscord({ req, body }) {
    const myUser = await assertRole(req);

    const { accessToken } = body;

    const result = await axios.get("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const discordId = result.data.id;

    const user = await UserDao.findByPk(myUser.id);

    assert(user != null);
    user.notificationPreferences = {
      ...user.notificationPreferences,
      discordId,
    };
    await user.save();

    return { status: 200, body: { preferences: user.notificationPreferences } };
  },

  async unlinkDiscord({ req }) {
    const myUser = await assertRole(req);

    const user = await UserDao.findByPk(myUser.id);

    assert(user != null);
    user.notificationPreferences = {
      ...user.notificationPreferences,
      turnNotifications: user.notificationPreferences.turnNotifications.filter(
        (not) =>
          not.method !== NotificationMethod.DISCORD &&
          not.method !== NotificationMethod.CUSTOM_DISCORD,
      ),
      discordId: undefined,
    };
    await user.save();

    return { status: 200, body: { preferences: user.notificationPreferences } };
  },

  async test({ req, body }) {
    await assertRole(req);
    await sendTestMessage(req.session.userId!, body.preferences);
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
