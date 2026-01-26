# Four Against Darkness - Implementation Roadmap
*A comprehensive analysis and architecture plan for missing mechanics*

**Last Updated:** 2026-01-17 (Roadmap reorganized; completed work archived)
**Status:** Implementation Phase - Refactors and remaining mechanics

---

## Executive Summary

This document provides a complete audit of the Four Against Darkness companion app implementation, comparing current code against official 4AD rules. It categorizes all mechanics by implementation status and provides architectural recommendations.

**Current Implementation Status:** ~75% Complete (snapshot; see archive for completed work)

- ✅ **Fully Implemented:** 55%
- ⚠️ **Partially Implemented:** 20%
- ❌ **Not Implemented:** 25%

**Completed work archive:** `archived_completed_tasks.md`

---

## Table of Contents

1. [Fully Implemented Features (Archived)](#fully-implemented)
2. [Partially Implemented Features](#partially-implemented)
3. [Not Implemented Features](#not-implemented)
4. [Architecture Refactors](#architecture-recommendations)
5. [Implementation Priority (Remaining)](#implementation-priority)
6. [Rules Verification (Outstanding)](#rules-verification)
7. [Timeline (Remaining Work)](#timeline)
8. [Testing Strategy (Remaining)](#testing-strategy)

---

<a name="fully-implemented"></a>
## 1. Fully Implemented Features (Archived)

Completed features and session work have moved to `archived_completed_tasks.md`.

---

<a name="partially-implemented"></a>
## 2. ⚠️ PARTIALLY IMPLEMENTED FEATURES

### Combat System

#### **Marching Order**
- **Status:** Implemented (corridor restrictions, narrow-corridor penalties, and wandering-monster rear-attack behavior)
- **What Exists:**
  - Marching order array: `src/state/initialState.js:157-159`
  - `SET_MARCHING_ORDER` action and reducer handling: `src/state/reducers/partyReducer.js:195-215`
  - Corridor / narrow-corridor helpers: `src/utils/combatLocationHelpers.js` (`canHeroMeleeAttack`, `getNarrowCorridorPenalty`)
- **Notes / Remaining polish:**
  - ✅ Corridor combat restrictions (only front positions may melee) — enforced via `canHeroMeleeAttack`.
  - ✅ Wandering-monster rear-attack logic implemented for ambushes.
  - ⚠️ Position-based targeting — partially implemented: the ambush rear-targeting currently prefers the rear-most alive heroes by selecting from the end of the `state.party` array. This is a deliberate, low-risk implementation; it can be upgraded to use `state.marchingOrder` (exact position indices 1–4) if you want strict position-mapping.
- **Behavior implemented:**
  - Wandering Monsters triggered as ambushes now always attack first (combat auto-enters defend mode).
  - Shields are disabled for the first defense roll against a wandering-monster encounter (one-time suppression).
  - In corridors, ambushes prefer rear-most PCs; in rooms, default allocation falls back to existing random/round-robin behavior unless a room-distribution algorithm is applied (see next steps).
- **Files touched (implementation):**
  - `src/utils/gameActions/monsterActions.js` — ambush flag on spawn; dispatch wandering-encounter meta
  - `src/utils/gameActions/combatActions.js` — rear-targeting for ambush monsters; `calculateDefense` supports shield suppression
  - `src/components/Combat.jsx` — auto-set monster-first initiative and handle shield suppression state
  - `src/state/actions.js` — added `SET_WANDERING_ENCOUNTER`
  - `src/state/reducers/combatReducer.js` — stores `combatMeta.wanderingEncounter`
- **Rule Reference:** Combat.txt p.118-122
- **Rule Reference:** Combat.txt p.118-122
- **Architecture Needed:**
  ```javascript
  // Combat action needs location context
  {
    location: 'corridor' | 'room',
    width: 'normal' | 'narrow',
    positions: {
      canMelee: [1, 2], // positions that can melee in corridors
      canRanged: [3, 4] // positions that can only use ranged
    }
  }
  ```

#### **Reaction-Based Initiative**
- **Status:** Reactions defined but initiative ordering incomplete
- **What Exists:**
  - Reaction types: `src/data/monsters.js:149-250+`
  - Basic initiative logic: `src/utils/gameActions/combatActions.js:799-860`
  - Reaction properties (hostile, bribe, etc.)
- **What's Missing:**
  - ❌ Per-monster reaction table assignment
  - ❌ Reaction-specific initiative rules (Fight to Death = monsters first)
  - ❌ Bribe mechanics
- **Rule Reference:** Combat.txt p.12-14
- **Architecture Needed:**
  ```javascript
  // Each monster template needs:
  {
    reactionTable: 'aggressive' | 'defensive' | 'neutral',
    reactionModifiers: {
      bribe: '+1',
      intimidate: '-2'
    }
  }
  ```

#### **Spell Targeting**
- **Status:** Spell types defined but targeting NOT enforced
- **What Exists:**
  - Spell definitions with target types: `src/data/spells.js`
  - Target types: 'all_enemies', 'single', 'single_ally'
- **What's Missing:**
  - ✅ Core cast logic implemented in `src/data/spells.js` with MR and casting roll handling
  - ✅ performCastSpell and performCastScrollSpell apply most spell effects and log MR/cast details
  - ✅ AoE damage and single-target damage plumbing in `src/utils/gameActions/spellActions.js`
  - ❌ UI for target selection
  - ❌ Per-spell exact targeting/edge cases still need to be hardened (e.g., fire immunities, elementals, undead exceptions)
  - ❌ Minor Foe group targeting rules UI (selection) and group-resolution edge cases
- **Rule Reference:** Magic.txt
- **Architecture Needed:**
  ```javascript
  // Add to combat UI:
  const SpellTargeting = {
    single: (monsters) => selectOne(monsters),
    all_enemies: (monsters) => monsters.filter(alive),
    minor_foe_group: (monsters) => selectMinorFoeGroup(monsters)
  }
  ```

#### **Traps**
- **Status:** Basic trap system exists but missing complications
- **What Exists:**
  - Trap state: `src/state/reducers/dungeonReducer.js:66-95`
  - Detect/disarm functions
  - Trap types defined
- **What's Missing:**
  - ❌ Trap complications on failed disarm (alarm, secret monsters)
  - ❌ Rogue +L bonus to disarm
  - ❌ Trap damage variety
- **Rule Reference:** Exploration.txt p.90-91
- **Architecture Needed:**
  ```javascript
  // Enhance trap system:
  {
    complications: {
      1-2: 'alarm', // triggers wandering monsters
      3-5: 'straightDamage',
      6: 'ghostGuardian'
    }
  }
  ```

#### **Character Traits**
- **Status:** All traits defined but not all effects wired up
- **What Exists:**
  - Complete trait definitions: `src/data/traits.js` (987 lines)
  - Roll modifiers applied: `src/utils/gameActions/combatActions.js:70`
- **What's Missing:**
  - ❌ Some special trait effects (Wildform, Rootbind, etc.)
  - ❌ Trait activation UI
- **Rule Reference:** Characters.txt
- **Priority:** Low (most traits functional)

---

<a name="not-implemented"></a>
## 3. ❌ NOT IMPLEMENTED FEATURES

- ADD CURVED AND ENTRANCE ROOMS (1-6, 25, 34, 36)
- add xp roll button to each party card
- when placing a recognized tile from the library that was generated, the walls need to be two different colors for the two tile types, corridor and room.
- manually update monsters.js

### Dungeon Exploration

#### **Retracing Steps Wandering Monster (1-in-6)**
- **Status:** NOT FULLY IMPLEMENTED
- **Rule:** When revisiting tiles, 1-in-6 wandering monster (Exploration.txt p.104)
- **Current Issue:** Implemented for Withdraw but not general retracing
- **Architecture Needed:**
  ```javascript
  const onEnterTile = (x, y) => {
    const tile = state.grid[y][x];
    if (tile.visited) {
      if (d6() === 1) {
        rollWanderingMonster();
      }
    }
  };
  ```
- **Priority:** LOW

### Combat System

### Remaining Spell/Combat Tasks (high priority)
- Wire trait effect flags into `getTraitRollModifiers` (expose `spellCastingBonus` from trait effects consistently).
- Replace `targets[0].castingBonus` usage with explicit `castSpell(spellKey, caster, targets, context)` signature for clarity.
- Implement UI target selection for: single target, minor-foe group target, and AoE confirmation.
- Implement edge-case resistances/vulnerabilities (fire-immune, undead vs healing-like effects, elementals) in `castSpell` and `performCastSpell`.
- Ensure per-turn expiry of status flags (entangleTurns/boundTurns/asleep duration) and visual/log expiry messages.
- Add tests for MR fail/pass, Fireball minor-foe slay, entangle/asleep behavior, and bound target +2 damage.

#### **Environment-Based Treasure Tables**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Different treasure for Dungeons, Fungal Grottoes, Caverns (Tables.txt)
- **Current Issue:** Generic treasure table only
- **Architecture Needed:**
  ```javascript
  // Add to state:
  {
    currentEnvironment: 'dungeon' | 'fungal_grottoes' | 'caverns'
  }

  // Create environment-specific tables:
  export const TREASURE_BY_ENVIRONMENT = {
    dungeon: { /* standard loot */ },
    fungal_grottoes: { /* mushrooms, spores */ },
    caverns: { /* crystals, minerals */ }
  };
  ```
- **Priority:** MEDIUM

#### **Quest System**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Quests are rolled from the quest table (tables.txt) and given to the player via Reactions (if the monster reaction roll lands on "Quest") or from Dungeon Special Events, when the Lady in White gives the characters a quest.
- **Architecture Needed:**
  ```javascript
  // Add to adventure state:
  {
    quest: {
      type: 'rescue' | 'artifact' | 'exterminate',
      target: string,
      reward: number,
      completed: boolean
    }
  }

  // Quest table:
  export const QUEST_TABLE = {
    1: { type: 'rescue', reward: 100 },
    2: { type: 'artifact', reward: 150 },
    // ...
  };
  ```
- **Priority:** LOW (optional content)

#### **Epic Rewards**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Special rewards for achievements
- **Priority:** LOW (optional content)

### Party Management

#### **Equipment Limits**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** 3 weapons, 2 shields max per PC
- **Current Issue:** No validation on equipment add
- **Architecture Needed:**
  ```javascript
  // Already partially implemented!
  // src/data/equipment.js:372-415 has canEquipItem()
  // Just needs to be enforced in UI
  ```
- **Priority:** LOW

#### **Stealth Modifiers Per Class**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Rogues, rangers, etc. get stealth bonuses
- **Priority:** LOW

### Resource Tracking

#### **Food Rations**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Required for wilderness survival
- **Priority:** LOW (wilderness not in scope)

---

<a name="architecture-recommendations"></a>
## 4. ARCHITECTURE REFACTORS

This roadmap prioritizes the following refactors (in order):

1. Deterministic Rules and RNG Injection (#2) - `docs/ARCH_REFACTOR_02_DETERMINISTIC_RULES.md`
2. Core Rules Test Harness (#6) - `docs/ARCH_REFACTOR_06_TEST_HARNESS.md`
3. Data Schema and Validation (#5) - `docs/ARCH_REFACTOR_05_DATA_SCHEMA_VALIDATION.md`

Optional architecture work:
- Input to Action Mapping Layer (#4) - `docs/ARCH_REFACTOR_04_INPUT_ACTION_LAYER.md`
- Game Core Separation (#1) - `docs/ARCH_REFACTOR_01_GAME_CORE.md`

---

<a name="implementation-priority"></a>

## 5. IMPLEMENTATION PRIORITY (REMAINING)
1. allow user to input custom gold amount instead of rolling at start x
2. implement starting rooms with correct shapes and addition at beginning of crawl.
4. fix bug where player cant attack sometimes because character "already attacked that round"
5. make sure multiple enemies all get a chance to attack
6. fix bug where major foes all seem to have one health
7. add undo button (and history states) to dungeon grid editor. works for any action taken (placing tiles, adding rooms, editing walls and doors, etc.)

### High Priority: Core Gameplay Gaps
1. Spell targeting UI + casting edge cases (traits, resistances, status expiry)
2. Reaction-based initiative and per-monster reaction tables (bribe/intimidate/otherwise peaceful reactions need to be coded in logically)
3. Trap complications + rogue bonus + damage variety
4. Environment-based treasure tables (depends on #5)
5. Marching order targeting improvements (use marchingOrder positions)

### Medium Priority: Content and UX
9. Retracing steps wandering monster (1-in-6)
10. Character trait effects and activation UI
11. Curved and entrance rooms (1-6, 25, 34, 36)
12. Tile library wall colors for room vs corridor tiles
13. Update monsters data (after #5 schema)
14. XP roll button per party card (UI polish)
15. Bandage limits

### Low Priority: Optional Content
16. Quest system
17. Epic rewards
18. Equipment limits
19. Stealth modifiers
20. Food rations

Manually check everything in data - for example, traits for rogue are incorrect and are probably implemented incorrectly in the actual game files. all classes need checked.

---

<a name="rules-verification"></a>
## 6. RULES VERIFICATION (OUTSTANDING)

- Carried treasure weight (200gp): verify exact rule source.
- XP rolls: verify exact formula (assumed d6 * base XP / 6).
- Equipment limits (3 weapons, 2 shields): verify in equipment rules.

---

<a name="timeline"></a>
## 7. TIMELINE (REMAINING WORK)

### Phase 0: Refactor Foundations (sequence locked)
1. Deterministic Rules and RNG Injection (#2)
2. Core Rules Test Harness (#6)
3. Data Schema and Validation (#5)

### Phase 1: Core Gameplay Gaps
4. Spell targeting UI + casting edge cases
5. Reaction-based initiative + reaction tables + bribe mechanics
6. Trap complications + rogue bonus + damage variety
7. Marching order targeting improvements
8. Retracing steps wandering monster (1-in-6)

### Phase 2: Data-Driven Content and UX
9. Environment-based treasure tables (after #5)
10. Update monsters data (after #5)
11. Curved and entrance rooms (1-6, 25, 34, 36)
12. Tile library wall colors for room vs corridor tiles
13. XP roll button per party card
14. Bandage limits

### Phase 3: Optional Content
15. Quest system
16. Epic rewards
17. Equipment limits
18. Stealth modifiers
19. Food rations

### Verification Track (parallel)
- Verify carried treasure weight rule source and behavior
- Verify XP roll formula against rulebook

---

<a name="testing-strategy"></a>
## 8. TESTING STRATEGY

Use the deterministic rules context and the test harness from #6 for all rule-level tests.

### Unit Tests (rules)
- Deterministic RNG and dice helpers
- Modifier math (darkness, corridor, equipment)
- Reaction-based initiative logic
- Trap complications and rogue bonus

### Scenario Tests (deterministic)
- Spell targeting flows (single, group, AoE)
- Monster targeting in room vs corridor
- Flee/withdraw and strike during escape
- Environment-based treasure table selection

### Manual Testing Checklist
- Seeded runs reproduce outcomes and log order
- Spell targeting UI works end-to-end
- Reaction tables drive initiative ordering as expected
- Retracing steps wandering monster triggers (1-in-6)
- Data loader validation errors surface in dev

---

**Document Maintained By:** Claude Code
**Last Review:** 2026-01-17 (Roadmap reorganization)
**Next Review:** After Phase 0 refactors (#2, #6, #5)
**Status:** Implementation Phase - Refactors and remaining mechanics
