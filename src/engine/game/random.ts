import { iterate } from "../../utils/functions";
import { OnRoll } from "../state/roll";

export class Random {
  private reversible = true;

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
    this.reversible = false;
    return Math.floor(Math.random() * number);
  }

  isReversible(): boolean {
    const { reversible } = this;
    this.reversible = true;
    return reversible;
  }
}