import { useParams } from "react-router-dom";
import { MyUserApi } from "../../api/user";
import { Loading } from "../components/loading";
import { useMe } from "../services/me";
import { useUsers } from "../services/user";

export function UserProfilePage() {
  const userId = Number(useParams()!.userId!);
  const me = useMe();
  return userId === me?.id ? <MeProfile me={me} /> : <UserProfile userId={userId} />;
}

function MeProfile({ me }: { me: MyUserApi }) {
  return <div>
    <h1>Profile Settings</h1>
    Username: {me.username}
  </div>
}

function UserProfile({ userId }: { userId: number }) {
  const [user] = useUsers([userId]);
  if (user == null) return <Loading />;
  return <div>
    Username: {user.username}
  </div>
}