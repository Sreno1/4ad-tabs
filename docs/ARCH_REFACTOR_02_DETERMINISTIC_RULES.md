# Deterministic Rules and RNG Injection Plan (#2)

## Summary
Make randomness explicit and injectable so rules are deterministic under a seed.
This enables reproducible tests, consistent logs, and easier debugging without changing gameplay behavior.

## Reasoning
- Combat and dungeon outcomes depend on random rolls, which makes bugs hard to reproduce.
- Deterministic RNG allows scenario replays and stable unit tests.
- Explicit RNG usage makes rules clearer, makes roll order visible, and reduces hidden randomness.

## Scope and non-goals
- Do not change probabilities or rule math.
- Do not force a seed in production by default.
- Do not modify UI rendering or animation behavior.

## Plan
1. Create a simple RNG interface in `src/game/rng.js`.
   - Provide `createRng(seed)` and methods `nextInt(max)`, `nextFloat()`, `nextRange(min, max)`.
   - Provide `getState()` and `setState(state)` to support replay/debug.
   - Export a `defaultRng` backed by Math.random to preserve current behavior.
2. Update `src/utils/dice.js` to accept an optional rng.
   - `d6(rng)` uses `rng.nextInt(6) + 1` and defaults to `defaultRng`.
   - `explodingD6(rng)` uses the same rng for each roll in the chain.
   - Keep existing call sites working by allowing the rng param to be omitted.
3. Introduce a rules context object.
   - `ctx = { rng, now, debug, rollLog }` with `getDefaultContext()` for UI callers.
   - Thread `ctx` into rules without breaking signatures by defaulting to `getDefaultContext()`.
4. Add a seeded RNG for tests and debug sessions.
   - Use a stable algorithm (xorshift32 or mulberry32).
   - Allow seeding via query param or dev console to reproduce a session.
5. Add an optional roll recorder and replayer.
   - `rollLog.push({ type, sides, result, meta })` from dice helpers.
   - Provide a replay rng that returns recorded rolls in order.
6. Migrate and audit.
   - `rg "Math.random"` and replace uses in rules and dice.
   - Ensure no incidental rng calls occur during logging or UI work.
7. Document usage.
   - Add a short doc section describing seeding, debug mode, and roll logs.
   - Optionally show the active seed in dev builds.

## API sketch (informational)
```js
const rng = createRng(seed);
const ctx = { rng, now: Date.now, debug: false, rollLog: [] };
const result = calculateEnhancedAttack(hero, foeLevel, options, ctx);
```

## Explanation
Rules should never call Math.random directly. Instead they call `rng.nextInt` or a dice helper.
By default, the app uses a Math.random-backed rng so gameplay stays identical.
For tests or replays, the caller injects a seeded rng to get the same sequence every time.
Keeping rng inside `ctx` makes roll order explicit and avoids hidden randomness.

## Roll ordering constraints
- Preserve the existing order of die rolls for each action.
- Avoid adding new randomness in logging or animation paths.
- When refactoring, ensure the same sequence of rng calls in the same order.

## Risks and Mitigations
- Risk: passing rng everywhere adds boilerplate. Mitigation: a single ctx param with defaults.
- Risk: accidental mixed RNG sources. Mitigation: search for Math.random and add a lint rule.
- Risk: roll ordering changes during refactor. Mitigation: deterministic tests that assert logs.
- Risk: dev seed leaks into prod. Mitigation: default to Math.random unless a seed is supplied.

## Acceptance Checklist
- All randomness flows through the rng interface or dice helpers.
- Default behavior matches current dice outcomes and log messages.
- Rules can run with a fixed seed and produce repeatable results.
- No remaining Math.random usage in rules or dice code.
- Seed and roll logs are available in dev mode for debugging.
