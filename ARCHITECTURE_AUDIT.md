# Architecture Audit Report - Four Against Darkness

**Date:** 2026-01-15
**Status:** Active Development
**Overall Health:** 6/10 - Functional but accumulating debt

---

## Executive Summary

This React application has solid fundamentals but is approaching critical mass in several areas:

### Critical Issues (🔴)
- **Combat.jsx**: 1043 lines, god component
- **gameActions.js**: 1766 lines, too many concerns
- **ActionPane.jsx**: 700 lines, recently created but already oversized
- **Prop drilling**: 16+ props passed through ActionPane

### Major Issues (🟠)
- **reducer.js**: 688 lines, needs composition
- **Circular dependencies**: Data ↔ Utils ↔ Hooks
- **Inconsistent patterns**: 3 different dispatch patterns
- **State schema confusion**: Redundant data structures

### Architectural Debt Estimate
**30-44 hours** of refactoring work across 3 categories

---

## Refactoring Priority Matrix

### Phase 1: Immediate Wins (Week 1) - 6-8 hours

#### 1.1 Extract UI State Context (2 hours)
**Problem**: App.jsx has 8 modal visibility states
**Solution**: Create UIContext for all UI-only state

```javascript
// src/contexts/UIContext.jsx
const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [modals, setModals] = useState({
    settings: false,
    rules: false,
    saveLoad: false,
    dungeonFeatures: false,
    campaign: false,
    equipment: false,
    abilities: false
  });

  const openModal = (name) => setModals(m => ({ ...m, [name]: true }));
  const closeModal = (name) => setModals(m => ({ ...m, [name]: false }));

  return (
    <UIContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </UIContext.Provider>
  );
};
```

**Benefit**: Eliminates prop drilling for modal state

---

#### 1.2 Break ActionPane into Sub-components (3-4 hours)

**Current**: 700-line monolithic component
**Target**: 5-6 focused components

```
components/actionPane/
├── ActionPane.jsx (100 lines - wrapper only)
├── EventCard.jsx (existing)
├── ActiveMonsters.jsx (existing)
├── CombatInitiative.jsx (existing)
├── CombatPhaseRenderer.jsx (NEW - 200 lines)
│   ├── PartyTurnPhase.jsx (NEW - 150 lines)
│   └── MonsterTurnPhase.jsx (NEW - 150 lines)
├── AbilityButtons.jsx (NEW - 200 lines)
│   ├── SpellSelector.jsx (NEW - 100 lines)
│   ├── HealTargetSelector.jsx (NEW - 80 lines)
│   └── BlessTargetSelector.jsx (NEW - 80 lines)
└── NonCombatActions.jsx (NEW - 150 lines)
```

**Refactoring Steps**:
1. Extract spell/ability selection popups into separate components
2. Extract attack/defense roll grids into phase components
3. Extract non-combat room actions (search, treasure, etc.)
4. Update ActionPane to compose these components

---

#### 1.3 Standardize Dispatch Pattern (1-2 hours)

**Problem**: 3 different patterns for dispatching actions
**Solution**: Action creator pattern

```javascript
// src/actions/monsterActions.js
export const addMonster = (monster) => ({
  type: 'ADD_MONSTER',
  m: monster
});

export const logMessage = (message) => ({
  type: 'LOG',
  t: message
});

// Usage:
dispatch(addMonster(monster));
dispatch(logMessage(`${monster.name} appears!`));
```

**Apply to**: All direct dispatch calls throughout app

---

### Phase 2: Critical Refactors (Weeks 2-3) - 13-18 hours

#### 2.1 Split Combat.jsx (4-6 hours)

**Current structure** (1043 lines):
```javascript
Combat.jsx
├── 14 useState hooks (scattered state)
├── 30+ event handlers (mixed concerns)
├── Combat flow logic (400 lines)
├── UI rendering (343 lines)
└── Side effects & XP/leveling (300 lines)
```

