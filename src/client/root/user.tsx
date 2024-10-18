import { useState } from "react";
import { users } from "../../api/fake_data";
import { CreateUserApi, MyUserApi } from "../../api/user";
import { userClient } from "../services/user";
import { assert } from "../../utils/validate";

interface UserProps {
  user?: MyUserApi;
  setUser: (user: MyUserApi|undefined) => void;
}


export function User({user, setUser}: UserProps) {
  const [editing, setEditing] = useState(false);
  return <div>
    <h2>Select user</h2>
    <select disabled={editing} value={user?.username} onChange={(e) => login(users.find(({username}) => username === e.target.value))}>
      <option value={undefined}></option>
      {users.map((user) => <option key={user.username} value={user.username}>{user.username}</option>)}
    </select>
  </div>;

  async function login(user?: CreateUserApi) {
    try {
      setEditing(true);
      if (!user) {
        await userClient.logout();
        setUser(undefined);
        return;
      }
      const {status, body} = await userClient.login({body: {usernameOrEmail: user.username, password: user.password}});
      assert(status === 200);
      setUser(body.user);
    } finally {
      setEditing(false);
    }

    async function register(user: CreateUserApi) {
      const {status, body} = await userClient.create({body: user});
      assert(status == 200);
      setUser(body.user);
    }
  }
}