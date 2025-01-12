import { Rotation } from "../../engine/game/map_settings";
import { City } from "../../engine/map/city";
import { cityGroupColor, cityGroupTextColor, toLetter } from "../../engine/state/city_group";
import { Rotate } from "../components/rotation";
import { Point, movePointInRadDirection } from "./point";

interface OnRollProps {
  city: City; center: Point; size: number;
  rotation?: Rotation;
}

export function OnRoll({ city, center, size, rotation }: OnRollProps) {
  const sideLength = 36;
  const numberCenter = movePointInRadDirection(center, size * 3 / 5, Math.PI / 2);
  const boxTopLeft = {
    x: numberCenter.x - (sideLength / 2),
    y: numberCenter.y - (sideLength / 2),
  };

  return <>
    <Rotate rotation={rotation} reverse={true} center={center}>
      <rect x={boxTopLeft.x} y={boxTopLeft.y} width={sideLength} height={sideLength} stroke="black" fill={cityGroupColor(city.onRoll()[0].group)} strokeWidth="1" />
      <text x={numberCenter.x} y={numberCenter.y} dominantBaseline="middle" textAnchor="middle" color={cityGroupTextColor(city.onRoll()[0].group)}>
        {city.isUrbanized() ? toLetter(city.onRoll()[0]) : city.onRoll()[0].onRoll}
      </text>
    </Rotate>;
  </>;
}
