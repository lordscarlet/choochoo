import { ChangeEvent, useState } from "react";

export function useFormState(initialValue: string): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [state, setState] = useState(initialValue);
  return [state, (e) => setState(e.target.value)];
}