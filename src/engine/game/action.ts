


export interface ActionProcessor<T extends {}> {
  // Note, there is no type-safety here. Oh well.
  // See https://github.com/microsoft/TypeScript/issues/49262
  assertInput(data: unknown): T;
  validate(data: T): void;
  process(data: T): boolean;
}