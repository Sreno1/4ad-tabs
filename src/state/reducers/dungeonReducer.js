/**
 * Dungeon Reducer - Handles dungeon grid, doors, traps, and special rooms
 */
import * as A from '../actions.js';

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
      const newGrid = state.grid.map((row, y) =>
        row.map((cell, x) =>
          (x === action.x && y === action.y) ? (cell + 1) % 3 : cell
        )
      );
      return { ...state, grid: newGrid };
    }

    case A.CLEAR_GRID:
      return {
        ...state,
        grid: Array(28).fill(null).map(() => Array(20).fill(0)),
        doors: []
      };

    // ========== Door Management ==========
    case A.TOGGLE_DOOR: {
      const exists = state.doors.findIndex(
        d => d.x === action.x && d.y === action.y && d.edge === action.edge
      );
      const newDoors = exists >= 0
        ? state.doors.filter((_, i) => i !== exists)
        : [...state.doors, { x: action.x, y: action.y, edge: action.edge }];
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

    default:
      return state;
  }
}
