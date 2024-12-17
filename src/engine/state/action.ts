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

  // Ireland
  DEURBANIZATION,

  // Sweden Recycling
  WTE_PLANT_OPERATOR,
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
    case Action.DEURBANIZATION: return 'Deurbanization';
    case Action.WTE_PLANT_OPERATOR: return 'WTE Plant Operator';
    default:
      assertNever(action);
  }
}