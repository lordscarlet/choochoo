import { SelectChangeEvent } from "@mui/material";
import { ChangeEvent, useCallback, useState } from "react";

export function useTextInputState(initialValue: string): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [state, setState] = useState(initialValue);
  return [state, useCallback((e) => setState(e.target.value), [setState])];
}

export function useSelectState<T>(initialValue: T): [T, (e: SelectChangeEvent<T>) => void] {
  const [state, setState] = useState(initialValue);
  return [state, useCallback((e) => setState(e.target.value as T), [setState])];
}