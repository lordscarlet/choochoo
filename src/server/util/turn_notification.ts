import axios from 'axios';
import { URL } from "url";
import { NotificationFrequency, NotificationMethod, TurnNotificationSetting, WebHookSetting } from "../../api/notifications";
import { assert, assertNever } from "../../utils/validate";
import { GameDao } from "../game/dao";
import { UserDao } from "../user/dao";
import { emailService } from "./email";
import { environment } from './environment';

export async function notifyTurn(game: GameDao): Promise<void> {
  if (game.activePlayerId === null) return;

  const user = await UserDao.findByPk(game.activePlayerId!, { transaction: null });
  if (user == null) return;
  const setting = user.getTurnNotificationSetting(NotificationFrequency.IMMEDIATELY);
  switch (setting?.method) {
    case NotificationMethod.EMAIL:
      return emailService.sendTurnReminder(user, game.toApi());
    case NotificationMethod.WEBHOOK: {
      const message = `Your turn in ${game.name} (${game.getSummary()!})\nhttps://www.choochoo.games/app/games/${game.id}`;
      return callWebhook(message, setting);
    }
    case undefined:
      return;
    default:
      assertNever(setting);
  }
}

export async function sendTestMessage(userId: number, setting: TurnNotificationSetting | undefined): Promise<void> {
  switch (setting?.method) {
    case NotificationMethod.EMAIL: {
      const user = await UserDao.getUser(userId);
      assert(user != null);
      return emailService.sendTestNotification(user);
    }
    case NotificationMethod.WEBHOOK: {
      const message = `Test Message from Choo Choo Games.`;
      return callWebhook(message, setting);
    }
    case undefined:
      return;
    default:
      assertNever(setting);
  }
}

export async function callWebhook(message: string, setting: WebHookSetting): Promise<void> {

  const encodedMessage =
    `<${getNotifyPrefix(setting.webHookUrl)}${setting.webHookUserId}> ${message}`;

  if (environment.stage !== 'production') {
    console.log(`submitting webhook (${setting.webHookUrl}), "${encodedMessage}"`);
    return;
  }

  await axios.post(setting.webHookUrl, getPayload(setting.webHookUrl, encodedMessage));
}

function getNotifyPrefix(urlStr: string): string {
  const url = new URL(urlStr);
  switch (url.host) {
    case 'chat.googleapis.com':
      return 'users/';
    default:
      return '@';
  }
}

function getPayload(urlStr: string, message: string): object {
  const url = new URL(urlStr);
  switch (url.host) {
    case 'discord.com':
    case 'discordapp.com':
      return {
        content: message,
        allowed_mentions: { parse: ['users'] },
      };
    default:
      return { text: message };
  }
}