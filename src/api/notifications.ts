import { initContract } from "@ts-rest/core";
import z from "zod";

export enum NotificationMethod {
  EMAIL = 1,
}

export enum NotificationFrequency {
  IMMEDIATELY = 1,
}

export const IndividualSetting = z.object({
  method: z.nativeEnum(NotificationMethod),
  frequency: z.nativeEnum(NotificationFrequency),
});
export type IndividualSetting = z.infer<typeof IndividualSetting>;

export const NotificationPreferences = z.object({
  turnNotifications: z.array(IndividualSetting),
  // Mailjet is the source of truth for this field.
  marketing: z.boolean(),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferences>;

export const notificationsContract = initContract().router({
  unsubscribe: {
    body: z.object({ unsubscribeCode: z.string() }),
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    method: 'POST',
    path: '/notification-preferences/unsubscribe',
  },
});