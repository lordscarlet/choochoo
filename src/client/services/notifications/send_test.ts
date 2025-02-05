import { useNotifications } from "@toolpad/core";
import { useCallback } from "react";
import { NotificationPreferences } from "../../../api/notifications";
import { tsr } from "../client";
import { handleError } from "../network";

export function useSendTestNotification() {
  const { mutate, error, isPending } = tsr.notifications.test.useMutation();
  const validationError = handleError(isPending, error);
  const notifications = useNotifications();

  const test = useCallback(
    (preferences: NotificationPreferences) =>
      mutate(
        {
          body: { preferences },
        },
        {
          onSuccess: () => {
            notifications.show("Success", {
              autoHideDuration: 2000,
              severity: "success",
            });
          },
        },
      ),
    [mutate],
  );

  return { test, isPending, validationError };
}
