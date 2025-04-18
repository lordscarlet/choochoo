import z from "zod";

export type Primitive = number | string | boolean;

export type SomePartial<T, OptionalProps extends keyof T> = Partial<
  Pick<T, OptionalProps>
> &
  Omit<T, OptionalProps>;

type RequiredAndNonNull<T> = { [K in keyof T]: NonNullable<T> };

export type SomeRequired<T, RequiredProps extends keyof T> = RequiredAndNonNull<
  Pick<T, RequiredProps>
> &
  Omit<T, RequiredProps>;

export type Entry<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export type FormNumber = number | "";

export type WithFormNumber<T extends object, R extends keyof T> = {
  [K in keyof T]: K extends R
    ? number extends T[K]
      ? T[K] | ""
      : never
    : T[K];
};

export const TextInputNumber = z
  .union([z.literal(""), z.number()])
  .transform((data) => (data === "" ? undefined : data))
  .pipe(z.number());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tuple = [...any[]];
