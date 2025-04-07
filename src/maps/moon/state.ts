import z from "zod";

export enum Side {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export const SideZod = z.nativeEnum(Side);

export const MoonMapData = z.object({
  side: SideZod,
});
export type MoonMapData = z.infer<typeof MoonMapData>;
