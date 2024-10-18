export type Constructor<T> = new (...args: any) => T;
export type ConstructorReturnType<T> = T extends Constructor<infer P> ? P : never;

export type Primitive = number | string | boolean;

export interface BaseMap<A, B> {
  get(a: A): B|undefined;
  entries(): Iterable<[A, B]>;
  keys(): Iterable<A>;
  values(): Iterable<B>;
  [Symbol.iterator](): Iterator<[A, B]>;
}

export type PromiseOr<T> = Promise<T> | T;

export type UrlParameters = {[key: string]: Primitive};