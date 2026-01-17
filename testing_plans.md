# Testing & Debug/Dev Tools Implementation Plan

## Overview
This document outlines a step-by-step plan for implementing meaningful testing and debug/dev tools for the 4AD-Tabs companion app. The plan prioritizes practical tools that improve development velocity and game mechanics validation.

---

## Phase 1: Testing Infrastructure Setup (Foundation)

### 1.1 Unit Testing Framework
**Goal:** Set up Jest + React Testing Library for component and utility testing

**Steps:**
1. Install dependencies: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom @babel/preset-react`
2. Create `jest.config.js` configuration
3. Add test scripts to `package.json`:
   - `npm test` - run tests in watch mode
   - `npm test:coverage` - generate coverage reports
4. Create `.babelrc` for JSX/ES6 support in tests
5. Add GitHub Actions workflow for CI/CD testing

**Files to create:**
- `jest.config.js`
- `.babelrc`

**Success criteria:**
- Tests can be run with `npm test`
- Coverage reports generate successfully

---

## Phase 2: Utility & Game Logic Testing

### 2.1 Dice Utility Tests
**Goal:** Validate dice rolling logic with high confidence

**Test coverage:**
- `src/utils/dice.js` - all rolling functions
  - Single die rolls (d4, d6, d8, d10, d12, d20)
  - Multiple dice rolls (e.g., 2d6)
  - Dice pool mechanics
  - Expected value validation

**Steps:**
1. Create `src/utils/__tests__/dice.test.js`
2. Write tests for each dice function
3. Add edge case tests (0 dice, negative modifiers, etc.)
4. Run tests to establish baseline

**Files to create:**
- `src/utils/__tests__/dice.test.js`

**Success criteria:**
- All dice functions have >95% test coverage
- Tests validate correct probabilities

### 2.2 Game Action Utility Tests
**Goal:** Validate core game mechanics (spawn, treasure, combat)

**Test coverage:**
- `src/utils/gameActions/combatActions.js` - damage, hit mechanics
- `src/utils/gameActions/treasureActions.js` - loot distribution
- `src/utils/gameActions/dungeonActions.js` - room/door generation
- `src/utils/gameActions/monsterActions.js` - monster spawning

**Steps:**
1. Create test files for each game action utility
2. Write tests for deterministic functions
3. Test edge cases and rule validation
4. Validate stat changes and state mutations

**Files to create:**
- `src/utils/gameActions/__tests__/combatActions.test.js`
- `src/utils/gameActions/__tests__/treasureActions.test.js`
- `src/utils/gameActions/__tests__/dungeonActions.test.js`
- `src/utils/gameActions/__tests__/monsterActions.test.js`

**Success criteria:**
- Game logic functions have >90% test coverage
- All combat/treasure calculations validated

---

## Phase 3: State Management Testing

### 3.1 Reducer Tests
**Goal:** Validate all Redux-like reducer logic

**Test coverage:**
- `src/state/reducers/combatReducer.js`
- `src/state/reducers/partyReducer.js`
- `src/state/reducers/campaignReducer.js`

**Steps:**
1. Create test files for each reducer
2. Test each action type with various payloads
3. Validate state immutability
4. Test action sequence scenarios (e.g., combat flow)
5. Test error cases and invalid inputs

**Files to create:**
- `src/state/reducers/__tests__/combatReducer.test.js`
- `src/state/reducers/__tests__/partyReducer.test.js`
- `src/state/reducers/__tests__/campaignReducer.test.js`

**Success criteria:**
- All reducer actions have tests
- State mutations are properly validated
- Action sequences work as expected

### 3.2 Integration Tests
**Goal:** Validate multi-step game flows

**Test scenarios:**
1. Full encounter flow (spawn → combat → loot)
2. Campaign progression (adventure → results → new adventure)
3. Hero level-up and equipment management
4. Party death and revival mechanics
5. Special room and trap interactions

**Steps:**
1. Create `src/__tests__/integration/` directory
2. Write scenario-based tests using reducer dispatch
3. Validate state changes across multiple actions
4. Test edge cases (party death, TPK, etc.)

**Files to create:**
- `src/__tests__/integration/encounterFlow.test.js`
- `src/__tests__/integration/campaignFlow.test.js`
- `src/__tests__/integration/specialRoomFlow.test.js`

**Success criteria:**
- Major game flows are tested end-to-end
- Edge cases and error conditions handled

---

## Phase 4: Component Testing (Selective)

### 4.1 Critical Component Tests
**Goal:** Test complex interactive components

**Components to test:**
- `Combat.jsx` - battle mechanics UI
- `Party.jsx` - party management interactions
- `Dungeon.jsx` - grid interaction and placement
- `Equipment.jsx` - item selection and management

**Steps:**
1. Create test files for critical components
2. Mock state and dispatch functions
3. Test user interactions (clicks, selections)
4. Validate rendered output matches state
5. Test error states and edge cases

**Files to create:**
- `src/components/__tests__/Combat.test.jsx`
- `src/components/__tests__/Party.test.jsx`
- `src/components/__tests__/Dungeon.test.jsx`
- `src/components/__tests__/Equipment.test.jsx`

**Success criteria:**
- Critical user flows are testable
- Component state changes validated

---

## Phase 5: Debug Tools Development

### 5.1 State Inspector Tool
**Goal:** Visualize and inspect application state in real-time

**Features:**
1. **Redux DevTools Integration**
   - Install `redux-devtools-extension`
   - Hook into reducer dispatch
   - Enable time-travel debugging

2. **Custom State Inspector Component**
   - Keyboard shortcut to toggle (e.g., `Ctrl+Shift+I`)
   - JSON viewer with collapsible sections
   - Search/filter state properties
   - Copy state to clipboard
   - Load state from clipboard

**Steps:**
1. Install redux-devtools-extension
2. Integrate into state management
3. Create `src/components/dev/StateInspector.jsx`
4. Add keyboard event listener in `App.jsx`
5. Style with Tailwind for dev panel

**Files to create/modify:**
- `src/components/dev/StateInspector.jsx` (new)
- `src/state/reducer.js` (modify to add devtools)
- `src/App.jsx` (add keyboard handler)

**Success criteria:**
- State inspector toggles with keyboard shortcut
- State changes visible in real-time
- Can export/import state for testing

### 5.2 Game Mechanics Debugger
**Goal:** Validate and test game mechanics in isolation

**Features:**
1. **Dice Roll Tester**
   - Input field for dice expressions (e.g., "2d6+3")
   - Roll counter with distribution graph
   - Probability calculator

2. **Monster Spawner**
   - Quick spawn any monster type
   - Set level and traits
   - Validate stat calculations

3. **Encounter Simulator**
   - Auto-resolve combats N times
   - Track win/loss rates
   - Identify balance issues

4. **State Mutator**
   - Manually set party stats (health, level, etc.)
   - Add/remove equipment
   - Adjust gold and clues

**Steps:**
1. Create `src/components/dev/MechanicsDebugger.jsx`
2. Implement dice roll tester with Chart.js
3. Implement monster spawner with quick presets
4. Add encounter simulator with batch testing
5. Create state mutation shortcuts
6. Add toggle button to app header

**Files to create/modify:**
- `src/components/dev/MechanicsDebugger.jsx` (new)
- `npm install chart.js react-chartjs-2` (new dependency)
- `src/App.jsx` (add dev tools button)

**Success criteria:**
- Can quickly test game mechanics
- Dice probabilities visible and validated
- Balance issues identifiable through simulation

### 5.3 Performance Profiler
**Goal:** Identify performance bottlenecks

**Features:**
1. **Render Time Tracking**
   - Log component render times
   - Identify slow re-renders
   - Track renders per action

2. **Memory Usage Monitor**
   - Display current memory usage
   - Alert on memory spikes
   - Track localStorage usage

3. **Action Performance**
   - Log dispatch time per action
   - Identify slow reducers
   - Visualize action frequency

**Steps:**
1. Create `src/components/dev/PerformanceProfiler.jsx`
2. Add performance measurement hooks
3. Create `src/hooks/usePerformanceTracking.js`
4. Integrate into reducer (performance middleware)
5. Add visualization component

**Files to create/modify:**
- `src/components/dev/PerformanceProfiler.jsx` (new)
- `src/hooks/usePerformanceTracking.js` (new)
- `src/state/performanceMiddleware.js` (new)
- `src/App.jsx` (add profiler access)

**Success criteria:**
- Can identify slow components
- Performance metrics visible during development
- Memory leaks detectable

---

## Phase 6: Development Utilities

### 6.1 Quick Test Data Generator
**Goal:** Generate consistent test scenarios for manual testing

**Features:**
1. **Party Presets**
   - Balanced party (all level 1)
   - High-level party (level 5+)
   - Mixed difficulty parties

2. **Scenario Presets**
   - Fresh adventure start
   - Mid-dungeon with enemies
   - Boss encounter setup
   - Campaign with history

3. **Quick Actions**
   - Reset all state
   - Generate random seed
   - Export current state as preset

**Steps:**
1. Create `src/utils/devData.js` with preset generators
2. Add presets to `MechanicsDebugger.jsx`
3. Add quick action buttons
4. Store favorite presets in localStorage

**Files to create/modify:**
- `src/utils/devData.js` (new)
- `src/components/dev/MechanicsDebugger.jsx` (add preset buttons)

**Success criteria:**
- Can quickly load test scenarios
- Consistent data for manual testing
- Presets shareable between developers

### 6.2 Console Logging Utilities
**Goal:** Structured, filtered logging for development

**Features:**
1. **Log Levels** - debug, info, warn, error
2. **Categories** - combat, party, dungeon, campaign, ui
3. **Filtering** - show/hide by category or level
4. **Time Tracking** - timestamp and duration between logs
5. **State Snapshots** - capture state at log point

**Steps:**
1. Create `src/utils/logger.js`
2. Add environment-aware logging (dev vs production)
3. Create filter UI in StateInspector
4. Add localStorage toggle for log persistence
5. Add grouping by category in console

**Files to create:**
- `src/utils/logger.js` (new)

**Success criteria:**
- Structured logs in browser console
- Can filter logs by category
- Timestamps and state snapshots included

### 6.3 Dev Tool Panel
**Goal:** Central hub for all development tools

**Features:**
1. **Collapsible Panel** (bottom or side)
2. **Tabs for different tools:**
   - State Inspector
   - Mechanics Debugger
   - Performance Profiler
   - Console Logs
3. **Settings**
   - Toggle dev mode on/off
   - Enable/disable performance tracking
   - Set log levels
4. **Keyboard Shortcuts Cheat Sheet**

**Steps:**
1. Create `src/components/dev/DevToolPanel.jsx`
2. Integrate all debug tools as tabs
3. Add panel toggle keyboard shortcut (e.g., `Ctrl+Shift+D`)
4. Style with Tailwind, minimize by default
5. Add help documentation

**Files to create/modify:**
- `src/components/dev/DevToolPanel.jsx` (new)
- `src/App.jsx` (add panel + keyboard handler)

**Success criteria:**
- All dev tools accessible in one place
- Can toggle with keyboard shortcut
- Non-intrusive when minimized

---

## Phase 7: Integration & Documentation

### 7.1 Test Coverage Baseline
**Goal:** Establish and maintain minimum coverage standards

**Steps:**
1. Generate initial coverage report: `npm test:coverage`
2. Document coverage targets by category:
   - Utilities: >95%
   - Reducers: >90%
   - Game Logic: >90%
   - Components: >75% (focus on critical)
3. Add pre-commit hook to check coverage
4. Update CI/CD to fail on coverage drop

**Files to create:**
- `.nycrc` (nyc coverage config)
- Pre-commit hook script

### 7.2 Development Guide
**Goal:** Document how to use testing and debug tools

**Content:**
1. **Testing Guide**
   - How to run tests
   - How to write new tests
   - Testing patterns and examples

2. **Debug Tools Guide**
   - Keyboard shortcuts
   - How to use each tool
   - Common debugging scenarios

3. **Performance Tips**
   - How to interpret performance metrics
   - Common bottlenecks
   - Optimization strategies

**Files to create:**
- `TESTING_GUIDE.md`
- `DEBUG_TOOLS_GUIDE.md`

---

## Implementation Priority

### Must-Have (Weeks 1-2)
1. ✅ Jest + RTL setup
2. ✅ Dice utility tests
3. ✅ State Inspector debug tool
4. ✅ Reducer tests
5. ✅ Game logic tests

### Should-Have (Weeks 3-4)
1. ✅ Mechanics Debugger
2. ✅ Performance Profiler
3. ✅ Component tests (critical)
4. ✅ Dev Tool Panel

### Nice-to-Have (Week 5+)
1. ✅ Test data generator
2. ✅ Console logging utilities
3. ✅ E2E tests (Cypress/Playwright)
4. ✅ Enhanced CI/CD integration

---

## Success Metrics

1. **Code Coverage:**
   - Utilities: >95%
   - Game Logic: >90%
   - Reducers: >90%
   - Overall: >80%

2. **Development Velocity:**
   - Faster bug identification
   - Reduced debugging time
   - Quicker feature validation

3. **Quality Improvements:**
   - Fewer production bugs
   - Better confidence in refactoring
   - More maintainable code

4. **Developer Experience:**
   - Easy to onboard new developers
   - Clear testing patterns
   - Comprehensive debug tools

---

## Tools & Dependencies to Add

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "redux-devtools-extension": "^2.13.0",
    "chart.js": "^4.0.0",
    "react-chartjs-2": "^5.0.0",
    "@babel/preset-react": "^7.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0"
  }
}
```

---

## Next Steps

1. **Start with Phase 1:** Set up Jest and testing infrastructure
2. **Move to Phase 2:** Write tests for utilities (highest value)
3. **Add Phase 5.1:** State Inspector for immediate dev benefit
4. **Iterate:** Add tools and tests as you develop
5. **Maintain:** Keep test coverage high with each new feature

---

## Notes

- Keep tests focused on behavior, not implementation details
- Use realistic test data (not just edge cases)
- Debug tools should not impact production bundle (dev-only)
- Document common testing patterns for consistency
- Review and refine testing strategy monthly
