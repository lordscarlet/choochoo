import { TrackInfo } from "../../engine/map/track";
import { getPlayerColorCss } from "../components/player_color";
import { getExitPoint, Point } from "./point";
import * as styles from './track.module.css';

export function Track({ track, center, size, highlighted }: { track: TrackInfo, center: Point, size: number, highlighted: boolean }) {
  const point1 = getExitPoint(center, track.exits[0], size);
  const point2 = getExitPoint(center, track.exits[1], size);

  const curve = `M${point1.x} ${point1.y} Q ${center.x} ${center.y} ${point2.x} ${point2.y}`;
  return <>
    {highlighted && <path d={curve} stroke="yellow" strokeWidth="16" strokeLinecap="butt" fill="transparent"></path>}
    <path className={`${styles.track} ${getPlayerColorCss(track.owner)}`} d={curve} strokeWidth="8" strokeLinecap="butt" fill="transparent"></path>
    {track.claimableCost != null && track.owner == null && <ClaimableTrack center={center} size={size} cost={track.claimableCost} />}
  </>;
}

interface ClaimableTrackProps {
  center: Point;
  size: number;
  cost: number;
}

function ClaimableTrack({ center, size, cost }: ClaimableTrackProps) {
  return <>
    <circle cx={center.x} cy={center.y} fill="white" r={size / 2} />
    <text x={center.x} y={center.y} dominantBaseline="middle" textAnchor="middle">${cost}</text>
  </>;
}
