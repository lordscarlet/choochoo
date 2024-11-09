import { Box, Button, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect } from "react";
import { RouteObject, useNavigate } from "react-router-dom";
import { useMe, useRegister } from "../services/me";
import { useTextInputState } from "../utils/form_state";
import { LoginPage } from "./login";

export function RegisterPage() {
  const [email, setEmail] = useTextInputState('');
  const [username, setUsername] = useTextInputState('');
  const [password, setPassword] = useTextInputState('');
  const { register, isPending } = useRegister();
  const navigate = useNavigate();
  const me = useMe();
  useEffect(() => {
    if (me != null) {
      navigate('/');
    }
  }, [me]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register({ username, email, password });
  }, [username, email, password]);

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
        label="Username"
        value={username}
        onChange={setUsername}
      />
    </div>
    <div>
      <TextField
        required
        label="Email"
        value={email}
        onChange={setEmail}
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
      <Button type="submit" disabled={isPending}>Register</Button>
    </div>
  </Box>;
}

export const loginRoute: RouteObject = {
  path: '/users/login',
  element: <LoginPage />,
}