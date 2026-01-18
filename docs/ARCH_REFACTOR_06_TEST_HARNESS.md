# Core Rules Test Harness Plan (#6)

## Summary
Build a light test harness around the rules layer now that deterministic RNG is in place.
Focus on rule outcomes and log messages, not UI rendering.

## Reasoning
- A large rules surface makes refactors risky without tests.
- Deterministic RNG enables reliable snapshots and scenario tests.
- Tests speed up iteration and reduce regressions during major changes.

## Scope and non-goals
- Scope: rules logic, modifiers, targeting, combat flow, save/flee/withdraw logic.
- Non-goals: React component rendering, canvas output, CSS, or performance tests.
- Keep the harness minimal and fast; avoid heavy integration tests.

## Plan
1. Add a test runner suited for Vite (Vitest) and a simple config.
2. Create helpers for deterministic contexts (ctx with seeded rng and rollLog).
3. Add unit tests for modifier builders and roll resolution.
4. Add scenario tests for combat turns, saves, flee, and monster targeting.
5. Add snapshot tests for log output where behavior must match.
6. Add a lint or grep rule to ensure no new Math.random usage sneaks into rules.

## Test categories
- Unit tests:
  - Modifier math (darkness, corridor, equipment, class bonuses).
  - Dice helpers and exploding roll behavior.
  - Targeting selection order rules.
- Scenario tests:
  - One full hero attack vs minor foes with morale.
  - Major foe attack with level reduction logic.
  - Defense roll including shield ignore conditions.
  - Flee/withdraw flow with strike during escape.
  - Monster attack allocation in room vs corridor.
- Snapshot tests:
  - Combat log messages when ordering and text must remain stable.

## Harness structure
- `src/game/test/fixtures/`:
  - canonical hero and monster objects for repeatable tests.
- `src/game/test/helpers/`:
  - `makeCtx(seed)` -> { rng, rollLog, now } using the deterministic rng.
  - `applyAction` wrapper if using the game core layer.
- `src/game/test/scenarios/`:
  - scenario tests grouped by rules domain.

## Determinism model
- All rule tests use a seeded rng from the deterministic rules layer.
- Roll order is asserted in scenarios when it matters (via rollLog).
- If new randomness is introduced, tests must pin the new sequence and update logs.

## Example test outline (informational)
```js
const ctx = makeCtx(123);
const result = calculateEnhancedAttack(hero, 3, { blessed: true }, ctx);
expect(result.finalTotal).toBe(7);
expect(ctx.rollLog).toMatchObject([{ type: 'd6', result: 4 }]);
expect(result.message).toMatchSnapshot();
```

## Tooling details
- Vitest runs in Node; no DOM dependencies required.
- Keep tests under a few seconds; prefer small data fixtures.
- Add a `test:rules` script to run only core tests during refactors.
- If needed, add a `--seed` option to reproduce failures from the CLI.

## Risks and Mitigations
- Risk: brittle snapshot tests. Mitigation: snapshot only stable logs and avoid noisy fields.
- Risk: large setup cost. Mitigation: start with a minimal core rules suite.
- Risk: false confidence from poor coverage. Mitigation: cover high value flows first.

## Acceptance Checklist
- Test suite runs in under a few seconds.
- Key combat and dungeon flows are covered with deterministic results.
- Refactors can be validated without manual playthroughs.
- Logs and roll order are stable when using a fixed seed.
- New rules can be tested without touching React or DOM.
