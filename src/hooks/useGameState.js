/**
 * Custom hook for game state management with localStorage persistence
 */
import { useReducer, useEffect, useRef } from 'react';
import { reducer } from '../state/reducer.js';
import { initialState } from '../state/initialState.js';

const STORAGE_KEY = '4ad-state';
const SAVE_DEBOUNCE_MS = 1000;

/**
 * Validate state structure
 * @param {object} state - State to validate
 * @returns {boolean} True if state is valid
 */
const validateState = (state) => {
  if (!state || typeof state !== 'object') return false;

  // Check for required top-level properties
  const required = ['party', 'gold', 'clues', 'monsters', 'grid', 'log', 'doors', 'abilities'];
  return required.every(key => key in state);
};

/**
 * Load state from localStorage with migration support
 * @returns {object} Loaded state or initial state
 */
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;

    const parsed = JSON.parse(saved);

    // Validate loaded state
    if (!validateState(parsed)) {
      console.warn('Invalid state structure, using initial state');
      return initialState;
    }

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
    // Return initial state if there's any error
    return initialState;
  }
};

/**
 * Save state to localStorage with quota handling
 * @param {object} state - State to save
 */
const saveState = (state) => {
  try {
    // Validate before saving
    if (!validateState(state)) {
      console.error('Invalid state structure, save aborted');
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('localStorage quota exceeded. Clearing old data.');
      // Try to clear and retry once
      try {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.warn('localStorage cleared and state saved');
        return true;
      } catch (retryError) {
        console.error('Failed to save state even after clearing:', retryError);
        return false;
      }
    }
    console.error('Failed to save state:', e);
    return false;
  }
};

/**
 * Custom hook for game state management
 * @returns {[object, function]} State and dispatch function
 */
export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const saveTimeoutRef = useRef(null);

  // Debounced auto-save on state change
  useEffect(() => {
    if (!state) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveState(state);
    }, SAVE_DEBOUNCE_MS);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state]);

  return [state, dispatch];
}

export default useGameState;
