import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { parseArgs } from "util";

const { values: argsUnparsed } = parseArgs({
  args: process.argv.slice(2),
  options: {
    name: { type: "string", short: "n" },
    designer: { type: "string", short: "d" },
    implementer: { type: "string", short: "i" },
    min: { type: "string" },
    max: { type: "string" },
  },
  strict: true,
});

const CAMEL_CASE = /TTTCAMEL_CASE/g;
const NAME = /TTTNAME/g;
const DESIGNER = /TTTDESIGNER/g;
const IMPLEMENTER = /KAOSKODY/g;
const GAME_KEY_NAME = /GameKey.REVERSTEAM/g;
const MIN_PLAYERS = /readonly minPlayers = \d;/g;
const MAX_PLAYERS = /readonly maxPlayers = \d;/g;

createMap(validateArgs(argsUnparsed));

async function createMap({
  name,
  designer,
  implementer,
  maxPlayers,
  minPlayers,
}: ParsedArgs) {
  const snakeCase = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
  const gameKey = snakeCase.replace(/_/g, "-");
  const upperCamelCase = snakeCase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  const constantCase = snakeCase.toUpperCase();

  const dirName = resolve(__dirname, `../maps/${snakeCase}`);
  const templateDir = resolve(__dirname, `../maps/template`);

  try {
    await mkdir(dirName);
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes("file already exists")) {
      throw e;
    }
  }
  const files = await readdir(templateDir);
  await Promise.all([
    updateMapRegistry(),
    updateViewRegistry(),
    addGameKey(),
    addVariantConfig(),
    ...files.map(transformFile),
  ]);

  async function transformFile(filename: string) {
    const contents = await readFile(resolve(templateDir, filename), "utf8");
    const newContents = contents
      .replace(CAMEL_CASE, upperCamelCase)
      .replace(NAME, name)
      .replace(DESIGNER, designer)
      .replace(IMPLEMENTER, implementer)
      .replace(GAME_KEY_NAME, `GameKey.${constantCase}`)
      .replace(MIN_PLAYERS, `readonly minPlayers = ${minPlayers};`)
      .replace(MAX_PLAYERS, `readonly maxPlayers = ${maxPlayers};`);
    await writeFile(resolve(dirName, filename), newContents, "utf8");
  }

  async function updateMapRegistry() {
    const file = resolve(__dirname, "../maps/registry.ts");
    const contents = await readFile(file, "utf8");
    const newContents =
      `import { ${upperCamelCase}MapSettings } from "./${snakeCase}/settings";\n` +
      contents.replace(
        "    this.add(",
        `    this.add(new ${upperCamelCase}MapSettings());\n    this.add(`,
      );
    await writeFile(file, newContents);
  }

  async function updateViewRegistry() {
    const file = resolve(__dirname, "../maps/view_registry.ts");
    const contents = await readFile(file, "utf8");
    const newContents =
      `import { ${upperCamelCase}ViewSettings } from "./${snakeCase}/view_settings";\n` +
      contents.replace(
        "    this.add(",
        `    this.add(new ${upperCamelCase}ViewSettings());\n    this.add(`,
      );
    await writeFile(file, newContents);
  }

  async function addGameKey() {
    const file = resolve(__dirname, "../api/game_key.ts");
    const contents = await readFile(file, "utf8");
    const newContents = contents.replace(
      "enum GameKey {",
      `enum GameKey {\n  ${constantCase} = "${gameKey}",`,
    );
    await writeFile(file, newContents);
  }

  async function addVariantConfig() {
    const file = resolve(__dirname, "../api/variant_config.ts");
    const contents = await readFile(file, "utf8");
    const newContents = contents.replace(
      "gameKey: z.enum([",
      `gameKey: z.enum([\n    GameKey.${constantCase},`,
    );
    await writeFile(file, newContents);
  }
}

interface UnparsedArgs {
  name?: string;
  designer?: string;
  implementer?: string;
  min?: string;
  max?: string;
}

interface ParsedArgs {
  name: string;
  designer: string;
  implementer: string;
  minPlayers: number;
  maxPlayers: number;
}

function validateArgs(args: UnparsedArgs): ParsedArgs {
  const name = args.name;
  if (name == null || name == "") {
    throw new Error("Empty name. Provide a name using --name or -n.");
  }

  const designer = args.designer;
  if (designer == null || designer == "") {
    throw new Error(
      "Empty designer. Provide a designer using --designer or -d.",
    );
  }

  const implementer = args.implementer?.toUpperCase();
  const validImpementers = new Set(["KAOSKODY", "JACK", "GRIMIKU"]);
  if (implementer == null || implementer == "") {
    throw new Error(
      "Empty implementer. Provide an implementer using --implementer or -i.",
    );
  }
  if (!validImpementers.has(implementer)) {
    throw new Error(
      `Invalid implementer. Valid implementers are: ${Array.from(validImpementers).join(", ")}`,
    );
  }

  const maxPlayers = parseInt(args.max ?? "");
  if (isNaN(maxPlayers) || maxPlayers < 1) {
    throw new Error("Invalid max players. Provide max players using --max");
  }

  const minPlayers = parseInt(args.min ?? "3");
  if (isNaN(minPlayers) || minPlayers < 1) {
    throw new Error("Invalid max players. Provide max players using --min");
  }
  if (maxPlayers < minPlayers) {
    throw new Error("Max players cannot be less than min players");
  }
  return {
    name,
    designer,
    implementer,
    minPlayers,
    maxPlayers,
  };
}
