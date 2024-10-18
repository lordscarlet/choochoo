import { emitError, ErrorInput } from "./error";

export function assert(check: boolean, msg: ErrorInput = 'failed assertion'): asserts check {
  if (!check) {
    emitError(msg);
  }
}

export function assertPositiveInteger(num: unknown, msg: ErrorInput = 'failed assertion'): asserts num is number {
  assertNumber(num, msg);
  assertPositive(num, msg);
  assertInteger(num, msg);
}

export function assertNumber(num: unknown, msg: ErrorInput = 'failed assertion'): asserts num is number {
  assert(typeof num === 'number', msg);
}

export function assertNever(val: never): never {
  throw Error('assumed never: ' + val);
}

export function assertPositive(num: number, msg: ErrorInput = 'failed assertion'): void {
  assert(num >= 0, msg);
}

export function assertInteger(num: number, msg: ErrorInput = 'failed assertion'): void {
  assert(Math.floor(num) === num, msg);
}

// interface WithField<T extends {}, R extends string, F> extends T {
//   [typeof R]: F;
// }

// export function hasField<T, R extends string, F>(data: T, fieldName: R, assertFn: (value: unknown) => value is F) {
//   assert(fieldName in data, 'expected ' + fieldName + ' in data object');
//   assertFn(data[fieldName]);
// }