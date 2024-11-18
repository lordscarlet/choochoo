import { ReactNode, useCallback } from "react";
import { environment, Stage } from "../services/environment";
import { useLoginBypass, useMe } from "../services/me";


export function LoginButton({ playerId, children }: { playerId: number, children: ReactNode }) {
  const { login, isPending } = useLoginBypass();
  const me = useMe();
  const cb = useCallback(() => {
    login(playerId);
  }, [playerId]);

  if (isPending || me?.id === playerId || environment.stage !== Stage.enum.development) return <></>;
  return <button onClick={cb} disabled={isPending}>{children}</button>;
}