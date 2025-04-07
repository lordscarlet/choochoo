import { Point } from "../../utils/point";

export function MoonTextures() {
  const center: Point = { x: 735.5, y: 1515.5 };
  const offsets = [
    { x: 0, y: 554.5 },
    { x: 50.5, y: 587.7 },
    { x: 104.9, y: 617.3 },
    { x: 162.6, y: 581.4 },
    { x: 209.6, y: 555.5 },
    { x: 268.4, y: 520.2 },
    { x: 316.7, y: 494.3 },
    { x: 372, y: 462.3 },
    { x: 420.2, y: 431.7 },
    { x: 477.9, y: 399.9 },
    { x: 522.6, y: 370.5 },
    { x: 583.7, y: 338.8 },
    { x: 628.4, y: 310.5 },
    { x: 688.4, y: 276.4 },
    { x: 730.8, y: 251.7 },
    { x: 793.2, y: 225.1 },
    { x: 793.2, y: 148.6 },
    { x: 794.3, y: 100.4 },
    { x: 794.3, y: 27.4 },
    { x: 795.5, y: -22 },
    { x: 793.2, y: -93.7 },
    { x: 793.2, y: -140.8 },
    { x: 793.2, y: -218.5 },
    { x: 735.5, y: -249 },
    { x: 692, y: -273.7 },
    { x: 627.3, y: -312.6 },
    { x: 586.1, y: -334.9 },
    { x: 528.4, y: -369.8 },
    { x: 481.4, y: -393.3 },
    { x: 421.4, y: -432.1 },
    { x: 377.9, y: -459.2 },
    { x: 319, y: -495.7 },
    { x: 270.8, y: -518 },
    { x: 216.7, y: -552.1 },
    { x: 162.6, y: -581.5 },
    { x: 106.1, y: -615.7 },
    { x: 48.4, y: -585.1 },
  ];
  return (
    <>
      {offsets.map((offset, index) => (
        <Offboard
          center={center}
          offset={offset}
          content={index + 1}
          key={index}
        />
      ))}
    </>
  );
}

interface OffboardProps {
  center: Point;
  offset: Point;
  content: number;
}

export function Offboard({ center, offset, content }: OffboardProps) {
  const center1 = { x: center.x - offset.x, y: center.y - offset.y };
  const center2 = { x: center.x + offset.x, y: center.y + offset.y };

  return (
    <>
      <text
        x={center1.x}
        y={center1.y}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {content}
      </text>
      <text
        x={center2.x}
        y={center2.y}
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {content}
      </text>
    </>
  );
}
