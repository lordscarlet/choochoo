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
import { ProfitHelper } from "./helper";

export class ExpensesPhase extends PhaseModule {
  static readonly phase = Phase.EXPENSES;

  private readonly profitHelper = inject(ProfitHelper);
  private readonly grid = inject(GridHelper);
  private readonly log = inject(Log);
  private readonly players = injectState(PLAYERS);
  private readonly order = injectState(TURN_ORDER);

  onStart(): void {
    const outOfGamePlayers = new Set<PlayerColor>();
    this.players.update((players) => {
      for (const player of players) {
        if (player.outOfGame) continue;
        const expenses = this.profitHelper.getExpenses(player);
        if (expenses <= player.money) {
          player.money -= expenses;
          const profit = this.profitHelper.getProfit(player);
          if (profit > 0) {
            this.log.player(player.color, `earns $${profit}`);
          } else {
            this.log.player(player.color, `loses ${-profit}`);
          }
        } else {
          const lostIncome = expenses - player.money;
          player.money = 0;
          player.income -= lostIncome;
          this.log.player(player.color, `cannot afford expenses and loses ${lostIncome} income`);
          if (player.income < 0) {
            player.outOfGame = true;
            outOfGamePlayers.add(player.color);
            this.log.player(player.color, `drops out of the game`);
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
    this.order.update((order) => {
      const newTurnOrder = [...removeFromTurnOrder].reduce((newTurnOrder, toRemove) => remove(newTurnOrder, toRemove), [...order]);
      replaceAll(order, newTurnOrder);
    });
  }

  protected removeOwnershipMarkers(players: Set<PlayerColor>): void {
    const toUpdate: Location[] = [...this.grid.all()].filter(isLocation)
      .filter((location) => {
        return [...location.getTrack()].some((track) => {
          const owner = track.getOwner();
          return owner != null && players.has(owner);
        });
      });
    for (const location of toUpdate) {
      this.grid.update(location.coordinates, (space) => {
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