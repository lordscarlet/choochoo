import { remove, replaceAll } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { inject, injectState } from "../framework/execution_context";
import { Log } from "../game/log";
import { PhaseModule } from "../game/phase_module";
import { PLAYERS, TURN_ORDER } from "../game/state";
import { GridHelper } from "../map/grid_helper";
import { isLocation, Location } from "../map/location";
import { LocationType } from "../state/location_type";
import { Phase } from "../state/phase";
import { PlayerColor } from "../state/player";

export class ExpensesPhase extends PhaseModule {
  static readonly phase = Phase.EXPENSES;

  onStart(): void {
    const log = inject(Log);
    const outOfGamePlayers = new Set<PlayerColor>();
    injectState(PLAYERS).update((players) => {
      for (const player of players) {
        if (player.outOfGame) continue;
        const expenses = player.shares + player.locomotive;
        if (expenses <= player.money) {
          player.money -= expenses;
          log.player(player.color, `earns $${player.income - player.shares - player.locomotive}`);
        } else {
          const lostIncome = expenses - player.money;
          player.money = 0;
          player.income -= lostIncome;
          log.player(player.color, `cannot afford expenses and loses ${lostIncome} income`);
          if (player.income < 0) {
            player.outOfGame = true;
            outOfGamePlayers.add(player.color);
            log.player(player.color, `drops out of the game`);
          }
        }
      }
    });
    if (outOfGamePlayers.size > 0) {
      this.removeFromTurnOrder(outOfGamePlayers);
      this.removeOwnershipMarkers(outOfGamePlayers);
    }
    super.onStart();
  }

  protected removeFromTurnOrder(removeFromTurnOrder: Set<PlayerColor>): void {
    injectState(TURN_ORDER).update((turnOrder) => {
      const newTurnOrder = [...removeFromTurnOrder].reduce((newTurnOrder, toRemove) => remove(newTurnOrder, toRemove), [...turnOrder]);
      /// TODO: What to do when only one person is left.
      replaceAll(turnOrder, newTurnOrder);
    });
  }

  protected removeOwnershipMarkers(players: Set<PlayerColor>): void {
    const grid = inject(GridHelper);
    const toUpdate: Location[] = [...grid.all()].filter(isLocation)
      .filter((location) => {
        return [...location.getTrack()].some((track) => {
          const owner = track.getOwner();
          return owner != null && players.has(owner);
        });
      });
    for (const location of toUpdate) {
      grid.update(location.coordinates, (space) => {
        assert(space.type !== LocationType.CITY);
        assert(space.tile != null);
        space.tile.owners = space.tile.owners.map((owner) => owner != null && players.has(owner) ? undefined : owner);
      });
    }
  }

  getPlayerOrder(): PlayerColor[] {
    return [];
  }
}