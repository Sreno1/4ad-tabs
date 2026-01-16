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


- figure out what info needs to go where, ie party should show equiped weappons?

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
