# Archived Completed Tasks
Archived from `IMPLEMENTATION_ROADMAP.md` on 2026-01-17.

## Recent Session Improvements (2026-01-16)
- Hero selection modal for clue discovery
- Rogue disarm trap mechanics
- Cleric banish ghost system
- Environment switching for secret passages
- Party-wide damage application

## Fully Implemented Features (Snapshot)
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


#### **Secret Door Discovery**
- **Status:** IMPLEMENTED
- **Implementation:** `src/utils/gameActions/explorationActions.js:161-187`
- **Features:**
  - Search roll 5-6 gives option to find secret door
  - 1-in-6 chance it's a shortcut out
  - Treasure behind secret doors DOUBLED (treasureMultiplier: 2)
  - UI modal for secret door discovery
- **Completed Date:** 2026-01-16

#### **Secret Passage**
- **Status:** IMPLEMENTED
- **Implementation:**
  - Logic: `src/utils/gameActions/explorationActions.js:195-218`
  - Action: `src/state/actions.js:37-38` (CHANGE_ENVIRONMENT)
  - Reducer: `src/state/reducers/dungeonReducer.js:40-45`
  - Initial State: `src/state/initialState.js:21`
- **Features:**
  - Passage to different environment (dungeon/fungal_grottoes/caverns)
  - State properly tracks environment
  - UI modal shows passage discovery
  - Dispatch action changes environment
- **Completed Date:** 2026-01-16

#### **Hidden Treasure Complications**
- **Status:** IMPLEMENTED
- **Implementation:** `src/utils/gameActions/explorationActions.js:100-124`
- **Features:**
  - Alarm (1-2): Triggers wandering monsters
  - Trap (3-5): Rogue can attempt disarm at L+1 DC
  - Ghost (6): Cleric can banish at L/2 bonus vs DC(3+HCL)
  - All complications wired to SearchModal with action handlers
  - HiddenTreasureModal shows complications and resolution options
- **Completed Date:** 2026-01-16

## Recent Spell/Status Integration (2026-01-16)
- Implemented MR two-stage checks (MR roll then casting roll) and exposed both rolls in combat log via `performCastSpell` and `performCastScrollSpell`.
- Implemented passing of casting bonuses from traits and scrolls into `castSpell` (via `targets[0].castingBonus`). Currently wired: Specialist (hero.specialistChoice), Shadow Adept, and scroll +L/+1 bonuses.
- Implemented entangle/bound/asleep effects being applied as monster status flags and updating combat behavior:
  - asleep: monsters skip attacks
  - entangled: monsters attack with effective level -1
  - bound: attackers receive +2 vs bound targets
- Implemented Fireball minor-foe exact slay rule in the combat handler and Fireball=1 vs Major Foe handling in `castSpell`.

## Carried Treasure Weight (200gp max)
#### **Carried Treasure Weight (200gp max) - NEEDS TESTING**
- **Status:** IMPLEMENTED
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

## Completed Priority Items (from Implementation Priority)
1. **Corridor vs Room Combat Restrictions**  4 hours **[COMPLETED]**
2. **Narrow Corridor Penalties**  2 hours **[COMPLETED]**
3. **Location-Aware Combat System**  6 hours **[COMPLETED]**
5. **Clues System**  6 hours **[COMPLETED]**
6. **XP Rolls**  3 hours **[COMPLETED]**
7. **Final Boss Trigger**  4 hours **[COMPLETED]**
8. **Secret Door System**  5 hours **[COMPLETED]**
9. **Secret Passage System**  3 hours **[COMPLETED]**
10. **Hidden Treasure Complications**  4 hours **[COMPLETED]**
11. **Clue Discovery Hero Selection**  2 hours **[COMPLETED]**

## Recent Completion (from Next Steps)
### Recent Completion (2026-01-16)
**COMPLETED - 5 Major Features Implemented:**
 Hero selection modal for clue discovery
 Rogue disarm trap mechanics with success/failure handling
 Cleric banish ghost system with level-based DC
 Environment system for secret passages (dungeon  fungal_grottoes  caverns)
 Party-wide damage application for failed ghost banish

## Phase 1-2 Completion Summary (from Next Steps)
### Phase 1: Critical Fixes (1-2 weeks)
1. Fix campaign save system (COMPLETED)
2. Implement corridor combat restrictions (COMPLETED)
3. Add narrow corridor penalties (COMPLETED)
4. Create location-aware combat system (COMPLETED)

### Phase 2: Core Mechanics (1-2 weeks remaining)
5. Implement clues system (COMPLETED - search rolls, clue discovery, spending)
6. Add XP rolls (COMPLETED - d6 roll per hero)
7. Complete final boss trigger (COMPLETED - grid fullness tracking)
8. Add secret door discovery (COMPLETED - 1-in-6 shortcut)
9. Secret passage system (COMPLETED - environment transitions)
10. Hidden treasure complications (COMPLETED - alarm/trap/ghost)
11. Clue discovery hero selection (COMPLETED - modal UI)
