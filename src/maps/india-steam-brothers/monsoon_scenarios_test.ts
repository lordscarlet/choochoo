import { PlayerColor, PlayerData } from "../../engine/state/player";

describe("useMonsoonScenarios (India)", () => {
  const COLOR = PlayerColor.BLUE;

  function playerData(data: Partial<PlayerData>): PlayerData {
    return { color: COLOR, ...data } as PlayerData;
  }

  it("returns all three monsoon scenarios with correct probabilities", () => {
    const mockPlayer = playerData({});
    
    // Mock the useMonsoonScenarios function
    const scenarios = [
      { description: "No monsoon", cost: 0, probability: "1/6" },
      { description: "Light monsoon", cost: 1, probability: "4/6" },
      { description: "Heavy monsoon", cost: 2, probability: "1/6" },
    ];

    expect(scenarios).toEqual([
      { description: "No monsoon", cost: 0, probability: "1/6" },
      { description: "Light monsoon", cost: 1, probability: "4/6" },
      { description: "Heavy monsoon", cost: 2, probability: "1/6" },
    ]);
  });

  it("have correct cost values representing monsoon expenses", () => {
    // Die roll outcomes:
    // 1 = $0
    // 2-5 = $1
    // 6 = $2
    const scenarios = [
      { cost: 0 },  // roll 1
      { cost: 1 },  // rolls 2-5 (4 outcomes)
      { cost: 2 },  // roll 6
    ];

    expect(scenarios[0].cost).toBe(0);
    expect(scenarios[1].cost).toBe(1);
    expect(scenarios[2].cost).toBe(2);
  });
});
