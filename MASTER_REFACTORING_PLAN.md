# 🎯 Master Refactoring Plan: Four Against Darkness
**Complete Codebase Transformation Roadmap**

**Date:** 2026-01-15
**Timeline:** 6-8 weeks (40-55 hours total)
**Approach:** Incremental, test-as-you-go, production-safe

---

## 📊 Executive Summary

This plan combines architectural improvements, CSS refactoring, and critical fixes into a cohesive roadmap. Each week builds on the previous, maintaining a working application throughout.

**Current State Health Scores:**
- JavaScript Architecture: 6/10
- CSS Architecture: 4/10
- Code Quality: 5/10
- **Overall: 5/10**

**Target State Health Scores:**
- JavaScript Architecture: 9/10
- CSS Architecture: 9/10
- Code Quality: 9/10
- **Overall: 9/10**

---

## 🗓️ Week-by-Week Timeline

```
Week 1: Foundation & Critical Fixes (8-10 hours)
  ├─ Critical fixes (gitignore, error boundaries, localStorage)
  ├─ UI component library (Button, Card)
  └─ First component migrations

Week 2: CSS Architecture Refactoring (8-10 hours)
  ├─ Add semantic data attributes
  ├─ Migrate buttons and cards across all components
  └─ Remove theme !important flags

Week 3: Component Decomposition (8-10 hours)
  ├─ Split ActionPane into subcomponents
  ├─ Start Combat.jsx decomposition
  ├─ Deduplicate code
  └─ Create onboarding/start screen for new users

Week 4: State & Utilities Refactoring (8-10 hours)
  ├─ Split gameActions.js by domain
  ├─ Compose reducer into domain reducers
  └─ Create selector functions

Week 5: Performance & Accessibility (6-8 hours)
  ├─ Add React.memo and useCallback
  ├─ Implement ARIA labels
  └─ Fix keyboard navigation

Week 6: Testing & Polish (6-8 hours)
  ├─ Set up testing infrastructure
  ├─ Write tests for critical paths
  └─ Documentation and cleanup
```

---

## 📋 Detailed Task Breakdown

---

## WEEK 1: Foundation & Critical Fixes
**Focus:** Fix critical issues, establish new patterns
**Effort:** 8-10 hours
**Risk:** Low

### Day 1 (2-3 hours): Critical Fixes & Setup

#### Task 1.1: Git Hygiene (30 minutes)
**Priority:** 🔴 CRITICAL

**Problem:** 30+ temporary files cluttering repository

**Action:**
```bash
# 1. Update .gitignore
echo "" >> .gitignore
echo "# Claude temporary files" >> .gitignore
echo "tmpclaude-*" >> .gitignore
echo "" >> .gitignore
echo "# Editor files" >> .gitignore
echo "*.swp" >> .gitignore
echo "*.swo" >> .gitignore
echo "*~" >> .gitignore
echo ".vscode/" >> .gitignore
echo ".idea/" >> .gitignore

# 2. Remove existing temp files
rm -f tmpclaude-*

# 3. Commit changes
git add .gitignore
git commit -m "chore: update .gitignore for temp files and editors"
```

**Files to edit:**
- `.gitignore`

**Success Criteria:**
- [ ] No tmpclaude files in git status
- [ ] .gitignore covers common editor files

---

#### Task 1.2: Error Boundary Implementation (1 hour)
**Priority:** 🔴 CRITICAL

**Problem:** Single component crash takes down entire app

**Action:**

**File 1:** Create `src/components/ErrorBoundary.jsx`
```jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-800 rounded-lg p-6 space-y-4">
            <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
            <p className="text-slate-300">
              An unexpected error occurred. You can try reloading the page or resetting the game state.
            </p>

            {this.state.error && (
              <details className="bg-slate-700 rounded p-3 text-sm">
                <summary className="cursor-pointer font-semibold">Error Details</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold"
              >
                Clear Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**File 2:** Update `src/main.jsx`
```jsx
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Files to edit:**
- Create: `src/components/ErrorBoundary.jsx`
- Update: `src/main.jsx`

**Success Criteria:**
- [ ] Error boundary catches component errors
- [ ] User sees friendly error screen
- [ ] Can recover without losing all data

---

#### Task 1.3: localStorage Safety (1 hour)
**Priority:** 🔴 CRITICAL

**Problem:** localStorage can fail silently, corrupting or losing user data

**Action:**

Update `src/hooks/useGameState.js`:

```javascript
// Add at top
const STORAGE_KEY = 'gameState-v1';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB safety limit

// Validate state shape
const validateStateShape = (state) => {
  const required = ['party', 'gold', 'clues', 'hcl', 'grid', 'log'];
  for (const key of required) {
    if (!(key in state)) {
      console.warn(`Invalid state: missing key "${key}"`);
      return false;
    }
  }
  return true;
};

// Replace loadState function
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;

    const parsed = JSON.parse(saved);

    // Validate shape
    if (!validateStateShape(parsed)) {
      console.warn('Invalid state shape, using defaults');
      return initialState;
    }

    // Merge with defaults to handle new keys
    return { ...initialState, ...parsed };
  } catch (e) {
    console.error('Failed to load state:', e);
    // Backup corrupted state
    try {
      const corrupted = localStorage.getItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY + '-corrupted-' + Date.now(), corrupted);
    } catch {}
    return initialState;
  }
};

// Replace saveState function
const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);

    // Check size
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.error('State too large to save:', serialized.length, 'bytes');
      // TODO: Show user notification
      return;
    }

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // TODO: Show user notification to clear old data
    } else {
      console.error('Failed to save state:', e);
    }
  }
};

// Add debounce to useEffect
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveState(state);
  }, 500); // Debounce saves

  return () => clearTimeout(timeoutId);
}, [state]);
```

**Files to edit:**
- `src/hooks/useGameState.js`

**Success Criteria:**
- [ ] Corrupted localStorage doesn't crash app
- [ ] State validation prevents invalid data
- [ ] QuotaExceededError handled gracefully
- [ ] Saves debounced (500ms delay)

---

### Day 2 (3-4 hours): UI Component Library Foundation

#### Task 1.4: Finalize Button & Card Components (1 hour)
**Priority:** 🟠 HIGH

**Status:** ✅ Already created (Button.jsx, Card.jsx)

**Action:** Review and test

Test the components:
```jsx
// Create test file: src/components/ui/__test__.jsx (temporary)
import { Button } from './Button';
import { Card, HeroCard, MonsterCard } from './Card';

export function UIComponentTest() {
  return (
    <div className="p-4 space-y-4 bg-slate-900">
      <h2 className="text-white text-xl">Button Variants</h2>
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="info">Info</Button>
      </div>

      <h2 className="text-white text-xl">Button Sizes</h2>
      <div className="flex gap-2 items-center">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <h2 className="text-white text-xl">Card Variants</h2>
      <Card variant="default">Default Card</Card>
      <Card variant="hero">Hero Card</Card>
      <Card variant="monster">Monster Card</Card>
    </div>
  );
}
```

Temporarily add to App.jsx to verify, then remove.

**Files to verify:**
- `src/components/ui/Button.jsx` ✓
- `src/components/ui/Card.jsx` ✓
- `src/components/ui/index.js` ✓

**Success Criteria:**
- [ ] All button variants render correctly
- [ ] All card variants render correctly
- [ ] Data attributes present in DOM
- [ ] Components work in all 3 themes (default, rpgui, doodle)

---

#### Task 1.5: First Component Migration - Dice.jsx (2 hours)
**Priority:** 🟠 HIGH

**Problem:** Dice component has inline button styles

**Action:**

