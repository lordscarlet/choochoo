import { City } from "../../engine/map/city";
import { cityGroupColor, cityGroupTextColor, toLetter } from "../../engine/state/city_group";
import { hexNameDiff } from "./hex_name";
import { Point, getCorners, pointBetween, polygon } from "./point";

export function OnRoll({ city, center, size }: { city: City; center: Point; size: number; }) {
  const [_, bottomRight, bottomLeft, left] = getCorners(center, size);
  const bottomLeftCorner = pointBetween(bottomLeft, left, hexNameDiff);
  const buffer = 2;
  const boxTopRight = { x: bottomRight.x, y: bottomLeftCorner.y + buffer };
  const boxTopLeft = { x: bottomLeft.x, y: bottomLeftCorner.y + buffer };
  const points = polygon([boxTopRight, bottomRight, bottomLeft, boxTopLeft]);
  const numberCenter = pointBetween(boxTopRight, bottomLeft);
  return <>
    <polygon points={points} stroke="black" fill={cityGroupColor(city.onRoll()[0].group)} strokeWidth="1" />
    <text x={numberCenter.x} y={numberCenter.y} dominantBaseline="middle" textAnchor="middle" color={cityGroupTextColor(city.onRoll()[0].group)}>
      {city.isUrbanized() ? toLetter(city.onRoll()[0]) : city.onRoll()[0].onRoll}
    </text>
  </>;
}
