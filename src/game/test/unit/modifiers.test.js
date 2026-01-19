// src/game/test/unit/modifiers.test.js
import { describe, it, expect } from "vitest";
import { calculateDefense } from "../../../utils/gameActions/combatActions.js";
import { heroWarrior } from "../fixtures/heroes.js";
import { makeCtx } from "../helpers/makeCtx.js";

describe("defense modifiers", () => {
  it("applies darkness penalty without darkvision", () => {
    const ctx = makeCtx(5);
    const result = calculateDefense(heroWarrior, 2, { hasLightSource: false }, ctx);
    expect(result.mod).toBeLessThan(0);
  });
});
