import { NestedMap } from './nested_map';

export function memoize(_: Object, __: string, descriptor: TypedPropertyDescriptor<any>) {
  if (descriptor.value != null) {
    descriptor.value = getNewFunction(descriptor.value);
  } else if (descriptor.get != null) {
    descriptor.get = getNewFunction(descriptor.get);
  } else {
    throw 'Only put a Memoize() decorator on a method or get accessor.';
  }
}

const clearCacheTagsMap: Map<string, Map<any, any>[]> = new Map();

export function clear(tags: string[]): number {
  const cleared: Set<Map<any, any>> = new Set();
  for (const tag of tags) {
    const maps = clearCacheTagsMap.get(tag);
    if (maps) {
      for (const mp of maps) {
        if (!cleared.has(mp)) {
          mp.clear();
          cleared.add(mp);
        }
      }
    }
  }
  return cleared.size;
}

function getNewFunction(originalMethod: (...args: any[]) => void) {
  const nestedMap = new NestedMap();

  // The function returned here gets called instead of originalMethod.
  return function (this: any, ...args: any[]) {
    return nestedMap.get([this, ...args], () => originalMethod.apply(this, args));
  };
}