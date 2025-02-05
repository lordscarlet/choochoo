import { tsr } from "../client";

export const queryKey = ["notification-preferences"];

export function useNotificationPreferences() {
  const { data } = tsr.notifications.get.useSuspenseQuery({ queryKey });

  return data.body.preferences;
}
