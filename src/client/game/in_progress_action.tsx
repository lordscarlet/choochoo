import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { BuildData } from "../../engine/build/build";
import { MoveData } from "../../engine/move/move";
import { freeze, Immutable } from "../../utils/freeze";

interface InProgressAction {
  inProgress: boolean;
  build?: Immutable<BuildData>;
  move?: Immutable<MoveData>;
}

export const InProgressData = createContext<undefined | InProgressAction>(undefined);
const SetInProgressData = createContext<((data: InProgressAction) => void) | undefined>(undefined);

export function InProgressActionProvider({ children }: { children?: ReactNode }) {
  const [data, setData] = useState(freeze({ inProgress: false }));
  const externalSetData = useCallback((data: InProgressAction) => setData(freeze(data)), [setData]);
  return <InProgressData.Provider value={data}>
    <SetInProgressData.Provider value={externalSetData}>
      {children}
    </SetInProgressData.Provider>
  </InProgressData.Provider>;
}

export function useInProgressAction(): InProgressAction {
  return useContext(InProgressData)!;
}

export function useResetInProgressAction(): () => void {
  const ctx = useContext(SetInProgressData)!;
  return useCallback(() => ctx({ inProgress: false }), []);
}