/**
 * Party Reducer - Handles hero management, stats, and party composition
 */
import * as A from '../actions.js';
import { getEquipment } from '../../data/equipment.js';

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
      // After removing a hero, ensure the global hasLightSource flag reflects any remaining equipped light sources
      const anyLightEquipped = newParty.some(h => (h.equipment || []).some(k => {
        const it = getEquipment(k);
        return it && it.lightSource;
      }));
      return {
        ...state,
        party: newParty,
        abilities: newAbilities,
        hcl: calculateHCL(newParty),
        hasLightSource: !!anyLightEquipped
      };
    }

    case A.UPD_HERO: {
      const newParty = state.party.map((h, i) =>
        i === action.i ? { ...h, ...action.u } : h
      );
      // After updating a hero (hp/equipment may have changed), recompute whether
      // any alive hero still has an equipped light source so the global flag
      // remains accurate (this makes lights disappear if the carrier dies).
      const anyLightEquipped = newParty.some(h => (h?.hp > 0) && ((h.equipment || []).some(k => {
        const it = getEquipment(k);
        return it && it.lightSource;
      })));
      return {
        ...state,
        party: newParty,
        hcl: calculateHCL(newParty),
        hasLightSource: !!anyLightEquipped
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
      // If the equipped item is a light source, enable global light flag
      const equippedItem = getEquipment(action.itemKey);
      if (equippedItem && equippedItem.lightSource) {
        return { ...state, party: newParty, hasLightSource: true };
      }
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
      // After unequipping, if no hero has any equipped light source, clear global flag
      const anyLightEquipped = newParty.some(h => (h.equipment || []).some(k => {
        const it = getEquipment(k);
        return it && it.lightSource;
      }));
      return { ...state, party: newParty, hasLightSource: !!anyLightEquipped };
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

    // ========== Clues ==========
    case A.ADD_HERO_CLUE: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        // Max 3 clues per hero per game rules
        const currentClues = h.clues || 0;
        if (currentClues >= 3) return h;
        return {
          ...h,
          clues: currentClues + (action.amount || 1)
        };
      });
      return { ...state, party: newParty };
    }

    case A.REMOVE_HERO_CLUE: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        return {
          ...h,
          clues: Math.max(0, (h.clues || 0) - (action.amount || 1))
        };
      });
      return { ...state, party: newParty };
    }

    // ========== Scrolls & Learned Spells ==========
    case A.ADD_LEARNED_SPELL: {
      const newParty = state.party.map((h, i) => {
        if (i !== action.heroIdx) return h;
        // Only add if not already learned
        const learnedSpells = h.learnedSpells || [];
        if (learnedSpells.includes(action.spellKey)) return h;
        return {
          ...h,
          learnedSpells: [...learnedSpells, action.spellKey]
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
