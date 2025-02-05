import { useCallback, useState } from "react";
import { NotificationPreferences } from "../../../api/notifications";
import { useSuccess } from "../../utils/notify";
import { tsr } from "../client";
import { handleError } from "../network";
import { useSetNotificationPreferencesCache } from "./set_cache";

export function useSetNotificationPreferences() {
  const updateCache = useSetNotificationPreferencesCache();
  const { mutate, error, isPending } = tsr.notifications.update.useMutation();
  const validationError = handleError(isPending, error);
  const [attempted, setAttempted] = useState<
    NotificationPreferences | undefined
  >();
  const onSuccess = useSuccess();

  const setPreferences = useCallback(
    (preferences: NotificationPreferences) => {
      setAttempted(undefined);
      mutate(
        {
          body: { preferences },
        },
        {
          onError: () => {
            setAttempted(preferences);
          },
          onSuccess: ({ body }) => {
            updateCache(body.preferences);
            onSuccess();
          },
        },
      );
    },
    [mutate],
  );

  return { setPreferences, attempted, isPending, validationError };
}