Update `src/components/Dice.jsx`:

```jsx
// BEFORE (lines 27-37)
<RpguiButton key={type} onClick={() => roll(type)}>
  <Dices size={18} /> {type}
</RpguiButton>

// AFTER
import { Button } from './ui/Button';

<Button
  key={type}
  onClick={() => roll(type)}
  variant="primary"
  size="sm"
  dataAction={`roll-${type}`}
  className="rpgui-button" // Keep RPGUI styling if needed
>
  <Dices size={18} /> {type}
</Button>
```

Add ARIA labels:
```jsx
<Button
  key={type}
  onClick={() => roll(type)}
  variant="primary"
  size="sm"
  dataAction={`roll-${type}`}
  aria-label={`Roll ${type} dice`}
>
  <Dices size={18} /> {type}
</Button>
```

**Files to edit:**
- `src/components/Dice.jsx`

**Success Criteria:**
- [ ] Dice buttons use Button component
- [ ] ARIA labels present
- [ ] Data attributes for testing
- [ ] Styling preserved in all themes

---

#### Task 1.6: Deduplicate Dungeon Door Rendering (2-3 hours)
**Priority:** 🟠 HIGH

**Problem:** 90 lines of duplicated code for door rendering

**Action:**

Create helper component in `src/components/Dungeon.jsx`:

```jsx
// Add near top of file after imports
function DoorEdge({ edge, isPlaced, onClick, cellSize }) {
  const positions = {
    top: {
      className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
      lineClass: 'h-1',
      lineStyle: { width: `${cellSize * 0.4}px` }
    },
    right: {
      className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
      lineClass: 'w-1',
      lineStyle: { height: `${cellSize * 0.4}px` }
    },
    bottom: {
      className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
      lineClass: 'h-1',
      lineStyle: { width: `${cellSize * 0.4}px` }
    },
    left: {
      className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
      lineClass: 'w-1',
      lineStyle: { height: `${cellSize * 0.4}px` }
    }
  };

  const { className, lineClass, lineStyle } = positions[edge];
  const lineOpacity = isPlaced ? 'opacity-100' : 'opacity-0 hover:opacity-100';
  const buttonOpacity = isPlaced ? '' : 'opacity-0 group-hover/cell:opacity-100';

  return (
    <button
      onClick={onClick}
      className={`absolute ${className} ${buttonOpacity} z-10 transition-opacity`}
      data-door-edge={edge}
      aria-label={`${isPlaced ? 'Remove' : 'Place'} door on ${edge} edge`}
    >
      <div
        className={`${lineClass} bg-amber-500 ${lineOpacity}`}
        style={lineStyle}
      />
    </button>
  );
}

// Then in cell rendering (replace lines 443-534)
{['top', 'right', 'bottom', 'left'].map(edge => {
  const doorEdge = cell.doors?.[edge];
  const isDoorPlaced = state.doors.some(d =>
    d.row === r && d.col === c && d.edge === edge
  );

  if (!doorEdge && !isDoorPlaced) return null;

  return (
    <DoorEdge
      key={edge}
      edge={edge}
      isPlaced={isDoorPlaced}
      onClick={() => onDoorClick(r, c, edge)}
      cellSize={cellSize}
    />
  );
})}
```

**Files to edit:**
- `src/components/Dungeon.jsx` (lines 443-534 → ~30 lines)

**Success Criteria:**
- [ ] Door rendering reduced from 90 to ~30 lines
- [ ] All door functionality preserved
- [ ] ARIA labels added
- [ ] Data attributes for testing

---

### Day 3 (3 hours): Component Migrations

#### Task 1.7: Migrate MobileNavigation (30 minutes)
**Priority:** 🟡 MEDIUM

Update `src/components/layout/MobileNavigation.jsx`:

```jsx
// Add ARIA labels
<button
  key={t.id}
  onClick={() => onTabChange(t.id)}
  className={`...`}
  aria-label={`Navigate to ${t.label}`}
  aria-current={activeTab === t.id ? 'page' : undefined}
>
  <t.icon size={18} aria-hidden="true" />
  <span className="text-xs">{t.label}</span>
</button>
```

---

#### Task 1.8: Add package.json Metadata (30 minutes)
**Priority:** 🟡 MEDIUM

Update `package.json`:

```json
{
  "name": "4ad-tabs",
  "description": "Four Against Darkness - Solo tabletop RPG companion app",
  "version": "1.0.0",
  "author": "Your Name",
  "license": "MIT",
  "homepage": "https://github.com/yourusername/4ad-tabs",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/4ad-tabs.git"
  },
  "keywords": ["rpg", "tabletop", "four-against-darkness", "solo-game"],
  "private": true,
  "type": "module",
  ...
}
```

---

#### Task 1.9: Create .env.example (15 minutes)
**Priority:** 🟡 MEDIUM

Create `.env.example`:

```bash
# Base URL for deployment
# Development: /
# Production: /4ad-tabs/
VITE_BASE_URL=/4ad-tabs/

# Theme default
VITE_DEFAULT_THEME=default

# Feature flags (future use)
VITE_ENABLE_CAMPAIGN_MODE=true
VITE_ENABLE_ANALYTICS=false
```

---

#### Task 1.10: Week 1 Review & Documentation (1 hour)
**Priority:** 🟡 MEDIUM

Create `CHANGELOG.md`:

```markdown
# Changelog

## Week 1 - Foundation & Critical Fixes (Date: YYYY-MM-DD)

### Fixed
- Added comprehensive .gitignore for temp files and editors
- Implemented ErrorBoundary for graceful error handling
- Added localStorage validation and quota handling
- Debounced state saves for better performance

### Added
- UI component library (Button, Card)
- ARIA labels for accessibility
- Data attributes for testing
- DoorEdge component (deduplication)

### Changed
- Migrated Dice component to use Button component
- Refactored Dungeon door rendering (90 lines → 30 lines)

### Files Modified
- .gitignore
- src/components/ErrorBoundary.jsx (new)
- src/main.jsx
- src/hooks/useGameState.js
- src/components/Dice.jsx
- src/components/Dungeon.jsx
- package.json
```

**Week 1 Completion Checklist:**
- [ ] All critical fixes implemented
- [ ] UI components created and tested
- [ ] First migrations complete
- [ ] No regressions in functionality
- [ ] CHANGELOG.md updated

---

## WEEK 2: CSS Architecture Refactoring
**Focus:** Migrate all buttons/cards, add semantic data attributes
**Effort:** 8-10 hours
**Risk:** Low-Medium

### Day 1 (3-4 hours): Mass Button Migration

#### Task 2.1: Migrate ActionPane Buttons (1.5 hours)
**Priority:** 🔴 CRITICAL

**Action:** Update `src/components/ActionPane.jsx`

Find and replace all button instances with Button component:

```jsx
// Import at top
import { Button } from './ui/Button';

// BEFORE (line 567)
<button
  onClick={generateTile}
  className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-4 py-3 rounded font-bold text-sm flex items-center justify-center gap-2"
>
  <Dices size={18} /> Generate Tile
</button>

// AFTER
<Button
  onClick={generateTile}
  variant="primary"
  size="lg"
  fullWidth
  dataAction="generate-tile"
  className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500"
>
  <Dices size={18} /> Generate Tile
</Button>

// Pattern: Find all <button> tags, replace with <Button>
// Mapping:
// bg-red-600 → variant="primary"
// bg-slate-600 → variant="secondary"
// bg-green-600 → variant="success"
// bg-yellow-600 → variant="warning"
// bg-orange-600 → variant="danger"
// bg-blue-600 → variant="info"
```

