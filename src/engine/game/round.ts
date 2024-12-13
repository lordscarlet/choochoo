import z from "zod";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { Log } from "./log";
import { PLAYERS } from "./state";

export const ROUND = new Key('roundNumber', { parse: z.number().parse });

export class RoundEngine {
  protected readonly log = inject(Log);
  protected readonly players = injectState(PLAYERS);
  protected readonly currentRound = injectState(ROUND);

  startFirstRound(): void {
    // The rounds go from 1 to max rounds
    this.currentRound.initState(1);
    this.start(1);
  }

  start(round: number) {
    this.currentRound.initState(round);
    this.log.log(`Start round #${this.currentRound()}`);
  }

  end(): void {
    this.log.log(`End round #${this.currentRound()}`);
    this.currentRound.delete();
  }

  maxRounds(): number {
    const numPlayers = this.players().length;

    switch (numPlayers) {
      case 3: return 10;
      case 4: return 8;
      case 5: return 7;
      case 6: return 6;
      default:
        assert(false, 'unknown number of rounds for player count');
    }
  }
}