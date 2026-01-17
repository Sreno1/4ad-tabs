# Refactoring Roadmap - Quick Start Guide

This is your practical, step-by-step guide to improving the codebase architecture based on the comprehensive audit.

---

## TL;DR - What's Wrong and What to Do

### 🔴 Critical Problems
1. **ActionPane.jsx** - 700 lines, just became a new god class
2. **Combat.jsx** - 1043 lines, original god class
3. **gameActions.js** - 1766 lines, kitchen sink utility file

### ✅ Solution: Incremental Refactoring
Follow the 3-phase approach below. Each phase is 1-2 weeks of work.

---

## Phase 1: Quick Wins (This Week) - 6-8 hours

These changes provide immediate value with minimal risk.

### Task 1.1: Use UI Context for Modals (2 hours)

**File created**: `src/contexts/UIContext.jsx` ✓

**Update App.jsx**:

```javascript
// BEFORE (App.jsx lines 35-41):
const [showSettings, setShowSettings] = useState(false);
const [showRules, setShowRules] = useState(false);
const [showSaveLoad, setShowSaveLoad] = useState(false);
const [showDungeonFeatures, setShowDungeonFeatures] = useState(false);
const [showCampaign, setShowCampaign] = useState(false);
const [showEquipment, setShowEquipment] = useState(false);
const [showAbilities, setShowAbilities] = useState(false);

// AFTER:
import { UIProvider, useUI } from './contexts/UIContext';

// Inside App component:
const { modals, openModal, closeModal } = useUI();

// Update all setShowX(true) calls:
openModal('settings')   // instead of setShowSettings(true)
openModal('rules')      // instead of setShowRules(true)
// etc.

// Update all modal components:
<SettingsModal
  isOpen={modals.settings}
  onClose={() => closeModal('settings')}
/>
```

**Wrap App in main.jsx**:
```javascript
import { UIProvider } from './contexts/UIContext';

root.render(
  <UIProvider>
    <App />
  </UIProvider>
);
```

**Benefits**: -7 useState hooks from App.jsx, cleaner code

---

### Task 1.2: Extract ActionPane Combat Phase Components (3-4 hours)

Create these new files:

#### File 1: `src/components/actionPane/combat/PartyTurnPhase.jsx`

Extract lines 733-806 from ActionPane.jsx (attack rolls grid)

```javascript
import React from 'react';
import { d6 } from '../../../utils/dice.js';

export default function PartyTurnPhase({
  state,
  dispatch,
  activeMonsters,
  corridor,
  onEndTurn
}) {
  const handleAttack = (hero, index) => {
    const abilities = state.abilities?.[index] || {};
    const rageBonus = (hero.key === 'barbarian' && abilities.rageActive) ? 1 : 0;
    const classBonus = hero.key === 'warrior' ? hero.lvl : 0;
    const totalBonus = hero.lvl + classBonus + rageBonus;

    const roll = d6();
    const blessed = hero.status?.blessed ? 1 : 0;
    const total = roll + totalBonus + blessed;
    const monster = activeMonsters[0];
    const hit = total >= monster.level;

    // Clear blessed if used
    if (blessed) {
      dispatch({ type: 'SET_HERO_STATUS', heroIdx: index, statusKey: 'blessed', value: false });
    }

    // Build result message
    let bonusBreakdown = `d6=${roll}`;
    if (totalBonus > 0) bonusBreakdown += `+${totalBonus}`;
    if (blessed) bonusBreakdown += `+1(blessed)`;
    bonusBreakdown += `=${total}`;

    dispatch({ type: 'LOG', t: `⚔️ ${hero.name} attacks: ${bonusBreakdown} vs L${monster.level} - ${hit ? '💥 HIT!' : '❌ Miss'}` });

    if (hit && monster.count !== undefined) {
      // Minor foe multi-kill logic
      const kills = Math.floor(total / monster.level);
      const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
      const remaining = Math.max(0, monster.count - kills);
      dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: remaining } });
      dispatch({ type: 'LOG', t: `💀 ${kills} ${monster.name} slain! (${remaining} remain)` });
    } else if (hit) {
      // Major foe damage logic
      const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
      const newHp = monster.hp - 1;
      dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: newHp } });
      if (newHp <= 0) {
        dispatch({ type: 'LOG', t: `💥 ${monster.name} takes 1 damage and is DEFEATED!` });
      } else {
        dispatch({ type: 'LOG', t: `💥 ${monster.name} takes 1 damage! (${newHp}/${monster.maxHp} HP)` });
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="text-orange-400 font-bold text-sm mb-2">
        ⚔️ Attack Rolls
        <span className="text-slate-500 text-xs ml-2 font-normal">
          (Roll {activeMonsters[0]?.level}+ to hit)
        </span>
      </div>
      {corridor && (
        <div className="text-xs text-slate-300 mb-2">
          Corridor: Only front 2 heroes can melee. Back can use ranged/spells.
        </div>
      )}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {state.party.map((hero, index) => {
          const abilities = state.abilities?.[index] || {};
          const rageBonus = (hero.key === 'barbarian' && abilities.rageActive) ? 1 : 0;
          const classBonus = hero.key === 'warrior' ? hero.lvl : 0;
          const totalBonus = hero.lvl + classBonus + rageBonus;

          return (
            <button
              key={hero.id || index}
              onClick={() => handleAttack(hero, index)}
              disabled={hero.hp <= 0}
              className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 px-2 py-1.5 rounded text-xs truncate relative"
            >
              {hero.name} {hero.hp <= 0 ? '💀' : `(+${totalBonus})`}
              {hero.status?.blessed && <span className="absolute -top-1 -right-1 text-yellow-300">✨</span>}
            </button>
          );
        })}
      </div>
      <button
        onClick={onEndTurn}
        className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm"
      >
        End Turn → Monster's Turn
      </button>
    </div>
  );
}
```

