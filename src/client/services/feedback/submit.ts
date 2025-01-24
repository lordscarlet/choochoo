import { useNotifications } from "@toolpad/core";
import { useCallback } from "react";
import { SubmitFeedbackApi } from "../../../api/feedback";
import { tsr } from "../client";
import { handleError } from "../network";

export function useSubmitFeedback() {
  const notifications = useNotifications();
  const { mutate, error, isPending } = tsr.feedback.submit.useMutation();
  const validationError = handleError(isPending, error);

  const submitFeedback = useCallback(
    (body: SubmitFeedbackApi, onSubmit?: () => void) =>
      mutate(
        { body },
        {
          onSuccess: (_) => {
            notifications.show("Feedback submitted", {
              autoHideDuration: 2000,
              severity: "success",
            });
            onSubmit?.();
          },
        },
      ),
    [notifications],
  );
  return { submitFeedback, validationError, isPending };
}
