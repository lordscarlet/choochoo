import z from "zod";
import { injectState } from "../../engine/framework/execution_context";
import { Key, MapKey } from "../../engine/framework/key";
import { TURN_ORDER } from "../../engine/game/state";
import { PlayerColor, PlayerColorZod } from "../../engine/state/player";

export const GarbageCount = new Key('GarbageCount', { parse: z.number().parse });
export const OwnedGarbage = new MapKey('OwnedGarbage', PlayerColorZod.parse, z.number().parse);

export class Incinerator {
  private readonly count = injectState(GarbageCount);
  private readonly ownedGarbage = injectState(OwnedGarbage);
  private readonly turnOrder = injectState(TURN_ORDER);

  initialize(): void {
    this.count.initState(0);
    this.ownedGarbage.initState(new Map(this.turnOrder().map((color) => [color, 0])));
  }

  getGarbageCount(): number {
    return this.count();
  }

  getGarbageCountForUser(user: PlayerColor): number {
    return this.ownedGarbage().get(user)!;
  }

  addCube(): void {
    this.count.update((count) => count + 1);
  }

  takeCubes(playerColor: PlayerColor): void {
    this.ownedGarbage.update((map) => {
      map.set(playerColor, map.get(playerColor)! + this.count());
    });

    this.count.set(0);
  }
}