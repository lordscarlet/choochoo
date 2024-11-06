import { assertNever } from "../../utils/validate";

export enum CityGroup {
  WHITE = 1,
  BLACK,
}

export function cityGroupColor(group: CityGroup) {
  switch (group) {
    case CityGroup.WHITE: return 'white';
    case CityGroup.BLACK: return 'black';
    default:
      assertNever(group);
  }
}

export function cityGroupTextColor(group: CityGroup): string {
  switch (group) {
    case CityGroup.WHITE: return 'black';
    case CityGroup.BLACK: return 'white';
    default:
      assertNever(group);
  }
}

export function toLetter(group: CityGroup, onRoll: number) {
  if (group === CityGroup.WHITE) {
    return String.fromCharCode('A'.charCodeAt(0) + onRoll - 3);
  }
  return String.fromCharCode('E'.charCodeAt(0) + onRoll - 1);
}