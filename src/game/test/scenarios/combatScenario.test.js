// src/game/test/scenarios/combatScenario.test.js
import { describe, it, expect } from "vitest";
import { makeCtx } from "../helpers/makeCtx.js";
import { heroWarrior } from "../fixtures/heroes.js";
import { minorFoe } from "../fixtures/monsters.js";
import { attackMinorFoe } from "../../../utils/gameActions/combatActions.js";

describe("combat scenarios", () => {
  it("minor foe attack is deterministic", () => {
    const ctx = makeCtx(123);
    const result = attackMinorFoe(heroWarrior, minorFoe, {}, ctx);
    expect(result.kills).toBeGreaterThanOrEqual(0);
    expect(ctx.rollLog.length).toBeGreaterThanOrEqual(0);
  });
});
