---
title: Extract Combat Phases from Combat.jsx
status: open
priority: 1
issue-type: task
assignee: 
created-at: 2026-01-15T00:00:00Z
blocks: []
---

**Strategy:** Don't try to refactor all 1043 lines at once. Start with phases.

- Create directory: `src/components/combat/phases/`
- Extract reaction rolling logic to `ReactionPhase.jsx` (~100 lines)
- Extract initiative selection logic to `InitiativePhase.jsx` (~80 lines)
- Extract victory/treasure logic to `VictoryPhase.jsx` (~100 lines)
- Update `Combat.jsx` to import and use these phase components
- Create `src/components/combat/phases/index.js` for exports

**Target:** Combat.jsx should be ~760 lines  
**Success Criteria:**  
- [ ] Combat phases in separate files  
- [ ] Combat.jsx reduced by ~280 lines  
- [ ] No functionality broken
