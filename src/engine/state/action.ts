import z from "zod";
import { assertNever } from "../../utils/validate";

export enum Action {
  LOCOMOTIVE,
  FIRST_BUILD,
  FIRST_MOVE,
  ENGINEER,
  TURN_ORDER_PASS,
  URBANIZATION,
  PRODUCTION,

  // Montreal metro
  REPOPULATION,
}

export const ActionZod = z.nativeEnum(Action);

export function getSelectedActionString(action?: Action) {
  switch (action) {
    case undefined: return '';
    case Action.LOCOMOTIVE: return 'Locomotive';
    case Action.FIRST_BUILD: return 'First Build';
    case Action.FIRST_MOVE: return 'First Move';
    case Action.ENGINEER: return 'Engineer';
    case Action.TURN_ORDER_PASS: return 'Turn Order Pass';
    case Action.URBANIZATION: return 'Urbanization';
    case Action.PRODUCTION: return 'Production';
    case Action.REPOPULATION: return 'Repopulation';
    default:
      assertNever(action);
  }
}