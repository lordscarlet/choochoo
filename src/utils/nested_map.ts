import { peek } from "./functions";
import { assert } from "./validate";


export class NestedMap {
  private readonly map = new Map<unknown, unknown>();

  get<T>(args: unknown[], factory: () => T): T {
    const leafParent = this.digToLeafParent(args);
    const leafArg = peek(args);
    if (leafParent.has(leafArg)) {
      return leafParent.get(leafArg) as T;
    }
    const newValue = factory();
    leafParent.set(leafArg, newValue);
    return newValue;
  }

  private digToLeafParent(args: unknown[]): Map<unknown, unknown> {
    if (args.length === 1) return this.map;

    assert(args.length > 0, 'called NestedMap with not enough args');
    const [next, ...rest] = args;
    if (!this.map.has(next)) {
      this.map.set(next, new NestedMap());
    }
    const nextMap = this.map.get(next);

    assert(nextMap instanceof NestedMap, 'called NestedMap with too many args');
    return nextMap.digToLeafParent(rest);
  }
}
