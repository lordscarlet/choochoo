import { Box, Button, Checkbox, FormControl, FormControlLabel, TextField } from "@mui/material";
import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ValidationError } from "../../api/error";
import { GameStatus, ListGamesApi } from "../../api/game";
import { NotificationFrequency, NotificationMethod, TurnNotificationSetting, WebHookSetting } from "../../api/notifications";
import { MyUserApi } from "../../api/user";
import { iterate } from "../../utils/functions";
import { Loading } from "../components/loading";
import { GameList } from "../home/game_list";
import { useMe } from "../services/me";
import { useNotificationPreferences, useSetNotificationPreferences } from "../services/notifications/preferences";
import { useUser } from "../services/user";
import { UpdatePassword } from "./update_password";

export function UserProfilePage() {
  const userId = Number(useParams()!.userId!);
  const me = useMe();
  return userId === me?.id ? <MeProfile me={me} /> : <UserProfile userId={userId} />;
}

function MeProfile({ me }: { me: MyUserApi }) {
  return <div>
    <h1>Profile Settings</h1>
    <p>Username: {me.username}</p>
    <p>Email: {me.email}</p>
    <UpdatePassword />
    <NotificationSettings />
    <UserGameList userId={me.id} />
  </div>
}

const emailSettings = {
  method: NotificationMethod.EMAIL,
  frequency: NotificationFrequency.IMMEDIATELY,
} as const;

function findErrorInNotifications(validationError: ValidationError | undefined, key: string): string | undefined {
  return iterate(5, i => `preferences.turnNotifications.${i}.${key}`)
    .map((key) => validationError?.[key])
    .find((i) => i != null);
}

function NotificationSettings() {
  const preferences = useNotificationPreferences();
  const { validationError, setPreferences, isPending } = useSetNotificationPreferences();

  const marketing = preferences.marketing;
  const [setting, setSetting] = useState<TurnNotificationSetting | undefined>(preferences.turnNotifications[0]);

  const email = setting?.method === NotificationMethod.EMAIL;
  const enableWebHook = setting?.method === NotificationMethod.WEBHOOK;

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPreferences({
      marketing,
      turnNotifications: setting != null ? [setting] : [],
    });
  }, [marketing, setting, setPreferences]);

  const webHookUrlError = findErrorInNotifications(validationError, 'webHookUrl');
  const webHookUserIdError = findErrorInNotifications(validationError, 'webHookUserId');

  const setEmail = useCallback(() => {
    setSetting(emailSettings);
  }, [setSetting]);

  const setEnableWebHook = useCallback(() => {
    setSetting({
      method: NotificationMethod.WEBHOOK,
      frequency: NotificationFrequency.IMMEDIATELY,
      webHookUrl: '',
      webHookUserId: '',
    });
  }, [setSetting]);

  const setWebHookUrl = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSetting({
      ...(setting as WebHookSetting),
      webHookUrl: e.target.value,
    });
  }, [setSetting, setting]);

  const setWebHookUserId = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSetting({
      ...(setting as WebHookSetting),
      webHookUserId: e.target.value,
    });
  }, [setSetting, setting]);

  return <>
    <h2>Notification Preferences</h2>
    <Box
      component="form"
      sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <FormControl>
        <FormControlLabel sx={{ m: 1, minWidth: 80 }}
          label="Email notifications"
          control={
            <Checkbox
              checked={email}
              disabled={isPending}
              onChange={setEmail}
            />}
        />
      </FormControl>
      <FormControl>
        <FormControlLabel sx={{ m: 1, minWidth: 80 }}
          label="Webhook"
          control={
            <Checkbox
              checked={enableWebHook}
              disabled={isPending}
              onChange={setEnableWebHook}
            />}
        />
      </FormControl>
      {enableWebHook && <FormControl>
        <TextField
          required
          label="Webhook URL"
          value={setting!.webHookUrl}
          error={webHookUrlError != null}
          helperText={webHookUrlError}
          onChange={setWebHookUrl}
        />
      </FormControl>}
      {enableWebHook && <FormControl>
        <TextField
          required
          label="Webhook User ID"
          value={setting!.webHookUserId}
          error={webHookUserIdError != null}
          helperText={webHookUserIdError}
          onChange={setWebHookUserId}
        />
      </FormControl>}
      <div>
        <Button type="submit" disabled={isPending}>Save Preferences</Button>
      </div>
    </Box>
  </>;
}

function UserProfile({ userId }: { userId: number }) {
  const user = useUser(userId);
  if (user == null) return <Loading />;
  return <div>
    Username: {user.username}
    <UserGameList userId={userId} />
  </div>
}

function UserGameList({ userId }: { userId: number }) {
  const query: ListGamesApi = useMemo(() => ({
    status: [GameStatus.Enum.ENDED],
    userId: userId,
    order: ['id', 'DESC'],
  }), [userId]);
  return <GameList title="Finished Games" query={query} hideStatus />;
}