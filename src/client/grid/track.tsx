import { TrackInfo } from "../../engine/map/track";
import { getPlayerColorCss } from "../../engine/state/player";
import { getExitPoint, Point } from "./point";

export function Track({ track, center, size, highlighted }: { track: TrackInfo, center: Point, size: number, highlighted: boolean }) {
  const point1 = getExitPoint(center, track.exits[0], size);
  const point2 = getExitPoint(center, track.exits[1], size);

  const curve = `M${point1.x} ${point1.y} Q ${center.x} ${center.y} ${point2.x} ${point2.y}`;
  return <>
    {highlighted && <path d={curve} stroke="yellow" strokeWidth="6" strokeLinecap="round" fill="transparent"></path>}
    <path d={curve} stroke={getPlayerColorCss(track.owner)} strokeWidth="3" strokeLinecap="round" fill="transparent"></path>
  </>;
}


