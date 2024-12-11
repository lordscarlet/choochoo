import 'jasmine';
import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { setInjectionContext } from "../engine/framework/execution_context";
import { InjectionContext } from "../engine/framework/inject";
import { Key } from '../engine/framework/key';
import { StateStore } from '../engine/framework/state';
import { ReversteamMapSettings } from '../maps/reversteam/settings';
import { resettable } from './resettable';

export class InjectionHelper {
  private readonly injector = resettable(() => new InjectionContext(new ReversteamMapSettings().key));

  private constructor() { }

  static install(): InjectionHelper {
    const helper = new InjectionHelper();

    beforeEach(() => {
      setInjectionContext(helper.injector());
    });

    afterEach(() => {
      setInjectionContext();
    });

    return helper;
  }

  resettableSpyOn<T, K extends keyof T = keyof T>(ctor: SimpleConstructor<T>, key: T[K] extends Function ? K : never, handleSpy?: (spy: ReturnType<typeof spyOn<T, K>>) => void): () => ReturnType<typeof spyOn<T, K>> {
    const spy = resettable(() => spyOn(this.injector().get(ctor), key));
    beforeEach(() => {
      handleSpy && handleSpy(spy());
    });
    return spy;
  }

  initResettableState<T>(key: Key<T>, value: T): void {
    beforeEach(() => {
      this.initState(key, value);
    });
  }

  initState<T>(key: Key<T>, value: T): void {
    this.injector().get(StateStore).init(key, value);
  }

  updateState<T>(key: Key<T>, value: T): void {

  }
}

