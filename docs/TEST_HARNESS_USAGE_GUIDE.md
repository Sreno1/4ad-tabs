# 4AD Core Rules Test Harness: Usage Guide

This document explains how to use the deterministic test harness for the 4AD rules engine. It covers setup, writing tests, and best practices, with real-world code examples.

## Overview

The test harness is designed to:
- Validate rules logic deterministically (using seeded RNG)
- Prevent regressions during refactors
- Keep tests fast and focused on rules (no UI rendering)

## Prerequisites
- Node.js and npm installed
- `vitest` installed as a dev dependency (see `package.json`)

## Running the Tests

To run all rules tests:

```bash
npm run test:rules
```

This runs all tests in `src/game/test/` using Vitest.

## Test Directory Structure

```
src/game/test/
  fixtures/      # Minimal test data (heroes, monsters, etc)
  helpers/       # Test utilities (makeCtx, makeState)
  scenarios/     # Scenario and integration tests
  unit/          # Unit tests for helpers and modifiers
```

## Writing Deterministic Tests

### 1. Using a Seeded Context

All rules tests use a seeded RNG context for determinism. Use the `makeCtx` helper:

```js
import { makeCtx } from '../helpers/makeCtx.js';

const ctx = makeCtx(42); // 42 is the RNG seed
```

### 2. Example: Unit Test for Dice

```js
import { describe, it, expect } from 'vitest';
import { makeCtx } from '../helpers/makeCtx.js';
import { d6 } from '../../../utils/dice.js';

describe('d6', () => {
  it('is deterministic with seed', () => {
    const ctx = makeCtx(42);
    expect(d6(ctx.rng)).toBe(4);
    expect(d6(ctx.rng)).toBe(2);
  });
});
```

### 3. Example: Unit Test for Modifiers

```js
import { describe, it, expect } from 'vitest';
import { calculateDefense } from '../../../utils/gameActions/combatActions.js';
import { heroWarrior } from '../fixtures/heroes.js';
import { makeCtx } from '../helpers/makeCtx.js';

describe('defense modifiers', () => {
  it('applies darkness penalty without darkvision', () => {
    const ctx = makeCtx(5);
    const result = calculateDefense(heroWarrior, 2, { hasLightSource: false }, ctx);
    expect(result.mod).toBeLessThan(0);
  });
});
```

### 4. Example: Scenario Test

```js
import { describe, it, expect } from 'vitest';
import { makeCtx } from '../helpers/makeCtx.js';
import { heroWarrior } from '../fixtures/heroes.js';
import { minorFoe } from '../fixtures/monsters.js';
import { attackMinorFoe } from '../../../utils/gameActions/combatActions.js';

describe('combat scenarios', () => {
  it('minor foe attack is deterministic', () => {
    const ctx = makeCtx(123);
    const result = attackMinorFoe(heroWarrior, minorFoe, {}, ctx);
    expect(result.kills).toBeGreaterThanOrEqual(0);
    expect(ctx.rollLog.length).toBeGreaterThanOrEqual(0);
  });
});
```

### 5. Example: Snapshot Test for Logs

```js
import { describe, it, expect } from 'vitest';
import { makeCtx } from '../helpers/makeCtx.js';
import { calculateEnhancedAttack } from '../../../utils/gameActions/combatActions.js';
import { heroWarrior } from '../fixtures/heroes.js';

describe('combat log output', () => {
  it('log output is stable with seed', () => {
    const ctx = makeCtx(999);
    const result = calculateEnhancedAttack(heroWarrior, 2, {}, ctx);
    expect(result.message).toMatchSnapshot();
  });
});
```

## Best Practices

- Always use `makeCtx(seed)` for deterministic tests.
- Use fixtures for minimal, reusable test data.
- Prefer unit tests for helpers and modifiers; use scenario tests for flows.
- Use snapshot tests only for stable, user-visible logs.
- Never use `Math.random` in rules code—use `ctx.rng` instead.

## Enforcing Determinism

A guard script (`scripts/check-random.js`) will fail CI if `Math.random` is found in rules code. Run it manually:

```bash
node scripts/check-random.js
```

## Troubleshooting

- If tests are not deterministic, check that all randomness uses `ctx.rng`.
- Use a fixed seed for reproducible failures (optionally via a `TEST_SEED` env var).

## Migrating Existing Tests

- Refactor tests to use `makeCtx(seed)` and pass `ctx` to all rules functions.
- Replace any direct `Math.random` usage with the seeded RNG.

---

For more details, see `docs/ARCH_REFACTOR_06_TEST_HARNESS_DETAIL.md`.
