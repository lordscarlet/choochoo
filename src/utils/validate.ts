import { emitError, ErrorInput } from "./error";

/// 'Is' functions

export function isPositiveInteger(num: unknown): num is number {
  return isNumber(num) &&
    isPositive(num) &&
    isInteger(num);
}

export function isNumber(num: unknown): num is number {
  return typeof num === 'number';
}

export function isPositive(num: unknown): num is number {
  return isNumber(num) && num >= 0;
}

export function isInteger(num: unknown): num is number {
  return isNumber(num) && Math.floor(num) === num;
}

/// 'Assert' functions

export function assert(check: boolean, msg: ErrorInput = 'failed assertion'): asserts check {
  if (!check) {
    emitError(msg);
  }
}

export function fail(msg: ErrorInput = 'failed assertion'): never {
  emitError(msg);
}


export function assertNever(val: never): never {
  throw Error('assumed never: ' + val);
}