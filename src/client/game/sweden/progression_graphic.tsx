import YellowFactory from './factory-yellow.svg';
import RedFactory from './factory-red.svg';
import BlueFactory from './factory-blue.svg';
import BlackFactory from './factory-black.svg';
import EmptyFactory from './factory-empty.svg';
import { useGame } from '../../services/game';
import { SwedenRecyclingMapSettings } from '../../../maps/sweden/settings';
import { useInject, useInjected } from '../../utils/injection_context';
import { Incinerator } from '../../../maps/sweden/incinerator';
import { inject } from '../../../engine/framework/execution_context';


export function SwedenProgressionGraphic() {
  const game = useGame();
  if (game.gameKey !== SwedenRecyclingMapSettings.key) return <></>;

  return <ProgressionGraphic />;
}

export function ProgressionGraphic() {
  const garbageCount = useInject(() => {
    const incinerator = inject(Incinerator);
    return incinerator.getGarbageCount();
  }, []);
  return <>
    <YellowFactory />
    <RedFactory />
    <BlueFactory />
    <BlackFactory />
    <EmptyFactory />
    <text>{garbageCount}</text>
  </>;
}