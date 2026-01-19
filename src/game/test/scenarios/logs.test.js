// src/game/test/scenarios/logs.test.js
import { describe, it, expect } from "vitest";
import { makeCtx } from "../helpers/makeCtx.js";
import { calculateEnhancedAttack } from "../../../utils/gameActions/combatActions.js";
import { heroWarrior } from "../fixtures/heroes.js";

describe("combat log output", () => {
  it("log output is stable with seed", () => {
    const ctx = makeCtx(999);
    const result = calculateEnhancedAttack(heroWarrior, 2, {}, ctx);
    expect(result.message).toMatchSnapshot();
  });
});