**Target structure**:
```
components/combat/
├── CombatManager.jsx (200 lines - orchestration)
│   └── Uses: useCombatState hook
├── phases/
│   ├── ReactionPhase.jsx (120 lines)
│   ├── InitiativePhase.jsx (80 lines)
│   ├── PartyTurnPhase.jsx (180 lines)
│   ├── MonsterTurnPhase.jsx (150 lines)
│   └── VictoryPhase.jsx (80 lines)
├── CombatControls.jsx (100 lines)
├── CombatLog.jsx (60 lines)
└── hooks/
    └── useCombatState.js (150 lines)
```

**Migration strategy**:
1. Create phase components one-by-one
2. Test each in isolation
3. Gradually replace sections in Combat.jsx
4. Remove Combat.jsx when all phases extracted

---

#### 2.2 Refactor gameActions.js (6-8 hours)

**Current**: 1766 lines, 50+ functions, all domains mixed

**Target structure**:
```
src/gameActions/
├── monsterActions.js (300 lines)
│   ├── createMonsterSpawn()
│   ├── rollReaction()
│   └── applyMonsterAbility()
├── treasureActions.js (200 lines)
│   ├── rollTreasure()
│   ├── rollGold()
│   └── rollEquipment()
├── dungeonActions.js (400 lines)
│   ├── generateRoom()
│   ├── rollDoor()
│   ├── rollTrap()
│   └── rollSpecialFeature()
├── combatActions.js (300 lines)
│   ├── calculateAttack()
│   ├── calculateDefense()
│   ├── applyDamage()
│   └── resolveCombat()
├── spellActions.js (200 lines)
│   ├── castSpell()
│   ├── rollSpellDamage()
│   └── applySpellEffect()
├── abilityActions.js (200 lines)
│   ├── useClericHeal()
│   ├── useBarbarianRage()
│   └── useHalflingLuck()
└── index.js (exports all)
```

**Refactoring approach**:
- Extract pure logic first (no dispatch)
- Keep dispatch wrappers separate
- Add JSDoc comments for all functions
- Write unit tests as you go

**Example refactor**:
```javascript
// BEFORE: gameActions.js
export const spawnMonster = (dispatch, type, level = null) => {
  const monster = createMonster(type, level);
  if (!monster) return;
  dispatch({ type: 'ADD_MONSTER', m: monster });
  if (monster.isMinorFoe && monster.count) {
    dispatch({ type: 'LOG', t: `${monster.count} ${monster.name}...` });
  } else {
    dispatch({ type: 'LOG', t: `${monster.name} appears!` });
  }
};

// AFTER: monsterActions.js
// Pure logic
export const createMonsterSpawn = (type, level = null) => {
  const monster = createMonster(type, level);
  if (!monster) return null;

  return {
    monster,
    logMessage: monster.isMinorFoe && monster.count
      ? `${monster.count} ${monster.name} appear!`
      : `${monster.name} appears!`
  };
};

// Dispatch wrapper
export const spawnMonster = (dispatch, type, level) => {
  const result = createMonsterSpawn(type, level);
  if (!result) return;

  dispatch({ type: 'ADD_MONSTER', m: result.monster });
  dispatch({ type: 'LOG', t: result.logMessage });
};
```

---

#### 2.3 Compose Reducer (3-4 hours)

**Current**: 688 lines, 60+ cases

**Target**:
```javascript
// src/state/reducers/
├── partyReducer.js (150 lines)
├── combatReducer.js (200 lines)
├── dungeonReducer.js (150 lines)
├── inventoryReducer.js (100 lines)
├── logReducer.js (50 lines)
└── mainReducer.js (combines all)
```

**Implementation**:
```javascript
// mainReducer.js
import { combineReducers } from './combineReducers';

const rootReducer = combineReducers({
  party: partyReducer,
  combat: combatReducer,
  dungeon: dungeonReducer,
  inventory: inventoryReducer,
  log: logReducer
});

// combineReducers.js
export const combineReducers = (reducers) => {
  return (state = {}, action) => {
    const newState = {};
    let hasChanged = false;

    for (const [key, reducer] of Object.entries(reducers)) {
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      newState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? newState : state;
  };
};
```

---

### Phase 3: Structural Improvements (Month 2) - 11-18 hours

