import { useCallback, useMemo, useState } from "react";
import {
  Button,
  DropdownProps,
  Header,
  Modal,
  ModalActions,
  ModalContent,
  Select,
} from "semantic-ui-react";
import { MoveData } from "../../engine/move/move";
import { PlayerColor, playerColorToString } from "../../engine/state/player";
import { MoonMoveAction } from "../../maps/moon/low_gravitation";
import * as styles from "../components/confirm.module.css";
import { useAction } from "../services/action";
import { useCurrentPlayer, useInjected } from "../utils/injection_context";

interface StealIncomeModalProps {
  cityName?: string;
  moveData?: MoveData;
  clearMoveData(): void;
}

export function useStealIncomeState() {
  const action = useInjected(MoonMoveAction);
  const { canEmit } = useAction(MoonMoveAction);
  const [cityName, setCityName] = useState<string | undefined>();
  const [moveData, setMoveData] = useState<MoveData | undefined>();
  const clearMoveData = useCallback(() => {
    setCityName(undefined);
    setMoveData(undefined);
  }, []);
  const maybeStealFrom = useCallback(
    (moveData: MoveData, cityName: string) => {
      if (action.hasLowGravitation()) {
        setCityName(cityName);
        setMoveData(moveData);
        return true;
      }
      return false;
    },
    [canEmit, setMoveData],
  );
  return { moveData, cityName, clearMoveData, maybeStealFrom };
}

const NO_ONE = "NO_ONE" as const;

type StealFrom = PlayerColor | typeof NO_ONE;

export function StealIncomeModal({
  cityName,
  moveData,
  clearMoveData: clearMoveDataExternal,
}: StealIncomeModalProps) {
  const { emit, isPending } = useAction(MoonMoveAction);
  const [stealFrom, setStealFrom] = useState<StealFrom | undefined>(NO_ONE);
  const currentPlayer = useCurrentPlayer();

  const clearMoveData = useCallback(() => {
    clearMoveDataExternal();
    setStealFrom(NO_ONE);
  }, [clearMoveDataExternal, setStealFrom]);

  const options = useMemo(() => {
    if (moveData == null) return [];
    const { path } = moveData;
    const players = new Set(
      path.map((p) => p.owner).filter((p) => p != currentPlayer?.color),
    );
    return [
      { key: NO_ONE, text: "Don't use LG", value: NO_ONE },
      ...[...players].map((p) => ({
        key: p == null ? "--Unowned--" : p,
        text: p == null ? "Unowned link" : playerColorToString(p),
        value: p,
      })),
    ];
  }, [moveData, currentPlayer?.color]);

  const completeMove = useCallback(() => {
    emit({
      ...moveData!,
      stealFrom: stealFrom === NO_ONE ? undefined : { color: stealFrom },
    });
    clearMoveData();
    setStealFrom(NO_ONE);
  }, [emit, clearMoveData, moveData, stealFrom]);

  const onChange = useCallback(
    (_: unknown, { value }: DropdownProps) => {
      setStealFrom(value as StealFrom | undefined);
    },
    [setStealFrom],
  );

  return (
    <Modal
      className={styles.modal}
      closeIcon
      open={moveData != null}
      onClose={clearMoveData}
    >
      <Header className={styles.modal} content={`Deliver to ${cityName}?`} />
      <ModalContent>
        <p>
          Optionally, you can use low gravitation to use a player&apos;s link{" "}
          {stealFrom == NO_ONE ? "no one" : playerColorToString(stealFrom)}.
        </p>
        <Select
          placeholder="Player link"
          options={options}
          onChange={onChange}
        />
      </ModalContent>
      <ModalActions>
        <Button onClick={clearMoveData} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={completeMove} disabled={isPending}>
          {stealFrom === NO_ONE
            ? "Continue without using low gravitation"
            : "Use low gravitation"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
