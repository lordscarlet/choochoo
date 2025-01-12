import { ReactNode } from "react";
import { Rotation } from "../../engine/game/map_settings";

export function Rotate({ rotation, children }: { rotation?: Rotation, children: ReactNode }) {
  return <g transform={rotation != null ? `rotate(${(rotation === Rotation.CLOCKWISE ? 1 : -1) * 90})` : ''}>
    {children}
  </g>;
}