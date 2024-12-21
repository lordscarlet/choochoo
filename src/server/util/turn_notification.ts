import axios from 'axios';
import { URL } from "url";
import { NotificationFrequency, NotificationMethod, WebHookSetting } from "../../api/notifications";
import { assertNever } from "../../utils/validate";
import { GameModel } from "../model/game";
import { UserModel } from "../model/user";
import { emailService } from "./email";
import { environment } from './environment';

export async function notifyTurn(game: GameModel): Promise<void> {
  if (game.activePlayerId === null) return;

  const user = await UserModel.findByPk(game.activePlayerId!, { transaction: null });
  if (user == null) return;
  const setting = user.getTurnNotificationSetting(NotificationFrequency.IMMEDIATELY);
  switch (setting?.method) {
    case NotificationMethod.EMAIL:
      return emailService.sendTurnReminder(user, game.toApi());
    case NotificationMethod.WEBHOOK:
      return callWebhook(game, setting);
    case undefined:
      return;
    default:
      assertNever(setting);
  }
}

async function callWebhook(game: GameModel, setting: WebHookSetting): Promise<void> {
  if (environment.stage !== 'production') return;
  const message = `Your turn in ${game.name} (${game.getSummary()!})\nhttps://www.choochoo.games/app/games/${game.id}`;

  const encodedMessage =
    `<${getNotifyPrefix(setting.webHookUrl)}${setting.webHookUserId}> ${message}`;

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

function getPayload(urlStr: string, message: string): {} {
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