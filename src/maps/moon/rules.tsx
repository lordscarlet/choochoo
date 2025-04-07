export function MoonRules() {
  return (
    <div>
      <p>Same as base game with the following changes:</p>
      <ul>
        <li>
          <b>Black Cities</b>: are removed from the game.
        </li>
        <li>
          <b>Builds</b>: are limited to 2 (3 w/ engineer).
        </li>
        <li>
          <b>Craters</b>: cost $3 and mountains cost $4. Towns cost $2 +
          $1/exit.
        </li>
        <li>
          <b>Connections</b>: must either be off the Moon Base, or traced back
          to the Moon Base (through any player).
        </li>
        <li>
          <b>Spherical map</b>: builds off one edge of the map can be routed off
          the other end (as marked).
        </li>
        <li>
          <b>Cities</b>: switch to black cities on every other turn.
        </li>
        <li>
          <b>Low gravitation</b>: lets you use another player&apos;s links as
          your own. For now, you must use this ability, there is no partial
          usage.
        </li>
        <li>
          <b>Goods Growth</b>: only replenishes non-black cities.
        </li>
      </ul>
    </div>
  );
}
