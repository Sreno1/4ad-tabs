/**
 * Combine Reducers - Compose domain reducers into a single reducer
 *
 * This utility allows us to split reducer logic by domain while maintaining
 * a single source of truth for state management.
 */

import { partyReducer } from './partyReducer.js';
import { combatReducer } from './combatReducer.js';
import { dungeonReducer } from './dungeonReducer.js';
import { inventoryReducer } from './inventoryReducer.js';
import { uiReducer } from './uiReducer.js';
import { logReducer } from './logReducer.js';
import { campaignReducer } from './campaignReducer.js';

/**
 * Combines multiple domain reducers into a single reducer function.
 * Each reducer processes the action and returns the updated state.
 * Reducers are called in sequence, with each receiving the output of the previous.
 *
 * @param {Array<Function>} reducers - Array of reducer functions
 * @returns {Function} Combined reducer function
 */
export function combineReducers(reducers) {
  return (state, action) => {
    let nextState = state;

    for (const reducer of reducers) {
  try { console.log('[composedReducer] running reducer', reducer.name || 'anon', 'for action', action && action.type); } catch (e) {}
      const previousStateForKey = nextState;
      const nextStateForKey = reducer(previousStateForKey, action);

      // Only update if the reducer actually changed something
      if (nextStateForKey !== previousStateForKey) {
        nextState = nextStateForKey;
      }
    }

    return nextState;
  };
}

/**
 * Pre-composed reducer combining all domain reducers.
 * Order matters: earlier reducers can affect state that later reducers depend on.
 *
 * Order explanation:
 * 1. campaignReducer - Handles game state, resets, and loads (affects everything)
 * 2. partyReducer - Manages heroes (combat and dungeon need hero state)
 * 3. combatReducer - Manages monsters and abilities (can update party stats)
 * 4. dungeonReducer - Manages grid, doors, traps, special rooms
 * 5. inventoryReducer - Manages gold and clues
 * 6. logReducer - Manages logs (usually last to record state changes)
 */
export const composedReducer = combineReducers([
  campaignReducer,
  partyReducer,
  combatReducer,
  dungeonReducer,
  inventoryReducer,
  uiReducer,
  logReducer
]);
