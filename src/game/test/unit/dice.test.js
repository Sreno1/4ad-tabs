// src/game/test/unit/dice.test.js
import { describe, it, expect } from "vitest";
import { makeCtx } from "../helpers/makeCtx.js";
import { d6, explodingD6 } from "../../../utils/dice.js";

describe("dice helpers", () => {
  it("d6 is deterministic with seed", () => {
    const ctx = makeCtx(42);
    expect(d6(ctx.rng)).toBe(4);
    expect(d6(ctx.rng)).toBe(2);
  });

  it("explodingD6 uses same rng", () => {
    const ctx = makeCtx(1);
    const result = explodingD6(ctx.rng);
    expect(result.rolls.length).toBeGreaterThan(0);
  });
});