**Attack buttons** (lines 736-798):
```jsx
<Button
  key={hero.id || index}
  onClick={() => handleAttack(hero, index)}
  disabled={hero.hp <= 0}
  variant="danger"
  size="xs"
  dataAction={`attack-${hero.name}`}
  className="truncate relative"
>
  {hero.name} {hero.hp <= 0 ? '💀' : `(+${totalBonus})`}
  {hero.status?.blessed && <span className="absolute -top-1 -right-1 text-yellow-300">✨</span>}
</Button>
```

**Files to edit:**
- `src/components/ActionPane.jsx` (~30 button instances)

**Success Criteria:**
- [ ] All buttons use Button component
- [ ] Styling preserved
- [ ] Data attributes added
- [ ] ARIA labels where needed

---

#### Task 2.2: Migrate Combat.jsx Buttons (2 hours)
**Priority:** 🔴 CRITICAL

**Problem:** Combat.jsx has 40+ button instances

**Action:** Update `src/components/Combat.jsx`

Similar pattern to ActionPane - find/replace all buttons:

```jsx
// Import Button
import { Button } from './ui/Button';

// Example replacements:
<Button variant="primary" size="md" dataAction="roll-save">Roll Save</Button>
<Button variant="secondary" size="sm" dataAction="new-round">New Round</Button>
<Button variant="warning" size="sm" dataAction="flee">Flee</Button>
```

**Files to edit:**
- `src/components/Combat.jsx` (~40 button instances)

**Success Criteria:**
- [ ] All buttons migrated
- [ ] Combat functionality unchanged
- [ ] Data attributes present

---

#### Task 2.3: Migrate Party.jsx Buttons (1 hour)
**Priority:** 🟠 HIGH

Update `src/components/Party.jsx`:

```jsx
import { Button } from './ui/Button';

// HP adjustment buttons (lines 250-257)
<Button
  onClick={() => dispatch({ type: 'UPD_HERO', i: idx, u: { hp: Math.max(0, hero.hp - 1) } })}
  variant="danger"
  size="xs"
  dataAction={`decrease-hp-${hero.name}`}
  aria-label={`Decrease ${hero.name} HP`}
>
  -
</Button>

// Add hero button (line 346)
<Button
  onClick={addHero}
  variant="success"
  size="md"
  fullWidth
  dataAction="add-hero"
  disabled={state.party.length >= 4}
>
  + Add Hero
</Button>
```

**Files to edit:**
- `src/components/Party.jsx` (~15 button instances)

---

### Day 2 (3-4 hours): Card Migration & Data Attributes

#### Task 2.4: Migrate Hero Cards (1.5 hours)
**Priority:** 🟠 HIGH

Update `src/components/Party.jsx`:

```jsx
import { Card, HeroCard } from './ui/Card';

// BEFORE (line 211)
<div className="bg-slate-700 rounded p-2 text-sm ring-2 ring-offset-2 ring-offset-slate-800">
  {/* Hero content */}
</div>

// AFTER
<HeroCard hero={hero}>
  {/* Hero content */}
</HeroCard>
```

Update `src/components/Combat.jsx` for monster cards:

```jsx
import { MonsterCard } from './ui/Card';

// BEFORE (line 476)
<div className="bg-slate-800 rounded p-2 border border-slate-600">
  {/* Monster content */}
</div>

// AFTER
<MonsterCard monster={monster}>
  {/* Monster content */}
</MonsterCard>
```

**Files to edit:**
- `src/components/Party.jsx` (~10 card instances)
- `src/components/Combat.jsx` (~8 card instances)
- `src/components/ActionPane.jsx` (~5 card instances)

**Success Criteria:**
- [ ] All hero cards use HeroCard component
- [ ] All monster cards use MonsterCard component
- [ ] Data attributes (data-hero-id, data-monster-id) present

---

#### Task 2.5: Add Data Attributes Throughout (1.5 hours)
**Priority:** 🟠 HIGH

**Action:** Add semantic data attributes to major elements

**Pattern:**
```jsx
// Dungeon grid
<div data-dungeon-grid="true" />

// Dungeon cells
<div data-dungeon-cell={`${r}-${c}`} />

// Combat phases
<div data-combat-phase={combatPhase} />

// Log entries
<div data-log-entry={index} data-log-type={entryType} />

// Modals
<div data-modal="settings" data-modal-open={isOpen} />
```

**Files to edit:**
- `src/components/Dungeon.jsx`
- `src/components/Combat.jsx`
- `src/components/Log.jsx`
- All modal components

**Success Criteria:**
- [ ] Major UI sections have data attributes
- [ ] DevTools inspection easier
- [ ] Can write reliable selectors for testing

---

### Day 3 (2-3 hours): Theme File Refactoring

#### Task 2.6: Update Theme Files for Data Attributes (2 hours)
**Priority:** 🟠 HIGH

**Action:** Refactor theme CSS files to target data attributes

Update `src/styles/rpgui-overrides.css`:

```css
/* BEFORE - Brittle */
body.rpgui-content button.bg-red-600 {
  background-color: #6b5c3d !important;
}

/* AFTER - Semantic */
body.rpgui-content [data-button="primary"],
body.rpgui-content [data-button="danger"] {
  background-color: #6b5c3d;
  border: 3px solid #8b7355;
  /* Remove !important */
}

body.rpgui-content [data-card] {
  border-image-source: url('/4ad-tabs/rpgui/img/border-image.png');
  border-image-slice: 6;
  /* ... */
}
```

Do the same for:
- `src/styles/doodle-overrides.css`
- `src/styles/roguelike-crt.css`

**Files to edit:**
- `src/styles/rpgui-overrides.css`
- `src/styles/doodle-overrides.css`
- `src/styles/roguelike-crt.css`

**Success Criteria:**
- [ ] Theme files target [data-button], [data-card]
- [ ] 90% of !important flags removed
- [ ] Themes still work correctly

---

#### Task 2.7: Week 2 Review (1 hour)
**Priority:** 🟡 MEDIUM

Update CHANGELOG.md:

```markdown
## Week 2 - CSS Architecture Refactoring (Date: YYYY-MM-DD)

### Changed
- Migrated 100+ buttons to Button component
- Migrated 30+ cards to Card/HeroCard/MonsterCard
- Added semantic data attributes throughout app
- Refactored theme CSS files to use data attributes

### Removed
- Removed 90% of !important flags from theme files
- Removed inline button/card styling

### Files Modified
- src/components/ActionPane.jsx
- src/components/Combat.jsx
- src/components/Party.jsx
- src/components/Dungeon.jsx
- src/styles/*.css (3 files)

### Metrics
- Buttons: 120+ → Button component
- Cards: 35+ → Card components
- !important: 150+ → 15
- Lines reduced: ~400 lines
```

**Week 2 Completion Checklist:**
- [ ] All buttons migrated
- [ ] All cards migrated
- [ ] Data attributes added
- [ ] Theme files updated
- [ ] No styling regressions

---

## WEEK 3: Component Decomposition
**Focus:** Break up god components
**Effort:** 8-10 hours
**Risk:** Medium

### Day 1 (3-4 hours): ActionPane Decomposition

#### Task 3.1: Extract Combat Phase Components (2 hours)
**Priority:** 🔴 CRITICAL

Create new files:

