import { useCallback } from "react";
import { toast } from "react-toastify";
import { NotificationPreferences } from "../../../api/notifications";
import { tsr } from "../client";
import { handleError } from "../network";

export function useSendTestNotification() {
  const { mutate, error, isPending } = tsr.notifications.test.useMutation();
  const validationError = handleError(isPending, error);

  const test = useCallback(
    (preferences: NotificationPreferences) =>
      mutate(
        {
          body: { preferences },
        },
        {
          onSuccess: () => {
            toast.success("Success");
          },
        },
      ),
    [mutate],
  );

  return { test, isPending, validationError };
}
