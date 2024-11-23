import { peek } from "../../utils/functions";
import { NestedMap } from "../../utils/nested_map";
import { Constructor, ConstructorReturnType } from "../../utils/types";
import { assert } from "../../utils/validate";
import { Key } from "./key";

export class InjectionContext {
  private readonly overrides = new Map<Constructor<unknown>, unknown>();
  private readonly inConstruction = new Map<Constructor<unknown>, ProxyObject<unknown>>();
  private readonly dependencies = new Map<Constructor<unknown>, Set<Key<unknown> | Constructor<unknown>>>();
  private readonly injected = new NestedMap();
  private readonly dependencyStack: Array<Set<Constructor<unknown> | Key<unknown>>> = [];

  addDependency(dep: Key<unknown> | Constructor<unknown>): void {
    peek(this.dependencyStack)?.add(dep);
  }

  startDependencyStack<T>(fn: () => T): [T, Set<Key<unknown> | Constructor<unknown>>] {
    this.dependencyStack.push(new Set<Constructor<unknown> | Key<unknown>>());
    return [fn(), this.dependencyStack.pop()!];
  }

  get<R, T extends Constructor<R>>(factory: T, args: ConstructorParameters<T>): R {
    const overridden = this.overrides.get(factory) as T ?? factory;
    const mapArgs = [overridden, ...args];
    this.addDependency(factory);
    return this.injected.get(mapArgs, () => {
      if (this.inConstruction.has(overridden)) {
        return this.inConstruction.get(overridden)!.proxy as R;
      }
      const proxyObject = buildProxy(overridden);
      this.inConstruction.set(overridden, proxyObject);
      const [result, dependencies] = this.startDependencyStack(() => {
        return new overridden(...args);
      });
      proxyObject.setInternalObject(result as ConstructorReturnType<T>);
      this.inConstruction.delete(overridden);
      this.dependencies.set(overridden, dependencies);

      return result;
    });
  }

  getStateDependencies(...dependencies: Array<Key<unknown> | Constructor<unknown>>): Set<Key<string>> {
    const stateDependencies = new Set<Key<string>>();
    const visited = new Set<Constructor<unknown>>();
    for (let index = 0; index < dependencies.length; index++) {
      const dependency = dependencies[index];
      if (dependency instanceof Key) {
        stateDependencies.add(dependency);
        continue;
      }
      if (visited.has(dependency)) continue;
      visited.add(dependency);
      assert(this.dependencies.has(dependency));
      dependencies.push(...this.dependencies.get(dependency)!);
    }
    return stateDependencies;
  }

  override<R, T extends Constructor<R>, S extends Constructor<R>>(factory: T, override: S): void {
    this.overrides.set(factory, override);
  }
}

interface Initialized<T> {
  value: T;
}

interface ProxyObject<T> {
  setInternalObject(t: T): void;
  proxy: T;
}

function buildProxy<T extends Constructor<any>>(constructorFn: T): ProxyObject<ConstructorReturnType<T>> {
  //we don't care about the target, but compiler does not allow a null one, so let's pass an "empty object" {}
  let initialized: Initialized<T> | undefined;
  const proxy = new Proxy({}, {
    get: function (_, property: string, __) {
      assert(initialized != null, 'called an uninitialized value');

      let item = (initialized.value as any)[property];
      if (typeof (item) === "function") {
        return function (...args: any) {
          assert(initialized != null, 'called an uninitialized value');
          return item.call(initialized.value, ...args);
        };
      } else {
        return item;
      }
    },

    set: function (_, property: string | symbol, value: any, __): boolean {
      assert(initialized != null, 'called an uninitialized value');
      (initialized.value as any)[property] = value;
      return true;
    },

  });

  return {
    proxy: proxy as ConstructorReturnType<T>,
    setInternalObject: (value: T) => initialized = { value },
  };
}