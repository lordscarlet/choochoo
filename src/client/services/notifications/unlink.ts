import { useDialogs } from "@toolpad/core";
import { useCallback } from "react";
import { useSuccess } from "../../utils/notify";
import { tsr } from "../client";
import { useSetNotificationPreferencesCache } from "./set_cache";

export function useUnlink() {
  const { mutate } = tsr.notifications.unlinkDiscord.useMutation();
  const onSuccess = useSuccess();
  const updateCache = useSetNotificationPreferencesCache();
  const dialogs = useDialogs();

  return useCallback(async () => {
    if (!(await dialogs.confirm("Unlink from Discord?"))) {
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
