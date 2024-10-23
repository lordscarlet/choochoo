import { ChangeEvent, useCallback } from "react";
import { users } from "../../api/fake_data";
import { useLogin, useMe } from "../services/me";


export function User() {
  const user = useMe();
  const { login, isPending } = useLogin();
  const onChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const user = users.find(({ username }) => username === e.target.value)!;
    login({ usernameOrEmail: user.username, password: user.password });
  }, [login]);
  return <div>
    <h2>Select user</h2>
    <select disabled={isPending} value={user?.username} onChange={onChange}>
      <option value={undefined}></option>
      {users.map((user) => <option key={user.username} value={user.username}>{user.username}</option>)}
    </select>
  </div>;
}