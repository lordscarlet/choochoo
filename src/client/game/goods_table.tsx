import { useCallback, useMemo } from "react";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { OnRoll } from "../../engine/state/roll";
import { iterate } from "../../utils/functions";
import { assert, assertNever } from "../../utils/validate";
import { useAction } from "../services/game";
import { useGrid, useInjectedState, usePhaseState } from "../utils/injection_context";
import * as styles from './goods_table.module.css';


export function GoodsTable() {
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

  const good = useMemo(() => {
    if (productionState == null) return undefined;
    return productionState.goods[0];
  }, [productionState]);

  const onClick = useCallback((urbanized: boolean, cityGroup: CityGroup, onRoll: OnRoll) => {
    if (!canEmit) return;
    assert(good != null);
    emit({ urbanized, onRoll, cityGroup, good });
  }, [canEmit, emit, good]);

  return <div className={styles.goodsContainer}>
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
          {iterate(3, goodIndex => <GoodBlock key={goodIndex} good={city?.[2 - goodIndex]} onClick={() => onClick(false, cityGroup, onRoll)} />)}
          <div>{urbanizedCity && letter}</div>
          {iterate(2, goodIndex => <GoodBlock key={goodIndex} good={urbanizedCity?.[1 - goodIndex]} onClick={() => onClick(true, cityGroup, onRoll)} />)}
        </div>;
      })}
    </div>
  </div>;
}

interface GoodBlockProps {
  onClick(): void;
  good?: Good;
}

function GoodBlock({ onClick, good }: GoodBlockProps) {
  const classNames = [
    styles.goodPlace,
    good != null ? styles.good : '',
    goodStyle(good),
  ]
  return <div onClick={onClick} className={classNames.join(' ')} />;
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