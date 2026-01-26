/**
 * Dungeon Reducer - Handles dungeon grid, doors, traps, and special rooms
 */
import * as A from '../actions.js';
import { STYLE_ORDER } from '../../utils/tileStyles.js';

/**
 * Dungeon reducer - handles all dungeon-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function dungeonReducer(state, action) {
  switch (action.type) {
    // ========== Dungeon Grid ==========
    case A.TOGGLE_CELL: {
      // New behavior: clicking toggles the logical cell between 0 (empty) and 1 (room full).
      // Visual variants (diag1, diag2, round1, round2) are stored in cellStyles and cycled
      // independently. We implement a cycle order for styles when toggling a filled cell.
      const key = `${action.x},${action.y}`;
      const current = (state.grid[action.y] && state.grid[action.y][action.x]) || 0;
      const nextGrid = state.grid.map((row, y) => row.map((cell, x) => (x === action.x && y === action.y) ? (current === 0 ? 1 : 0) : cell));
      // Update styles: if we just turned a cell on (0 -> 1), set style to 'full' if none exists.
      const styles = { ...(state.cellStyles || {}) };
      if (current === 0) {
        // turning on
        if (!styles[key]) styles[key] = 'full';
      } else {
        // turning off: remove any style for this cell
        if (styles[key]) delete styles[key];
      }
      return { ...state, grid: nextGrid, cellStyles: styles };
    }

    case A.SET_CELL: {
      const newGrid = state.grid.map((row, y) =>
        row.map((cell, x) =>
          (x === action.x && y === action.y) ? action.value : cell
        )
      );
      // If setting to empty, clear any style for this cell. If setting to 1 and no style exists, set 'full'.
      const key = `${action.x},${action.y}`;
      const styles = { ...(state.cellStyles || {}) };
      if (action.value === 0) {
        if (styles[key]) delete styles[key];
      } else if (action.value === 1) {
        // If an explicit style was provided with the action, use it (used when placing templates).
        // Otherwise default to 'full' to ensure a fresh fill doesn't inherit previous variants.
        if (action.style && typeof action.style === 'string') styles[key] = action.style;
        else styles[key] = 'full';
      }
      return { ...state, grid: newGrid, cellStyles: styles };
    }

    case A.CLEAR_GRID:
      return {
    ...state,
    grid: Array(28).fill(null).map(() => Array(20).fill(0)),
    cellStyles: {},
  doors: [],
  walls: [],
  traps: []
      };
    case A.SET_DUNGEON_STATE: {
      const next = action.payload || {};
      return {
        ...state,
        grid: Array.isArray(next.grid) ? next.grid : state.grid,
        doors: Array.isArray(next.doors) ? next.doors : state.doors,
        walls: Array.isArray(next.walls) ? next.walls : state.walls,
        cellStyles: (next.cellStyles && typeof next.cellStyles === 'object') ? next.cellStyles : state.cellStyles,
      };
    }

    // ========== Environment ==========
    case A.CHANGE_ENVIRONMENT:
      return {
        ...state,
        currentEnvironment: action.environment
      };

    // ========== Door Management ==========
    case A.TOGGLE_DOOR: {
      // Check if a door already exists on this exact cell and edge
      const existsIdx = state.doors.findIndex(
        d => d.x === action.x && d.y === action.y && d.edge === action.edge
      );

      if (existsIdx >= 0) {
        // Door exists on this edge - remove it
        return { ...state, doors: state.doors.filter((_, i) => i !== existsIdx) };
      }

      // Determine the adjacent cell and opposite edge that shares this edge
      let adjacentX = action.x;
      let adjacentY = action.y;
      let oppositeEdge = null;

      if (action.edge === 'N') {
        adjacentY = action.y - 1;
        oppositeEdge = 'S';
      } else if (action.edge === 'S') {
        adjacentY = action.y + 1;
        oppositeEdge = 'N';
      } else if (action.edge === 'E') {
        adjacentX = action.x + 1;
        oppositeEdge = 'W';
      } else if (action.edge === 'W') {
        adjacentX = action.x - 1;
        oppositeEdge = 'E';
      }

      // Check if there's a conflicting door on the adjacent cell's opposite edge
      const conflictIdx = state.doors.findIndex(
        d => d.x === adjacentX && d.y === adjacentY && d.edge === oppositeEdge
      );

      // Remove conflicting door (if any) and add the new door
      let newDoors = state.doors;
      if (conflictIdx >= 0) {
        newDoors = newDoors.filter((_, i) => i !== conflictIdx);
      }
      newDoors = [...newDoors, { x: action.x, y: action.y, edge: action.edge }];

      return { ...state, doors: newDoors };
    }

    case A.SET_DOOR_TYPE: {
      // Update a door with its type
      const newDoors = state.doors.map((d, i) =>
        i === action.doorIdx ? { ...d, doorType: action.doorType, opened: false } : d
      );
      return { ...state, doors: newDoors };
    }

    case A.OPEN_DOOR: {
      const newDoors = state.doors.map((d, i) =>
        i === action.doorIdx ? { ...d, opened: true } : d
      );
      return { ...state, doors: newDoors };
    }

    // ========== Trap Mechanics ==========
    case A.ADD_TRAP: {
      const newTraps = [...(state.traps || []), {
        id: Date.now() + Math.random(),
        x: action.x,
        y: action.y,
        type: action.trapType,
        detected: action.detected || false,
        disarmed: false,
        triggered: false
      }];
      return { ...state, traps: newTraps };
    }

    case A.TRIGGER_TRAP: {
      const newTraps = (state.traps || []).map((t, i) =>
        i === action.trapIdx ? { ...t, triggered: true } : t
      );
      return { ...state, traps: newTraps };
    }

    case A.DISARM_TRAP: {
      const newTraps = (state.traps || []).map((t, i) =>
        i === action.trapIdx ? { ...t, disarmed: true, detected: true } : t
      );
      return { ...state, traps: newTraps };
    }

    case A.CLEAR_TRAPS:
      return { ...state, traps: [] };

    // ========== Special Rooms ==========
    case A.SET_SPECIAL_ROOM: {
      const newSpecialRooms = [...(state.specialRooms || []), {
        id: Date.now(),
        x: action.x,
        y: action.y,
        type: action.roomType,
        interacted: false,
        result: null
      }];
      return { ...state, specialRooms: newSpecialRooms };
    }

    case A.RESOLVE_SPECIAL: {
      const newSpecialRooms = (state.specialRooms || []).map((r, i) =>
        i === action.roomIdx ? { ...r, interacted: true, result: action.result } : r
      );
      return { ...state, specialRooms: newSpecialRooms };
    }

    // ========== Boss Room ==========
    case A.SET_BOSS_ROOM:
      return {
        ...state,
        bossRoom: { x: action.x, y: action.y, unlocked: false }
      };

    case A.ENTER_BOSS_ROOM:
      return {
        ...state,
        bossRoom: { ...state.bossRoom, unlocked: true, entered: true }
      };

    // ========== Tile Exploration ==========
    case A.MARK_TILE_SEARCHED: {
      const tileKey = `${action.x},${action.y}`;
      if (state.searchedTiles.includes(tileKey)) {
        return state; // Already searched
      }
      return {
        ...state,
        searchedTiles: [...state.searchedTiles, tileKey]
      };
    }

    case A.SET_WALLS: {
      return { ...state, walls: action.walls || [] };
    }

    case A.CYCLE_CELL_STYLE: {
      const key = `${action.x},${action.y}`;
      const styles = { ...(state.cellStyles || {}) };
  // New order: full -> diag1 -> diag2 -> diag3 -> diag4 -> round1 -> round2 -> round3 -> round4
  const order = STYLE_ORDER;
  const current = styles[key] || 'full';
  const idx = Math.max(0, order.indexOf(current));
  const next = order[(idx + 1) % order.length];
      styles[key] = next;
      return { ...state, cellStyles: styles };
    }

    case A.SET_DOORS: {
      return { ...state, doors: action.doors || [] };
    }

    default:
      return state;
  }
}
