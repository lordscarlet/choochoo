import { useCallback } from "react";
import { toast } from "react-toastify";
import { SubmitFeedbackApi } from "../../../api/feedback";
import { tsr } from "../client";
import { handleError } from "../network";

export function useSubmitFeedback() {
  const { mutate, error, isPending } = tsr.feedback.submit.useMutation();
  const validationError = handleError(isPending, error);

  const submitFeedback = useCallback(
    (body: SubmitFeedbackApi, onSubmit?: () => void) =>
      mutate(
        { body },
        {
          onSuccess: (_) => {
            toast.success("Feedback submitted");
            onSubmit?.();
          },
        },
      ),
    [],
  );
  return { submitFeedback, validationError, isPending };
}
