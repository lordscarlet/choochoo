import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "@sequelize/core";
import {
  Attribute,
  AutoIncrement,
  CreatedAt,
  DeletedAt,
  NotNull,
  PrimaryKey,
  Table,
  UpdatedAt,
  Version,
} from "@sequelize/core/decorators-legacy";
import { GameApi, GameLiteApi, GameStatus, MapConfig } from "../../api/game";
import { GameKey } from "../../api/game_key";
import { VariantConfig } from "../../api/variant_config";
import { EngineDelegator } from "../../engine/framework/engine";
import { LimitedGame, toLimitedGame } from "../../engine/game/game_memory";
import { AutoAction } from "../../engine/state/auto_action";
import { assert, assertNever } from "../../utils/validate";

@Table({ modelName: "Game" })
export class GameDao extends Model<
  InferAttributes<GameDao>,
  InferCreationAttributes<GameDao>
> {
  @AutoIncrement
  @PrimaryKey
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare version: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare gameKey: GameKey;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.TEXT)
  declare gameData: string | null;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare status: GameStatus;

  @Attribute(DataTypes.JSONB)
  declare autoAction: { users: { [playerId: number | string]: AutoAction } } | null;

  @Attribute(DataTypes.ARRAY(DataTypes.TEXT))
  @NotNull
  declare playerIds: (number | string)[];

  @Attribute({ type: DataTypes.INTEGER, allowNull: true })
  declare ownerId: number | null;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare unlisted: boolean;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare autoStart: boolean;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare turnDuration: number;

  @Attribute({ type: DataTypes.DATE, allowNull: true })
  declare turnStartTime?: CreationOptional<Date | null>;

  @Attribute(DataTypes.ARRAY(DataTypes.TEXT))
  @NotNull
  declare concedingPlayers: (number | string)[];

  @Attribute(DataTypes.JSONB)
  declare config: MapConfig;

  @Attribute(DataTypes.JSONB)
  @NotNull
  declare variant: VariantConfig;

  @Attribute(DataTypes.ARRAY(DataTypes.TEXT))
  declare notes: Array<string | null> | null;

  @Attribute({ type: DataTypes.TEXT, allowNull: true })
  declare activePlayerId: number | string | null;

  @Attribute({ type: DataTypes.TEXT, allowNull: true })
  declare undoPlayerId: number | string | null;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare hotseat: boolean;

  @Version
  @NotNull
  declare internalVersion: CreationOptional<number>;

  @CreatedAt
  @NotNull
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @NotNull
  declare updatedAt: CreationOptional<Date>;

  @DeletedAt
  declare deletedAt: Date | null;

  toLiteApi(): GameLiteApi {
    return toLiteApi(this);
  }

  toApi(): GameApi {
    return toApi(this);
  }

  toLimitedGame(): LimitedGame {
    return toLimitedGame(this);
  }

  getSummary(): string | undefined {
    return toSummary(this);
  }

  getAutoActionForUser(playerId: number | string): AutoAction {
    return this.autoAction?.users?.[playerId] ?? {};
  }

  setAutoActionForUser(playerId: number | string, autoAction: AutoAction): void {
    this.autoAction = this.autoAction ?? { users: {} };
    this.autoAction.users[playerId] = autoAction;
    this.changed("autoAction", true);
  }

  getNotesForUser(playerId: number | string): string {
    const index = this.playerIds.indexOf(playerId);
    if (index === -1) {
      return "";
    }
    return this.notes?.[index] ?? "";
  }

  setNotesForUser(playerId: number | string, notes: string) {
    const index = this.playerIds.indexOf(playerId);
    assert(index >= 0, { unauthorized: "only players can set notes for themselves" });
    this.notes ??= [];
    this.notes[index] = notes;
    this.changed("notes", true);
  }
}

export function toApi(game: InferAttributes<GameDao> | GameApi): GameApi {
  return {
    ...toLiteApi(game),
    version: game.version,
    concedingPlayers: game.concedingPlayers,
    turnStartTime: game.turnStartTime?.toString() ?? undefined,
    gameData: game.gameData ?? undefined,
    undoPlayerId: game.undoPlayerId ?? undefined,
    hotseat: game.hotseat ?? false,
  };
}

function toLiteApi(game: GameApi | InferAttributes<GameDao>): GameLiteApi {
  return {
    id: game.id,
    gameKey: game.gameKey,
    variant: game.variant,
    name: game.name,
    status: game.status,
    turnDuration: game.turnDuration,
    playerIds: [...game.playerIds],
    activePlayerId: game.activePlayerId ?? undefined,
    config: game.config,
    summary: toSummary(game),
    unlisted: game.unlisted,
    hotseat: ("hotseat" in game && game.hotseat) || false,
    ownerId:
      "ownerId" in game ? (game.ownerId ?? undefined) : undefined,
  };
}

export function toSummary(
  game: GameApi | InferAttributes<GameDao>,
): string | undefined {
  if ("summary" in game) {
    return game.summary;
  }
  switch (game.status) {
    case GameStatus.enum.LOBBY:
      return undefined;
    case GameStatus.enum.ACTIVE:
      return EngineDelegator.singleton.readSummary(toLimitedGame(game));
    case GameStatus.enum.ENDED:
      return "Ended";
    case GameStatus.enum.ABANDONED:
      return "Abandoned";
    default:
      assertNever(game.status);
  }
}
