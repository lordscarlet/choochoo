import { Box, Button, FormControl, TextField } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { useCreateInvitation } from "../services/me";
import { useNumberInputState, useTextInputState } from "../utils/form_state";

export function CreateInvitePage() {
  const { createInvite, validationError, isPending } = useCreateInvitation();

  const [code, setCode] = useTextInputState();
  const [count, setCount] = useNumberInputState(5);

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createInvite({ code, count });
  }, [createInvite, code, count]);

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
        label="Code"
        value={code}
        error={validationError?.code != null}
        helperText={validationError?.code}
        onChange={setCode}
      />
    </FormControl>
    <FormControl>
      <TextField
        required
        label="Password"
        type="number"
        value={count}
        error={validationError?.count != null}
        helperText={validationError?.count}
        onChange={setCount}
      />
    </FormControl>
    <div>
      <Button type="submit" disabled={isPending}>Create</Button>
    </div>
  </Box>;
}