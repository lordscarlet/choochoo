

interface RememberedValue<T> {
  (): T;

  set(t: T): void;
}

/** All state for the game engine should be isolated to this function. */
export class Memory {
  private readonly resetters: Array<() => void> = [];

  remember<T>(initialValue: T): RememberedValue<T> {
    let value = initialValue;
    const remembered: RememberedValue<T> = () => value;
    remembered.set = (newValue: T) => value = newValue;
    this.resetters.push(() => {
      value = initialValue;
    });
    return remembered;
  }

  rememberArray<T>(): T[] {
    const array: T[] = [];
    this.resetters.push(() => {
      array.splice(0, array.length);
    });
    return array;
  }

  rememberMap<R, S>(): Map<R, S> {
    const map = new Map<R, S>();
    this.resetters.push(() => {
      for (const key of map.keys()) {
        map.delete(key);
      }
    });
    return map;
  }

  reset(): void {
    for (const reset of this.resetters) {
      reset();
    }
  }
}