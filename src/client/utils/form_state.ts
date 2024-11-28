import { SelectChangeEvent } from "@mui/material/Select";
import { ChangeEvent, useCallback, useState } from "react";

export function useCheckboxState(initialValue = false): [boolean, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [state, setState] = useState(initialValue);
  return [state, useCallback((e) => setState(e.target.checked), [setState])];
}

export function useTextInputState(initialValue: string): [string, (e: ChangeEvent<HTMLInputElement>) => void, (value: string) => void] {
  const [state, setState] = useState(initialValue);
  return [state, useCallback((e) => setState(e.target.value), [setState]), setState];
}

export function useSelectState<T>(initialValue: T): [T, (e: SelectChangeEvent<T>) => void] {
  const [state, setState] = useState(initialValue);
  return [state, useCallback((e) => setState(e.target.value as T), [setState])];
}