#### 3.1 Create Selector Functions (2-3 hours)

**Problem**: State access logic duplicated across components

**Solution**: Centralized selectors

```javascript
// src/state/selectors.js

// Party selectors
export const selectParty = (state) => state.party;
export const selectActiveHeroes = (state) => state.party.filter(h => h.hp > 0);
export const selectHCL = (state) =>
  state.party.length > 0 ? Math.max(...state.party.map(h => h.lvl)) : 1;

// Combat selectors
export const selectMonsters = (state) => state.monsters || [];
export const selectActiveMonsters = (state) =>
  selectMonsters(state).filter(m => m.hp > 0 && (m.count === undefined || m.count > 0));
export const selectCombatWon = (state) =>
  selectMonsters(state).length > 0 && selectActiveMonsters(state).length === 0;

// Dungeon selectors
export const selectGrid = (state) => state.grid;
export const selectDoors = (state) => state.doors;
export const selectTraps = (state) => state.traps;

// Campaign selectors
export const selectCampaignMode = (state) => state.mode === 'campaign';
export const selectCurrentAdventure = (state) => state.adventure;
```

**Usage**:
```javascript
// Before
const activeMonsters = state.monsters?.filter(m => m.hp > 0) || [];

// After
import { selectActiveMonsters } from '../state/selectors';
const activeMonsters = selectActiveMonsters(state);
```

---

#### 3.2 Implement Error Boundaries (2-3 hours)

```javascript
// src/components/ErrorBoundary.jsx
export class GameErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

#### 3.3 Add Action Validation (2-3 hours)

```javascript
// src/state/validateAction.js
const ACTION_SCHEMAS = {
  'ADD_HERO': {
    required: ['h'],
    validate: (action) => {
      if (!action.h.name) throw new Error('Hero name required');
      if (!action.h.key) throw new Error('Hero class required');
    }
  },
  'UPD_MONSTER': {
    required: ['i', 'u'],
    validate: (action) => {
      if (typeof action.i !== 'number') throw new Error('Monster index must be number');
    }
  }
};

export const validateAction = (action) => {
  if (!action.type) {
    throw new Error('Action type is required');
  }

  const schema = ACTION_SCHEMAS[action.type];
  if (!schema) return; // Allow unknown actions (for now)

  for (const field of schema.required) {
    if (!(field in action)) {
      throw new Error(`Action ${action.type} missing required field: ${field}`);
    }
  }

  if (schema.validate) {
    schema.validate(action);
  }
};
```

**Usage in reducer**:
```javascript
export function reducer(state, action) {
  validateAction(action); // Throws if invalid

  switch (action.type) {
    // ... cases
  }
}
```

---

#### 3.4 Add Testing Infrastructure (4-6 hours)

**Install dependencies**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Setup**:
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

**Write tests**:
```javascript
// src/state/__tests__/partyReducer.test.js
import { describe, test, expect } from 'vitest';
import { partyReducer } from '../reducers/partyReducer';

describe('partyReducer', () => {
  test('ADD_HERO adds hero to party', () => {
    const state = { party: [] };
    const action = {
      type: 'ADD_HERO',
      h: { id: 1, name: 'Test', key: 'warrior' }
    };

    const newState = partyReducer(state, action);
    expect(newState.party).toHaveLength(1);
    expect(newState.party[0].name).toBe('Test');
  });

  test('ADD_HERO fails when party is full', () => {
    const state = {
      party: [
        { id: 1, name: 'Hero1' },
        { id: 2, name: 'Hero2' },
        { id: 3, name: 'Hero3' },
        { id: 4, name: 'Hero4' }
      ]
    };
    const action = { type: 'ADD_HERO', h: { id: 5, name: 'Hero5' } };

    const newState = partyReducer(state, action);
    expect(newState.party).toHaveLength(4); // Unchanged
  });
});
```

---

#### 3.5 Performance Optimization (1-2 hours)

**Add memoization**:
```javascript
// Memoize expensive selectors
import { useMemo } from 'react';

const activeMonsters = useMemo(
  () => selectActiveMonsters(state),
  [state.monsters]
);

