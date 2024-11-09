import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { FormEvent, useCallback, useMemo } from "react";
import { MapRegistry } from "../../maps";
import { useCreateGame } from "../services/game";
import { useSelectState, useTextInputState } from "../utils/form_state";

export function CreateGamePage() {
  const maps = useMemo(() => [...new MapRegistry().values()], []);
  const [name, setName] = useTextInputState('');
  const [gameKey, setGameKey] = useSelectState(maps[0].key);
  const { createGame, isPending } = useCreateGame();

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createGame({ name, gameKey });
  }, [name]);

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
        label="Name"
        value={name}
        disabled={isPending}
        onChange={setName}
      />
    </FormControl>
    <FormControl sx={{ m: 1, minWidth: 80 }}>
      <InputLabel>Map</InputLabel>
      <Select
        required
        value={gameKey}
        disabled={isPending}
        onChange={setGameKey}
        autoWidth
        label="Map"
      >
        {maps.map((m) => <MenuItem value={m.key}>{m.name}</MenuItem>)}
      </Select>
    </FormControl>
    <div>
      <Button type="submit" disabled={isPending}>Create</Button>
    </div>
  </Box>;
}