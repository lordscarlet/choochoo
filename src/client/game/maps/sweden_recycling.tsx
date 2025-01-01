import { Incinerator } from "../../../maps/sweden/incinerator";
import { useInjected } from "../../utils/injection_context";

export function SwedenRecyclingMetadata() {
  const incinerator = useInjected(Incinerator);

  return <p>Garbage needing recycling: {incinerator.getGarbageCount()}</p>;
}