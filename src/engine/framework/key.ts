

import { assert } from "../../utils/validate";


export class Key<T> {
  private static readonly registry = new Set<string>();
  constructor(readonly name: string) {
    assert(!Key.registry.has(this.name));
    Key.registry.add(this.name);
  }
}