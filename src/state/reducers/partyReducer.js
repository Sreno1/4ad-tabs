/**
 * Party Reducer - Handles hero management, stats, and party composition
 */
import * as A from '../actions.js';

/**
 * Calculate HCL from party
 * @param {Array} party - Array of hero objects
 * @returns {number} Highest character level
 */
const calculateHCL = (party) => {
  if (!party || party.length === 0) return 1;
  return Math.max(...party.map(h => h.lvl));
};

/**
 * Party reducer - handles all party-related state changes
 * @param {Object} state - Full game state
 * @param {Object} action - Action object
 * @returns {Object} Updated state
 */
export function partyReducer(state, action) {
  switch (action.type) {
    // ========== Party Management ==========
    case A.ADD_HERO: {
      if (state.party.length >= 4) return state;
      const newParty = [...state.party, action.h];
      return {
        ...state,
        party: newParty,
        hcl: calculateHCL(newParty)
      };
    }

    case A.DEL_HERO: {
      const newParty = state.party.filter((_, i) => i !== action.i);
      // Clean up abilities for removed hero
      const newAbilities = { ...state.abilities };
      delete newAbilities[action.i];
      return {
        ...state,
        party: newParty,
        abilities: newAbilities,
        hcl: calculateHCL(newParty)
      };
    }

    case A.UPD_HERO: {
      const newParty = state.party.map((h, i) =>
        i === action.i ? { ...h, ...action.u } : h
      );
      return {
        ...state,
        party: newParty,
        hcl: calculateHCL(newParty)
      };
    }

    // ========== Hero Status ==========
    case A.SET_HERO_STATUS: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          status: {
            ...(h.status || {}),
            [action.statusKey]: action.value
          }
        };
      });
      return { ...state, party: newParty };
    }

    // ========== XP & Leveling ==========
    case A.ADD_XP: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          xp: (h.xp || 0) + action.amount
        };
      });
      return { ...state, party: newParty };
    }

    case A.LEVEL_UP: {
      const hero = state.party[action.heroIdx];
      if (!hero || hero.lvl >= 5) return state;

      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          lvl: h.lvl + 1,
          maxHp: h.maxHp + 1,
          hp: h.hp + 1 // Gain 1 HP on level up
        };
      });

      return {
        ...state,
        party: newParty,
        hcl: Math.max(...newParty.map(h => h.lvl))
      };
    }

    // ========== Equipment ==========
    case A.EQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        // Add item to equipment array if not already there
        const equipment = h.equipment || [];
        if (equipment.includes(action.itemKey)) return h;
        return {
          ...h,
          equipment: [...equipment, action.itemKey]
        };
      });
      return { ...state, party: newParty };
    }

    case A.UNEQUIP_ITEM: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          equipment: (h.equipment || []).filter(key => key !== action.itemKey)
        };
      });
      return { ...state, party: newParty };
    }

    case A.ADD_TO_INVENTORY: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          inventory: [...(h.inventory || []), action.itemKey]
        };
      });
      return { ...state, party: newParty };
    }

    case A.REMOVE_FROM_INVENTORY: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          inventory: (h.inventory || []).filter((_, idx) => idx !== action.itemIdx)
        };
      });
      return { ...state, party: newParty };
    }

    // ========== Marching Order ==========
    case A.SET_MARCHING_ORDER: {
      const newOrder = [...state.marchingOrder];
      const existingPos = newOrder.indexOf(action.heroIdx);
      const targetHero = newOrder[action.position];

      // No-op if dropped onto same position
      if (existingPos === action.position) return state;

      if (targetHero != null && existingPos >= 0) {
        // Swap positions: place targetHero where this hero came from
        newOrder[existingPos] = targetHero;
        newOrder[action.position] = action.heroIdx;
      } else {
        // Move: clear previous pos and set target
        if (existingPos >= 0) newOrder[existingPos] = null;
        newOrder[action.position] = action.heroIdx;
      }

      return { ...state, marchingOrder: newOrder };
    }

    default:
      return state;
  }
}
