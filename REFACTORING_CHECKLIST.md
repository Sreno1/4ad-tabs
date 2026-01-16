# 📋 Refactoring Checklist - Quick Reference

Use this checklist to track your progress week-by-week. Check off tasks as you complete them.

---

## WEEK 1: Foundation & Critical Fixes ⏱️ 8-10 hours

### Day 1: Critical Fixes (2-3 hours)
- [ ] Task 1.1: Update .gitignore (30 min)
  - [ ] Add tmpclaude-* pattern
  - [ ] Add editor files
  - [ ] Remove temp files from repo
  - [ ] Commit changes

- [ ] Task 1.2: Error Boundary (1 hour)
  - [ ] Create ErrorBoundary.jsx
  - [ ] Update main.jsx to use boundary
  - [ ] Test error catching

- [ ] Task 1.3: localStorage Safety (1 hour)
  - [ ] Add state validation
  - [ ] Add quota error handling
  - [ ] Add debounce to saves
  - [ ] Test with corrupted data

### Day 2: UI Components (3-4 hours)
- [ ] Task 1.4: Review Button & Card (1 hour)
  - [ ] Test Button variants
  - [ ] Test Card variants
  - [ ] Verify data attributes
  - [ ] Check in all themes

- [ ] Task 1.5: Migrate Dice.jsx (2 hours)
  - [ ] Use Button component
  - [ ] Add ARIA labels
  - [ ] Add data attributes
  - [ ] Test functionality

- [ ] Task 1.6: Deduplicate Dungeon Doors (2-3 hours)
  - [ ] Create DoorEdge component
  - [ ] Replace 90 lines with component
  - [ ] Add ARIA labels
  - [ ] Test door placement

### Day 3: Metadata & Review (3 hours)
- [ ] Task 1.7: Migrate MobileNavigation (30 min)
  - [ ] Add ARIA labels
  - [ ] Add aria-current

- [ ] Task 1.8: Update package.json (30 min)
  - [ ] Add description, author, license
  - [ ] Add repository URL
  - [ ] Add keywords

- [ ] Task 1.9: Create .env.example (15 min)
  - [ ] Document env variables

- [ ] Task 1.10: Week 1 Review (1 hour)
  - [ ] Create/update CHANGELOG.md
  - [ ] Test all changes
  - [ ] Commit with descriptive message

**Week 1 Complete:** ☐

---

## WEEK 2: CSS Architecture ⏱️ 8-10 hours

### Day 1: Button Migration (3-4 hours)
- [ ] Task 2.1: ActionPane Buttons (1.5 hours)
  - [ ] Import Button component
  - [ ] Replace ~30 button instances
  - [ ] Add data attributes
  - [ ] Test all buttons work

- [ ] Task 2.2: Combat.jsx Buttons (2 hours)
  - [ ] Import Button component
  - [ ] Replace ~40 button instances
  - [ ] Verify combat flow unchanged
  - [ ] Test in all themes

- [ ] Task 2.3: Party.jsx Buttons (1 hour)
  - [ ] Replace ~15 button instances
  - [ ] Test HP adjustments
  - [ ] Test hero creation

### Day 2: Card Migration (3-4 hours)
- [ ] Task 2.4: Migrate Cards (1.5 hours)
  - [ ] Party.jsx hero cards
  - [ ] Combat.jsx monster cards
  - [ ] ActionPane.jsx event cards
  - [ ] Test styling preserved

- [ ] Task 2.5: Add Data Attributes (1.5 hours)
  - [ ] Dungeon grid attributes
  - [ ] Combat phase attributes
  - [ ] Log entry attributes
  - [ ] Modal attributes
  - [ ] Test in DevTools

### Day 3: Theme Refactoring (2-3 hours)
- [ ] Task 2.6: Update Theme Files (2 hours)
  - [ ] rpgui-overrides.css
  - [ ] doodle-overrides.css
  - [ ] roguelike-crt.css
  - [ ] Target [data-button], [data-card]
  - [ ] Remove !important flags
  - [ ] Test all themes

- [ ] Task 2.7: Week 2 Review (1 hour)
  - [ ] Update CHANGELOG.md
  - [ ] Test all migrations
  - [ ] Check theme switching

**Week 2 Complete:** ☐

---

## WEEK 3: Component Decomposition ⏱️ 8-10 hours

### Day 1: ActionPane Split (3-4 hours)
- [ ] Task 3.1: Extract Combat Phases (2 hours)
  - [ ] Create PartyTurnPhase.jsx
  - [ ] Create MonsterTurnPhase.jsx
  - [ ] Update ActionPane to use them
  - [ ] Test combat flow

- [ ] Task 3.2: Extract Abilities (1.5 hours)
  - [ ] Create AbilityButtons.jsx
  - [ ] Move ability logic
  - [ ] Move spell/heal/bless popups
  - [ ] Test all abilities

### Day 2: Combat Split (3-4 hours)
- [ ] Task 3.3: Extract Combat Phases (3 hours)
  - [ ] Create phases/ directory
  - [ ] Create ReactionPhase.jsx
  - [ ] Create InitiativePhase.jsx
  - [ ] Create VictoryPhase.jsx
  - [ ] Update Combat.jsx
  - [ ] Test phases

