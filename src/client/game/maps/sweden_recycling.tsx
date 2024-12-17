import { Incinerator } from "../../../maps/sweden/incinerator";
import { useInjected } from "../../utils/injection_context";

export function SwedenRecyclingRules() {
  return <div>
    <p>Same as base game with the following changes:</p>
    <ul>

    </ul>
  </div>
}

export function SwedenRecyclingMetadata() {
  const incinerator = useInjected(Incinerator);

  return <p>Garbage needing recycling: {incinerator.getGarbageCount()}</p>;
}