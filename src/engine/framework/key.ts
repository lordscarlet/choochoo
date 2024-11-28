

import { assert } from "../../utils/validate";

type ParseFunction<T> = (value: unknown) => T;

function defaultSerialize<T>(value: T): unknown {
  return value;
}

function defaultParse<T>(value: unknown): T {
  return value as T;
}

export class Key<T> {
  private static readonly registry = new Map<string, Key<unknown>>();

  constructor(readonly name: string, readonly parse: ParseFunction<T> = defaultParse<T>, readonly serialize = defaultSerialize<T>) {
    assert(!Key.registry.has(this.name), `duplicate key name ${this.name}`);
    Key.registry.set(this.name, this as Key<unknown>);
  }

  static fromString<T>(name: string): Key<T> {
    const result = this.registry.get(name);
    assert(result != null);
    return result as Key<T>;
  }
}