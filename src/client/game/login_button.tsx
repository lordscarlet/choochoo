import { ReactNode, useCallback } from "react";
import { users } from "../../api/fake_data";
import { useLogin, useMe } from "../services/me";
import { useUsers } from "../services/user";


export function LoginButton({ playerId, children }: { playerId: number, children: ReactNode }) {
  const { login, isPending } = useLogin();
  const [user] = useUsers([playerId]);
  const me = useMe();
  const cb = useCallback(() => {
    const userToFind = users.find((u) => u.username === user.username)!;
    login({ usernameOrEmail: userToFind.username, password: userToFind.password });
  }, [user]);

  if (isPending || me?.id === user.id) return <></>;
  return <button onClick={cb} disabled={isPending}>{children}</button>;
}