import { SimpleConstructor } from "../engine/framework/dependency_stack";
import { Module } from "../engine/module/module";
import { AllowedActions } from "../engine/select_action/allowed_actions";
import { Action } from "../engine/state/action";
import { ImmutableSet } from "../utils/immutable";

interface ActionsMutation {
  fullReplace?: Action[];
  remove?: Action[];
  add?: Action[];
}

export class AvailableActionsModule extends Module {
  constructor(private readonly mutation: ActionsMutation) {
    super();
  }

  installMixins(): void {
    this.installMixin(AllowedActions, allowedActionsMixin(this.mutation));
  }
}

function allowedActionsMixin(mutation: ActionsMutation) {
  return function (
    Ctor: SimpleConstructor<AllowedActions>,
  ): SimpleConstructor<AllowedActions> {
    return class extends Ctor {
      getActions(): ImmutableSet<Action> {
        if (mutation.fullReplace) {
          return ImmutableSet(mutation.fullReplace);
        }
        let current = super.getActions();
        for (const remove of mutation.remove ?? []) {
          current = current.delete(remove);
        }
        for (const add of mutation.add ?? []) {
          current = current.add(add);
        }
        return current;
      }
    };
  };
}