**File 1:** `src/components/actionPane/combat/PartyTurnPhase.jsx`
```jsx
import React from 'react';
import { Button } from '../../ui/Button';
import { d6 } from '../../../utils/dice';

export default function PartyTurnPhase({
  state,
  dispatch,
  activeMonsters,
  corridor,
  onEndTurn
}) {
  // Extract attack handling logic from ActionPane
  const handleAttack = (hero, index) => {
    // ... attack logic from ActionPane lines 223-290
  };

  return (
    <div className="bg-slate-800 rounded p-2" data-phase="party-turn">
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
        {state.party.map((hero, index) => (
          <Button
            key={hero.id || index}
            onClick={() => handleAttack(hero, index)}
            disabled={hero.hp <= 0}
            variant="danger"
            size="xs"
            dataAction={`attack-${hero.name}`}
          >
            {/* ... button content */}
          </Button>
        ))}
      </div>
      <Button
        onClick={onEndTurn}
        variant="secondary"
        size="sm"
        fullWidth
        dataAction="end-party-turn"
      >
        End Turn → Monster's Turn
      </Button>
    </div>
  );
}
```

**File 2:** `src/components/actionPane/combat/MonsterTurnPhase.jsx`
Similar structure for defense rolls (lines 808-876).

**File 3:** `src/components/actionPane/combat/index.js`
```javascript
export { default as PartyTurnPhase } from './PartyTurnPhase';
export { default as MonsterTurnPhase } from './MonsterTurnPhase';
```

**Update ActionPane.jsx:**
```jsx
import { PartyTurnPhase, MonsterTurnPhase } from './actionPane/combat';

// Replace inline phase rendering with:
{combatPhase === COMBAT_PHASES.PARTY_TURN && (
  <PartyTurnPhase
    state={state}
    dispatch={dispatch}
    activeMonsters={activeMonsters}
    corridor={corridor}
    onEndTurn={handleEndPartyTurn}
  />
)}

{combatPhase === COMBAT_PHASES.MONSTER_TURN && (
  <MonsterTurnPhase
    state={state}
    dispatch={dispatch}
    activeMonsters={activeMonsters}
    onEndTurn={handleEndMonsterTurn}
  />
)}
```

**Files to create:**
- `src/components/actionPane/combat/PartyTurnPhase.jsx`
- `src/components/actionPane/combat/MonsterTurnPhase.jsx`
- `src/components/actionPane/combat/index.js`

**Files to edit:**
- `src/components/ActionPane.jsx` (reduce by ~200 lines)

**Success Criteria:**
- [ ] ActionPane reduced to ~500 lines
- [ ] Combat phases in separate files
- [ ] No functionality broken

---

#### Task 3.2: Extract Ability Components (1.5 hours)
**Priority:** 🟠 HIGH

Create `src/components/actionPane/combat/AbilityButtons.jsx`:

Extract lines 881-1144 from ActionPane.jsx (ability buttons + popups).

```jsx
export default function AbilityButtons({
  state,
  dispatch,
  showSpells,
  setShowSpells,
  showHealTarget,
  setShowHealTarget,
  // ... other state
}) {
  // Move all ability logic here
}
```

**Files to create:**
- `src/components/actionPane/combat/AbilityButtons.jsx`

**Files to edit:**
- `src/components/ActionPane.jsx` (reduce by ~260 lines)

**Target:** ActionPane.jsx should be ~250 lines

---

### Day 2 (3-4 hours): Combat.jsx Decomposition Part 1

#### Task 3.3: Extract Combat Phases from Combat.jsx (3 hours)
**Priority:** 🔴 CRITICAL

**Strategy:** Don't try to refactor all 1043 lines at once. Start with phases.

Create directory: `src/components/combat/phases/`

**File 1:** `src/components/combat/phases/ReactionPhase.jsx`
Extract reaction rolling logic (~100 lines).

**File 2:** `src/components/combat/phases/InitiativePhase.jsx`
Extract initiative selection logic (~80 lines).

**File 3:** `src/components/combat/phases/VictoryPhase.jsx`
Extract victory/treasure logic (~100 lines).

**Update Combat.jsx:**
```jsx
import { ReactionPhase, InitiativePhase, VictoryPhase } from './combat/phases';

// Replace inline phase rendering
{currentPhase === 'reaction' && (
  <ReactionPhase
    monster={state.monsters[0]}
    onReactionRolled={handleReaction}
  />
)}
```

**Files to create:**
- `src/components/combat/phases/ReactionPhase.jsx`
- `src/components/combat/phases/InitiativePhase.jsx`
- `src/components/combat/phases/VictoryPhase.jsx`
- `src/components/combat/phases/index.js`

**Files to edit:**
- `src/components/Combat.jsx` (reduce by ~280 lines)

**Target:** Combat.jsx should be ~760 lines

---

### Day 3 (2-3 hours): Code Deduplication

#### Task 3.4: Extract Shared Card Patterns (1.5 hours)
**Priority:** 🟡 MEDIUM

Create `src/components/ui/StatCard.jsx`:

```jsx
export function StatCard({ label, value, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-800',
    highlight: 'bg-blue-900/30 ring-1 ring-blue-400',
    danger: 'bg-red-900/30 ring-1 ring-red-400'
  };

  return (
    <div className={`${variants[variant]} rounded p-2`} data-card="stat">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
    </div>
  );
}
```

Use in Party, Combat, Analytics components.

---

#### Task 3.5: Create Onboarding/Start Screen (1.5-2 hours)
**Priority:** 🟡 MEDIUM

**Problem:** When the app loads with no data, users are dropped into an empty state with no guidance on how to create a party or start a campaign.

**Solution:** Create a welcoming start screen that guides users through initial party creation.

Create `src/components/OnboardingScreen.jsx`:

```jsx
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CLASSES } from '../data/classes';
import { d6 } from '../utils/dice';

/**
 * OnboardingScreen - First-time user experience for party creation
 * Shows when no party exists in state
 */
export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState('welcome'); // welcome | create-party | buy-equipment
  const [heroes, setHeroes] = useState([]);
  const [gold, setGold] = useState(0);

  // Step 1: Welcome screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card variant="surface1" className="max-w-2xl">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">
            Four Against Darkness
          </h1>
          <p className="text-slate-300 mb-6">
            Welcome, adventurer! You're about to embark on a solo dungeon-crawling
            adventure. Let's create your party of heroes.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setStep('create-party')}
            dataAction="start-adventure"
          >
            Start New Adventure
          </Button>
        </Card>
      </div>
    );
  }

  // Step 2: Create party (4 heroes)
  if (step === 'create-party') {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Card variant="surface1" className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            Create Your Party ({heroes.length}/4)
          </h2>

          {/* Hero creation form */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[0, 1, 2, 3].map(idx => (
              <HeroCreationCard
                key={idx}
                hero={heroes[idx]}
                onSave={(hero) => {
                  const newHeroes = [...heroes];
                  newHeroes[idx] = hero;
                  setHeroes(newHeroes);
                }}
              />
            ))}
          </div>

          {heroes.length === 4 && (
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={() => {
                // Roll starting gold (2d6 × 5)
                const goldRoll = (d6() + d6()) * 5;
                setGold(goldRoll);
                setStep('buy-equipment');
              }}
              dataAction="confirm-party"
            >
              Continue to Equipment
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Step 3: Equipment purchase
  if (step === 'buy-equipment') {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Card variant="surface1" className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            Buy Starting Equipment
          </h2>
          <p className="text-slate-300 mb-4">
            You have {gold} gold pieces to spend on equipment.
          </p>

          {/* Equipment shop interface - simplified version */}
          <EquipmentShop
            gold={gold}
            heroes={heroes}
            onComplete={(updatedHeroes, remainingGold) => {
              onComplete({
                party: updatedHeroes,
                gold: remainingGold
              });
            }}
          />
        </Card>
      </div>
    );
  }

  return null;
}

/**
 * HeroCreationCard - Individual hero creation form
 */
function HeroCreationCard({ hero, onSave }) {
  const [name, setName] = useState(hero?.name || '');
  const [selectedClass, setSelectedClass] = useState(hero?.key || '');
  const [selectedTrait, setSelectedTrait] = useState(hero?.trait || null);

  const handleSave = () => {
    if (!name || !selectedClass) return;

    const classData = CLASSES[selectedClass];
    onSave({
      id: Date.now() + Math.random(),
      name,
      key: selectedClass,
      lvl: 1,
      xp: 0,
      hp: classData.life + 1,
      maxHp: classData.life + 1,
      trait: selectedTrait,
      equipment: [],
      gold: 0
    });
  };

  return (
    <Card variant="hero" className="p-4">
      <input
        type="text"
        placeholder="Hero Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3"
        aria-label="Hero name"
      />

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3"
        aria-label="Character class"
      >
        <option value="">Select Class</option>
        {Object.entries(CLASSES).map(([key, cls]) => (
          <option key={key} value={key}>{cls.name}</option>
        ))}
      </select>

      {selectedClass && CLASSES[selectedClass].traits && (
        <select
          value={selectedTrait || ''}
          onChange={(e) => setSelectedTrait(e.target.value || null)}
          className="w-full bg-slate-700 rounded px-3 py-2 mb-3"
          aria-label="Character trait"
        >
          <option value="">Select Trait (Optional)</option>
          {CLASSES[selectedClass].traits.map(trait => (
            <option key={trait} value={trait}>{trait}</option>
          ))}
        </select>
      )}

      <Button
        variant="success"
        size="sm"
        fullWidth
        onClick={handleSave}
        disabled={!name || !selectedClass}
        dataAction="save-hero"
      >
        {hero ? 'Update' : 'Create'} Hero
      </Button>
    </Card>
  );
}

/**
 * EquipmentShop - Starting equipment purchase interface
 */
function EquipmentShop({ gold, heroes, onComplete }) {
  // Simplified shop - can be expanded later
  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">
        Equipment can be purchased later. Click below to begin your adventure!
      </p>
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => onComplete(heroes, gold)}
        dataAction="start-adventure"
      >
        Begin Adventure
      </Button>
    </div>
  );
}
```

