import z from "zod";

export interface ActionProcessor<T extends object> {
  // Note, there is no type-safety here. Oh well.
  // See https://github.com/microsoft/TypeScript/issues/49262
  assertInput(data: unknown): T;
  canEmit?: () => boolean;
  validate(data: T): void;
  process(data: T): boolean;
}


export const EmptyAction = z.object({});
export type EmptyAction = z.infer<typeof EmptyAction>;

export abstract class EmptyActionProcessor implements ActionProcessor<EmptyAction> {
  assertInput = EmptyAction.parse;

  abstract validate(): void;
  abstract process(): boolean;
}