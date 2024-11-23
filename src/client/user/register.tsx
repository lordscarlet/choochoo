import { Box, Button, FormControl, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect } from "react";
import { RouteObject, useNavigate, useSearchParams } from "react-router-dom";
import { useMe, useRegister } from "../services/me";
import { useTextInputState } from "../utils/form_state";
import { LoginPage } from "./login";

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useTextInputState('');
  const [username, setUsername] = useTextInputState('');
  const [password, setPassword] = useTextInputState('');
  const [invitationCode, setInvitationCode] = useTextInputState(searchParams.has('invitationCode') ? searchParams.get('invitationCode')! : '');
  const { register, validationError, isPending } = useRegister();
  const navigate = useNavigate();
  const me = useMe();
  useEffect(() => {
    if (me != null) {
      navigate('/');
    }
  }, [me]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    register({ username, email, password, invitationCode });
  }, [register, username, email, password]);

  return <Box
    component="form"
    sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
    noValidate
    autoComplete="off"
    onSubmit={onSubmit}
  >
    <FormControl>
      <TextField
        required
        label="Username"
        value={username}
        error={validationError?.username != null}
        helperText={validationError?.username}
        onChange={setUsername}
      />
    </FormControl>
    <FormControl>
      <TextField
        required
        label="Email"
        value={email}
        error={validationError?.email != null}
        helperText={validationError?.email}
        onChange={setEmail}
      />
    </FormControl>
    <FormControl>
      <TextField
        required
        label="Password"
        type="password"
        value={password}
        error={validationError?.password != null}
        helperText={validationError?.password}
        onChange={setPassword}
      />
    </FormControl>
    <FormControl>
      <TextField
        required
        label="Invite Code"
        type="text"
        value={invitationCode}
        error={validationError?.invitationCode != null}
        helperText={validationError?.invitationCode}
        onChange={setInvitationCode}
      />
    </FormControl>
    <div>
      <Button type="submit" disabled={isPending}>Register</Button>
    </div>
  </Box>;
}

export const loginRoute: RouteObject = {
  path: '/users/login',
  element: <LoginPage />,
}