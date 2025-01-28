import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
} from "@mui/material";
import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { ValidationError } from "../../api/error";
import { GameStatus, ListGamesApi } from "../../api/game";
import {
  isWebHookSetting,
  NotificationFrequency,
  NotificationMethod,
  WebHookSetting,
} from "../../api/notifications";
import { MyUserApi } from "../../api/user";
import { iterate } from "../../utils/functions";
import { Loading } from "../components/loading";
import { GameList } from "../home/game_list";
import { useMe } from "../services/me";
import {
  useNotificationPreferences,
  useSendTestNotification,
  useSetNotificationPreferences,
} from "../services/notifications/preferences";
import { useUser } from "../services/user";
import { useCheckboxState } from "../utils/form_state";
import { UpdatePassword } from "./update_password";

export function UserProfilePage() {
  const userId = Number(useParams()!.userId!);
  const me = useMe();
  return userId === me?.id ? (
    <MeProfile me={me} />
  ) : (
    <UserProfile userId={userId} />
  );
}

function MeProfile({ me }: { me: MyUserApi }) {
  return (
    <div>
      <h1>Profile Settings</h1>
      <p>Username: {me.username}</p>
      <p>Email: {me.email}</p>
      <UpdatePassword />
      <NotificationSettings />
      <UserGameList userId={me.id} />
    </div>
  );
}

const emailSettings = {
  method: NotificationMethod.EMAIL,
  frequency: NotificationFrequency.IMMEDIATELY,
} as const;

function findErrorInNotifications(
  validationError: ValidationError | undefined,
  key: string,
): string | undefined {
  return iterate(5, (i) => `preferences.turnNotifications.${i}.${key}`)
    .map((key) => validationError?.[key])
    .find((i) => i != null);
}

function NotificationSettings() {
  const preferences = useNotificationPreferences();
  const {
    validationError: validationErrorSet,
    setPreferences,
    isPending,
  } = useSetNotificationPreferences();
  const {
    validationError: validationErrorSend,
    test,
    isPending: isTestPending,
  } = useSendTestNotification();

  const validationError = {
    ...validationErrorSet,
    ...validationErrorSend,
  };

  const marketing = preferences.marketing;

  const [email, setEmail] = useCheckboxState(
    preferences.turnNotifications.some(
      ({ method }) => method === NotificationMethod.EMAIL,
    ),
  );
  const [webHook, setWebHook] = useState<WebHookSetting | undefined>(
    preferences.turnNotifications.find(isWebHookSetting),
  );
  const enableWebHook = webHook != null;

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPreferences({
        marketing,
        turnNotifications: [
          ...(email ? [emailSettings] : []),
          ...(webHook != null ? [webHook] : []),
        ],
      });
    },
    [marketing, email, webHook, setPreferences],
  );

  const sendTestNotification = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      test({
        marketing,
        turnNotifications: [
          ...(email ? [emailSettings] : []),
          ...(webHook != null ? [webHook] : []),
        ],
      });
    },
    [test, marketing, email, webHook],
  );

  const webHookUrlError = findErrorInNotifications(
    validationError,
    "webHookUrl",
  );
  const webHookUserIdError = findErrorInNotifications(
    validationError,
    "webHookUserId",
  );

  const setEnableWebHook = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.checked) {
        setWebHook(undefined);
        return;
      }
      setWebHook({
        method: NotificationMethod.WEBHOOK,
        frequency: NotificationFrequency.IMMEDIATELY,
        webHookUrl: "",
        webHookUserId: "",
      });
    },
    [setWebHook],
  );

  const setWebHookUrl = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setWebHook({
        ...webHook!,
        webHookUrl: e.target.value,
      });
    },
    [webHook, setWebHook],
  );

  const setWebHookUserId = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setWebHook({
        ...webHook!,
        webHookUserId: e.target.value,
      });
    },
    [webHook, setWebHook],
  );

  return (
    <>
      <h2>Notification Preferences</h2>
      <Box
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
        noValidate
        autoComplete="off"
        onSubmit={onSubmit}
      >
        <div>
          <FormControl>
            <FormControlLabel
              sx={{ m: 1, minWidth: 80 }}
              label="Custom Webhook"
              control={
                <Checkbox
                  checked={enableWebHook}
                  disabled={isPending}
                  onChange={setEnableWebHook}
                />
              }
            />
          </FormControl>
          <FormControl>
            <TextField
              required
              label="Webhook URL"
              value={webHook?.webHookUrl ?? ""}
              disabled={!enableWebHook}
              error={webHookUrlError != null}
              helperText={webHookUrlError}
              onChange={setWebHookUrl}
            />
          </FormControl>
          <FormControl>
            <TextField
              required
              label="Webhook User ID"
              disabled={!enableWebHook}
              value={webHook?.webHookUserId ?? ""}
              error={webHookUserIdError != null}
              helperText={webHookUserIdError}
              onChange={setWebHookUserId}
            />
          </FormControl>
        </div>
        <FormControl error={email}>
          <FormControlLabel
            sx={{ m: 1, minWidth: 80 }}
            label="Email notifications"
            control={
              <Checkbox
                checked={email}
                disabled={isPending}
                onChange={setEmail}
              />
            }
          />
          {email && (
            <FormHelperText>
              Email notifications are significantly more expensive than webooks.
              Please consider setting up a webhook instead to support the site.
            </FormHelperText>
          )}
        </FormControl>
        <div>
          <Button type="submit" disabled={isPending}>
            Save Preferences
          </Button>
          <Button onClick={sendTestNotification} disabled={isTestPending}>
            Test
          </Button>
        </div>
      </Box>
    </>
  );
}

function UserProfile({ userId }: { userId: number }) {
  const user = useUser(userId);
  if (user == null) return <Loading />;
  return (
    <div>
      Username: {user.username}
      <UserGameList userId={userId} />
    </div>
  );
}

function UserGameList({ userId }: { userId: number }) {
  const query: ListGamesApi = useMemo(
    () => ({
      status: [GameStatus.Enum.ENDED],
      userId: userId,
      order: ["id", "DESC"],
    }),
    [userId],
  );
  return <GameList title="Finished Games" query={query} hideStatus />;
}
