import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { RoundEngine } from "../engine/game/round";
import { Module } from "../engine/module/module";

export class TurnLengthModule extends Module {
  constructor(private readonly turnLength: number) {
    super();
  }

  installMixins(): void {
    this.installMixin(RoundEngine, turnLengthMixin(this.turnLength));
  }
}

function turnLengthMixin(turnLength: number) {
  return function (
    Ctor: SimpleConstructor<RoundEngine>,
  ): SimpleConstructor<RoundEngine> {
    return class extends Ctor {
      maxRounds() {
        return turnLength;
      }
    };
  };
}
