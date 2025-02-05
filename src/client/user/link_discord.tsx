import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/loading";
import { tsr } from "../services/client";
import { useSetNotificationPreferencesCache } from "../services/notifications/set_cache";
import { useSuccess } from "../utils/notify";

export function LinkDiscordPage() {
  const navigate = useNavigate();
  const { mutate } = tsr.notifications.linkDiscord.useMutation();
  const updateCache = useSetNotificationPreferencesCache();
  const notifySuccess = useSuccess();
  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token")!;
      const redirectPath = params.get("state")!;
      mutate(
        { body: { accessToken } },
        {
          onSuccess({ body }) {
            updateCache(body.preferences);
            notifySuccess();
            navigate(redirectPath);
          },
        },
      );
    }
  }, []);
  return <Loading />;
}
