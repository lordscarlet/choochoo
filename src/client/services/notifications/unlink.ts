import { useCallback } from "react";
import { useConfirm } from "../../components/confirm";
import { useSuccess } from "../../utils/notify";
import { tsr } from "../client";
import { useSetNotificationPreferencesCache } from "./set_cache";

export function useUnlink() {
  const { mutate } = tsr.notifications.unlinkDiscord.useMutation();
  const onSuccess = useSuccess();
  const updateCache = useSetNotificationPreferencesCache();
  const confirm = useConfirm();

  return useCallback(async () => {
    if (!(await confirm("Unlink from Discord?"))) {
      return;
    }
    mutate(
      {},
      {
        onSuccess: ({ body }) => {
          updateCache(body.preferences);
          onSuccess();
        },
      },
    );
  }, [mutate, onSuccess, updateCache]);
}
