import { Button } from "@mui/material";
import { ReactNode } from "react";
import { useLoginBypass } from "../services/me";


export function LoginButton({ playerId, children }: { playerId: number, children: ReactNode }) {
  const { login, isPending, canUseLoginBypass } = useLoginBypass(playerId);
  if (!canUseLoginBypass) return <></>;

  return <Button onClick={login} disabled={isPending}>{children}</Button>;
}