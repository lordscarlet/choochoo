import { Box, Button, Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { FormEvent, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { GameStatus, ListGamesApi } from "../../api/game";
import { NotificationFrequency, NotificationMethod } from "../../api/notifications";
import { MyUserApi } from "../../api/user";
import { Loading } from "../components/loading";
import { GameList } from "../home/game_list";
import { useMe } from "../services/me";
import { useNotificationPreferences, useSetNotificationPreferences } from "../services/notifications/preferences";
import { useUser } from "../services/user";
import { useCheckboxState } from "../utils/form_state";
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

function NotificationSettings() {
  const preferences = useNotificationPreferences();
  const { validationError, setPreferences, isPending } = useSetNotificationPreferences();
  const marketing = preferences.marketing;
  const [email, setEmail] = useCheckboxState(preferences.turnNotifications.some(({ method }) => method === NotificationMethod.EMAIL));
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPreferences({
      marketing,
      turnNotifications: email ? [{
        method: NotificationMethod.EMAIL,
        frequency: NotificationFrequency.IMMEDIATELY,
      }] : [],
    });
  }, [marketing, email, setPreferences]);

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