# Core Rules Test Harness - Detailed Plan and Code Samples

## Goals
- Validate rules logic deterministically after RNG injection.
- Prevent regressions during large refactors.
- Keep tests fast and focused on rules (no UI rendering).

## Assumptions
- Deterministic RNG and a rules context (ctx) already exist.
- Rules functions accept an optional `ctx` argument.

## Design Overview
### Test scope
- Unit tests for modifier math and roll helpers.
- Scenario tests for combat flow and targeting.
- Snapshot tests only for stable, user-visible log strings.

### Determinism model
- Every test uses a seeded RNG in ctx.
- Roll order and counts are explicit (using rollLog when needed).

## Step-by-step Implementation Plan
### Step 0: Add Vitest
Add Vitest as a dev dependency and a focused script.

```json
// package.json
{
  "devDependencies": {
    "vitest": "^1.6.0"
  },
  "scripts": {
    "test:rules": "vitest run src/game/test"
  }
}
```

### Step 1: Create test harness structure
```
src/
  game/
    test/
      fixtures/
        heroes.js
        monsters.js
      helpers/
        makeCtx.js
        makeState.js
      scenarios/
        combatScenario.test.js
        monsterTargeting.test.js
      unit/
        modifiers.test.js
        dice.test.js
```

### Step 2: Seeded ctx helper
```js
// src/game/test/helpers/makeCtx.js
import { createRng } from "../../rng.js";

export const makeCtx = (seed = 123) => ({
  rng: createRng(seed),
  now: () => 0,
  debug: false,
  rollLog: [],
});
```

### Step 3: Minimal fixtures
```js
// src/game/test/fixtures/heroes.js
export const heroWarrior = {
  key: "warrior",
  name: "Arden",
  lvl: 2,
  hp: 3,
  equipment: [],
};
```

```js
// src/game/test/fixtures/monsters.js
export const minorFoe = {
  name: "Goblins",
  level: 1,
  count: 4,
  isMinorFoe: true,
};
```

### Step 4: Unit tests for dice
```js
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
```

### Step 5: Unit tests for modifiers
```js
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
```

### Step 6: Scenario tests
```js
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
```

### Step 7: Snapshot tests for logs (sparingly)
```js
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
```

### Step 8: Enforce no Math.random in rules
Add a simple guard script (or a grep check in CI).

```js
// scripts/check-random.js
import { execSync } from "node:child_process";
const output = execSync('rg "Math.random" src/utils src/game', { encoding: "utf8" });
if (output.trim().length > 0) {
  console.error(output);
  process.exit(1);
}
```

## Migration Notes by Area
- `combatActions.js`: add ctx usage to all dice calls.
- `monsterActions.js`: random selection uses ctx.rng.
- `explorationActions.js`: search rolls and wandering monsters use ctx.rng.
- `treasureActions.js`: roll tables use ctx.rng.

## CI/Dev Workflow
- `npm run test:rules` before refactors that touch rules.
- Add a `TEST_SEED` env var in helpers for reproducible failures.

## Verification Checklist
- Tests run in under a few seconds.
- All rules tests use seeded ctx.
- Logs and roll order are stable under a fixed seed.
- No `Math.random` remains in rules code.
