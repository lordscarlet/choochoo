import z from "zod";

export type Constructor<T> = new (...args: any) => T;
export type ConstructorReturnType<T> = T extends Constructor<infer P> ? P : never;

export type Primitive = number | string | boolean;

export type PromiseOr<T> = Promise<T> | T;

export type UrlParameters = { [key: string]: Primitive };

export type SomePartial<T, OptionalProps extends keyof T> =
  Partial<Pick<T, OptionalProps>> & Required<Omit<T, OptionalProps>>;

export type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export type FormNumber = number | '';

export type WithFormNumber<T extends {}, R extends keyof T> = {
  [K in keyof T]: K extends R ? (number extends T[K] ? T[K] | '' : never) : T[K];
}

export const TextInputNumber = z.union([z.literal(''), z.number()]).transform((data) => data === '' ? undefined : data).pipe(z.number());
