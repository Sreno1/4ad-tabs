---
title: Create Domain Action Files
status: open
priority: 1
issue-type: task
assignee: 
created-at: 2026-01-15T00:00:00Z
blocks: []
---

Split `gameActions.js` (1766 lines) into 6 domain files in `src/gameActions/`:

- `monsterActions.js`: spawnMonster, createMonster, rollMonsterReaction, applyMonsterAbility
- `combatActions.js`: all combat-related functions
- (Continue for other domains as per plan)

**Success Criteria:**  
- [ ] Each domain file created and imported where needed  
- [ ] No functionality broken  
- [ ] Codebase easier to maintain
