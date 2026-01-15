/**
 * Log Reducer - Handles game log and log archive
 */
import * as A from '../actions.js';

/**
 * Log reducer - handles all log-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function logReducer(state, action) {
  switch (action.type) {
    // ========== Logging ==========
    case A.LOG:
      return {
        ...state,
        log: [action.t, ...state.log].slice(0, 80)
      };

    case A.CLEAR_LOG:
      return { ...state, log: [] };

    case A.ARCHIVE_LOG: {
      // Archive current log and clear it (preserves history until campaign reset)
      if (state.log.length === 0) return state;

      const archiveEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        adventureName: state.adventure?.adventureName || 'Adventure',
        entries: [...state.log]
      };

      return {
        ...state,
        log: [],
        logArchive: [...(state.logArchive || []), archiveEntry]
      };
    }

    default:
      return state;
  }
}
