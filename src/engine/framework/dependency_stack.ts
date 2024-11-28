import { peek } from "../../utils/functions";
import { Key } from "./key";

export type SimpleConstructor<T> = new () => T;

export type Dependency = SimpleConstructor<unknown> | Key<unknown>;

export class DependencyStack {
  private readonly dependencyStack: Array<Set<Dependency>> = [];

  addDependency<T>(dep: Key<T> | SimpleConstructor<T>): void {
    peek(this.dependencyStack)?.add(dep as Key<unknown> | SimpleConstructor<unknown>);
  }

  startDependencyStack<T>(fn: () => T): [T, Set<Dependency>] {
    this.dependencyStack.push(new Set<SimpleConstructor<unknown> | Key<unknown>>());
    return [fn(), this.dependencyStack.pop()!];
  }
}