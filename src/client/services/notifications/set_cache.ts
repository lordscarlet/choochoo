import { useCallback } from "react";
import { NotificationPreferences } from "../../../api/notifications";
import { tsr } from "../client";
import { queryKey } from "./preferences";

export function useSetNotificationPreferencesCache() {
  const tsrQueryClient = tsr.useQueryClient();

  return useCallback((preferences: NotificationPreferences) => {
    tsrQueryClient.notifications.get.setQueryData(queryKey, () => ({
      headers: new Headers(),
      status: 200,
      body: { preferences },
    }));
  }, []);
}
