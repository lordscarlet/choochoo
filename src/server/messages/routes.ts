import { createExpressEndpoints, initServer } from "@ts-rest/express";
import express from "express";

import { Op, WhereOptions } from "@sequelize/core";
import { messageContract } from "../../api/message";
import { NotificationFrequency } from "../../api/notifications";
import { MyUserApi, UserRole } from "../../api/user";
import { isNotNull, reverse } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { GameDao } from "../game/dao";
import "../session";
import { UserDao } from "../user/dao";
import { assertRole } from "../util/enforce_role";
import { getNotifier } from "../util/turn_notification";
import { LogDao } from "./log_dao";

export const messageApp = express();

const router = initServer().router(messageContract, {
  async list({ query }) {
    const where: WhereOptions<LogDao> = {};
    where.gameId = query.gameId ?? null;
    if (query.pageCursor != null) {
      where.id = {
        [Op.lte]: query.pageCursor,
      };
    }
    const pageSize = 20;
    const modelMessages = await LogDao.findAll({
      where,
      limit: pageSize + 1,
      order: [["id", "DESC"]],
    });
    const messages = reverse(modelMessages.map((message) => message.toApi()));
    if (messages.length > pageSize) {
      const [omitted, ...rest] = messages;
      return {
        status: 200,
        body: { messages: rest, nextPageCursor: omitted.id },
      };
    } else {
      return { status: 200, body: { messages } };
    }
  },

  async sendChat({ body: { message, gameId }, req }) {
    const game = gameId != null ? await GameDao.findByPk(gameId) : undefined;
    const user = await assertRole(req);
    assert(gameId == null || game != null, {
      notFound: true,
    });

    const users = (
      await Promise.all(
        [
          ...new Set(
            [...message.matchAll(/@[a-z0-9_]*/g)].map(([username]) =>
              username.substring(1),
            ),
          ),
        ].map((username) => UserDao.findByUsername(username)),
      )
    ).filter(isNotNull);

    const refactored = users.reduce(
      (message, user) =>
        replaceAll(message, `@${user.username}`, `<@user-${user.id}>`),
      message,
    );
    const log = await LogDao.create({
      message: refactored,
      gameId,
      userId: req.session.adminUserId ?? req.session.userId,
    });

    notifyMentions(user, game, users);

    return { status: 200, body: { message: log.toApi() } };
  },
});

async function notifyMentions(
  user: MyUserApi,
  game: GameDao | null | undefined,
  users: UserDao[],
): Promise<void> {
  if (game == null || users.length === 0) return;
  if (!game.playerIds.includes(user.id) && user.role !== UserRole.enum.ADMIN) {
    return;
  }

  const filtered = users.filter(
    (user) =>
      game.playerIds.includes(user.id) || user.role === UserRole.enum.ADMIN,
  );

  await Promise.all(
    filtered.map((user) => {
      if (user == null) return;
      const settings = user.getTurnNotificationSettings(
        NotificationFrequency.IMMEDIATELY,
      );

      return Promise.all(
        settings.map((setting) =>
          getNotifier(setting).sendChatMention({
            user: user.toMyApi(),
            notificationPreferences: user.notificationPreferences,
            turnNotificationSetting: setting,
            game: game.toApi(),
          }),
        ),
      );
    }),
  );
}

function replaceAll(value: string, find: string, replace: string): string {
  let newValue = value;
  let oldValue = newValue;
  do {
    oldValue = newValue;
    newValue = newValue.replace(find, replace);
  } while (newValue !== oldValue);
  return newValue;
}

createExpressEndpoints(messageContract, router, messageApp);