**Integration with App.jsx:**

Update App.jsx to show OnboardingScreen when party is empty:

```jsx
import OnboardingScreen from './components/OnboardingScreen';

function App() {
  const [state, dispatch] = useGameState();

  // Show onboarding if no party exists
  if (!state.party || state.party.length === 0) {
    return (
      <OnboardingScreen
        onComplete={({ party, gold }) => {
          party.forEach(hero => dispatch({ type: 'ADD_HERO', h: hero }));
          dispatch({ type: 'SET_GOLD', amount: gold });
        }}
      />
    );
  }

  // Normal app flow
  return (
    <div className="app">
      {/* ... existing app layout */}
    </div>
  );
}
```

**Features:**
- Welcome screen with clear call-to-action
- Step-by-step party creation (4 heroes)
- Name, class, and trait selection per hero
- Starting gold roll (2d6 × 5)
- Equipment purchase interface (can be simplified initially)
- Clean transition to main app

**Files to create:**
- `src/components/OnboardingScreen.jsx`

**Files to modify:**
- `src/App.jsx` (add conditional rendering)

**Success Criteria:**
- [ ] OnboardingScreen renders on first load
- [ ] Can create 4 heroes with names/classes/traits
- [ ] Starting gold is rolled and displayed
- [ ] Transition to main app works correctly
- [ ] Component is accessible (ARIA labels)

---

#### Task 3.6: Week 3 Review (1 hour)

Update CHANGELOG:

```markdown
## Week 3 - Component Decomposition (Date: YYYY-MM-DD)

### Changed
- Split ActionPane into subcomponents (~700 lines → ~250 lines)
- Extracted combat phases from Combat.jsx (~1043 lines → ~760 lines)
- Created StatCard component for reuse

### Added
- PartyTurnPhase, MonsterTurnPhase components
- AbilityButtons component
- Combat phase components (Reaction, Initiative, Victory)
- StatCard reusable component
- OnboardingScreen for first-time user experience

### Improved
- New user onboarding flow with guided party creation
- Step-by-step hero creation (name, class, trait)
- Starting gold roll and equipment setup

### Metrics
- ActionPane: 700 → 250 lines (-64%)
- Combat: 1043 → 760 lines (-27%)
- New components: 9 (including OnboardingScreen)
- Code duplication reduced: ~300 lines
- UX improvement: First load experience now has clear guidance
```

**Week 3 Completion Checklist:**
- [ ] ActionPane < 300 lines
- [ ] Combat.jsx started decomposition
- [ ] No functionality broken
- [ ] All tests passing

---

## WEEK 4: State & Utilities Refactoring
**Focus:** Split god utilities, compose reducer
**Effort:** 8-10 hours
**Risk:** Medium-High

### Day 1 (3-4 hours): Split gameActions.js

#### Task 4.1: Create Domain Action Files (3 hours)
**Priority:** 🔴 CRITICAL

**Strategy:** Split 1766-line file into 6 domain files

Create directory: `src/gameActions/`

**File 1:** `src/gameActions/monsterActions.js` (~300 lines)
```javascript
// Move all monster-related functions:
// - spawnMonster()
// - createMonster()
// - rollMonsterReaction()
// - applyMonsterAbility()

export const spawnMonster = (dispatch, type, level) => {
  // ... implementation
};
```

**File 2:** `src/gameActions/combatActions.js` (~300 lines)
```javascript
// Move all combat-related functions:
// - performAttack()
// - performDefense()
// - calculateDamage()
// - resolveCombat()

export const performAttack = (dispatch, attacker, target) => {
  // ... implementation
};
```

**File 3:** `src/gameActions/dungeonActions.js` (~400 lines)
```javascript
// Move all dungeon-related functions:
// - generateRoom()
// - rollDoor()
// - rollTrap()
// - rollSpecialFeature()

export const generateRoom = (dispatch) => {
  // ... implementation
};
```

**File 4:** `src/gameActions/treasureActions.js` (~200 lines)
```javascript
// Move all treasure-related functions:
// - rollTreasure()
// - rollGold()
// - rollEquipment()

export const rollTreasure = (dispatch) => {
  // ... implementation
};
```

**File 5:** `src/gameActions/spellActions.js` (~200 lines)
```javascript
// Move all spell-related functions:
// - castSpell()
// - performCastSpell()
// - rollSpellDamage()

export const performCastSpell = (dispatch, caster, spellKey, context) => {
  // ... implementation
};
```

**File 6:** `src/gameActions/abilityActions.js` (~200 lines)
```javascript
// Move all ability-related functions:
// - useClericHeal()
// - useBarbarianRage()
// - useHalflingLuck()

export const useClericHeal = (dispatch, clericIdx, targetIdx) => {
  // ... implementation
};
```

**File 7:** `src/gameActions/index.js`
```javascript
// Re-export all functions
export * from './monsterActions';
export * from './combatActions';
export * from './dungeonActions';
export * from './treasureActions';
export * from './spellActions';
export * from './abilityActions';
```

**Migration Strategy:**
1. Create new files one at a time
2. Copy functions to new files
3. Update imports in one component at a time
4. Test after each component
5. Delete old gameActions.js only when all imports updated

**Files to create:**
- `src/gameActions/monsterActions.js`
- `src/gameActions/combatActions.js`
- `src/gameActions/dungeonActions.js`
- `src/gameActions/treasureActions.js`
- `src/gameActions/spellActions.js`
- `src/gameActions/abilityActions.js`
- `src/gameActions/index.js`

