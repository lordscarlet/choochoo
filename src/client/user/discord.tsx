import { Button } from "@mui/material";
import { NotificationPreferences } from "../../api/notifications";

export function DiscordNotificationSettings({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  return (
    <form method="GET" action="https://discord.com/oauth2/authorize">
      <input type="hidden" name="client_id" value="1336123312228794368" />
      <input
        type="hidden"
        name="redirect_uri"
        value={window.location.origin + "/app/users/link-discord"}
      />
      <input type="hidden" name="state" value={window.location.pathname} />
      <input type="hidden" name="response_type" value="token" />
      <input type="hidden" name="scope" value="identify email" />
      <Button type="submit">
        {preferences.discordId != null ? "Update discord id" : "Link Discord"}
      </Button>
    </form>
  );
}
