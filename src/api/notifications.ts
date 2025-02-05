import { initContract } from "@ts-rest/core";
import z from "zod";

export enum NotificationMethod {
  EMAIL = 1,
  WEBHOOK,
  DISCORD,
}

export enum NotificationFrequency {
  IMMEDIATELY = 1,
}

export enum WebHookOption {
  AOS = 1,
  EOT,
}
export const WebHookOptionZod = z.nativeEnum(WebHookOption);

export const EmailSetting = z.object({
  method: z.literal(NotificationMethod.EMAIL),
  frequency: z.nativeEnum(NotificationFrequency),
});
export type EmailSetting = z.infer<typeof EmailSetting>;

export const DiscordWebHookSetting = z.object({
  method: z.literal(NotificationMethod.DISCORD),
  frequency: z.nativeEnum(NotificationFrequency),
  option: WebHookOptionZod.or(z.string()),
});
export type DiscordWebHookSetting = z.infer<typeof DiscordWebHookSetting>;

// Copied from 18xx.games.
// See https://github.com/tobymao/18xx/wiki/Notifications
export const WebHookSetting = z.object({
  method: z.literal(NotificationMethod.WEBHOOK),
  frequency: z.nativeEnum(NotificationFrequency),
  webHookUrl: z.string().min(1).url(),
  webHookUserId: z.string().min(1),
});
export type WebHookSetting = z.infer<typeof WebHookSetting>;

export const TurnNotificationSetting = z.discriminatedUnion("method", [
  WebHookSetting,
  EmailSetting,
  DiscordWebHookSetting,
]);
export type TurnNotificationSetting = z.infer<typeof TurnNotificationSetting>;

export function isWebHookSetting(
  value: TurnNotificationSetting,
): value is WebHookSetting {
  return value.method === NotificationMethod.WEBHOOK;
}

export function isDirectWebHookSetting(
  value: TurnNotificationSetting,
  option?: WebHookOption,
): value is DiscordWebHookSetting {
  return (
    value.method === NotificationMethod.DISCORD &&
    (option == null || value.option === option)
  );
}

export const SetNotificationPreferences = z.object({
  turnNotifications: z.array(TurnNotificationSetting),
  // Mailjet is the source of truth for this field.
  marketing: z.boolean(),
  discordId: z.string().optional(),
});
export type SetNotificationPreferences = z.infer<
  typeof SetNotificationPreferences
>;

export const NotificationPreferences = SetNotificationPreferences.extend({
  discordId: z.string().optional(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferences>;

export const notificationsContract = initContract().router({
  get: {
    responses: {
      200: z.object({ preferences: NotificationPreferences }),
    },
    method: "GET",
    path: "/notification-preferences",
  },
  update: {
    body: z.object({
      preferences: SetNotificationPreferences,
    }),
    responses: {
      200: z.object({ preferences: NotificationPreferences }),
    },
    method: "PUT",
    path: "/notification-preferences",
  },
  linkDiscord: {
    body: z.object({ accessToken: z.string() }),
    responses: {
      200: z.object({ preferences: NotificationPreferences }),
    },
    method: "PUT",
    path: "/discord",
  },
  test: {
    body: z.object({ preferences: NotificationPreferences }),
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    method: "PUT",
    path: "/test",
  },
  unsubscribe: {
    body: z.object({ unsubscribeCode: z.string() }),
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    method: "POST",
    path: "/notification-preferences/unsubscribe",
  },
});