// Memoize callbacks
const handleAttack = useCallback((monsterIdx) => {
  // Attack logic
}, [dispatch, state.monsters]);
```

**Debounce localStorage**:
```javascript
// useGameState.js
useEffect(() => {
  const timeoutId = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, 500); // Save 500ms after last change

  return () => clearTimeout(timeoutId);
}, [state]);
```

---

### Phase 4: Long-term Architecture (Month 3+) - Optional

#### 4.1 Feature-based Structure

Reorganize by feature instead of type:

```
src/
├── features/
│   ├── party/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── reducer.js
│   │   └── actions.js
│   ├── combat/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── reducer.js
│   │   └── actions.js
│   └── dungeon/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── reducer.js
│       └── actions.js
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── App.jsx
```

---

#### 4.2 Game Rules Engine

Extract game rules into platform-agnostic module:

```
src/gameRules/
├── classes.js        # Class definitions
├── abilities.js      # Ability system
├── combat.js         # Combat calculations
├── equipment.js      # Equipment rules
├── monsters.js       # Monster behavior
├── dungeons.js       # Dungeon generation
└── saves.js          # Save mechanics
```

**Benefits**:
- Rules are testable independently
- Can be reused in different UI contexts
- Easier to balance game mechanics
- Could be shared with backend/multiplayer

---

## Implementation Checklist

### Week 1
- [ ] Create UIContext for modal state
- [ ] Extract ActionPane sub-components
- [ ] Standardize dispatch pattern (action creators)
- [ ] Document new patterns in CONTRIBUTING.md

### Week 2
- [ ] Split Combat.jsx into phase components
- [ ] Test each phase independently
- [ ] Update tests

### Week 3
- [ ] Refactor gameActions.js into domain files
- [ ] Write unit tests for pure functions
- [ ] Update import paths across app

### Week 4
- [ ] Compose reducer into domain reducers
- [ ] Add action validation
- [ ] Set up testing infrastructure

### Week 5-6
- [ ] Create selector functions
- [ ] Add error boundaries
- [ ] Implement performance optimizations
- [ ] Write comprehensive tests

---

## Success Metrics

### Code Quality
- [ ] No file > 400 lines
- [ ] No function > 50 lines
- [ ] Test coverage > 70%
- [ ] TypeScript or JSDoc on all exports

### Performance
- [ ] localStorage saves < 500ms after action
- [ ] Component re-renders < 30ms
- [ ] Initial load < 2s

### Maintainability
- [ ] New feature takes < 4 hours to add
- [ ] Onboarding new dev takes < 1 day
- [ ] Clear separation of concerns
- [ ] Consistent patterns throughout

---

## Anti-Patterns to Avoid

### ❌ Don't Create More God Classes
- Keep components under 400 lines
- Single responsibility principle
- Extract when complexity grows

### ❌ Don't Over-Abstract Too Early
- Wait until you have 3 instances before abstracting
- Prefer duplication over wrong abstraction
- Keep it simple

### ❌ Don't Break Working Code Without Tests
- Write tests BEFORE refactoring
- Maintain backward compatibility
- Incremental changes

### ❌ Don't Ignore Performance Until It's Too Late
- Profile early
- Memoize expensive operations
- Watch bundle size

---

## Resources

### Testing
- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

### State Management
- [Redux Toolkit](https://redux-toolkit.js.org/) (if needed)
- [Zustand](https://github.com/pmndrs/zustand) (lightweight alternative)

### Architecture Patterns
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

---

## Conclusion

This refactoring plan addresses the critical architectural issues identified in the audit. By following this incremental approach, you can improve code quality, maintainability, and scalability without disrupting active development.

**Estimated Total Effort**: 30-44 hours over 6-8 weeks
**Expected Impact**: 50%+ improvement in development velocity
**Risk Level**: Low (incremental, testable changes)

**Next Steps**:
1. Review and prioritize recommendations
2. Start with Phase 1 (quick wins)
3. Set up testing infrastructure early
4. Tackle one phase per week
5. Document patterns as you go

Questions or need clarification on any recommendation? Create an issue or discussion.
