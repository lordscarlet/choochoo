import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { GameStatus, ListGamesApi } from "../../api/game";
import { MyUserApi } from "../../api/user";
import { Loading } from "../components/loading";
import { GameList } from "../home/game_list";
import { useMe } from "../services/me";
import { useUsers } from "../services/user";
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
  return <>
    <h2>Notification Preferences</h2>
  </>;
}

function UserProfile({ userId }: { userId: number }) {
  const [user] = useUsers([userId]);
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