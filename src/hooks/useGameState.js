/**
 * Custom hook for game state management with localStorage persistence
 * Now supports multi-campaign storage
 */
import { useReducer, useEffect, useRef, useState } from "react";
import { reducer } from "../state/reducer.js";
import { initialState } from "../state/initialState.js";
import {
  getActiveCampaignId,
  loadCampaign,
  saveCampaign,
} from "../utils/campaignStorage.js";
import { getEquipment } from "../data/equipment.js";

const STORAGE_KEY = "4ad-state"; // Legacy key for backward compatibility
const SAVE_DEBOUNCE_MS = 1000;

/**
 * Validate state structure
 * @param {object} state - State to validate
 * @returns {boolean} True if state is valid
 */
const validateState = (state) => {
  if (!state || typeof state !== "object") return false;

  // Check for required top-level properties
  const required = [
    "party",
    "gold",
    "clues",
    "monsters",
    "grid",
    "log",
    "doors",
    "abilities",
  ];
  return required.every((key) => key in state);
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
      console.warn("Invalid state structure, using initial state");
      return initialState;
    }

    // Merge with initialState to ensure new properties exist (migration)
    const merged = {
      ...initialState,
      ...parsed,
      // Ensure nested objects have all required properties
      grid: parsed.grid || initialState.grid,
      doors: parsed.doors || initialState.doors,
      monsters: parsed.monsters || initialState.monsters,
      abilities: parsed.abilities || initialState.abilities,
      campaign: { ...initialState.campaign, ...(parsed.campaign || {}) },
      adventure: { ...initialState.adventure, ...(parsed.adventure || {}) },
    };

    // If the loaded party has no equipped items that are light sources, clear the persisted global light flag
    try {
      const anyLightEquipped = (merged.party || []).some((h) => {
        const eq = h?.equipment || [];
        if (!Array.isArray(eq)) return false;
        return eq.some((k) => {
          const item = getEquipment(k);
          return item && item.lightSource;
        });
      });
      if (!anyLightEquipped) merged.hasLightSource = false;
    } catch (e) {
      // If equipment lookup fails for any reason, default to leaving the flag as-is
      console.warn('Failed to evaluate equipped light items during load:', e);
    }

    return merged;
  } catch (e) {
    console.error("Failed to load state:", e);
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
      console.error("Invalid state structure, save aborted");
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    if (e.name === "QuotaExceededError" || e.code === 22) {
      console.error("localStorage quota exceeded. Clearing old data.");
      // Try to clear and retry once
      try {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.warn("localStorage cleared and state saved");
        return true;
      } catch (retryError) {
        console.error("Failed to save state even after clearing:", retryError);
        return false;
      }
    }
    console.error("Failed to save state:", e);
    return false;
  }
};

/**
 * Custom hook for game state management with multi-campaign support
 * @returns {[object, function, object]} State, dispatch function, and campaign controls
 */
export function useGameState() {
  const activeCampaignId = getActiveCampaignId();
  const [currentCampaignId, setCurrentCampaignId] = useState(activeCampaignId);

  // Load initial campaign or use legacy state
  const initialCampaign = currentCampaignId
    ? loadCampaign(currentCampaignId)
    : null;

  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => initialCampaign || loadState(),
  );
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
      if (currentCampaignId) {
        // Save to campaign storage with updated metadata
        const updatedCampaign = {
          ...state,
          id: currentCampaignId,
          lastPlayedAt: new Date().toISOString(),
          heroNames: state.party?.map((h) => h.name) || [],
        };
        saveCampaign(updatedCampaign);
      } else {
        // Fallback to legacy single-state storage
        saveState(state);
      }
    }, SAVE_DEBOUNCE_MS);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, currentCampaignId]);

  // Campaign controls
  const campaignControls = {
    currentCampaignId,
    setCurrentCampaignId,
  };

  return [state, dispatch, campaignControls];
}

export default useGameState;
