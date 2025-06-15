export function TrislandRules() {
  return (
    <div>
      <p>Same as base game with the following changes:</p>
      <ul>
        <li>
          <b>No purple cities</b>
        </li>
        <li>
          <b>Limited Action selection</b>: Each player has a limit to the number
          of times they can select each action. They must select an action if
          possible, and they must use the action if possible. If there is no
          action available, you will be forced to go without an action.
          <ul>
            <li>Locomotive (2x)</li>
            <li>
              Engineer (2x): you must build 4 track, or until you run out of
              money, even if that means you will not be able to afford your
              expenses.
            </li>
            <li>First Build (x2)</li>
            <li>Production (x1): you must place the drawn goods.</li>
            <li>Urbanization (x1): you must place the available city.</li>
          </ul>
        </li>
      </ul>
    </div>
  );
}
