import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Key } from "../framework/key";
import { GameEngine } from "./game";
import { Log } from "./log";
import { PhaseEngine } from "./phase";
import { PLAYERS } from "./state";

export const ROUND = new Key<number>('roundNumber');

export class RoundEngine {
  private readonly log = inject(Log);
  private readonly players = injectState(PLAYERS);
  private readonly currentRound = injectState(ROUND);
  private readonly phase = inject(PhaseEngine);
  private readonly game = inject(GameEngine);

  startFirstRound(): void {
    // The rounds go from 1 to max rounds
    this.currentRound.initState(1);
    this.start();
  }

  start() {
    this.log.log(`Start round #${this.currentRound()}`);
    this.phase.startFirstPhase();
  }

  end() {
    const currentRound = this.currentRound();
    this.log.log(`End round #${currentRound}`);

    if (currentRound <= this.maxRounds()) {
      this.currentRound.set(currentRound + 1);
      this.start();
      return;
    }

    this.game.end();
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