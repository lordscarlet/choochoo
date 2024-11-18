import { z } from "zod";

export const ZodError = z.object({
  name: z.literal('ZodError'),
  issues: z.array(z.object({
    code: z.string(),
    exact: z.boolean().optional(),
    inclusive: z.boolean().optional(),
    message: z.string(),
    minimum: z.number().optional(),
    path: z.array(z.string()),
    type: z.string().optional(),
  })),
});

export type ZodError = z.infer<typeof ZodError>;

export type ValidationError = Record<string, string>;