import * as React from "react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Container,
  DropdownProps,
  Form,
  FormCheckbox,
  FormInput,
  FormSelect,
  Header,
  Segment,
} from "semantic-ui-react";
import { GameKey } from "../../api/game_key";
import { UserRole } from "../../api/user";
import { VariantConfig } from "../../api/variant_config";
import {
  ReleaseStage,
  releaseStageToString,
} from "../../engine/game/map_settings";
import { Grid } from "../../engine/map/grid";
import { ViewRegistry } from "../../maps/view_registry";
import * as mapStyles from "../grid/hex.module.css";
import { HexGrid } from "../grid/hex_grid";
import { environment, Stage } from "../services/environment";
import { useCreateGame } from "../services/game";
import { useIsAdmin, useMe } from "../services/me";
import {
  useNumberInputState,
  useSelectState,
  useSemanticUiCheckboxState,
  useTextInputState,
} from "../utils/form_state";
import { MapInfo } from "./map_info";

export function CreateGamePage() {
  const me = useMe();
  const initialMapValue =
    (useSearchParams()[0].get("map") as GameKey) ?? GameKey.REVERSTEAM;
  const maps = useMemo(
    () =>
      [...ViewRegistry.singleton.values()]
        .filter((map) => map.stage !== ReleaseStage.DEPRECATED)
        .filter(
          (map) =>
            environment.stage === "development" ||
            map.stage !== ReleaseStage.DEVELOPMENT ||
            me?.role === UserRole.enum.ADMIN,
        )
        .sort((a, b) => (a.name < b.name ? -1 : 1)),
    [],
  );
  const [name, setName] = useTextInputState("");
  const [gameKey, _, setGameKeyState] = useSelectState(initialMapValue);

  const map = ViewRegistry.singleton.get(gameKey);
  const allowPlayerSelections = map.minPlayers !== map.maxPlayers;

  const selectedMap = useMemo(() => {
    return ViewRegistry.singleton.get(gameKey);
  }, [gameKey]);

  const [artificialStart, setArtificialStart] = useSemanticUiCheckboxState();
  const [unlisted, setUnlisted] = useSemanticUiCheckboxState();
  const [minPlayersS, setMinPlayers, setMinPlayersRaw] = useNumberInputState(
    selectedMap.minPlayers,
  );
  const [maxPlayersS, setMaxPlayers, setMaxPlayersRaw] = useNumberInputState(
    selectedMap.maxPlayers,
  );
  const { validateGame, createGame, validationError, isPending } =
    useCreateGame();
  const [variant, setVariant] = useState(
    (selectedMap.getInitialVariantConfig?.() ?? { gameKey }) as VariantConfig,
  );

  const minPlayers = allowPlayerSelections ? minPlayersS : map.minPlayers;
  const maxPlayers = allowPlayerSelections ? maxPlayersS : map.maxPlayers;

  const setGameKey = useCallback(
    (event: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      const gameKey = data.value as GameKey;
      setGameKeyState(gameKey);
      const map = ViewRegistry.singleton.get(gameKey);
      if (typeof minPlayers === "number") {
        setMinPlayersRaw(Math.max(minPlayers, map.minPlayers));
      }
      if (typeof maxPlayers === "number") {
        setMaxPlayersRaw(Math.min(maxPlayers, map.maxPlayers));
      }
      setVariant(
        (map.getInitialVariantConfig?.() ?? { gameKey }) as VariantConfig,
      );
    },
    [
      setVariant,
      minPlayers,
      maxPlayers,
      setMinPlayersRaw,
      setMaxPlayersRaw,
      setGameKeyState,
    ],
  );

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      createGame({
        name,
        gameKey,
        artificialStart,
        minPlayers,
        maxPlayers,
        unlisted,
        variant: variant as VariantConfig,
      });
    },
    [
      name,
      gameKey,
      allowPlayerSelections,
      artificialStart,
      unlisted,
      createGame,
      minPlayers,
      maxPlayers,
      variant,
    ],
  );

  const validateGameInternal = useCallback(() => {
    validateGame({
      name,
      gameKey,
      artificialStart,
      minPlayers,
      maxPlayers,
      unlisted,
      variant: variant as VariantConfig,
    });
  }, [name, gameKey, artificialStart, minPlayers, maxPlayers, variant]);

  const [riverPath, setRiverPath] = useState<string | undefined>();

  const grid = useMemo(() => {
    if (gameKey == null) return undefined;
    const settings = ViewRegistry.singleton.get(gameKey);
    return Grid.fromData(
      settings,
      settings.startingGrid,
      settings.interCityConnections ?? [],
    );
  }, [gameKey]);

  const Editor = selectedMap.getVariantConfigEditor;

  if (validationError != null) {
    console.log("validation", validationError);
  }

  return (
    <Container>
      <Header as="h1">Create a new Game</Header>

      <Segment>
        <Form>
          <FormInput
            required
            label="Name"
            value={name}
            disabled={isPending}
            error={validationError?.name}
            onChange={setName}
            onBlur={validateGameInternal}
          />
          <FormSelect
            options={maps.map((m) => ({
              key: m.key,
              value: m.key,
              text:
                m.name +
                (m.stage !== ReleaseStage.PRODUCTION &&
                  ` (${releaseStageToString(m.stage)})`),
            }))}
            required
            label="Map"
            value={gameKey}
            disabled={isPending}
            onChange={setGameKey}
            error={validationError?.gameKey}
            autoWidth
            placeholder="Map"
            onBlur={validateGameInternal}
          />
          <FormInput
            required
            label={allowPlayerSelections ? "Min Players" : "Num Players"}
            type="number"
            disabled={!allowPlayerSelections}
            value={minPlayers}
            error={validationError?.minPlayers}
            onChange={setMinPlayers}
            onBlur={validateGameInternal}
          />

          {allowPlayerSelections && (
            <FormInput
              required
              label="Max Players"
              type="number"
              value={maxPlayers}
              error={validationError?.maxPlayers}
              onChange={setMaxPlayers}
              onBlur={validateGameInternal}
            />
          )}

          {environment.stage == Stage.enum.development && (
            <FormCheckbox
              toggle
              label="Artificial Start"
              checked={artificialStart}
              disabled={isPending}
              onChange={setArtificialStart}
              error={validationError?.artificialStart}
            />
          )}

          <FormCheckbox
            toggle
            label="Unlisted Game"
            checked={unlisted}
            disabled={isPending}
            onChange={setUnlisted}
            error={validationError?.unlisted}
          />

          {Editor && (
            <Editor
              config={variant}
              setConfig={setVariant}
              errors={validationError}
              isPending={isPending}
            />
          )}

          <Button
            primary
            loading={isPending}
            disabled={isPending}
            onClick={onSubmit}
          >
            Create
          </Button>
        </Form>
      </Segment>

      <Segment>
        <MapInfo gameKey={gameKey} variant={variant} />
        <RiverEditor path={riverPath} setRiverPath={setRiverPath} />
        {grid && (
          <HexGrid
            key={gameKey}
            gameKey={gameKey}
            rotation={selectedMap.rotation}
            grid={grid}
            fullMapVersion={true}
          >
            {riverPath && <River path={riverPath} />}
          </HexGrid>
        )}
      </Segment>
    </Container>
  );
}

function River({ path }: { path: string }) {
  return <path className={mapStyles.riverPath} d={path} />;
}

function RiverEditor({
  path,
  setRiverPath,
}: {
  path?: string;
  setRiverPath: (path?: string) => void;
}) {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <></>;
  return (
    <input
      type="text"
      value={path}
      size={100}
      onChange={(e) =>
        setRiverPath(e.target.value.length ? e.target.value : undefined)
      }
    />
  );
}