#### File 2: `src/components/actionPane/combat/MonsterTurnPhase.jsx`

Extract lines 807-876 from ActionPane.jsx (defense rolls grid)

Similar pattern - extract defense roll logic.

#### File 3: `src/components/actionPane/AbilityButtons.jsx`

Extract lines 881-1144 from ActionPane.jsx (class abilities section)

---

### Task 1.3: Create Action Creators (1-2 hours)

Create: `src/actions/actionCreators.js`

```javascript
// Party actions
export const addHero = (hero) => ({
  type: 'ADD_HERO',
  h: hero
});

export const deleteHero = (index) => ({
  type: 'DEL_HERO',
  i: index
});

export const updateHero = (index, updates) => ({
  type: 'UPD_HERO',
  i: index,
  u: updates
});

// Monster actions
export const addMonster = (monster) => ({
  type: 'ADD_MONSTER',
  m: monster
});

export const updateMonster = (index, updates) => ({
  type: 'UPD_MONSTER',
  i: index,
  u: updates
});

export const clearMonsters = () => ({
  type: 'CLEAR_MONSTERS'
});

// Log actions
export const logMessage = (message) => ({
  type: 'LOG',
  t: message
});

// Hero status actions
export const setHeroStatus = (heroIdx, statusKey, value) => ({
  type: 'SET_HERO_STATUS',
  heroIdx,
  statusKey,
  value
});

// Ability actions
export const setAbility = (heroIdx, ability, value) => ({
  type: 'SET_ABILITY',
  heroIdx,
  ability,
  value
});
```

**Then update all dispatch calls**:

```javascript
// BEFORE:
dispatch({ type: 'ADD_HERO', h: newHero });

// AFTER:
import { addHero } from '../actions/actionCreators';
dispatch(addHero(newHero));
```

---

## Phase 2: Major Refactors (Weeks 2-3) - 13-18 hours

### Task 2.1: Split Combat.jsx (4-6 hours)

**Goal**: Reduce from 1043 lines to ~200 lines

**Step 1**: Create phase components (similar to ActionPane pattern)

```
src/components/combat/
├── CombatManager.jsx (new main component)
├── phases/
│   ├── ReactionPhase.jsx
│   ├── InitiativePhase.jsx
│   ├── PartyTurnPhase.jsx
│   ├── MonsterTurnPhase.jsx
│   └── VictoryPhase.jsx
└── CombatControls.jsx
```

**Step 2**: Extract logic to `useCombatManager` hook
**Step 3**: Replace Combat.jsx with CombatManager.jsx
**Step 4**: Test thoroughly

---

### Task 2.2: Break Up gameActions.js (6-8 hours)

**Goal**: Reduce from 1766 lines to ~300 lines per domain

Create:
```
src/gameActions/
├── monsterActions.js (300 lines)
├── treasureActions.js (200 lines)
├── dungeonActions.js (400 lines)
├── combatActions.js (300 lines)
├── spellActions.js (200 lines)
├── abilityActions.js (200 lines)
└── index.js (re-exports all)
```

