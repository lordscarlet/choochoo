import { FormEvent, useCallback, useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import { useLogin, useMe } from "../services/me";
import { useFormState } from "../utils/form_state";
import { LoginPage } from "./login";

export function RegisterPage() {
  const [email, setEmail] = useFormState('');
  const [username, setUsername] = useFormState('');
  const [password, setPassword] = useFormState('');
  const login = useLogin();
  const navigate = useNavigate();
  const me = useMe();
  useEffect(() => {
    if (me != null) {
      navigate('/');
    }
  }, [me]);
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // login({usernameOrEmail, password});
  }, [username, email, password]);

  return <form onSubmit={onSubmit}>
    <input type="text" placeholder="Username" value={username} onChange={setUsername} />
    <input type="text" placeholder="Email" value={email} onChange={setEmail} />
    <input type="password" placeholder="Password" value={password} onChange={setPassword} />
    <button type="submit">Login</button>
  </form>;
}

export const loginRoute: RouteObject = {
  path: '/users/login',
  element: <LoginPage />,
}