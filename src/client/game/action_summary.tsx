import { Button } from "@mui/material";
import { ReactNode, useCallback } from "react";
import { DoneAction } from "../../engine/build/done";
import { BuilderHelper } from "../../engine/build/helper";
import { inject } from "../../engine/framework/execution_context";
import { PHASE } from "../../engine/game/phase";
import { LocoAction } from "../../engine/move/loco";
import { MovePassAction } from "../../engine/move/pass";
import { SelectAction as ActionSelectionSelectAction } from "../../engine/select_action/select";
import { SkipAction } from "../../engine/select_action/skip";
import { ShareHelper } from "../../engine/shares/share_helper";
import { TakeSharesAction } from "../../engine/shares/take_shares";
import { Phase } from "../../engine/state/phase";
import { BidAction } from "../../engine/turn_order/bid";
import { TurnOrderHelper } from "../../engine/turn_order/helper";
import { PassAction } from "../../engine/turn_order/pass";
import { TurnOrderPassAction } from "../../engine/turn_order/turn_order_pass";
import { ProductionPassAction } from "../../maps/disco/production";
import { PassAction as DeurbanizationPassAction } from "../../maps/ireland/deurbanization";
import { PlaceAction } from "../../maps/soultrain/earth_to_heaven";
import {
  StLuciaBidAction,
  StLuciaPassAction,
} from "../../maps/st-lucia/bidding";
import { iterate } from "../../utils/functions";
import { assertNever } from "../../utils/validate";
import { useConfirm } from "../components/confirm";
import { DropdownMenu, DropdownMenuItem } from "../components/dropdown_menu";
import { MaybeTooltip } from "../components/maybe_tooltip";
import { Username } from "../components/username";
import { useAction, useEmptyAction } from "../services/game";
import {
  useActiveGameState,
  useInject,
  useInjected,
  useViewSettings,
} from "../utils/injection_context";
import { ManualGoodsGrowth } from "./india-steam-brothers/goods_growth";

const PASS_ACTION = "Pass" as const;
type PassActionString = typeof PASS_ACTION;

const TURN_ORDER_PASS_ACTION = "Turn Order Pass" as const;
type TurnOrderPassActionString = typeof TURN_ORDER_PASS_ACTION;

export function ActionSummary() {
  const currentPhase = useActiveGameState(PHASE);
  switch (currentPhase) {
    case Phase.SHARES:
      return <TakeShares />;
    case Phase.TURN_ORDER:
      return <Bid />;
    case Phase.ACTION_SELECTION:
      return <SpecialActionSelector />;
    case Phase.BUILDING:
      return <Build />;
    case Phase.MOVING:
      return <MoveGoods />;
    case Phase.END_GAME:
      return <EndGame />;
    case Phase.DEURBANIZATION:
      return <Deurbanization />;
    case Phase.MANUAL_GOODS_GROWTH:
      return <ManualGoodsGrowth />;
    case Phase.DISCO_INFERNO_PRODUCTION:
      return <DiscoProduction />;
    case Phase.EARTH_TO_HEAVEN:
      return <EarthToHeaven />;
    case Phase.ST_LUCIA_TURN_ORDER:
      return <StLuciaTurnOrder />;
    case Phase.GOODS_GROWTH:
    case Phase.INCOME:
    case Phase.EXPENSES:
    case Phase.INCOME_REDUCTION:
    case undefined:
      return <></>;
    default:
      assertNever(currentPhase);
  }
}

function StLuciaTurnOrder() {
  const {
    canEmit,
    canEmitUserId,
    emit: emitBid,
    isPending: bidIsPending,
  } = useEmptyAction(StLuciaBidAction);
  const { emit: emitPass, isPending: passIsPending } =
    useEmptyAction(StLuciaPassAction);

  const isPending = bidIsPending || passIsPending;

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must bid.
      </GenericMessage>
    );
  }

  return (
    <div>
      You must bid.
      <Button onClick={emitPass} disabled={isPending}>
        Pass
      </Button>
      <Button onClick={emitBid} disabled={isPending}>
        Claim first for $5
      </Button>
    </div>
  );
}

function EarthToHeaven() {
  const { canEmit, canEmitUserId } = useAction(PlaceAction);

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must place a new city.
      </GenericMessage>
    );
  }

  return <div>You must place a new city.</div>;
}

function DiscoProduction() {
  const { canEmit, emit, isPending, canEmitUserId } =
    useEmptyAction(ProductionPassAction);

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must select a city to place the
        drawn cubes.
      </GenericMessage>
    );
  }

  return (
    <div>
      You must select a city to place the drawn cubes.
      <Button disabled={isPending} onClick={emit}>
        Pass
      </Button>
    </div>
  );
}

function SpecialActionSelector() {
  const { canEmit, canEmitUserId } = useAction(ActionSelectionSelectAction);
  const {
    canEmit: canEmitSkip,
    isPending,
    emit: emitSkip,
  } = useEmptyAction(SkipAction);

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must select a special action.
      </GenericMessage>
    );
  }
  return (
    <GenericMessage>
      You must select a special action.
      {canEmitSkip && (
        <Button disabled={isPending} onClick={emitSkip}>
          Skip
        </Button>
      )}
    </GenericMessage>
  );
}

