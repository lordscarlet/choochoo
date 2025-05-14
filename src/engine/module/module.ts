import { SimpleConstructor } from "../framework/dependency_stack";

type Mixin<T> = (ctor: SimpleConstructor<T>) => SimpleConstructor<T>;

export abstract class Module {
  private readonly mixins: Array<[SimpleConstructor<unknown>, Mixin<unknown>]> =
    [];

  constructor() {
    this.installMixins();
  }

  abstract installMixins(): void;

  installMixin<T>(ctor: SimpleConstructor<T>, mixin: Mixin<T>) {
    this.mixins.push([ctor, mixin as Mixin<unknown>]);
  }

  registerOverrides(
    overrides: Map<SimpleConstructor<unknown>, SimpleConstructor<unknown>>,
  ) {
    for (const [base, mixin] of this.mixins) {
      const override = mixin(overrides.get(base) ?? base);
      let current = Object.getPrototypeOf(override);
      do {
        overrides.set(current, override);
        current = Object.getPrototypeOf(current);
      } while (current !== Object.getPrototypeOf(Object));
    }
  }
}