### Day 3: Deduplication & Campaign System (3-5 hours)
- [ ] Task 3.4: StatCard Component (1.5 hours)
  - [ ] Create StatCard.jsx
  - [ ] Use in Party, Combat, Analytics
  - [ ] Test rendering

- [x] Task 3.5: Campaign Manager System (3-4 hours) ✅ COMPLETE
  - [x] Create src/utils/campaignStorage.js utility functions
    - [x] getAllCampaigns()
    - [x] loadCampaign()
    - [x] saveCampaign()
    - [x] createCampaign()
    - [x] deleteCampaign()
    - [x] getActiveCampaignId()
    - [x] exportCampaign()
    - [x] importCampaign()
    - [x] rollGold() for per-class gold rolling
  - [x] Add startingWealth to src/data/classes.js for all classes
  - [x] Create CampaignManager.jsx component
    - [x] Show 3 save slots
    - [x] Display campaign names and hero names
    - [x] Show rooms explored and gold stats
    - [x] Load/Delete/Export buttons
    - [x] Import functionality
  - [x] Create OnboardingScreen.jsx component
    - [x] Campaign naming step
    - [x] Welcome step
    - [x] Party creation step (4 heroes)
    - [x] Per-hero name, class, trait selection
    - [x] Per-class gold rolling
    - [x] Gold pooling confirmation step
    - [x] Ready to explore step
  - [x] Update src/hooks/useGameState.js for multi-campaign support
    - [x] Load active campaign on init
    - [x] Save after each state change
    - [x] Return campaign controls in third element
  - [x] Update src/App.jsx with campaign manager flow
    - [x] Show CampaignManager when no active campaign
    - [x] Show OnboardingScreen when creating new campaign
    - [x] Show main app when campaign loaded
  - [x] Update src/components/layout/AppHeader.jsx
    - [x] Add "Back to Campaigns" button
    - [x] Display current campaign name
  - [x] Test campaign creation end-to-end
  - [x] Test campaign switching
  - [x] Test export/import
  - [x] Test per-class gold rolling
  - [x] Test campaign list display
  - [x] Add ARIA labels for accessibility

- [ ] Task 3.6: Week 3 Review (1 hour)
  - [ ] Update CHANGELOG.md
  - [ ] Verify line count reductions
  - [ ] Test all functionality

**Week 3 Complete:** ☐

---

## WEEK 4: State & Utilities ⏱️ 8-10 hours

### Day 1: Split gameActions (3-4 hours)
- [x] Task 4.1: Create Domain Files (3 hours) ✅ COMPLETE
  - [x] Create gameActions/ directory
  - [x] Create monsterActions.js
  - [x] Create combatActions.js
  - [x] Create dungeonActions.js
  - [x] Create treasureActions.js
  - [x] Create spellActions.js
  - [x] Create abilityActions.js
  - [x] Create index.js
  - [x] Update imports in all components
  - [x] Delete old gameActions.js
  - [x] Test all game actions

### Day 2: Compose Reducer (3-4 hours)
- [x] Task 4.2: Domain Reducers (3 hours) ✅ COMPLETE
  - [x] Create reducers/ directory
  - [x] Create partyReducer.js
  - [x] Create combatReducer.js
  - [x] Create dungeonReducer.js
  - [x] Create inventoryReducer.js
  - [x] Create logReducer.js
  - [x] Create campaignReducer.js
  - [x] Create combineReducers.js
  - [x] Create index.js
  - [x] Update main reducer.js
  - [x] Test all actions still work (build passes)

### Day 3: Selectors & Creators (2 hours)
- [ ] Task 4.3: Selectors (1 hour)
  - [ ] Create selectors.js
  - [ ] Add 15+ selector functions
  - [ ] Update 5-10 components to use

- [ ] Task 4.4: Action Creators (1 hour)
  - [ ] Create actionCreators.js
  - [ ] Add 20+ creator functions
  - [ ] Update 3-5 components to use

**Week 4 Complete:** ☐

---

## WEEK 5: Performance & A11y ⏱️ 6-8 hours

### Day 1: Performance (3 hours)
- [x] Task 5.1: React.memo (1.5 hours) ✅ COMPLETE
  - [x] Memo EventCard
  - [x] Memo ActiveMonsters
  - [x] Memo CombatInitiative
  - [x] Memo HeroCard, MonsterCard
  - [x] Memo DoorEdge
  - [x] Memo all combat phases (PartyTurnPhase, MonsterTurnPhase, InitiativePhase, VictoryPhase)
  - [x] Memo bonus components (AbilityButtons, MonsterReaction)
  - [ ] Check re-render count in DevTools

- [x] Task 5.2: useCallback (1.5 hours) ✅ COMPLETE
  - [x] ActionPane handlers (handleCastSpell)
  - [x] Combat.jsx handlers (15+ handlers wrapped)
  - [x] Party.jsx handlers (addHeroToParty, adjustLevel, handleLevelUp, adjustHP, toggleAbility)
  - [x] Dungeon.jsx handlers (handleCellClick, handleCellRightClick, handleDoorClick, hasDoor, marker handlers)
  - [x] Build passes successfully
  - [ ] Test performance improvement

