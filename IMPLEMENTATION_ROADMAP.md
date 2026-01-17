# Four Against Darkness - Implementation Roadmap
*A comprehensive analysis and architecture plan for missing mechanics*

**Last Updated:** 2026-01-16 (Updated with Session Completion)
**Status:** Implementation Phase - Focus on Exploration & Campaign Features

---

## Executive Summary

This document provides a complete audit of the Four Against Darkness companion app implementation, comparing current code against official 4AD rules. It categorizes all mechanics by implementation status and provides architectural recommendations.

**Current Implementation Status:** ~75% Complete (Up from ~55%)

- ✅ **Fully Implemented:** 55%
- ⚠️ **Partially Implemented:** 20%
- ❌ **Not Implemented:** 25%

**Recent Session Improvements:**
- ✅ Hero selection modal for clue discovery
- ✅ Rogue disarm trap mechanics
- ✅ Cleric banish ghost system
- ✅ Environment switching for secret passages
- ✅ Party-wide damage application

---

## Table of Contents

1. [✅ Fully Implemented Features](#fully-implemented)
2. [⚠️ Partially Implemented Features](#partially-implemented)
3. [❌ Not Implemented Features](#not-implemented)
4. [Architecture Recommendations](#architecture-recommendations)
5. [Implementation Priority](#implementation-priority)
6. [Rules Verification](#rules-verification)

---

<a name="fully-implemented"></a>
## 1. ✅ FULLY IMPLEMENTED FEATURES

### Combat System (Core)
| Feature | Rule Reference | Implementation Location |
|---------|----------------|------------------------|
| **Exploding d6 rolls** | Combat.txt p.92 | `src/utils/dice.js` |
| **Attack modifiers by class** | Combat.txt p.91-92 | `src/utils/gameActions/combatActions.js:66-135` |
| **Defense rolls** | Combat.txt p.96 | `src/utils/gameActions/combatActions.js:379-458` |
| **Minor Foe multi-kill** | Combat.txt p.99 | `src/utils/gameActions/combatActions.js:196-217` |
| **Major Foe level reduction at 50% HP** | Combat.txt p.106 | `src/utils/gameActions/combatActions.js:985-993` |
| **Minor Foe morale checks (50%)** | Combat.txt p.102 | `src/utils/gameActions/monsterActions.js` |
| **Withdraw vs Flee mechanics** | Combat.txt p.95 | `src/utils/gameActions/combatActions.js:713-788` |
| **Ranged weapons strike first** | Combat.txt p.90 | `src/utils/gameActions/combatActions.js:815-825` |
| **Equipment bonuses** | Equipment.txt | `src/data/equipment.js:313-349` |
| **Darkness penalties (-2 all rolls)** | Combat.txt p.92 | `src/utils/gameActions/combatActions.js:73-76` |
| **Darkvision (Dwarf/Elf immune)** | Characters.txt | `src/data/classes.js:67,77` |

### Class Abilities
| Feature | Rule Reference | Implementation Location |
|---------|----------------|------------------------|
| **Cleric: Heal (3x)** | Characters.txt | `src/components/Combat.jsx:368-378` |
| **Cleric: Bless (3x)** | Characters.txt | `src/components/Combat.jsx:368-378` |
| **Barbarian: Rage** | Characters.txt | `src/components/Combat.jsx:380-384` |
| **Halfling: Luck (L+1)** | Characters.txt | `src/components/Combat.jsx:386-389` |
| **Wizard/Elf: Spellcasting** | Magic.txt | `src/components/Combat.jsx:837-846` |
| **Rogue: +L when outnumbered** | Combat.txt p.92 | `src/utils/gameActions/combatActions.js:131-145` |
| **Rogue: +L Defense** | Combat.txt p.96 | `src/utils/gameActions/combatActions.js:402-404` |
| **Paladin: Prayer** | Characters.txt | `src/components/Combat.jsx:873-882` |
| **Ranger: Dual Wield** | Characters.txt | `src/components/Combat.jsx:884-896` |
| **Assassin: Hide in Shadows** | Characters.txt | `src/components/Combat.jsx:898-910` |

### Party Management
| Feature | Rule Reference | Implementation Location |
|---------|----------------|------------------------|
| **XP tracking** | Base Rules.txt | `src/state/initialState.js:47` |
| **Level progression** | Base Rules.txt | `src/state/reducers/partyReducer.js` |
| **HP management** | Base Rules.txt | `src/state/initialState.js:48-49` |
| **Save rolls** | Combat.txt | `src/data/saves.js` |
| **Status effects (poisoned, blessed, cursed)** | | `src/state/initialState.js:75-79` |
| **Dwarf Gold Sense** | Characters.txt | `src/data/traits.js:314-318` |

### Resource Tracking
| Feature | Rule Reference | Implementation Location |
|---------|----------------|------------------------|
| **Light sources (Torch/Lantern)** | Exploration.txt p.110 | `src/state/initialState.js:180` |
| **Light source tracking** | Exploration.txt p.110 | `src/data/equipment.js:188-204,246-255` |
| **Gold tracking** | Base Rules.txt | `src/state/initialState.js:99,136` |

### Dungeon Exploration
| Feature | Rule Reference | Implementation Location |
|---------|----------------|------------------------|
| **Grid mapping (20x28)** | Exploration.txt p.104 | `src/state/initialState.js:15` |
| **Room vs Corridor cell types** | Exploration.txt p.104 | `src/state/initialState.js:15` (0=empty, 1=room, 2=corridor) |
| **Door tracking** | Exploration.txt p.109 | `src/state/initialState.js:16,163` |

- **Status:** IMPLEMENTED
- **Rule:**
  - Corridors: Only positions 1-2 can melee (Combat.txt p.121)
  - Rooms: All PCs can fight
  - Narrow corridors: 2H weapons -1, light weapons no penalty
- **Current Issue:** Grid tracks room/corridor but no combat logic checks this
- **Architecture Needed:**
  ```javascript
  // Add to combat state:
  {
    currentLocation: {
      type: 'room' | 'corridor',
      width: 'normal' | 'narrow',
      x: number,
      y: number
    }
  }

  // Modify attack validation:
  const canAttack = (hero, heroIdx, location) => {
    if (location.type === 'corridor') {
      const position = state.marchingOrder.indexOf(heroIdx);
      return position < 2; // Only front 2 can melee
    }
    return true;
  };
  ```
- **Files to Modify:**
  - `src/components/Combat.jsx` - Add location context
  - `src/utils/gameActions/combatActions.js` - Add location checks
  - `src/components/Dungeon.jsx` - Track current location
- **Priority:** HIGH (core 4AD rule)

#### **Secret Door Discovery**
- **Status:** ✅ IMPLEMENTED
- **Implementation:** `src/utils/gameActions/explorationActions.js:161-187`
- **Features:**
  - ✅ Search roll 5-6 gives option to find secret door
  - ✅ 1-in-6 chance it's a shortcut out
  - ✅ Treasure behind secret doors DOUBLED (treasureMultiplier: 2)
  - ✅ UI modal for secret door discovery
- **Completed Date:** 2026-01-16

#### **Secret Passage**
- **Status:** ✅ IMPLEMENTED
- **Implementation:**
  - Logic: `src/utils/gameActions/explorationActions.js:195-218`
  - Action: `src/state/actions.js:37-38` (CHANGE_ENVIRONMENT)
  - Reducer: `src/state/reducers/dungeonReducer.js:40-45`
  - Initial State: `src/state/initialState.js:21`
- **Features:**
  - ✅ Passage to different environment (dungeon/fungal_grottoes/caverns)
  - ✅ State properly tracks environment
  - ✅ UI modal shows passage discovery
  - ✅ Dispatch action changes environment
- **Completed Date:** 2026-01-16

#### **Hidden Treasure Complications**
- **Status:** ✅ IMPLEMENTED
- **Implementation:** `src/utils/gameActions/explorationActions.js:100-124`
- **Features:**
  - ✅ Alarm (1-2): Triggers wandering monsters
  - ✅ Trap (3-5): Rogue can attempt disarm at L+1 DC
  - ✅ Ghost (6): Cleric can banish at L/2 bonus vs DC(3+HCL)
  - ✅ All complications wired to SearchModal with action handlers
  - ✅ HiddenTreasureModal shows complications and resolution options
- **Completed Date:** 2026-01-16

#### **Retracing Steps Wandering Monster (1-in-6)**
- **Status:** ❌ NOT FULLY IMPLEMENTED
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

---

<a name="partially-implemented"></a>
## 2. ⚠️ PARTIALLY IMPLEMENTED FEATURES

### Combat System

#### **Marching Order**
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

#### **Final Boss Trigger**
- **Status:** State exists but mechanics need testing
- **What Exists:**
  - Boss room state: `src/state/initialState.js:172`
  - Referenced in exploration code
- **What's Missing:**
  - ❌ Roll d6 + major foes defeated, trigger on 6+
  - ❌ Boss enhancements (+1 Life, +1 attack, triple treasure)
  - ❌ "Last tile" boss trigger
- **Rule Reference:** Exploration.txt p.105
- **Architecture Needed:**
  ```javascript
  // On major foe encounter:
  const checkBossTrigger = (state) => {
    const roll = d6();
    const majorFoesDefeated = state.majorFoes;
    if (roll + majorFoesDefeated >= 6 || state.tilesExplored >= maxTiles) {
      return enhanceBoss(currentMonster);
    }
  }
  ```

#### **XP Rolls**
- **Status:** ❌ Partially IMPLEMENTED in VictoryPhase.jsx, needs testing and need to make sure any character having 3 clues also immediately triggers an XP roll for them. Also level up logic needs to be fully implemented for each class(? most things are just +L)
- **Rule:** d6 roll to determine actual XP gained from encounters
- **Current Issue:** XP tracked but no roll mechanic
- **Architecture Needed:**
  ```javascript
  // Replace auto XP award with roll:
  const rollForXP = (monster) => {
    const roll = d6();
    const baseXP = monster.xp;
    const earnedXP = Math.floor(baseXP * roll / 6);
    return earnedXP;
  };
  ```
- **Priority:** MEDIUM

---

<a name="not-implemented"></a>
## 3. ❌ NOT IMPLEMENTED FEATURES

### Combat System

#### **Corridor vs Room Combat Restrictions**

#### **Narrow Corridor Rules**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** 2-handed weapons -1, light weapons no penalty (Combat.txt p.122)
- **Current Issue:** Equipment has `corridorPenalty: -1` property but never applied
- **Architecture Needed:**
  ```javascript
  // In calculateEnhancedAttack:
  if (options.location?.width === 'narrow') {
    const weapon = getEquippedWeapon(hero);
    if (weapon?.key === 'two_handed') {
      mod += weapon.corridorPenalty || -1;
      modifiers.push("-1 (narrow corridor)");
    }
  }
  ```
- **Priority:** MEDIUM

### Recent Spell/Status Integration (work completed 2026-01-16)
- Implemented MR two-stage checks (MR roll then casting roll) and exposed both rolls in combat log via `performCastSpell` and `performCastScrollSpell`.
- Implemented passing of casting bonuses from traits and scrolls into `castSpell` (via `targets[0].castingBonus`). Currently wired: Specialist (hero.specialistChoice), Shadow Adept, and scroll +L/+1 bonuses.
- Implemented entangle/bound/asleep effects being applied as monster status flags and updating combat behavior:
  - asleep: monsters skip attacks
  - entangled: monsters attack with effective level -1
  - bound: attackers receive +2 vs bound targets
- Implemented Fireball minor-foe exact slay rule in the combat handler and Fireball=1 vs Major Foe handling in `castSpell`.

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
- **Rule:** Random quest assignment on dungeon entry
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

#### **Carried Treasure Weight (200gp max) - NEEDS TESTING**
#### **Carried Treasure Weight (200gp max)**
- **Status:** ✅ IMPLEMENTED
- **Rule:** Each PC can carry max 200gp worth of treasure
- **Implementation:** Added per-hero carried treasure tracking and enforced limit on treasure pickup. Treasure is first stowed with heroes up to their 200gp capacity; any remainder becomes party gold.
- **Files Changed:**
  - `src/state/initialState.js` - added `carriedTreasureWeight` and `maxCarryWeight` to `createHero`
  - `src/state/actions.js` - added `ASSIGN_TREASURE` action
  - `src/state/reducers/partyReducer.js` - implemented `assignTreasureToParty` logic and integrated allocation
  - `src/utils/gameActions/treasureActions.js` - use `ASSIGN_TREASURE` when awarding rolled treasure
  - `src/components/ActionPane.jsx` - award hidden-treasure via `ASSIGN_TREASURE` (respects per-hero carry limits)
- **Architecture Notes:**
  ```javascript
  // Add to hero state:
  {
    carriedTreasureWeight: number, // sum of treasure gp values
    maxCarryWeight: 200
  }

  // Validate on treasure pickup:
  const canCarryTreasure = (hero, treasureValue) => {
    return (hero.carriedTreasureWeight + treasureValue) <= hero.maxCarryWeight;
  };
  ```
 - **Priority:** MEDIUM

#### **Food Rations**
- **Status:** ❌ NOT IMPLEMENTED
- **Rule:** Required for wilderness survival
- **Priority:** LOW (wilderness not in scope)

---

<a name="architecture-recommendations"></a>
## 4. ARCHITECTURE RECOMMENDATIONS

### 4.1 Location-Aware Combat System

**Problem:** Combat doesn't know if it's in a room or corridor

**Solution:** Enhance combat state with location context

```javascript
// src/state/initialState.js
{
  currentCombatLocation: {
    type: 'room' | 'corridor',
    width: 'normal' | 'narrow',
    gridX: number,
    gridY: number
  }
}

// Set when combat starts
const startCombat = (x, y) => {
  const cellType = state.grid[y][x]; // 0=empty, 1=room, 2=corridor
  const location = {
    type: cellType === 2 ? 'corridor' : 'room',
    width: 'normal', // Could be determined by corridor properties
    gridX: x,
    gridY: y
  };

  dispatch({ type: 'START_COMBAT', location });
};
```

**Files to Modify:**
1. `src/state/initialState.js` - Add currentCombatLocation
2. `src/state/actions.js` - Add START_COMBAT action
3. `src/state/reducers/combatReducer.js` - Handle location state
4. `src/utils/gameActions/combatActions.js` - Check location in attack/defense
5. `src/components/Combat.jsx` - Display location, restrict actions

### 4.2 Environment System

**Problem:** No environment tracking for different treasure/monster tables

**Solution:** Add environment state and table routing

```javascript
// src/state/initialState.js
{
  currentEnvironment: 'dungeon', // 'fungal_grottoes' | 'caverns'
  environmentHistory: ['dungeon'] // track transitions
}

// src/data/environments.js
export const ENVIRONMENTS = {
  dungeon: {
    monsters: DUNGEON_MONSTERS,
    treasure: DUNGEON_TREASURE,
    specialRules: []
  },
  fungal_grottoes: {
    monsters: FUNGAL_MONSTERS,
    treasure: FUNGAL_TREASURE,
    specialRules: ['slippery']
  },
  caverns: {
    monsters: CAVERN_MONSTERS,
    treasure: CAVERN_TREASURE,
    specialRules: ['no_doors', 'stalactites']
  }
};

// Usage
const rollMonster = (state) => {
  const env = ENVIRONMENTS[state.currentEnvironment];
  return rollFromTable(env.monsters);
};
```

**Files to Create:**
- `src/data/environments.js` - Environment definitions
- `src/data/treasure/dungeonTreasure.js` - Dungeon-specific loot
- `src/data/treasure/fungalTreasure.js` - Fungal grotto loot
- `src/data/treasure/cavernTreasure.js` - Cavern loot

**Files to Modify:**
- `src/state/initialState.js` - Add environment state
- `src/utils/gameActions/treasureActions.js` - Route by environment
- `src/utils/gameActions/monsterActions.js` - Route by environment

### 4.3 Clues & Secrets System

**Problem:** Clues tracked but no acquisition/spending mechanics

**Solution:** Implement search system with clue discovery

```javascript
// src/utils/gameActions/explorationActions.js
export const performSearch = (dispatch, state, location) => {
  const roll = d6();
  const isInCorridor = state.grid[location.y][location.x] === 2;
  const modifier = isInCorridor ? -1 : 0;
  const total = roll + modifier;

  if (total <= 1) {
    dispatch({ type: 'LOG', t: 'Wandering Monsters attack!' });
    rollWanderingMonster(dispatch);
    return;
  }

  if (total >= 5) {
    // Present choices
    const choices = [
      'Hidden Treasure',
      'Secret Door',
      'Secret Passage',
      'Clue'
    ];

    // This would open a UI modal
    return { success: true, choices };
  }

  dispatch({ type: 'LOG', t: 'Nothing found.' });
  return { success: false };
};

// On clue selection:
export const findClue = (dispatch, heroIdx) => {
  dispatch({ type: 'ADD_CLUE', heroIdx });
  dispatch({ type: 'LOG', t: `${hero.name} discovered a Clue!` });
};

// Spending clues:
export const spendCluesForSecret = (dispatch, state) => {
  if (state.clues < 3) {
    return { error: 'Need 3 clues to reveal a secret' };
  }

  dispatch({ type: 'SPEND_CLUES', count: 3 });

  // Reveal a secret (implementation varies)
  const secret = rollOnSecretTable();
  return { secret };
};
```

**Files to Create:**
- `src/utils/gameActions/explorationActions.js` - Search mechanics
- `src/data/secrets.js` - Secret table
- `src/components/SearchModal.jsx` - Search result UI

**Files to Modify:**
- `src/state/reducers/inventoryReducer.js` - ADD_CLUE, SPEND_CLUES actions
- `src/components/Dungeon.jsx` - Add search button

### 4.4 XP Roll System

**Problem:** XP auto-awarded instead of rolled

**Solution:** Replace auto XP with roll mechanic

```javascript
// src/utils/gameActions/combatActions.js
export const awardXPRoll = (dispatch, monster, party, heroIndex) => {
  const roll = d6();
  const baseXP = monster.xp;

  // XP = (Monster XP × roll) / 6, rounded down
  const earnedXP = Math.floor((baseXP * roll) / 6);

  dispatch({
    type: 'ADD_XP',
    heroIdx: heroIndex,
    xp: earnedXP
  });

  dispatch({
    type: 'LOG',
    t: `${party[heroIndex].name} rolls ${roll} for XP: ${earnedXP} XP earned!`
  });

  return earnedXP;
};
```

**Files to Modify:**
- `src/utils/gameActions/combatActions.js` - Replace awardXP() calls
- `src/components/Combat.jsx` - Show XP roll UI
- `src/components/combat/VictoryPhase.jsx` - Trigger XP rolls

---

<a name="implementation-priority"></a>
## 5. IMPLEMENTATION PRIORITY

### 🔴 Critical Priority (Core 4AD Rules)

These are essential mechanics from the official rules that significantly impact gameplay:

1. ✅ **Corridor vs Room Combat Restrictions** ⏱️ 4 hours **[COMPLETED]**
   - ✅ Marching order enforcement in corridors
   - ✅ Position-based attack restrictions
   - ✅ Visual UI indicators for position restrictions
   - ⚠️ Rear attacks from wandering monsters (TODO)

2. ✅ **Narrow Corridor Penalties** ⏱️ 2 hours **[COMPLETED]**
   - ✅ Apply 2H weapon -1 in narrow corridors
   - ✅ No penalty for light weapons

3. ✅ **Location-Aware Combat System** ⏱️ 6 hours **[COMPLETED]**
   - ✅ Track current combat location (room/corridor/narrow)
   - ✅ Pass location context to all combat functions
   - ✅ Update UI to show location restrictions
   - ✅ Helper functions for location checks

4. **Campaign Save System Fix** ⏱️ ~8 hours
   - Implement proper save slot management
   - Fix localStorage persistence bugs
   - Add save/load UI

**Total Estimated Time:** 21 hours completed, ~8 hours remaining for Critical Priority

### 🟡 High Priority (Significant Gameplay Impact)

5. ✅ **Clues System** ⏱️ 6 hours **[COMPLETED]**
   - ✅ Exploration actions created (search rolls, clue discovery)
   - ✅ Hidden treasure complications (alarm/trap/ghost)
   - ✅ Secret door mechanics (1-in-6 shortcut)
   - ✅ Secret passage (environment transitions)
   - ✅ Search modal UI with 4 choice options
   - ✅ Tile searched tracking
   - ✅ Integrated with ActionPane
   - ✅ Corridor penalty (-1 to search rolls)

6. ✅ **XP Rolls** ⏱️ 3 hours **[COMPLETED]**
   - ✅ Roll d6 for XP after combat (formula: BaseXP × roll / 6)
   - ✅ Updated awardXP function with individual rolls per hero
   - ✅ UI for XP roll display in VictoryPhase
   - ✅ Shows each hero's roll and earned XP
   - ✅ Separate button for rolling XP before ending combat

7. ✅ **Final Boss Trigger** ⏱️ 4 hours **[COMPLETED]**
   - ✅ d6 + major foes >= 6 check (already existed)
   - ✅ Boss enhancements (+1 Life, +1 attack, fights to death)
   - ✅ Treasure multiplier properly applied (3x gold, 100gp min)
   - ✅ Last tile boss spawn (auto-triggers at 90% grid full)
   - ✅ Grid fullness tracking and warning UI
   - ✅ Updated BossMechanics component with fullness display

8. ✅ **Secret Door System** ⏱️ 5 hours **[COMPLETED]**
   - ✅ Secret door discovery via Search (implemented in search system)
   - ✅ 1-in-6 shortcut chance (implemented)
   - ✅ Double treasure behind secret doors (treasureMultiplier: 2)
   - ✅ SecretDoorModal UI with shortcut/new tile distinction
   - Completed as part of the Clues System implementation

9. ✅ **Secret Passage System** ⏱️ 3 hours **[COMPLETED]**
   - ✅ Environment switching (dungeon ↔ fungal_grottoes ↔ caverns)
   - ✅ State tracking with CHANGE_ENVIRONMENT action
   - ✅ SecretPassageModal UI for discovery
   - ✅ Integration with exploration system
   - Completed 2026-01-16

10. ✅ **Hidden Treasure Complications** ⏱️ 4 hours **[COMPLETED]**
    - ✅ Alarm (1-2): Triggers wandering monsters
    - ✅ Trap (3-5): Rogue disarm with success/failure handling
    - ✅ Ghost (6): Cleric banish with level-based DC
    - ✅ All complications wired in ActionPane.jsx
    - ✅ HiddenTreasureModal handles resolution UI
    - Completed 2026-01-16

11. ✅ **Clue Discovery Hero Selection** ⏱️ 2 hours **[COMPLETED]**
    - ✅ HeroSelectionModal for choosing discoverer
    - ✅ Dead heroes excluded from selection
    - ✅ Shows hero class and HP for quick identification
    - Completed 2026-01-16

12. **Treasure Weight Limits (200gp max)** ⏱️ ~4 hours
   - Track carried treasure weight
   - Enforce limits on pickup
   - Encumbrance UI

**Total Estimated Time:** ~4 hours remaining in High Priority (~25 hours completed including session work)

### 🟢 Medium Priority (Nice to Have)

13. **Environment-Based Treasure** ⏱️ ~8 hours
    - Dungeon/Fungal/Cavern treasure tables
    - Environment state tracking
    - Secret passage environment transitions

14. **Monster Reaction Assignment** ⏱️ ~6 hours
    - Assign reaction tables per monster type
    - Implement bribe mechanics
    - Reaction-based initiative ordering

15. **Spell Targeting UI** ⏱️ ~8 hours
    - Single target selection
    - AoE targeting
    - Minor Foe group targeting

16. **Bandage Limits** ⏱️ ~2 hours
    - Track bandages used per adventure
    - Enforce 1 per PC limit

**Total Estimated Time:** ~28 hours

### 🔵 Low Priority (Optional Content)

17. **Quest System** ⏱️ ~12 hours
18. **Epic Rewards** ⏱️ ~6 hours
19. **Equipment Limit Enforcement** ⏱️ ~3 hours
20. **Stealth Modifiers** ⏱️ ~4 hours
21. **Food Rations** ⏱️ ~3 hours

**Total Estimated Time:** ~28 hours

---

<a name="rules-verification"></a>
## 6. RULES VERIFICATION

This section verifies each mechanic against official 4AD rulebooks to ensure accuracy.

### ✅ Verified Against Official Rules

| Mechanic | Rule Source | Page | Verified Accurate |
|----------|-------------|------|-------------------|
| Multi-kill formula (Attack ÷ Foe Level) | combat.txt | p.99-100 | ✅ Yes |
| Darkness penalty (-2 all rolls) | combat.txt | p.92 | ✅ Yes |
| Darkvision (Dwarf/Elf) | characters.txt | - | ✅ Yes (implied) |
| Major Foe level reduction (>50% HP) | combat.txt | p.106 | ✅ Yes |
| Minor Foe morale (50% = d6 check) | combat.txt | p.102 | ✅ Yes |
| Withdraw (+1 Defense, 1-in-6 wandering) | combat.txt | - | ✅ Yes (from flee rules) |
| Ranged strike first | combat.txt | p.90 | ✅ Yes |
| Corridor restrictions (positions 1-2 only) | combat.txt | p.121 | ✅ Yes |
| Narrow corridor (-1 two-handed) | combat.txt | p.122 | ✅ Yes |
| Marching order 4 positions | combat.txt | p.118 | ✅ Yes |
| Search roll (5-6 = find something) | exploration.txt | p.107 | ✅ Yes |
| Clues (3 to reveal secret) | exploration.txt | p.107-108 | ✅ Yes |
| Secret door (1-in-6 shortcut) | exploration.txt | p.108 | ✅ Yes |
| Hidden treasure (2d6+HCL)×(2d6+HCL) gp | exploration.txt | p.108 | ✅ Yes |
| Final Boss (d6+major foes, 6+ triggers) | exploration.txt | p.105 | ✅ Yes |
| Retracing steps (1-in-6 wandering) | exploration.txt | p.104 | ✅ Yes |
| Carried treasure (200gp max) | base rules.txt | - | ⚠️ Need to verify |
| Rogue outnumbered bonus | combat.txt | p.92 | ✅ Yes |
| Equipment bonuses | equipment.txt | - | ✅ Yes |

### ❌ Not in Official Rules (Custom/Homebrew)

- None identified - all mechanics in Missing Mechanics.md are from official rules

### ⚠️ Needs Clarification

- **Carried Treasure Weight (200gp):** Need to verify exact rule source
- **XP Rolls:** Need to verify exact formula (assumed d6 × base XP / 6)
- **Equipment Limits (3 weapons, 2 shields):** Need to verify in equipment rules

---

## 7. NEXT STEPS

### Recent Completion (2026-01-16)
**COMPLETED - 5 Major Features Implemented:**
✅ Hero selection modal for clue discovery
✅ Rogue disarm trap mechanics with success/failure handling
✅ Cleric banish ghost system with level-based DC
✅ Environment system for secret passages (dungeon ↔ fungal_grottoes ↔ caverns)
✅ Party-wide damage application for failed ghost banish

### Phase 1: Critical Fixes (1-2 weeks)
1. ✅ Fix campaign save system (COMPLETED)
2. ✅ Implement corridor combat restrictions (COMPLETED)
3. ✅ Add narrow corridor penalties (COMPLETED)
4. ✅ Create location-aware combat system (COMPLETED)

### Phase 2: Core Mechanics (1-2 weeks remaining)
5. ✅ Implement clues system (COMPLETED - search rolls, clue discovery, spending)
6. ✅ Add XP rolls (COMPLETED - d6 roll per hero)
7. ✅ Complete final boss trigger (COMPLETED - grid fullness tracking)
8. ✅ Add secret door discovery (COMPLETED - 1-in-6 shortcut)
9. ✅ Secret passage system (COMPLETED - environment transitions)
10. ✅ Hidden treasure complications (COMPLETED - alarm/trap/ghost)
11. ✅ Clue discovery hero selection (COMPLETED - modal UI)
12. **Implement treasure weight limits** ← NEXT PRIORITY

### Phase 3: Polish (2-3 weeks)
13. Environment-based treasure (plan: separate treasure tables)
14. Monster reaction assignment
15. Spell targeting UI
16. Bandage limits

### Phase 4: Optional Content (1-2 weeks)
17. Quest system
18. Epic rewards
19. Equipment limits
20. Stealth modifiers

---

## 8. TESTING STRATEGY

### Unit Tests Needed
- [ ] Corridor position attack validation
- [ ] Narrow corridor weapon penalties
- [ ] XP roll calculations
- [ ] Clue accumulation/spending
- [ ] Treasure weight tracking
- [ ] Secret door 1-in-6 chance

### Integration Tests Needed
- [ ] Full combat flow in corridor
- [ ] Full combat flow in narrow corridor
- [ ] Search → Clue → Secret flow
- [ ] Final boss trigger conditions
- [ ] Campaign save/load cycle

### Manual Testing Checklist
- [ ] Verify corridor only allows positions 1-2 to melee
- [ ] Verify 2H weapons get -1 in narrow corridors
- [ ] Verify darkvision immunity (dwarf/elf)
- [ ] Verify save system persists across browser refresh
- [ ] Verify XP rolls show in UI
- [ ] Verify 3 clues can reveal secret

---

**Document Maintained By:** Claude Code
**Last Review:** 2026-01-16 (Session Update Complete)
**Next Review:** After Phase 2 completion (Treasure Weight Limits)
**Status:** 75% Complete - Phase 2 major features mostly done, Phase 3 underway
