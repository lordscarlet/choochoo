import { assertNever } from "../../utils/validate";

export enum Action {
  LOCOMOTIVE,
  FIRST_BUILD,
  FIRST_MOVE,
  ENGINEER,
  TURN_ORDER_PASS,
  URBANIZATION,
  PRODUCTION,
}

export const allActions =  [
  Action.LOCOMOTIVE,
  Action.FIRST_BUILD,
  Action.FIRST_MOVE,
  Action.ENGINEER,
  Action.TURN_ORDER_PASS,
  Action.URBANIZATION,
  Action.PRODUCTION,
];

export function getSelectedActionString(action?: Action) {
  switch (action) {
    case undefined: return '';
    case Action.LOCOMOTIVE: return 'Locomotive';
    case Action.FIRST_BUILD: return 'First_Build';
    case Action.FIRST_MOVE: return 'First_Move';
    case Action.ENGINEER: return 'Engineer';
    case Action.TURN_ORDER_PASS: return 'Turn_Order_Pass';
    case Action.URBANIZATION: return 'Urbanization';
    case Action.PRODUCTION: return 'Production';
    default:
      assertNever(action);
  }
}