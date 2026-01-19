# combatActions.js refactor plan

## Goals
- Reduce duplication across attack/defense/save routines.
- Separate pure combat math from dispatch/log side effects.
- Keep behavior identical (rolls, modifiers, messages, and state updates).
- Make rules easier to test and extend.

## Guardrails
- No functional changes without explicit follow-up task.
- Preserve output message strings and log ordering.
- Keep public function signatures stable unless a coordinated change is planned.
- Maintain existing randomness sources and modifier ordering.

## Current pain points (from the file)
- Large 1.3k-line module mixing math, side effects, and control flow.
- Repeated modifier logic (darkness, corridor penalty, class bonuses, equipment).
- Repeated attack resolution for minor/major foes with only small differences.
- Mixed responsibilities: attack math, logging, state updates, targeting rules.

## Proposed decomposition
- **Pure rules helpers**
  - `buildAttackModifiers(hero, options)` -> { mod, modifiers }
  - `buildDefenseModifiers(hero, options)`
  - `buildSaveModifiers(hero, options)`
  - `applyCorridorPenalty(hero, options)`
  - `applyDarknessPenalty(hero, options)`
- **Roll and resolution helpers**
  - `resolveAttackRoll(roll, mod, foeLevel)`
  - `resolveMinorFoeKills(total, foeLevel, foeCount)` (wrap existing calc)
- **Side-effect layers**
  - `logAndUpdateAttack(dispatch, result, meta)`
  - `applyFoeDamage(dispatch, foe, foeIdx, hits)`
  - `applyHeroDamage(dispatch, heroIdx, delta)`
- **Targeting/AI**
  - `expandAttackers(monsters)`
  - `selectTargetsRoom(...)` / `selectTargetsCorridor(...)`

## Step-by-step refactor plan
1. **Extract constants and helpers**
   - Move string labels, class groups, and repeated numeric bonuses to `combatActions.constants.js`.
   - Add helpers for darkness + corridor penalties and equipment bonuses.
2. **Centralize modifier building**
   - Create `combatActions.modifiers.js` with reusable modifier builders.
   - Replace duplicated blocks in `calculateEnhancedAttack`, `attackMinorFoe`, and `calculateDefense`.
3. **Split pure vs side-effect code**
   - Move roll math into `combatActions.rules.js` (pure functions).
   - Keep dispatch/log behavior in `combatActions.effects.js`.
4. **Refactor monster attack targeting**
   - Extract `performMonsterAttacks` targeting rules into `combatActions.targeting.js`.
   - Keep attack resolution logic in a single shared helper to avoid drift.
5. **Recompose public API**
   - `combatActions.js` becomes a thin facade that re-exports public functions.
   - Maintain current signatures and output messages.
6. **Add lightweight verification**
   - Unit tests (if available) for modifier builders and attack resolution.
   - Manual checklist for: minor/major foe attacks, defense, saves, flee/withdraw, monster attacks in room/corridor.

## Suggested file layout
- `4ad-tabs/src/utils/gameActions/combatActions.js`
- `4ad-tabs/src/utils/gameActions/combatActions.constants.js`
- `4ad-tabs/src/utils/gameActions/combatActions.modifiers.js`
- `4ad-tabs/src/utils/gameActions/combatActions.rules.js`
- `4ad-tabs/src/utils/gameActions/combatActions.effects.js`
- `4ad-tabs/src/utils/gameActions/combatActions.targeting.js`

## Acceptance checklist
- All attack/defense/save results match current outputs.
- Modifier ordering and message strings are unchanged.
- Monster targeting rules behave identically in rooms and corridors.
- No change to dispatch sequences or state updates.
- No new performance regressions.
