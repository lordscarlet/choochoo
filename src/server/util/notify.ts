import { GameApi } from "../../api/game";
import {
  NotificationPreferences,
  TurnNotificationSetting,
} from "../../api/notifications";
import { MyUserApi } from "../../api/user";

export interface TestTurnNotifySetting<T extends TurnNotificationSetting> {
  user: MyUserApi;
  notificationPreferences: NotificationPreferences;
  turnNotificationSetting: T;
}

export interface TurnNotifySetting<T extends TurnNotificationSetting>
  extends TestTurnNotifySetting<T> {
  game: GameApi;
}

export interface TurnNotifyService<T extends TurnNotificationSetting> {
  sendTurnReminder(setting: TurnNotifySetting<T>): Promise<void>;

  sendGameEndNotification(setting: TurnNotifySetting<T>): Promise<void>;

  sendTestNotification(setting: TestTurnNotifySetting<T>): Promise<void>;

  sendChatMention(setting: TurnNotifySetting<T>): Promise<void>;
}
