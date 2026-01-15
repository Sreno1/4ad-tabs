/**
 * Inventory Reducer - Handles gold, clues, and resources
 */
import * as A from '../actions.js';

/**
 * Inventory reducer - handles all inventory-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function inventoryReducer(state, action) {
  switch (action.type) {
    // ========== Resources ==========
    case A.GOLD:
      return { ...state, gold: Math.max(0, state.gold + action.n) };

    case A.CLUE:
      return { ...state, clues: Math.max(0, state.clues + action.n) };

    default:
      return state;
  }
}
