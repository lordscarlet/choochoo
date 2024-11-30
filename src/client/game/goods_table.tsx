import { Button } from "@mui/material";
import { useCallback, useMemo } from "react";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { PassAction } from "../../engine/goods_growth/pass";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { CityGroup } from "../../engine/state/city_group";
import { getGoodColor, Good } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { OnRoll } from "../../engine/state/roll";
import { iterate } from "../../utils/functions";
import { assert, assertNever } from "../../utils/validate";
import { useAction, useEmptyAction, useGameVersionState } from "../services/game";
import { useGrid, useInjectedState, usePhaseState } from "../utils/injection_context";
import * as styles from './goods_table.module.css';


export function GoodsTable() {
  const [manuallySelectedGood, setSelectedGood] = useGameVersionState<Good | undefined>(undefined);
  const grid = useGrid();
  const availableCities = useInjectedState(AVAILABLE_CITIES);
  const cities = useMemo(() => {
    const cities = grid.cities();
    const regularCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    const urbanizedCities = new Map<CityGroup, Good[][]>([[CityGroup.WHITE, []], [CityGroup.BLACK, []]]);
    for (const city of cities) {
      const map = city.isUrbanized() ? urbanizedCities : regularCities;
      for (const [index, onRoll] of city.onRoll().entries()) {
        map.get(onRoll.group)![onRoll.onRoll] = onRoll.goods;
      }
    }
    for (const availableCity of availableCities) {
      for (const { group, onRoll, goods } of availableCity.onRoll) {
        urbanizedCities.get(group)![onRoll] = goods;
      }
    }
    return { regularCities, urbanizedCities };
  }, [grid, availableCities]);

  const { emit, canEmit } = useAction(ProductionAction);
  const productionState = usePhaseState(Phase.GOODS_GROWTH, GOODS_GROWTH_STATE);

  const good = manuallySelectedGood ?? productionState?.goods[0];

  const onClick = useCallback((urbanized: boolean, cityGroup: CityGroup, onRoll: OnRoll) => {
    if (!canEmit) return;
    assert(good != null);
    emit({ urbanized, onRoll, cityGroup, good });
  }, [canEmit, emit, good]);

  const toggleSelectedGood = useCallback(() => {
    assert(productionState != null);
    assert(good != null);
    setSelectedGood(productionState.goods[(productionState.goods.indexOf(good) + 1) % productionState.goods.length]);
  }, [good, productionState])

  return <div>
    <PlaceGood good={good} toggleSelectedGood={toggleSelectedGood} />
    <div className={styles.goodsContainer}>
      <div className={styles.row}>
        <div>White</div>
        <div>Black</div>
      </div>
      <div className={styles.row}>
        {iterate(12, i => {
          const cityGroup = i < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i % 6) + 1);
          const city = cities.regularCities.get(cityGroup)?.[onRoll];
          const urbanizedCity = cities.urbanizedCities.get(cityGroup)?.[onRoll];
          const letter = i < 2 || i >= 10 ? '' : numberToLetter(i - 2);
          return <div className={styles.column}>
            <div>{onRoll}</div>
            {iterate(3, goodIndex => <GoodBlock key={goodIndex} good={city?.[2 - goodIndex]} canSelect={canEmit} onClick={() => onClick(false, cityGroup, onRoll)} />)}
            <div>{urbanizedCity && letter}</div>
            {iterate(2, goodIndex => <GoodBlock key={goodIndex} good={urbanizedCity?.[1 - goodIndex]} canSelect={canEmit && urbanizedCity != null} onClick={() => onClick(true, cityGroup, onRoll)} />)}
          </div>;
        })}
      </div>
    </div>
  </div>;
}

export function PlaceGood({ good, toggleSelectedGood }: { good?: Good, toggleSelectedGood(): void }) {
  const { canEmit, canEmitUsername } = useAction(ProductionAction);
  const { emit: emitPass } = useEmptyAction(PassAction);
  const state = usePhaseState(Phase.GOODS_GROWTH, GOODS_GROWTH_STATE);
  if (canEmitUsername == null) {
    return <></>;
  }

  return <div>
    <p>{canEmit ? 'You' : canEmitUsername} drew {state!.goods.map(getGoodColor).join(', ')}</p>
    {canEmit && <div>
      Select where to place {getGoodColor(good!)}.
      {state!.goods.length > 1 && <Button onClick={toggleSelectedGood}>Switch selected good</Button>}
      <Button onClick={emitPass}>Pass</Button>
    </div>}
  </div>;
}

interface GoodBlockProps {
  onClick(): void;
  good?: Good;
  canSelect?: boolean;
}

function GoodBlock({ onClick, good, canSelect }: GoodBlockProps) {
  const classNames = [
    styles.goodPlace,
    good != null ? styles.good : '',
    goodStyle(good),
    canSelect && good == null ? styles.canSelectGood : '',
  ]
  return <div onClick={canSelect ? onClick : undefined} className={classNames.join(' ')} />;
}

export function goodStyle(good?: Good): string {
  switch (good) {
    case Good.BLACK:
      return styles.black;
    case Good.BLUE:
      return styles.blue;
    case Good.PURPLE:
      return styles.purple;
    case Good.RED:
      return styles.red;
    case Good.YELLOW:
      return styles.yellow;
    case undefined:
      return '';
    default:
      assertNever(good);
  }
}

function numberToLetter(i: number) {
  return String.fromCharCode('A'.charCodeAt(0) + i);
}