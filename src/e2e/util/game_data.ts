import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { GameStatus } from "../../api/game";
import { UserRole } from "../../api/user";
import { VariantConfig } from "../../api/variant_config";
import { SerializedGameData } from "../../engine/framework/state";
import { MutablePlayerData, PlayerColor } from "../../engine/state/player";
import { GameDao } from "../../server/game/dao";
import { UserDao } from "../../server/user/dao";

interface GameEnvironment {
  game: GameDao;
  players: Map<PlayerColor, UserDao>;
  activePlayer: UserDao;
}

export function setUpGameEnvironment(
  variantConfig: VariantConfig,
  gameDataFile: string,
): GameEnvironment {
  const gameEnvironment = {} as GameEnvironment;

  beforeEach(async () => {
    const gameData = await parseGameData(gameDataFile);
    const users = await initializeUsers();

    const playerData = gameData.gameData["players"] as MutablePlayerData[];
    const players = (gameEnvironment.players = new Map<PlayerColor, UserDao>());
    const currentPlayerColor = gameData.gameData[
      "currentPlayer"
    ] as PlayerColor;
    for (const player of playerData) {
      const user = users.pop()!;
      player.playerId = user.id;
      players.set(player.color, user);
      if (player.color === currentPlayerColor) {
        gameEnvironment.activePlayer = user;
      }
    }

    gameEnvironment.game = await initializeGame(
      variantConfig,
      gameData,
      gameEnvironment.activePlayer,
      [...players.values()],
    );
  });

  afterEach(async () => {
    await gameEnvironment?.game.destroy();
  });

  return gameEnvironment;
}

export async function compareGameData(game: GameDao, gameDataFile: string) {
  await game.reload();
  const actualGameData = JSON.stringify(
    {
      ...game.toApi(),
      id: undefined,
      turnStartTime: undefined,
      gameData: JSON.parse(game.gameData!),
    },
    undefined,
    2,
  );

  if (process.env.WRITE === "true") {
    await writeFile(
      resolve(__dirname, `../goldens/${gameDataFile}.json`),
      actualGameData,
      "utf-8",
    );
  } else {
    const expectedGameData = await parseGameData(gameDataFile);
    expect(actualGameData).toBe(JSON.stringify(expectedGameData, undefined, 2));
  }
}

async function initializeGame(
  variantConfig: VariantConfig,
  gameData: SerializedGameData,
  currentPlayer: UserDao,
  players: UserDao[],
): Promise<GameDao> {
  return GameDao.create({
    version: 1,
    gameKey: variantConfig.gameKey,
    gameData: JSON.stringify(gameData),
    name: "Test game",
    status: GameStatus.enum.ACTIVE,
    turnDuration: 1000,
    concedingPlayers: [],
    activePlayerId: currentPlayer.id,
    playerIds: players.map((u) => u.id),
    variant: variantConfig,
    config: {
      minPlayers: players.length,
      maxPlayers: players.length,
    },
    unlisted: false,
    autoStart: false,
  });
}

export async function initializeUsers(): Promise<UserDao[]> {
  const currentUsers = await UserDao.findAll({ limit: 6 });
  if (currentUsers.length < 6) {
    const newUsers = await fakeUsers(
      new Set(currentUsers.map((u) => u.username)),
    );
    return currentUsers.concat(newUsers);
  }
  return currentUsers;
}

export function fakeUsers(existingUsers: Set<string>): Promise<UserDao[]> {
  return UserDao.bulkCreate(
    ["bob", "jenny", "hurley", "nathan", "gustav", "penelope"]
      .filter((username) => !existingUsers.has(username))
      .map((username) => ({
        username,
        email: `${username}@gmail.com`,
        role: UserRole.enum.USER,
        notificationPreferences: { turnNotifications: [], marketing: false },
        password: "",
        preferredColors: [],
        abandons: 0,
      })),
  );
}

export async function parseGameData(
  gameDataFile: string,
): Promise<SerializedGameData> {
  const contents = await readFile(
    resolve(__dirname, `../goldens/${gameDataFile}.json`),
    "utf-8",
  );
  return SerializedGameData.parse(JSON.parse(contents));
}