function EndGame() {
  return <GenericMessage>This game is over.</GenericMessage>;
}

function MoveGoods() {
  const {
    emit: emitLoco,
    canEmit,
    canEmitUserId,
    getErrorMessage,
  } = useEmptyAction(LocoAction);
  const { emit: emitPass } = useEmptyAction(MovePassAction);
  const viewSettings = useViewSettings();

  const message = viewSettings.moveGoodsMessage?.();

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must move a good.
      </GenericMessage>
    );
  }

  const locoDisabledReason = getErrorMessage();

  return (
    <div>
      <GenericMessage>{message ?? "You must move a good."}</GenericMessage>
      <MaybeTooltip tooltip={locoDisabledReason}>
        <Button onClick={emitLoco} disabled={locoDisabledReason != null}>
          Locomotive
        </Button>
      </MaybeTooltip>
      <Button onClick={emitPass}>Pass</Button>
    </div>
  );
}

function numberFormat(num: number): string {
  return `${num}`;
}

function dollarFormat(num: number | string): string {
  if (typeof num === "string") return num;
  if (num < 0) {
    return `-$${-num}`;
  }
  return `$${num}`;
}

function Bid() {
  const {
    emit: emitBid,
    canEmit,
    canEmitUserId,
    isPending: isBidPending,
  } = useAction(BidAction);
  const { emit: emitTurnOrderPass, isPending: isTurnOrderPending } =
    useEmptyAction(TurnOrderPassAction);
  const { emit: emitPass, isPending: isPassPending } =
    useEmptyAction(PassAction);
  const helper = useInjected(TurnOrderHelper);

  const isPending = isBidPending || isTurnOrderPending || isPassPending;

  const placeBid = useCallback(
    (bid: number | PassActionString | TurnOrderPassActionString) => {
      if (bid === PASS_ACTION) {
        emitPass();
      } else if (bid === TURN_ORDER_PASS_ACTION) {
        emitTurnOrderPass();
      } else {
        emitBid({ bid });
      }
    },
    [emitBid, emitPass, emitTurnOrderPass],
  );

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must bid.
      </GenericMessage>
    );
  }

  const minBid = helper.getMinBid();
  const maxBid = helper.getMaxBid();
  const bids: Array<number | PassActionString | TurnOrderPassActionString> = [
    ...(helper.canUseTurnOrderPass() ? [TURN_ORDER_PASS_ACTION] : []),
    PASS_ACTION,
    ...iterate(maxBid - minBid + 1, (i) => i + minBid),
  ];

  return (
    <div>
      <p>You must bid.</p>
      <DropdownMenu id="bid" title="Place bid" disabled={isPending}>
        {bids.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => placeBid(option)}
            disabled={isPending}
          >
            {dollarFormat(option)}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </div>
  );
}

export function GenericMessage({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function TakeShares() {
  const { canEmit, canEmitUserId, emit, isPending } =
    useAction(TakeSharesAction);
  const numShares = useInjected(ShareHelper).getSharesTheyCanTake();
  const options = iterate(numShares + 1, (i) => i);

  const chooseValue = useCallback(
    (numShares: number) => emit({ numShares }),
    [emit],
  );

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must take out shares.
      </GenericMessage>
    );
  }

  return (
    <div>
      <p>Choose how many shares you would like to take out.</p>
      <DropdownMenu id="shares" title="Choose shares" disabled={isPending}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => chooseValue(option)}
            disabled={isPending}
          >
            {numberFormat(option)}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </div>
  );
}

function Deurbanization() {
  const {
    emit: emitPass,
    canEmit,
    isPending,
    canEmitUserId,
  } = useEmptyAction(DeurbanizationPassAction);

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must select a good to deurbanize.
      </GenericMessage>
    );
  }

  return (
    <div>
      You must select a good to deurbanize.
      <Button onClick={emitPass} disabled={isPending}>
        Skip
      </Button>
    </div>
  );
}

function Build() {
  const { emit: emitPass, canEmit, canEmitUserId } = useEmptyAction(DoneAction);
  const confirm = useConfirm();
  const [buildsRemaining, canUrbanize] = useInject(() => {
    const helper = inject(BuilderHelper);
    if (!canEmit) return [undefined, undefined];
    return [helper.buildsRemaining(), helper.canUrbanize()];
  }, [canEmit]);

  const emitPassClick = useCallback(() => {
    if (!canUrbanize) {
      emitPass();
      return;
    }
    confirm(
      "You still have an urbanize available, are you sure you are done building?",
    ).then((stillPass) => {
      if (stillPass) {
        emitPass();
      }
    });
  }, [emitPass, canUrbanize]);

  if (canEmitUserId == null) {
    return <></>;
  }

  if (!canEmit) {
    return (
      <GenericMessage>
        <Username userId={canEmitUserId} /> must build.
      </GenericMessage>
    );
  }

  return (
    <div>
      You can build {buildsRemaining} more track{canUrbanize && " and urbanize"}
      .<Button onClick={emitPassClick}>Done Building</Button>
    </div>
  );
}
