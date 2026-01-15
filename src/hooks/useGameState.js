/**
 * Custom hook for game state management with localStorage persistence
 */
import { useReducer, useEffect } from 'react';
import { reducer } from '../state/reducer.js';
import { initialState } from '../state/initialState.js';

const STORAGE_KEY = '4ad-state';

/**
 * Load state from localStorage with migration support
 * @returns {object} Loaded state or initial state
 */
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    
    const parsed = JSON.parse(saved);
    
    // Merge with initialState to ensure new properties exist (migration)
    return {
      ...initialState,
      ...parsed,
      // Ensure nested objects have all required properties
      grid: parsed.grid || initialState.grid,
      doors: parsed.doors || initialState.doors,
      monsters: parsed.monsters || initialState.monsters,
      abilities: parsed.abilities || initialState.abilities,
      campaign: { ...initialState.campaign, ...(parsed.campaign || {}) },
      adventure: { ...initialState.adventure, ...(parsed.adventure || {}) }
    };
  } catch (e) {
    console.error('Failed to load state:', e);
    return initialState;
  }
};

/**
 * Save state to localStorage
 * @param {object} state - State to save
 */
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

/**
 * Custom hook for game state management
 * @returns {[object, function]} State and dispatch function
 */
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  
  // Auto-save on state change
  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);
  
  return [state, dispatch];
}

export default useGameState;
