# Four Against Darkness - Development Guide

This is a Vite + React application for the "Four Against Darkness" solo tabletop game companion app.

## Running Locally

### Prerequisites

- **Node.js** version 18 or higher
- **npm** (comes with Node.js)

### Quick Start

1. **Install dependencies**

  ```bash
  npm install
  ```

2. **Start the development server**

  ```bash
  npm run dev
  ```

  The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

3. **Build for production** (optional)

  ```bash
  npm run build
  ```

4. **Preview production build** (optional)

  ```bash
  npm run preview
  ```

## Project Architecture

```
4ad-tabs/
├── src/
│   ├── App.jsx              # Main app shell (layout, tabs, routing)
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global styles (Tailwind)
│   │
│   ├── components/          # UI Components
│   │   ├── Dice.jsx         # Header dice roller
│   │   ├── Party.jsx        # Party management
│   │   ├── Dungeon.jsx      # Dungeon grid/mapping
│   │   ├── Combat.jsx       # Combat system
│   │   └── Log.jsx          # Adventure log
│   │
│   ├── data/                # Game data & tables
│   │   ├── classes.js       # Character class definitions
│   │   ├── monsters.js      # Monster templates & tables
│   │   ├── rooms.js         # Room generation tables
│   │   └── treasure.js      # Treasure & equipment tables
│   │
│   ├── state/               # State management
│   │   ├── initialState.js  # Full state schema (supports campaigns)
│   │   ├── reducer.js       # Main reducer with all actions
│   │   └── actions.js       # Action type constants
│   │
│   ├── utils/               # Utility functions
│   │   ├── dice.js          # Dice rolling utilities
│   │   └── gameActions.js   # Shared game logic (spawn, treasure, combat)
│   │
│   └── hooks/               # Custom React hooks
│       └── useGameState.js  # State + localStorage persistence
```

## State Architecture

The app uses React's `useReducer` with localStorage persistence. The state schema supports both single adventures and campaign mode:

### Adventure Mode (default)

- Party, gold, clues reset per adventure
- Dungeon grid, monsters, encounter counters

### Campaign Mode (Phase 6)

- Party, gold, clues, equipment carry over between dungeons
- Adventure history tracking
- Stats persist across adventures

### Key State Properties

```javascript
{
  mode: 'adventure' | 'campaign',
  party: [],           // Array of hero objects
  gold: 0,             // Currency
  clues: 0,            // Clue count
  hcl: 1,              // Highest Character Level
  monsters: [],        // Active encounter
  grid: [...],         // Dungeon map (20x28)
  doors: [],           // Door positions
  abilities: {},       // Per-hero ability tracking
  log: [],             // Adventure log
  // Campaign-specific
  campaign: { ... },   // Campaign metadata & history
  adventure: { ... }   // Current adventure metadata
}
```

## Adding New Features

### Adding a new action:

1. Add constant to `src/state/actions.js`
2. Add case to `src/state/reducer.js`
3. Dispatch from components

### Adding new game data:

1. Add to appropriate file in `src/data/`
2. Import where needed

### Adding shared game logic:

1. Add to `src/utils/gameActions.js`
2. Import and use in components

## Implemented Phases

- ✅ Phase 1: Core Mechanics (party, mapping, combat, dice)
- ✅ Phase 2: Essential Game Rules (monsters, rooms, treasure, abilities)
- ✅ Phase 3: Complete Exploration (doors, traps, special rooms) - 95% complete
- ✅ Phase 4: Advanced Combat (spells, special actions) - 85% complete
- ✅ Phase 5: Polish (save slots, export, rules reference) - 95% complete
- ✅ Phase 6: Campaign Mode (persistence between adventures) - 85% complete

## Recent Improvements (Current Session)

### Completed TODOs
1. **Hero Selection for Clue Discovery** - Added modal for selecting which hero finds a clue during search
2. **Rogue Disarm Trap Flow** - Implemented automatic rogue disarm attempts with success/failure handling
3. **Cleric Banish Ghost** - Added cleric ghost banishment mechanic with level-based DC
4. **Party-Wide Damage** - Implemented damage application to all party members (ghosts, failed banish)
5. **Environment System** - Hooked up secret passages to change dungeon environments (dungeon/fungal_grottoes/caverns)

### Remaining Improvements
- Temporary bonus tracking for armory (weapon/shield +1 bonuses)
- Enhanced campaign stats dashboard
- Adventure history visualization in Campaign Manager

## Technologies

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **localStorage** - State persistence
