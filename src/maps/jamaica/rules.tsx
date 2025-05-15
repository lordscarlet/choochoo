export function JamaicaRules() {
  return (
    <div>
      <p>Same as base game with the following changes:</p>
      <ul>
        <li>
          <b>Dark mountains:</b> cost $5.
        </li>
        <li>
          <b>Production:</b> will not let you place a good of the same color as
          the city.
        </li>
        <li>
          <b>Turn order:</b> takes place before taking shares (there is no
          auction). Players alternate going first, with first player paying $5.
          If the first player cannot or does not want to pay, then the other
          player can pay $5 to go first instead. If the other player chooses not
          to, then the first player can go first for free.
        </li>
        <li>
          <b>Game ends:</b> at the end of the first turn where there are no
          goods left on Jamaica. Goods on the growth chart don&apos;t count.
          Reminder: this check occurs <i>after</i> goods growth.
        </li>
        <li>
          <b>Goods growth:</b> rolls 3 dice each turn.
        </li>
      </ul>
    </div>
  );
}