**Pattern for each file**:
```javascript
// Pure logic functions (no dispatch)
export const calculateAttackBonus = (hero, abilities) => {
  let bonus = hero.lvl;
  if (hero.key === 'warrior') bonus += hero.lvl;
  if (hero.key === 'barbarian' && abilities.rageActive) bonus += 1;
  return bonus;
};

// Dispatch wrapper functions
export const performAttack = (dispatch, hero, heroIdx, monster, monsterIdx, abilities) => {
  const bonus = calculateAttackBonus(hero, abilities);
  // ... dispatch logic
};
```

**Migration**:
- Move functions one domain at a time
- Update imports across app
- Test after each domain

---

### Task 2.3: Compose Reducer (3-4 hours)

**Goal**: Split 688-line reducer into domain reducers

Create:
```javascript
// src/state/reducers/partyReducer.js
export const partyReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_HERO':
      // ... logic
    case 'DEL_HERO':
      // ... logic
    case 'UPD_HERO':
      // ... logic
    default:
      return state;
  }
};
```

**Main reducer**:
```javascript
// src/state/reducer.js
import { combineReducers } from './combineReducers';
import { partyReducer } from './reducers/partyReducer';
import { combatReducer } from './reducers/combatReducer';
// ... more reducers

export const reducer = combineReducers({
  party: partyReducer,
  combat: combatReducer,
  dungeon: dungeonReducer,
  inventory: inventoryReducer,
  log: logReducer
});
```

---

## Phase 3: Testing & Polish (Week 4+) - 11-18 hours

### Task 3.1: Add Testing Infrastructure (4-6 hours)

**Install**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Write tests for**:
- Reducer functions (100% coverage goal)
- Action creators (100% coverage)
- Selectors (100% coverage)
- Pure utility functions (100% coverage)
- Key components (60% coverage)

---

### Task 3.2: Create Selectors (2-3 hours)

Create: `src/state/selectors.js`

```javascript
export const selectActiveMonsters = (state) =>
  (state.monsters || []).filter(m =>
    m.hp > 0 && (m.count === undefined || m.count > 0)
  );

export const selectActiveHeroes = (state) =>
  state.party.filter(h => h.hp > 0);

export const selectHCL = (state) =>
  state.party.length > 0
    ? Math.max(...state.party.map(h => h.lvl))
    : 1;
```

Replace all inline state access with selectors.

---

### Task 3.3: Add Error Handling (2-3 hours)

**Action validation**:
```javascript
// src/state/validateAction.js
export const validateAction = (action) => {
  if (!action.type) {
    throw new Error('Action type is required');
  }
  // ... more validation
};
```

**Error boundary**:
```javascript
// src/components/ErrorBoundary.jsx
export class GameErrorBoundary extends React.Component {
  // ... error handling
}
```

---

### Task 3.4: Performance Optimization (1-2 hours)

- Add React.memo to expensive components
- Use useCallback for event handlers
- Use useMemo for expensive calculations
- Debounce localStorage saves

---

## Measuring Success

After each phase, measure:

### Code Metrics
- [ ] Largest file < 400 lines?
- [ ] Largest function < 50 lines?
- [ ] Test coverage > 70%?

### Developer Experience
- [ ] Can find code in < 30 seconds?
- [ ] Can add feature in < 4 hours?
- [ ] New team member productive in < 1 day?

### Performance
- [ ] Initial load < 2 seconds?
- [ ] Component re-renders < 30ms?
- [ ] localStorage saves < 500ms?

---

## Common Pitfalls to Avoid

### ❌ Don't Over-Engineer
- Wait until you have 3 instances before abstracting
- Prefer simple solutions
- Keep it readable

### ❌ Don't Break Working Features
- Write tests BEFORE refactoring
- Refactor incrementally
- Test after each change

### ❌ Don't Create New God Classes
- Keep components focused
- Extract when > 300 lines
- Single responsibility

---

## Getting Help

If you get stuck:
1. Review the full audit: `ARCHITECTURE_AUDIT.md`
2. Check examples in this file
3. Create a GitHub issue with specific questions

---

## Next Steps

1. **This week**: Complete Phase 1 (UI Context + ActionPane split)
2. **Next week**: Start Phase 2 (Combat.jsx split)
3. **Week 3**: Finish Phase 2 (gameActions.js split)
4. **Week 4**: Phase 3 (Testing & polish)

**Remember**: Progress > Perfection. Small, incremental improvements add up!
