/**
 * Main reducer for Four Against Darkness game state
 *
 * This file now delegates to domain-specific reducers for better organization.
 * See src/state/reducers/ for individual domain logic.
 */

import { composedReducer } from "./reducers/index.js";

/**
 * Main game reducer - delegates to composed domain reducers
 *
 * The reducer composition is handled in src/state/reducers/combineReducers.js
 * and includes the following domains:
 * - Campaign & Adventure management
 * - Party management (heroes, stats, equipment)
 * - Combat (monsters, abilities, reactions)
 * - Dungeon (grid, doors, traps, special rooms)
 * - Inventory (gold, clues)
 * - Log (messages, archives)
 *
 * @param {Object} state - Current game state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} Updated game state
 */
export function reducer(state, action) {
  try { console.log('[rootReducer] action', action && action.type); } catch (e) {}
  return composedReducer(state, action);
}
