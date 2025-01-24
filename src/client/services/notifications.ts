import { useCallback } from "react";
import { tsr } from "./client";
import { handleError } from "./network";

export function useUnsubscribe() {
  const { mutate, error, isPending, isSuccess } =
    tsr.notifications.unsubscribe.useMutation();
  handleError(isPending, error);

  const unsubscribe = useCallback(
    (unsubscribeCode: string) => {
      mutate({ body: { unsubscribeCode } });
    },
    [mutate],
  );
  return { unsubscribe, isPending, isSuccess };
}
