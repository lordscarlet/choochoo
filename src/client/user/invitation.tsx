import { Box, Button, FormControl, TextField } from "@mui/material";
import { FormEvent, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../api/user";
import { useCreateInvitation, useInvitation, useMe } from "../services/me";
import { useTextInputState } from "../utils/form_state";

export function InvitationPage() {
  const [code, setCode] = useTextInputState('');
  const { useInvitationCode, isPending: isInvitationPending } = useInvitation();
  const { createInvite, isPending: isCreatePending } = useCreateInvitation();
  const navigate = useNavigate();
  const me = useMe();

  const isPending = isInvitationPending && isCreatePending;

  useEffect(() => {
    if (me == null) {
      navigate('/');
      return;
    }
    if (me.role !== UserRole.enum.WAITLIST && me.role !== UserRole.enum.ADMIN) {
      navigate('/');
    }
  }, [me]);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (me!.role === UserRole.enum.WAITLIST) {
      useInvitationCode({ code });
      return;
    } else {
      createInvite({ code, count: 5 });
    }
  }, [useInvitationCode, createInvite, me, code]);

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
        label="Invitation Code"
        value={code}
        onChange={setCode}
      />
    </FormControl>
    <div>
      <Button type="submit" disabled={isPending}>
        {me?.role === UserRole.enum.ADMIN ? 'Create Invitation Code' : 'Use Invitation Code'}
      </Button>
    </div>
  </Box>;
}