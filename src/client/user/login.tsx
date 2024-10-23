import { Box, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import { useLogin, useMe } from "../services/me";
import { useFormState } from "../utils/form_state";

export function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useFormState('');
  const [password, setPassword] = useFormState('');
  const { login, isPending } = useLogin(true);
  const navigate = useNavigate();
  const me = useMe();
  useEffect(() => {
    if (me != null) {
      navigate('/');
    }
  }, [me]);
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login({ usernameOrEmail, password });
  }, [usernameOrEmail, password]);

  return <Box
    component="form"
    sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
    noValidate
    autoComplete="off"
    onSubmit={onSubmit}
  >
    <div>
      <TextField
        required
        label="Username or Email"
        value={usernameOrEmail}
        onChange={setUsernameOrEmail}
      />
    </div>
    <div>
      <TextField
        required
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
    </div>
    <div>
      <Button type="submit" disabled={isPending}>Login</Button>
    </div>
  </Box>;
}

export const loginRoute: RouteObject = {
  path: '/users/login',
  element: <LoginPage />,
}