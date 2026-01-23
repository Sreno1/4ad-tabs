/**
 * Combat Location Helpers
 * Utilities for corridor/room combat restrictions per 4AD rules
 */

/**
 * Check if a hero can attack in melee based on marching order and location
 * Per 4AD rules (Combat.txt p.121):
 * - In rooms: All PCs can fight
 * - In corridors: Only positions 1 and 2 can melee
 * - In narrow corridors: Only position 1 can melee (if implemented)
 *
 * @param {object} state - Game state
 * @param {number} heroIdx - Hero index in party array
 * @returns {object} { canMelee: boolean, reason: string }
 */
export const canHeroMeleeAttack = (state, heroIdx, options = {}) => {
  const location = state.currentCombatLocation;

  // If no location set, assume room (all can fight)
  if (!location) {
    return { canMelee: true, reason: null };
  }

  // In rooms, all PCs can fight
  if (location.type === 'room') {
    return { canMelee: true, reason: null };
  }

  // In corridors, check marching order position
  if (location.type === 'corridor') {
    // Only enforce corridor melee restrictions for wandering/ambush encounters.
    // Tile-generated combats (normal room spawns) should allow melee from all positions.
    const isWanderingAmbush = !!(state && state.combatMeta && state.combatMeta.wanderingEncounter && state.combatMeta.wanderingEncounter.ambush);
    if (!isWanderingAmbush) {
      return { canMelee: true, reason: null };
    }
    const position = state.marchingOrder.indexOf(heroIdx);

    // If hero not in marching order, assume they can fight (fallback)
    if (position === -1) {
      return { canMelee: true, reason: null };
    }

    // If caller requested to allow rear PCs when party attacks first (pre-initiative), honor that
    if (options.allowRearWhenPartyFirst) {
      return { canMelee: true, reason: null };
    }

    // Narrow corridor: only position 0 (position 1 in 1-indexed) can fight
    if (location.width === 'narrow') {
      if (position === 0) {
        return { canMelee: true, reason: null };
      }
      return {
        canMelee: false,
        reason: 'Only the front PC (position 1) can fight in narrow corridors. Use ranged weapons or spells.'
      };
    }

    // Normal corridor: positions 0-1 (positions 1-2 in 1-indexed) can melee
    if (position < 2) {
      return { canMelee: true, reason: null };
    }

    return {
      canMelee: false,
      reason: 'Only positions 1 and 2 can fight in melee in corridors. Use ranged weapons or spells from the rear.'
    };
  }

  // Fallback: allow attack
  return { canMelee: true, reason: null };
};

/**
 * Check if narrow corridor penalty applies to weapon
 * Per 4AD rules (Combat.txt p.122):
 * - Two-handed weapons: -1 attack in narrow corridors
 * - Light weapons: no penalty
 *
 * @param {object} location - Current combat location
 * @param {object} weapon - Equipped weapon
 * @returns {number} Penalty modifier (0 or -1)
 */
export const getNarrowCorridorPenalty = (location, weapon) => {
  if (!location || location.type !== 'corridor' || location.width !== 'narrow') {
    return 0;
  }

  if (!weapon) {
    return 0;
  }

  // Two-handed weapons get -1
  if (weapon.key === 'two_handed') {
    return weapon.corridorPenalty || -1;
  }

  // Light weapons have no penalty
  if (weapon.key === 'light_weapon') {
    return 0;
  }

  // Other weapons get the corridor penalty if defined
  return weapon.corridorPenalty || 0;
};

/**
 * Get equipped melee weapon for a hero
 * @param {object} hero - Hero object
 * @returns {object|null} Weapon object or null
 */
import { getEquipment, getActiveWeapon } from '../data/equipment.js';

export const getEquippedMeleeWeapon = (hero) => {
  // First, try to get the active weapon
  const activeWeapon = getActiveWeapon(hero);
  if (activeWeapon && activeWeapon.type === 'melee') {
    return activeWeapon;
  }

  // Fallback: find first melee weapon in equipment
  if (!hero.equipment || !Array.isArray(hero.equipment)) {
    return null;
  }
  const weaponKey = hero.equipment.find(itemKey => {
    const item = getEquipment(itemKey);
    return item && item.category === 'weapon' && item.type === 'melee';
  });

  if (!weaponKey) {
    return null;
  }
  return getEquipment(weaponKey);
};

/**
 * Determine location type from grid cell
 * @param {number} cellValue - Grid cell value (0=empty, 1=room, 2=corridor)
 * @returns {string} 'room' or 'corridor'
 */
export const getCellLocationType = (cellValue) => {
  if (cellValue === 2) {
    return 'corridor';
  }
  return 'room';
};

/**
 * Set combat location when combat begins
 * @param {function} dispatch - Redux dispatch
 * @param {object} state - Game state
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 */
export const setCombatLocation = (dispatch, state, x, y) => {
  if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) {
    return; // Invalid coordinates
  }

  const cellValue = state.grid[y][x];
  const locationType = getCellLocationType(cellValue);

  // For now, all corridors are 'normal' width
  // In future, could detect narrow corridors from dungeon generation
  const width = 'normal';

  dispatch({
    type: 'SET_COMBAT_LOCATION',
    locationType,
    width,
    x,
    y
  });
};

/**
 * Clear combat location when combat ends
 * @param {function} dispatch - Redux dispatch
 */
export const clearCombatLocation = (dispatch) => {
  dispatch({ type: 'CLEAR_COMBAT_LOCATION' });
};

/**
 * Check if ranged attacks are allowed based on combat rules
 * Per 4AD rules:
 * - In rooms: Ranged weapons can only be used in the first round (before melee engagement)
 * - In corridors: Ranged weapons can be used any round
 * - Pre-initiative volley: Always allowed
 *
 * @param {object} state - Game state
 * @param {object} options - Options { preInitiativeRanged }
 * @returns {object} { allowed: boolean, reason: string }
 */
export const canUseRangedWeapon = (state, options = {}) => {
  // Pre-initiative ranged volley is always allowed
  if (options.preInitiativeRanged) {
    return { allowed: true, reason: null };
  }

  const location = state.currentCombatLocation;

  // If no location set, assume room rules
  if (!location) {
    // Check if ranged engagement has occurred (first round passed)
    if (state.combatMeta?.rangedEngaged) {
      return {
        allowed: false,
        reason: 'Melee range closed - ranged weapons only usable in first round of room combat'
      };
    }
    return { allowed: true, reason: null };
  }

  // In rooms, ranged only allowed on first round (before rangedEngaged flag set)
  if (location.type === 'room') {
    if (state.combatMeta?.rangedEngaged) {
      return {
        allowed: false,
        reason: 'Melee range closed - ranged weapons only usable in first round of room combat'
      };
    }
    return { allowed: true, reason: null };
  }

  // In corridors, ranged always allowed
  if (location.type === 'corridor') {
    return { allowed: true, reason: null };
  }

  return { allowed: true, reason: null };
};
