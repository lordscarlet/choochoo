import { inject } from "../framework/execution_context";
import { Key } from "../framework/key";
import { injectState } from "../framework/execution_context";
import { Phase } from "../state/phase";
import { GameEngine } from "./game";
import { PhaseEngine } from "./phase";
import { PLAYERS } from "./state";
import { assert } from "../../utils/validate";

const ROUND = new Key<number>('roundNumber');

export class RoundEngine {
  private readonly currentRound = injectState(ROUND);
  private readonly phase = inject(PhaseEngine);
  private readonly game = inject(GameEngine);

  startFirstRound(): void {
    // The rounds go from 1 to max rounds
    this.start(1);
  }

  start(roundNumber: number) {
    this.currentRound.initState(roundNumber);
    this.phase.startFirstPhase();
  }

  end() {
    const currentRound = this.currentRound();

    if (currentRound < this.maxRounds()) {
      this.currentRound.set(currentRound + 1);
      return;
    }
    this.game.end();
  }

  maxRounds(): number {
    const numPlayers = injectState(PLAYERS)().length;

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