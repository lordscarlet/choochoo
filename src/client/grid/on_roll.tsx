import { Rotation } from "../../engine/game/map_settings";
import { City } from "../../engine/map/city";
import { CityGroup, toLetter } from "../../engine/state/city_group";
import { Point } from "../../utils/point";
import { Rotate } from "../components/rotation";

interface OnRollProps {
  city: City;
  center: Point;
  size: number;
  rotation?: Rotation;
}

export function OnRoll({ city, center, size, rotation }: OnRollProps) {
  const onRoll = city.onRoll();
  if (onRoll.length === 0) return <></>;
  return (
    <>
      <circle
        cx={center.x}
        cy={center.y}
        fill={onRoll[0].group == CityGroup.WHITE ? "#ffffff" : "#222222"}
        r={size * 0.4}
      />
      <Rotate rotation={rotation} reverse={true} center={center}>
        <text
          fontSize={size / 2}
          fill={
            city.onRoll()[0]?.group == CityGroup.BLACK ? "#ffffff" : "#222222"
          }
          x={center.x}
          y={center.y + size / 20}
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {city.isUrbanized()
            ? toLetter(onRoll[0])
            : onRoll.map(({ onRoll }) => onRoll).join(",")}
        </text>
      </Rotate>
      ;
    </>
  );
}
