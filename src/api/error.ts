import { z } from "zod";

export const ValidationError = z.record(z.string(), z.string());

export type ValidationError = z.infer<typeof ValidationError>;