**Files to update:** 20+ component files

**Success Criteria:**
- [ ] gameActions.js deleted
- [ ] All imports updated to new structure
- [ ] No functionality broken
- [ ] Each domain file < 400 lines

---

### Day 2 (3-4 hours): Compose Reducer

#### Task 4.2: Create Domain Reducers (3 hours)
**Priority:** 🟠 HIGH

Create directory: `src/state/reducers/`

**File 1:** `src/state/reducers/partyReducer.js` (~150 lines)
```javascript
export function partyReducer(state, action) {
  switch (action.type) {
    case 'ADD_HERO':
      if (state.party.length >= 4) return state;
      return { ...state, party: [...state.party, action.h] };

    case 'DEL_HERO':
      return {
        ...state,
        party: state.party.filter((_, i) => i !== action.i)
      };

    case 'UPD_HERO':
      return {
        ...state,
        party: state.party.map((h, i) =>
          i === action.i ? { ...h, ...action.u } : h
        )
      };

    default:
      return state;
  }
}
```

**File 2:** `src/state/reducers/combatReducer.js` (~200 lines)
```javascript
export function combatReducer(state, action) {
  switch (action.type) {
    case 'ADD_MONSTER':
      return { ...state, monsters: [...state.monsters, action.m] };

    case 'UPD_MONSTER':
      return {
        ...state,
        monsters: state.monsters.map((m, i) =>
          i === action.i ? { ...m, ...action.u } : m
        )
      };

    case 'CLEAR_MONSTERS':
      return { ...state, monsters: [] };

    default:
      return state;
  }
}
```

**File 3:** `src/state/reducers/dungeonReducer.js` (~150 lines)
Handle grid, doors, traps.

**File 4:** `src/state/reducers/inventoryReducer.js` (~100 lines)
Handle equipment, gold.

**File 5:** `src/state/reducers/logReducer.js` (~50 lines)
Handle log messages.

**File 6:** `src/state/reducers/combineReducers.js`
```javascript
export const combineReducers = (reducers) => {
  return (state = {}, action) => {
    // Try each reducer
    let nextState = state;
    for (const [key, reducer] of Object.entries(reducers)) {
      const previousStateForKey = nextState[key] || nextState;
      const nextStateForKey = reducer(previousStateForKey, action);
      if (nextStateForKey !== previousStateForKey) {
        nextState = { ...nextState, ...nextStateForKey };
      }
    }
    return nextState;
  };
};
```

**Update main reducer:**
```javascript
// src/state/reducer.js
import { combineReducers } from './reducers/combineReducers';
import { partyReducer } from './reducers/partyReducer';
import { combatReducer } from './reducers/combatReducer';
import { dungeonReducer } from './reducers/dungeonReducer';
import { inventoryReducer } from './reducers/inventoryReducer';
import { logReducer } from './reducers/logReducer';

export const reducer = combineReducers({
  party: partyReducer,
  combat: combatReducer,
  dungeon: dungeonReducer,
  inventory: inventoryReducer,
  log: logReducer
});
```

**Files to create:**
- `src/state/reducers/partyReducer.js`
- `src/state/reducers/combatReducer.js`
- `src/state/reducers/dungeonReducer.js`
- `src/state/reducers/inventoryReducer.js`
- `src/state/reducers/logReducer.js`
- `src/state/reducers/combineReducers.js`

**Files to update:**
- `src/state/reducer.js` (becomes ~50 lines)

**Success Criteria:**
- [ ] Reducer split into domain files
- [ ] Each domain reducer < 200 lines
- [ ] All actions still work
- [ ] State shape unchanged

---

### Day 3 (2 hours): Selectors & Action Creators

#### Task 4.3: Create Selector Functions (1 hour)
**Priority:** 🟡 MEDIUM

Create `src/state/selectors.js`:

```javascript
// Party selectors
export const selectParty = (state) => state.party;
export const selectActiveHeroes = (state) => state.party.filter(h => h.hp > 0);
export const selectHCL = (state) =>
  state.party.length > 0 ? Math.max(...state.party.map(h => h.lvl)) : 1;

// Combat selectors
export const selectMonsters = (state) => state.monsters || [];
export const selectActiveMonsters = (state) =>
  selectMonsters(state).filter(m =>
    m.hp > 0 && (m.count === undefined || m.count > 0)
  );
export const selectCombatWon = (state) =>
  selectMonsters(state).length > 0 && selectActiveMonsters(state).length === 0;

// Dungeon selectors
export const selectGrid = (state) => state.grid;
export const selectDoors = (state) => state.doors;

// Gold/Inventory selectors
export const selectGold = (state) => state.gold;
export const selectClues = (state) => state.clues;
```

Update 5-10 components to use selectors instead of direct state access.

---

#### Task 4.4: Create Action Creators (1 hour)
**Priority:** 🟡 MEDIUM

Create `src/actions/actionCreators.js`:

```javascript
// Party actions
export const addHero = (hero) => ({ type: 'ADD_HERO', h: hero });
export const deleteHero = (index) => ({ type: 'DEL_HERO', i: index });
export const updateHero = (index, updates) => ({ type: 'UPD_HERO', i: index, u: updates });

// Monster actions
export const addMonster = (monster) => ({ type: 'ADD_MONSTER', m: monster });
export const updateMonster = (index, updates) => ({ type: 'UPD_MONSTER', i: index, u: updates });
export const clearMonsters = () => ({ type: 'CLEAR_MONSTERS' });

// Log actions
export const logMessage = (message) => ({ type: 'LOG', t: message });

// Hero status
export const setHeroStatus = (heroIdx, statusKey, value) => ({
  type: 'SET_HERO_STATUS',
  heroIdx,
  statusKey,
  value
});
```

Update 3-5 components to use action creators.

---

#### Task 4.5: Week 4 Review (30 minutes)

Update CHANGELOG:

```markdown
## Week 4 - State & Utilities Refactoring (Date: YYYY-MM-DD)

### Changed
- Split gameActions.js into 6 domain files (1766 lines → 6 × ~250 lines)
- Composed reducer into domain reducers (688 lines → 6 × ~100 lines)
- Created selector functions for common state access patterns
- Created action creator functions for type safety

### Added
- Domain-specific action files (monsterActions, combatActions, etc.)
- Domain-specific reducers (partyReducer, combatReducer, etc.)
- Selector functions (selectors.js)
- Action creators (actionCreators.js)

### Metrics
- gameActions.js: 1766 → 0 lines (split into 6 files)
- reducer.js: 688 → 50 lines (domain reducers handle logic)
- Selectors created: 15+
- Action creators: 20+
```

**Week 4 Completion Checklist:**
- [ ] gameActions.js deleted
- [ ] Reducer composed into domains
- [ ] Selectors created
- [ ] Action creators created
- [ ] No functionality broken

---

## WEEK 5: Performance & Accessibility
**Focus:** Optimize renders, add a11y
**Effort:** 6-8 hours
**Risk:** Low

### Day 1 (3 hours): Performance Optimization

#### Task 5.1: Add React.memo to Components (1.5 hours)
**Priority:** 🟡 MEDIUM

**Target components for memoization:**

```jsx
// src/components/actionPane/EventCard.jsx
import React, { memo } from 'react';

const EventCard = memo(function EventCard({ event, index }) {
  // ... component code
});

export default EventCard;
```

**Components to memoize:**
- EventCard
- ActiveMonsters
- CombatInitiative
- HeroCard
- MonsterCard
- DoorEdge (in Dungeon.jsx)
- All combat phase components

**Files to edit:** 10-15 component files

**Success Criteria:**
- [ ] 10+ components memoized
- [ ] Re-render count reduced (check React DevTools)

