import { useNotifications } from "@toolpad/core";
import { useCallback } from "react";
import { NotificationPreferences } from "../../../api/notifications";
import { tsr } from "../client";
import { handleError } from "../network";

const queryKey = ["notification-preferences"];

export function useNotificationPreferences() {
  const { data } = tsr.notifications.get.useSuspenseQuery({ queryKey });

  return data.body.preferences;
}

export function useSetNotificationPreferences() {
  const tsrQueryClient = tsr.useQueryClient();
  const { mutate, error, isPending } = tsr.notifications.update.useMutation();
  const validationError = handleError(isPending, error);
  const notifications = useNotifications();

  const setPreferences = useCallback(
    (preferences: NotificationPreferences) =>
      mutate(
        {
          body: { preferences },
        },
        {
          onSuccess: ({ body }) => {
            tsrQueryClient.notifications.get.setQueryData(queryKey, () => ({
              headers: new Headers(),
              status: 200,
              body,
            }));
            notifications.show("Success", {
              autoHideDuration: 2000,
              severity: "success",
            });
          },
        },
      ),
    [mutate],
  );

  return { setPreferences, isPending, validationError };
}
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
