# Deterministic Rules and RNG Injection - Detailed Plan and Code Samples

## Goals
- Make all randomness explicit and injectable.
- Keep current gameplay behavior by default.
- Enable deterministic tests and reproducible bug reports.

## Design Overview
### RNG interface
- Use a small RNG abstraction with `nextInt`, `nextFloat`, and `nextRange`.
- Provide a seeded RNG for tests and debugging.
- Provide a Math.random backed default RNG for normal play.

### Context object
- Add a `ctx` parameter to rules functions: `{ rng, now, debug, rollLog }`.
- When `ctx` is omitted, rules should fall back to a default context.

### Roll logging (optional but recommended)
- Record each roll with type, sides, result, and optional metadata.
- Use this for deterministic snapshots and replay.

## Step-by-step Implementation Plan
### Step 0: Audit randomness
- `rg "Math.random" src` and `rg "d6\\(" src` to find all randomness entry points.
- Confirm which functions are rules vs UI-only.

### Step 1: Add RNG module
Create `src/game/rng.js` with a seeded RNG and default RNG.

```js
// src/game/rng.js
export const createRng = (seed = 123456789) => {
  let state = seed >>> 0;
  const nextInt = (max) => {
    // mulberry32
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(result * max);
  };
  const nextFloat = () => nextInt(0xffffffff) / 0xffffffff;
  const nextRange = (min, max) => min + nextInt(max - min + 1);
  const getState = () => state >>> 0;
  const setState = (s) => { state = (s >>> 0); };
  return { nextInt, nextFloat, nextRange, getState, setState };
};

export const defaultRng = {
  nextInt: (max) => Math.floor(Math.random() * max),
  nextFloat: () => Math.random(),
  nextRange: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
};
```

### Step 2: Update dice helpers to accept rng
Modify `src/utils/dice.js` so callers can pass `rng`, but old call sites still work.

```js
// src/utils/dice.js
import { defaultRng } from "../game/rng.js";

export const d6 = (rng = defaultRng) => rng.nextInt(6) + 1;

export const explodingD6 = (rng = defaultRng) => {
  const rolls = [];
  let total = 0;
  let exploded = false;
  let roll = d6(rng);
  rolls.push(roll);
  total += roll;
  while (roll === 6) {
    exploded = true;
    roll = d6(rng);
    rolls.push(roll);
    total += roll;
  }
  return { total, rolls, exploded };
};
```

### Step 3: Introduce a default context helper
Add a lightweight context factory to avoid passing many params.

```js
// src/game/context.js
import { defaultRng } from "./rng.js";

export const getDefaultContext = () => ({
  rng: defaultRng,
  now: Date.now,
  debug: false,
  rollLog: null,
});
```

### Step 4: Thread ctx into rules functions
Update rule functions to accept `ctx` as the last param and default it.

```js
import { getDefaultContext } from "../game/context.js";
import { d6, explodingD6 } from "../utils/dice.js";

export const calculateEnhancedAttack = (hero, foeLevel, options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const { total, rolls, exploded } = explodingD6(rng);
  if (rollLog) {
    rollLog.push({ type: "explodingD6", rolls });
  }
  // ... existing logic unchanged ...
};
```

### Step 5: Optional roll recorder
Add a small helper for consistent roll logging.

```js
// src/game/rollLog.js
export const logRoll = (rollLog, entry) => {
  if (!rollLog) return;
  rollLog.push(entry);
};
```

Use in dice helpers or rule functions:

```js
logRoll(rollLog, { type: "d6", result: roll });
```

### Step 6: Migrate call sites
- Keep existing calls unchanged by defaulting `ctx`.
- For tests and debug, pass `ctx` explicitly.

```js
const ctx = { rng: createRng(42), rollLog: [] };
const result = calculateEnhancedAttack(hero, level, options, ctx);
```

### Step 7: Audit and enforce
- Replace any remaining `Math.random` usage in rules code.
- Add a CI check or simple grep script to prevent regressions.

## Migration Notes by Area
- `src/utils/gameActions/combatActions.js`: pass `ctx` into dice rolls.
- `src/utils/gameActions/monsterActions.js`: any random selection uses `ctx.rng`.
- `src/utils/gameActions/explorationActions.js`: wandering monsters, search rolls.
- `src/utils/gameActions/treasureActions.js`: treasure tables should use `ctx.rng`.
- `src/data/spells.js` and spell actions: casting rolls and MR rolls use `ctx`.

## Code Sample: Deterministic Test
```js
import { createRng } from "../game/rng.js";
import { calculateEnhancedAttack } from "../utils/gameActions/combatActions.js";

const ctx = { rng: createRng(123), rollLog: [] };
const result = calculateEnhancedAttack(hero, 3, { blessed: true }, ctx);
expect(result.finalTotal).toBe(7);
expect(ctx.rollLog.length).toBe(1);
```

## Roll Order Constraints
- Preserve the exact order of RNG calls in each action.
- Do not add randomness during logging or UI only steps.
- If new randomness is added, document the change and update tests.

## Rollout Strategy
1. Add RNG and dice helper changes (no functional change).
2. Update a single rules file (combat) to use `ctx`.
3. Add deterministic tests for combat outcomes.
4. Migrate exploration and treasure.
5. Add a debug seed option to reproduce issues.

## Verification Checklist
- All rules use `ctx.rng` or dice helpers.
- Default gameplay behavior is unchanged.
- Deterministic tests pass with a fixed seed.
- No `Math.random` remains in rules code.
