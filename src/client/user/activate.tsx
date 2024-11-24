import { Button } from "@mui/material";
import { useNotifications } from "@toolpad/core";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useActivateAccount, useMe, useResendActivationCode } from "../services/me";

export function ActivatePage() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const me = useMe();
  const [searchParams] = useSearchParams();
  const activationCode = searchParams.get('activationCode');
  const { resend, isPending: isPendingResend } = useResendActivationCode();
  const { activate, isPending } = useActivateAccount();
  const [hasInitialized, sethasInitialized] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (hasNavigated.current) return;
    if (me == null) {
      hasNavigated.current = true;
      notifications.show('Login to activate your account', { autoHideDuration: 2000 });
      navigate('/app/users/login?activationCode=' + activationCode);
      return;
    }
    sethasInitialized(true);
    if (activationCode == null || activationCode == '') {
      return;
    }

    activate(activationCode);
  }, [me, activationCode]);

  if (!hasInitialized || isPending) {
    return <div>Activating account...</div>;
  }

  return <div>
    Failed to activate your account. Please try again.
    <Button onClick={resend} disabled={isPendingResend}>Resend activation code</Button>
  </div>;
}