import axios from "axios";
import { URL } from "url";
import {
  DirectWebHookSetting,
  NotificationFrequency,
  NotificationMethod,
  TurnNotificationSetting,
  WebHookOption,
  WebHookSetting,
} from "../../api/notifications";
import { assert, assertNever } from "../../utils/validate";
import { GameDao } from "../game/dao";
import { UserDao } from "../user/dao";
import { emailService } from "./email";
import { environment } from "./environment";

export async function notifyTurn(game: GameDao): Promise<void> {
  if (game.activePlayerId === null) return;

  const user = await UserDao.findByPk(game.activePlayerId!, {
    transaction: null,
  });
  if (user == null) return;
  const settings = user.getTurnNotificationSettings(
    NotificationFrequency.IMMEDIATELY,
  );
  await Promise.all(
    settings.map((setting) => {
      switch (setting?.method) {
        case NotificationMethod.EMAIL:
          return emailService.sendTurnReminder(user, game.toApi());
        case NotificationMethod.DIRECT_WEBHOOK:
        case NotificationMethod.WEBHOOK: {
          const message = `Your turn in ${game.name} [${game.getSummary()!}](https://www.choochoo.games/app/games/${game.id})`;
          return callWebhook(message, setting);
        }
        case undefined:
          return;
        default:
          assertNever(setting);
      }
    }),
  );
}

export async function sendTestMessage(
  userId: number,
  settings: TurnNotificationSetting[],
): Promise<void> {
  const user = await UserDao.getUser(userId);
  assert(user != null);
  await Promise.all(
    settings.map(async (setting) => {
      switch (setting?.method) {
        case NotificationMethod.EMAIL: {
          return emailService.sendTestNotification(user);
        }
        case NotificationMethod.WEBHOOK:
        case NotificationMethod.DIRECT_WEBHOOK: {
          const message = `Test Message from Choo Choo Games.`;
          return callWebhook(message, setting);
        }
        case undefined:
          return;
        default:
          assertNever(setting);
      }
    }),
  );
}

export async function callWebhook(
  message: string,
  setting: WebHookSetting | DirectWebHookSetting,
): Promise<void> {
  const webHookUrl = toUrl(setting);
  const encodedMessage = `<${getNotifyPrefix(webHookUrl)}${setting.webHookUserId}> ${message}`;

  if (environment.stage !== "production") {
    console.log(`submitting webhook (${webHookUrl}), "${encodedMessage}"`);
    return;
  }

  await axios.post(webHookUrl, getPayload(webHookUrl, encodedMessage));
}

function toUrl(setting: WebHookSetting | DirectWebHookSetting): string {
  if (setting.method === NotificationMethod.WEBHOOK) {
    return setting.webHookUrl;
  }
  switch (setting.option) {
    case WebHookOption.AOS:
      return "https://discord.com/api/webhooks/1333509087849087047/ljD50Bvi7ZiKuYdi1WNGdhvtcePzbQ88mh0CTX8J9eBz8ji6aJ7Xo3Fcjvtkq3WAQNEv";
    case WebHookOption.EOT:
      return "https://discord.com/api/webhooks/1333499625759572129/wAl78ONZ57T9J7c72n8-cjUT-mpjls3t7X8ql1GDTe6lpD49D9vfU1HM2GglxGruQZPV";
    default:
      assertNever(setting.option);
  }
}

function getNotifyPrefix(urlStr: string): string {
  const url = new URL(urlStr);
  switch (url.host) {
    case "chat.googleapis.com":
      return "users/";
    default:
      return "@";
  }
}

function getPayload(urlStr: string, message: string): object {
  const url = new URL(urlStr);
  switch (url.host) {
    case "discord.com":
    case "discordapp.com":
      return {
        content: message,
        allowed_mentions: { parse: ["users"] },
      };
    default:
      return { text: message };
  }
}
