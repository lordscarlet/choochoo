
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { FormEvent, useCallback, useMemo } from "react";
import { MapRegistry } from "../../maps";
import { environment, Stage } from "../services/environment";
import { useCreateGame } from "../services/game";
import { useCheckboxState, useSelectState, useTextInputState } from "../utils/form_state";

export function CreateGamePage() {
  const maps = useMemo(() => [...MapRegistry.singleton.values()], []);
  const [name, setName] = useTextInputState('');
  const [gameKey, setGameKey] = useSelectState(maps[0].key);
  const [artificialStart, setArtificialStart] = useCheckboxState();
  const { createGame, validationError, isPending } = useCreateGame();

  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createGame({ name, gameKey, artificialStart });
  }, [name, gameKey, artificialStart, createGame]);

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
        error={validationError?.name != null}
        helperText={validationError?.name}
        onChange={setName}
      />
    </FormControl>
    <FormControl sx={{ m: 1, minWidth: 80 }} error={validationError?.gameKey != null}>
      <InputLabel>Map</InputLabel>
      <Select
        required
        value={gameKey}
        disabled={isPending}
        onChange={setGameKey}
        error={validationError?.gameKey != null}
        autoWidth
        label="Map"
      >
        {maps.map((m) => <MenuItem key={m.key} value={m.key}>{m.name}</MenuItem>)}
      </Select>
      {validationError?.gameKey && <FormHelperText>{validationError?.gameKey}</FormHelperText>}
    </FormControl>
    {environment.stage == Stage.enum.development && <FormControl error={validationError?.artificialStart != null}>
      <FormControlLabel sx={{ m: 1, minWidth: 80 }}
        label="Artificial Start"
        control={
          <Checkbox
            value={artificialStart}
            disabled={isPending}
            onChange={setArtificialStart}
          />}
      />
      <FormHelperText>{validationError?.artificialStart}</FormHelperText>
    </FormControl>}
    <div>
      <Button type="submit" disabled={isPending}>Create</Button>
    </div>
  </Box>;
}