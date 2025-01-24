import { Box, Button, FormControl, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin, useMe } from "../services/me";
import { useTextInputState } from "../utils/form_state";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const activationCode = searchParams.get("activationCode") ?? undefined;
  const [usernameOrEmail, setUsernameOrEmail] = useTextInputState("");
  const [password, setPassword] = useTextInputState("");
  const { login, validationError, isPending } = useLogin();
  const navigate = useNavigate();
  const me = useMe();

  useEffect(() => {
    if (me != null) {
      navigate("/");
    }
  }, [me]);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      login({ usernameOrEmail, password, activationCode });
    },
    [usernameOrEmail, password, activationCode],
  );

  return (
    <Box
      component="form"
      sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
      noValidate
      autoComplete="off"
      onSubmit={onSubmit}
    >
      <h1>Login</h1>
      <FormControl>
        <TextField
          required
          label="Username or Email"
          value={usernameOrEmail}
          error={validationError?.usernameOrEmail != null}
          helperText={validationError?.usernameOrEmail}
          onChange={setUsernameOrEmail}
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
      <div>
        <Button type="submit" disabled={isPending}>
          Login
        </Button>
      </div>
      <p>
        <Link to="/app/users/forgot-password">Forgot password?</Link>
      </p>
      <p>
        <Link to="/app/users/register">Register</Link>
      </p>
    </Box>
  );
}
