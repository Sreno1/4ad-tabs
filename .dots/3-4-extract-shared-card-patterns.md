---
title: Extract Shared Card Patterns
status: active
priority: 2
issue-type: task
created-at: "2026-01-15T00:00:00Z"
blocks:
  - 3-3-extract-combat-phases-combatx
---

Create `src/components/ui/StatCard.jsx` for reusable stat display cards.

- Use in Party, Combat, Analytics components
- Refactor to use variants for different card types (default, highlight, danger)
- Remove duplicate card code from other components

**Success Criteria:**  
- [ ] StatCard used in all relevant components  
- [ ] Code duplication reduced