### Day 2: Accessibility (2-3 hours)
- [ ] Task 5.3: ARIA Labels (2 hours)
  - [ ] All buttons have labels
  - [ ] HP adjustment buttons
  - [ ] Combat attack buttons
  - [ ] Modal close buttons
  - [ ] Add aria-live to Log
  - [ ] Add aria-live to combat results
  - [ ] Add role="dialog" to modals
  - [ ] Test with screen reader

- [ ] Task 5.4: Keyboard Navigation (1 hour)
  - [ ] Escape closes modals
  - [ ] Add keyboard shortcuts
  - [ ] Focus management in modals
  - [ ] Tab through interactive elements
  - [ ] Test keyboard-only navigation

### Day 3: Final Performance (2 hours)
- [ ] Task 5.5: Fix Keys (1 hour)
  - [ ] Log entries use unique IDs
  - [ ] Event cards use unique IDs
  - [ ] Party map uses hero IDs
  - [ ] Test list rendering

- [ ] Task 5.6: Week 5 Review (1 hour)
  - [ ] Update CHANGELOG.md
  - [ ] Run Lighthouse audit
  - [ ] Check accessibility score
  - [ ] Verify performance metrics

**Week 5 Complete:** ☐

---

## WEEK 6: Testing & Polish ⏱️ 6-8 hours

### Day 1: Testing Setup (3 hours)
- [ ] Task 6.1: Set Up Vitest (1 hour)
  - [ ] Install dependencies
  - [ ] Create vitest.config.js
  - [ ] Create test/setup.js
  - [ ] Update package.json scripts
  - [ ] Run test command

- [ ] Task 6.2: Write Tests (2 hours)
  - [ ] Test partyReducer
  - [ ] Test combatReducer
  - [ ] Test selectors
  - [ ] Test Button component
  - [ ] Test Card component
  - [ ] Run coverage report
  - [ ] Aim for 70%+ coverage

### Day 2: Documentation (2 hours)
- [ ] Task 6.3: Update README (1 hour)
  - [ ] Add feature list
  - [ ] Update quick start
  - [ ] Add architecture section
  - [ ] Add project structure
  - [ ] Add tech stack

- [ ] Task 6.4: Create CONTRIBUTING (1 hour)
  - [ ] Add development setup
  - [ ] Add code style guide
  - [ ] Add component patterns
  - [ ] Add testing guidelines
  - [ ] Add PR process

### Day 3: Final Cleanup (2 hours)
- [ ] Task 6.5: Remove Dead Code (1 hour)
  - [ ] Search for commented code
  - [ ] Remove App_ending.jsx
  - [ ] Remove unused imports
  - [ ] Clean console.logs

- [ ] Task 6.6: Optimize Build (30 min)
  - [ ] Update vite.config.js
  - [ ] Add code splitting
  - [ ] Enable sourcemaps
  - [ ] Test build output

- [ ] Task 6.7: Final Review (30 min)
  - [ ] Update CHANGELOG.md final entry
  - [ ] Run all tests
  - [ ] Build production
  - [ ] Test production build
  - [ ] Create final commit

**Week 6 Complete:** ☐

---

## 🎉 REFACTORING COMPLETE!

### Final Verification
- [ ] All tests passing
- [ ] Coverage > 70%
- [ ] No files > 500 lines
- [ ] Lighthouse score > 90
- [ ] Accessibility audit passed
- [ ] Build successful
- [ ] All features working

### Post-Refactoring
- [ ] Deploy new version
- [ ] Update any external docs
- [ ] Celebrate! 🎊

---

## 📊 Metrics Comparison

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Largest file** | 1766 lines | 500 lines | 72% ↓ |
| **ActionPane** | 700 lines | 250 lines | 64% ↓ |
| **Combat.jsx** | 1043 lines | 500 lines | 52% ↓ |
| **Test coverage** | 0% | 70%+ | ∞ ↑ |
| **!important flags** | 150+ | 15 | 90% ↓ |
| **Accessibility** | 2/10 | 9/10 | 350% ↑ |
| **Architecture** | 5/10 | 9/10 | 80% ↑ |

---

## 💡 Tips for Success

1. **One task at a time** - Don't skip ahead
2. **Test frequently** - After each task
3. **Commit often** - Use descriptive messages
4. **Take breaks** - This is 6 weeks of work
5. **Ask for help** - Use Claude when stuck
6. **Stay organized** - Keep CHANGELOG updated
7. **Celebrate wins** - Mark completed weeks ✅

---

## 🆘 When You Get Stuck

1. Re-read the task in MASTER_REFACTORING_PLAN.md
2. Check relevant audit documents
3. Look at existing patterns in codebase
4. Test the specific piece in isolation
5. Ask Claude with specific context
6. Take a break and come back fresh

**Remember:** This is a marathon, not a sprint. Quality > speed.

Good luck! 🚀
