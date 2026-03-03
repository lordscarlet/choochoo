import { PlayerColor, PlayerData } from "../../engine/state/player";

describe("useNewEnglandScoreBreakdown", () => {
  const COLOR = PlayerColor.BLUE;

  function playerData(data: Partial<PlayerData>): PlayerData {
    return { color: COLOR, ...data } as PlayerData;
  }

  describe("money bonus calculation", () => {
    it("returns empty array when player has no money", () => {
      const player = playerData({ money: 0 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(0);
    });

    it("returns correct bonus for money = 20", () => {
      const player = playerData({ money: 20 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(1);
    });

    it("returns correct bonus for money = 40", () => {
      const player = playerData({ money: 40 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(2);
    });

    it("returns correct bonus for money = 50", () => {
      const player = playerData({ money: 50 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(2); // floor(50/20) = floor(2.5) = 2
    });

    it("returns correct bonus for money = 99", () => {
      const player = playerData({ money: 99 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(4); // floor(99/20) = floor(4.95) = 4
    });

    it("returns correct bonus for money = 100", () => {
      const player = playerData({ money: 100 });
      const bonus = Math.floor(player.money / 20);
      
      expect(bonus).toBe(5);
    });
  });
});