---

#### Task 5.2: Add useCallback to Event Handlers (1.5 hours)
**Priority:** 🟡 MEDIUM

**Pattern:**

```jsx
// BEFORE
const handleAttack = (heroIdx) => {
  // ... logic
};

// AFTER
const handleAttack = useCallback((heroIdx) => {
  // ... logic
}, [dispatch, state.monsters]); // Dependencies
```

**Target locations:**
- ActionPane.jsx (10+ handlers)
- Combat.jsx (15+ handlers)
- Party.jsx (8+ handlers)
- Dungeon.jsx (5+ handlers)

**Files to edit:** 5-10 component files

---

### Day 2 (2-3 hours): Accessibility Implementation

#### Task 5.3: Add ARIA Labels Everywhere (2 hours)
**Priority:** 🟠 HIGH

**Comprehensive ARIA audit:**

**Interactive elements without labels:**
```jsx
// Header dice buttons
<Button onClick={...} aria-label="Roll d6">
  <Dices size={18} />
</Button>

// HP adjustment buttons
<Button
  onClick={...}
  aria-label={`Decrease ${hero.name} HP`}
  aria-describedby={`${hero.name}-hp-current`}
>
  -
</Button>

// Combat attack buttons
<Button
  onClick={...}
  aria-label={`${hero.name} attacks ${monster.name}`}
  aria-disabled={hero.hp <= 0}
>
  {hero.name}
</Button>

// Modal close buttons
<button
  onClick={onClose}
  aria-label="Close dialog"
>
  ✕
</button>
```

**Add ARIA live regions:**
```jsx
// Log component
<div
  role="log"
  aria-live="polite"
  aria-atomic="false"
>
  {state.log.map(...)}
</div>

// Combat results
<div
  role="status"
  aria-live="assertive"
  aria-atomic="true"
>
  {combatResult}
</div>
```

**Add dialog roles:**
```jsx
// All modals
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Settings</h2>
  {/* ... */}
</div>
```

**Files to edit:** 15-20 component files

**Success Criteria:**
- [ ] All interactive elements have labels
- [ ] All modals have dialog role
- [ ] Log has aria-live
- [ ] Screen reader can navigate entire app

---

#### Task 5.4: Keyboard Navigation (1 hour)
**Priority:** 🟡 MEDIUM

**Add keyboard shortcuts:**

```jsx
// src/App.jsx
useEffect(() => {
  const handleKeyboard = (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      setShowSettings(false);
      setShowRules(false);
      // ... close all modals
    }

    // Ctrl/Cmd + D for dice
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      // Focus dice roller
    }

    // Tab through combat actions
    // Space/Enter to activate
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

**Add focus management:**
```jsx
// When modal opens, focus first element
useEffect(() => {
  if (isOpen) {
    const firstInput = modalRef.current?.querySelector('input, button');
    firstInput?.focus();
  }
}, [isOpen]);
```

---

### Day 3 (2 hours): Final Performance Tweaks

#### Task 5.5: Fix Key Props (1 hour)
**Priority:** 🟡 MEDIUM

**Problem:** Using index as key

```jsx
// BEFORE - Bad
{state.log.map((entry, index) => (
  <div key={index}>...</div>
))}

// AFTER - Good (if entries have IDs)
{state.log.map((entry, index) => (
  <div key={entry.id || `log-${index}-${entry.timestamp}`}>...</div>
))}

// OR add unique IDs when logging:
dispatch({
  type: 'LOG',
  t: message,
  id: `log-${Date.now()}-${Math.random()}`
});
```

**Files to audit:** Log.jsx, ActionPane.jsx, Party.jsx

---

#### Task 5.6: Week 5 Review (1 hour)

Update CHANGELOG:

```markdown
## Week 5 - Performance & Accessibility (Date: YYYY-MM-DD)

### Added
- React.memo to 15+ components
- useCallback to 40+ event handlers
- ARIA labels to all interactive elements
- ARIA live regions for dynamic content
- Dialog roles for all modals
- Keyboard navigation (Escape, shortcuts)
- Focus management for modals

### Changed
- Fixed key props (index → unique IDs)
- Optimized re-renders in list components

### Metrics
- Components memoized: 15
- Event handlers with useCallback: 40+
- ARIA labels added: 100+
- Keyboard shortcuts: 5
```

**Week 5 Completion Checklist:**
- [ ] Performance optimizations complete
- [ ] ARIA labels everywhere
- [ ] Keyboard navigation working
- [ ] Passes accessibility audit (Lighthouse/axe)

---

## WEEK 6: Testing & Polish
**Focus:** Set up tests, documentation, final cleanup
**Effort:** 6-8 hours
**Risk:** Low

### Day 1 (3 hours): Testing Infrastructure

#### Task 6.1: Set Up Vitest (1 hour)
**Priority:** 🟡 MEDIUM

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

Create `src/test/setup.js`:

```javascript
import '@testing-library/jest-dom';
```

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

#### Task 6.2: Write Core Tests (2 hours)
**Priority:** 🟡 MEDIUM

**Test 1:** Reducer tests
```javascript
// src/state/reducers/__tests__/partyReducer.test.js
import { describe, test, expect } from 'vitest';
import { partyReducer } from '../partyReducer';

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
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
      ]
    };
    const action = { type: 'ADD_HERO', h: { id: 5 } };

    const newState = partyReducer(state, action);
    expect(newState.party).toHaveLength(4);
  });
});
```

**Test 2:** Selector tests
```javascript
// src/state/__tests__/selectors.test.js
import { describe, test, expect } from 'vitest';
import { selectActiveMonsters, selectCombatWon } from '../selectors';

describe('selectors', () => {
  test('selectActiveMonsters filters dead monsters', () => {
    const state = {
      monsters: [
        { id: 1, hp: 5 },
        { id: 2, hp: 0 },
        { id: 3, hp: 3 }
      ]
    };

    const active = selectActiveMonsters(state);
    expect(active).toHaveLength(2);
    expect(active[0].id).toBe(1);
    expect(active[1].id).toBe(3);
  });
});
```

**Test 3:** Component tests
```javascript
// src/components/ui/__tests__/Button.test.jsx
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  test('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('data-button', 'primary');
  });

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

**Files to create:**
- `vitest.config.js`
- `src/test/setup.js`
- `src/state/reducers/__tests__/partyReducer.test.js`
- `src/state/__tests__/selectors.test.js`
- `src/components/ui/__tests__/Button.test.jsx`

**Success Criteria:**
- [ ] Test infrastructure working
- [ ] 10+ tests written and passing
- [ ] Coverage report generated

---

### Day 2 (2 hours): Documentation

#### Task 6.3: Update README.md (1 hour)
**Priority:** 🟡 MEDIUM

Update `README.md`:

```markdown
# Four Against Darkness - Digital Companion

A React-based companion app for the solo tabletop RPG "Four Against Darkness".

## Features

- 🎲 Party management with 12 character classes
- 🗺️ Interactive dungeon mapping
- ⚔️ Streamlined combat system
- 📊 Campaign mode with persistence
- 🎨 3 theme options (Default, RPGUI, Doodle)
- ♿ Full accessibility support
- 📱 Mobile responsive

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Testing

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Project Structure

\`\`\`
src/
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   ├── layout/      # Layout components
│   └── ...          # Feature components
├── gameActions/      # Game logic by domain
├── state/           # State management
│   ├── reducers/    # Domain reducers
│   ├── selectors.js # State selectors
│   └── actions.js   # Action types
├── hooks/           # Custom React hooks
├── data/            # Game data & tables
├── utils/           # Utility functions
└── styles/          # Global styles & themes
\`\`\`

## Technologies

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **localStorage** - Persistence

## License

MIT

## Credits

Based on "Four Against Darkness" by Andrea Sfiligoi
```

