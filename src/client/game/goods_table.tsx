import { useCallback, useMemo } from "react";
import { AVAILABLE_CITIES } from "../../engine/game/state";
import { ProductionAction } from "../../engine/goods_growth/production";
import { GOODS_GROWTH_STATE } from "../../engine/goods_growth/state";
import { CityGroup } from "../../engine/state/city_group";
import { Good } from "../../engine/state/good";
import { Phase } from "../../engine/state/phase";
import { OnRoll } from "../../engine/state/roll";
import { iterate } from "../../utils/functions";
import { assert } from "../../utils/validate";
import { GoodBlock } from "../grid/good";
import { useAction } from "../services/game";
import { useGrid, useInjectedState, usePhaseState } from "../utils/execution_context";


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

  return <table>
    <thead>
      <tr>
        <th colSpan={6}>White</th>
        <th colSpan={6}>Black</th>
      </tr>
      <tr>
        {iterate(12, (i) => <th key={i}>{i % 6 + 1}</th>)}
      </tr>
    </thead>
    <tbody>
      {iterate(3, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.regularCities.get(cityGroup)?.[onRoll];
          const good = city?.[2 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(false, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
      <tr>
        {iterate(12, (i) => <td key={i}>{i < 2 || i >= 10 ? '' : numberToLetter(i - 2)}</td>)}
      </tr>
      {iterate(2, (i) => <tr key={i}>
        {iterate(12, (i2) => {
          const cityGroup = i2 < 6 ? CityGroup.WHITE : CityGroup.BLACK;
          const onRoll = OnRoll.parse((i2 % 6) + 1);
          const city = cities.urbanizedCities.get(cityGroup)?.[onRoll];
          const good = city?.[1 - i];
          return <td key={i2}><GoodBlock good={good} onClick={() => onClick(true, cityGroup, onRoll)} /></td>;
        })}
      </tr>)}
    </tbody>
  </table>;
}

function numberToLetter(i: number) {
  return String.fromCharCode('A'.charCodeAt(0) + i);
}