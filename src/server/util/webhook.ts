import axios from "axios";
import {
  CustomDiscordWebHookSetting,
  DiscordWebHookSetting,
  NotificationMethod,
  NotificationPreferences,
  WebHookOption,
  WebHookSetting,
} from "../../api/notifications";
import { MapRegistry } from "../../maps/registry";
import { assertNever } from "../../utils/validate";
import { environment } from "./environment";
import {
  TestTurnNotifySetting,
  TurnNotifyService,
  TurnNotifySetting,
} from "./notify";

type AnyWebHookSetting =
  | WebHookSetting
  | CustomDiscordWebHookSetting
  | DiscordWebHookSetting;

abstract class BaseWebHookNotifier
  implements TurnNotifyService<AnyWebHookSetting>
{
  sendTurnReminder(
    setting: TurnNotifySetting<AnyWebHookSetting>,
  ): Promise<void> {
    const { game } = setting;
    const mapName = MapRegistry.singleton.get(game.gameKey).name;
    const message = `Your turn in [${game.name} (${mapName}): ${game.summary!}](https://www.choochoo.games/app/games/${game.id})`;
    return this.callWebhook(
      message,
      setting.notificationPreferences,
      setting.turnNotificationSetting,
    );
  }

  sendGameEndNotification(
    setting: TurnNotifySetting<AnyWebHookSetting>,
  ): Promise<void> {
    const mapName = MapRegistry.singleton.get(setting.game.gameKey).name;
    const message = `The game [${setting.game.name} (${mapName})](https://www.choochoo.games/app/games/${setting.game.id}) has ended.`;
    return this.callWebhook(
      message,
      setting.notificationPreferences,
      setting.turnNotificationSetting,
    );
  }

  sendTestNotification(
    setting: TestTurnNotifySetting<AnyWebHookSetting>,
  ): Promise<void> {
    const message = `Test Message from Choo Choo Games.`;
    return this.callWebhook(
      message,
      setting.notificationPreferences,
      setting.turnNotificationSetting,
    );
  }

  private async callWebhook(
    message: string,
    preferences: NotificationPreferences,
    setting: AnyWebHookSetting,
  ): Promise<void> {
    const webHookUrl = toUrl(setting);
    const webHookUserId = toUserId(preferences, setting);
    const encodedMessage = `<${getNotifyPrefix(webHookUrl)}${webHookUserId}> ${message}`;

    await this.post(webHookUrl, getPayload(webHookUrl, encodedMessage));
  }

  protected abstract post(url: string, payload: object): Promise<void>;
}

class NoopWebHookNotifier extends BaseWebHookNotifier {
  protected async post(url: string, payload: object): Promise<void> {
    console.log(`submitting webhook (${url}), ${JSON.stringify(payload)}`);
  }
}

class AxiosWebHookNotifier extends BaseWebHookNotifier {
  protected async post(url: string, payload: object): Promise<void> {
    await axios.post(url, payload);
  }
}

export const webHookNotifier =
  environment.stage !== "production"
    ? new NoopWebHookNotifier()
    : new AxiosWebHookNotifier();

function toUserId(
  preferences: NotificationPreferences,
  setting: AnyWebHookSetting,
) {
  switch (setting.method) {
    case NotificationMethod.DISCORD:
    case NotificationMethod.CUSTOM_DISCORD:
      return preferences.discordId!;
    case NotificationMethod.WEBHOOK:
      return setting.webHookUserId;
    default:
      assertNever(setting);
  }
}

function toUrl(setting: AnyWebHookSetting): string {
  if (
    setting.method === NotificationMethod.WEBHOOK ||
    setting.method === NotificationMethod.CUSTOM_DISCORD
  ) {
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