---

#### Task 6.4: Create CONTRIBUTING.md (1 hour)
**Priority:** 🟡 MEDIUM

Create `CONTRIBUTING.md`:

```markdown
# Contributing Guide

## Development Setup

1. Clone repository
2. Run `npm install`
3. Run `npm run dev`

## Code Style

### Components
- Use functional components with hooks
- Memoize expensive components with `React.memo`
- Use `useCallback` for event handlers passed to children
- Add PropTypes or TypeScript for type safety

### Naming Conventions
- Components: PascalCase (`Button.jsx`)
- Hooks: camelCase with `use` prefix (`useCombatFlow.js`)
- Utils: camelCase (`gameActions.js`)
- Constants: UPPER_SNAKE_CASE (`COMBAT_PHASES`)

### File Organization
- Group by feature/domain when possible
- UI primitives in `components/ui/`
- Layout components in `components/layout/`
- Feature components in `components/[feature]/`

### Accessibility
- All interactive elements must have ARIA labels
- Use semantic HTML
- Test with keyboard navigation
- Run accessibility audits (Lighthouse/axe)

### Testing
- Write tests for new features
- Test reducers, selectors, and utilities at 100%
- Test components at 60%+
- Run `npm test` before committing

## Submitting Changes

1. Create feature branch from `main`
2. Make changes
3. Write/update tests
4. Run `npm test`
5. Update CHANGELOG.md
6. Submit pull request

## Component Patterns

### Button Usage
\`\`\`jsx
import { Button } from './ui/Button';

<Button
  variant="primary"
  size="md"
  dataAction="unique-id"
  onClick={handleClick}
>
  Click Me
</Button>
\`\`\`

### Card Usage
\`\`\`jsx
import { Card, HeroCard } from './ui/Card';

<HeroCard hero={hero}>
  {/* Hero content */}
</HeroCard>
\`\`\`

### Action Creators
\`\`\`jsx
import { addHero } from '../actions/actionCreators';

dispatch(addHero(newHero));
\`\`\`

### Selectors
\`\`\`jsx
import { selectActiveHeroes } from '../state/selectors';

const activeHeroes = selectActiveHeroes(state);
\`\`\`

## Questions?

Open an issue or discussion on GitHub.
```

---

### Day 3 (2 hours): Final Cleanup

#### Task 6.5: Remove Dead Code (1 hour)
**Priority:** 🟡 MEDIUM

**Actions:**
1. Search for commented code: `//` and `/* */`
2. Remove old files if any (App_ending.jsx mentioned in git status)
3. Remove unused imports (use ESLint or editor)
4. Remove console.log statements

```bash
# Find commented code
grep -r "\/\/" src/ | wc -l

# Remove old files
rm src/App_ending.jsx

# Clean up console logs (but keep console.error in catch blocks)
```

---

#### Task 6.6: Optimize Build Config (30 minutes)
**Priority:** 🟡 MEDIUM

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/4ad-tabs/',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui': [
            './src/components/ui/Button.jsx',
            './src/components/ui/Card.jsx'
          ]
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
```

---

#### Task 6.7: Final Review & CHANGELOG (30 minutes)
**Priority:** 🟠 HIGH

Update CHANGELOG:

```markdown
## Week 6 - Testing & Polish (Date: YYYY-MM-DD)

### Added
- Vitest testing infrastructure
- 20+ unit tests (reducers, selectors, components)
- CONTRIBUTING.md guide
- Updated README.md with architecture info
- Build optimizations (code splitting)

### Removed
- Dead code and commented sections
- Unused imports
- Old temporary files

### Metrics
- Test coverage: 70%+
- Build size: Optimized with code splitting
- Documentation: Complete
```

**Final Project Review:**
```markdown
## Refactoring Summary - Complete

### JavaScript Architecture: 6/10 → 9/10
- Split god components (Combat 1043→500 lines, ActionPane 700→250 lines)
- Split god utilities (gameActions 1766→6×250 lines)
- Composed reducer (688→50 lines main + domains)
- Added selectors and action creators

### CSS Architecture: 4/10 → 9/10
- Created UI component library (Button, Card)
- Added semantic data attributes everywhere
- Removed 90% of !important flags
- Consolidated themes

### Code Quality: 5/10 → 9/10
- Added error boundaries
- Fixed localStorage safety
- Added 70%+ test coverage
- Implemented full accessibility
- Performance optimizations (memo, useCallback)

### Total Effort: 46 hours over 6 weeks

### Lines of Code Impact:
- Reduced: ~1500 lines (through deduplication)
- Added: ~800 lines (tests, new components)
- Net: -700 lines with better organization

### Key Wins:
✅ No file > 500 lines
✅ All buttons/cards use components
✅ Semantic data attributes everywhere
✅ Error handling implemented
✅ Accessibility complete
✅ Testing infrastructure ready
✅ Documentation complete
```

**Week 6 Completion Checklist:**
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Dead code removed
- [ ] Build optimized
- [ ] CHANGELOG.md final update

---

## 🎯 Post-Refactoring Maintenance

### Monthly Checklist
- [ ] Review test coverage
- [ ] Update dependencies
- [ ] Check bundle size
- [ ] Run accessibility audit
- [ ] Review error logs

### Before Adding Features
- [ ] Ensure it fits current architecture
- [ ] Write tests first
- [ ] Update documentation
- [ ] Consider performance impact

### Code Review Checklist
- [ ] No files > 500 lines
- [ ] Components use UI library
- [ ] Data attributes present
- [ ] ARIA labels on interactivity
- [ ] Tests written
- [ ] CHANGELOG updated

---

## 📚 Reference Documents

Throughout this plan, refer to:
- `ARCHITECTURE_AUDIT.md` - Full architectural analysis
- `CSS_ARCHITECTURE_AUDIT.md` - CSS-specific issues
- `REFACTORING_ROADMAP.md` - Original phase-based plan
- This document - Master timeline

---

## 🚀 Getting Started

**To begin Week 1:**

1. Review this entire document
2. Understand the week-by-week flow
3. Start with Day 1, Task 1.1
4. Work through tasks in order
5. Update CHANGELOG.md as you go
6. Test after each task
7. Commit frequently with descriptive messages

**Commit Message Format:**
```
type(scope): description

Examples:
feat(ui): add Button component
fix(storage): add localStorage quota handling
refactor(combat): extract PartyTurnPhase component
test(reducer): add partyReducer tests
docs(readme): update architecture section
```

**When You Get Stuck:**
- Refer back to audit documents
- Check existing patterns in codebase
- Test in isolation
- Ask Claude for specific help

**Remember:**
- Progress > Perfection
- Test frequently
- Commit often
- One task at a time
- Take breaks!

---

## 📊 Success Metrics

At the end of 6 weeks, you should have:

### Code Quality
✅ No file > 500 lines
✅ No function > 50 lines
✅ 70%+ test coverage
✅ Zero console errors
✅ Passes accessibility audit

### Performance
✅ Initial load < 2s
✅ Component renders < 30ms
✅ localStorage saves < 500ms

### Developer Experience
✅ Find code in < 30s
✅ Add feature in < 4 hours
✅ New dev productive in < 1 day
✅ Can target any element in DevTools
✅ Can write reliable tests

### Maintainability
✅ Clear separation of concerns
✅ Consistent patterns throughout
✅ Comprehensive documentation
✅ Easy to extend with new features

---

**Good luck! 🎲⚔️🗺️**
