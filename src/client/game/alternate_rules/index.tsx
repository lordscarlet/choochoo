import { useGame } from "../../services/game";
import { IrelandRules } from "./ireland";

export function AlternateRules({gameKey}: {gameKey: string}) {
  switch (gameKey) {
    case 'ireland':
      return <IrelandRules />;
    default:
      return <></>;
  }
}