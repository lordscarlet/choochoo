import { default as Box } from "@mui/material/Box";
import { default as Button } from "@mui/material/Button";
import { default as FormControl } from "@mui/material/FormControl";
import { default as TextField } from "@mui/material/TextField";
import { FormEvent, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserRole } from "../../api/user";
import { useLogout, useMe, useResendActivationCode, useSubscribe } from "../services/me";
import { useTextInputState } from "../utils/form_state";


interface LoginRequiredParams {
  children: React.ReactNode;
}

export function LoginRequired({ children }: LoginRequiredParams) {
  const me = useMe();

  if (me == null) return <WaitlistPage />;
  if (me.role === UserRole.enum.ACTIVATE_EMAIL) return <ActivateEmailPage />
  return children;
}

function ActivateEmailPage() {
  const { logout, isPending } = useLogout();
  const { resend, isPending: isPendingResend } = useResendActivationCode();
  return <div>
    You must activate your email. Please check your inbox (and spam folder).
    <Button onClick={resend} disabled={isPendingResend}>Resend Activation Code</Button>
    <Button onClick={logout} disabled={isPending}>Logout</Button>
  </div>;
}


function WaitlistPage() {
  const [email, setEmail] = useTextInputState('');
  const { subscribe, isSuccess, isPending, validationError } = useSubscribe();

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    subscribe(email);
  }, [email, subscribe]);

  return <Box
    component="form"
    sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}
    noValidate
    autoComplete="off"
    onSubmit={onSubmit}
  >
    <h1>Welcome!</h1>
    <p>This is a hobby project, and we are being careful about how many users we onboard.</p>
    <p>Please enter your email and we'll let you know when there are openings for sign ups.</p>
    {!isSuccess && <div>
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
      <div>
        <Button type="submit" disabled={isPending}>Subscribe</Button>
      </div>
    </div>}
    {isSuccess && <p>Thanks! We'll be in touch :).</p>}
    <p>
      <Link to="/app/users/register">I have an invite link</Link>
    </p>
    <p>
      <Link to="/app/users/login">Login</Link>
    </p>
  </Box>;
}