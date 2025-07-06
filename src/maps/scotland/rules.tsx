export function ScotlandRules() {
  return (
    <div>
      <p>Same as base game with the following changes:</p>
      <ul>
        <li>
          <b>Mountains with a river:</b> cost $5 to build over.
        </li>
        <li>
          <b>Ferry links:</b> the ferry connections (Stornoway-Ullapool &
          Belfast-Ayr) cost $6 and can only be built once both of respective
          towns on each side are urbanized.
        </li>
        <li>
          <b>Ayr-Glasgow connection:</b> will still exist even after Ayr is
          urbanized (it&apos;ll turn into an inter-city connection). If no one
          has build that link before urbanizing, then it will be available for
          claiming for $2.
        </li>
        <li>
          <b>Bidding and Turn Order Pass:</b> During regular auction the first
          player pays full amount of bid and second player pays nothing. Turn
          Order Pass action skips auction entirely on next turn giving priority
          to the player who has taken that action.
        </li>
        <li>
          <b>Goods growth:</b> rolls 4 dice each turn.
        </li>
        <li>
          <b>Game ends:</b> after 8 turns.
        </li>
      </ul>
      <p>
        This is a 2-player implementation of Scotland map on Choochoo. Please do
        check out <a href="https://eot.coderealms.io/">Era of Trains</a> for a
        higher player count variant and other maps.
      </p>
      <br />
    </div>
  );
}
