import { Box, Button, TextField } from "@mui/material";
import { FormEvent, useCallback } from "react";
import { useCreateGame } from "../services/game";
import { useFormState } from "../utils/form_state";

export function CreateGamePage() {
  const [name, setName] = useFormState('');
  const { createGame, isPending } = useCreateGame();

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createGame({ name, gameKey: 'rust-belt' });
  }, [name]);

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
        label="Name"
        value={name}
        disabled={isPending}
        onChange={setName}
      />
    </div>
    <div>
      <Button type="submit" disabled={isPending}>Create</Button>
    </div>
  </Box>;
}