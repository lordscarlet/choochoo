import { iterate } from "../../utils/functions";
import { inject } from "../framework/execution_context";
import { OnRoll } from "../state/roll";
import { Memory } from "./memory";

export class Random {
  private readonly reversible = inject(Memory).remember(true);

  shuffle<T>(array: T[]): T[] {
    const results: T[] = [];
    const values = [...array];
    while (values.length > 0) {
      const index = this.random(values.length);
      const value = [...values][index];
      results.push(value);
      values.splice(index, 1);
    }
    return results;
  }

  rollDie(): OnRoll {
    return OnRoll.parse(this.random(6) + 1);
  }

  rollDice(numDice: number): OnRoll[] {
    return iterate(numDice, () => this.rollDie());
  }

  random(number: number): number {
    this.reversible.set(false);
    return Math.floor(Math.random() * number);
  }

  isReversible(): boolean {
    return this.reversible();
  }
}