/**
 * Room and exploration tables for Four Against Darkness
 */

// Room Generation Table (d66)
export const ROOM_TABLE = {
  11: 'Empty Room', 
  12: 'Empty Room', 
  13: 'Empty Room', 
  14: 'Empty Room', 
  15: 'Vermin (L1)', 
  16: 'Vermin (L1)',
  21: 'Vermin (L1)', 
  22: 'Minion (L2)', 
  23: 'Minion (L2)', 
  24: 'Minion (L2)', 
  25: 'Minor Peril', 
  26: 'Minor Peril',
  31: 'Minor Peril', 
  32: 'Boss! (L=HCL+1)', 
  33: 'Treasure!', 
  34: 'Treasure!', 
  35: 'Special Feature', 
  36: 'Special Feature',
  41: 'Wandering Monster', 
  42: 'Clue', 
  43: 'Clue', 
  44: 'Clue', 
  45: 'Secret Door', 
  46: 'Statue/Fountain',
  51: 'Statue/Fountain', 
  52: 'Trapped Room', 
  53: 'Puzzle Room', 
  54: 'Empty + Door', 
  55: 'Empty + Door', 
  56: 'Empty + Door',
  61: 'Major Foe (L=HCL)', 
  62: 'Major Foe (L=HCL)', 
  63: 'Major Foe (L=HCL)', 
  64: 'Major Foe (L=HCL)', 
  65: 'Dead End', 
  66: 'Dead End'
};

// Door types for Phase 3
export const DOOR_TYPES = {
  normal: { name: 'Normal', openDC: 0 },
  stuck: { name: 'Stuck', openDC: 4 },
  locked: { name: 'Locked', openDC: 5, requiresKey: true },
  trapped: { name: 'Trapped', openDC: 4, hasTrap: true }
};

// Trap types for Phase 3
export const TRAP_TYPES = {
  pit: { name: 'Pit Trap', damage: 1, detectDC: 4 },
  dart: { name: 'Dart Trap', damage: 1, detectDC: 5 },
  blade: { name: 'Blade Trap', damage: 2, detectDC: 5 },
  poison: { name: 'Poison Trap', damage: 1, effect: 'poison', detectDC: 6 }
};

// Special room effects for Phase 3
export const SPECIAL_ROOMS = {
  shrine: { name: 'Shrine', effect: 'heal_or_curse' },
  fountain: { name: 'Fountain', effect: 'random_effect' },
  statue: { name: 'Statue', effect: 'treasure_or_trap' },
  altar: { name: 'Altar', effect: 'offering' }
};

/**
 * Parse room result to determine what happens
 * @param {string} result - Room table result string
 * @returns {object} Parsed room info with type and action
 */
export const parseRoomResult = (result) => {
  if (result.includes('Vermin')) return { type: 'monster', subtype: 'vermin', level: 1 };
  if (result.includes('Minion')) return { type: 'monster', subtype: 'minion', level: 2 };
  if (result.includes('Boss')) return { type: 'monster', subtype: 'boss', level: null }; // HCL+1
  if (result.includes('Major Foe')) return { type: 'monster', subtype: 'major', level: null }; // HCL
  if (result.includes('Clue')) return { type: 'clue' };
  if (result.includes('Treasure')) return { type: 'treasure' };
  if (result.includes('Empty')) return { type: 'empty', hasDoor: result.includes('Door') };
  if (result.includes('Trapped')) return { type: 'trap' };
  if (result.includes('Wandering')) return { type: 'wandering' };
  if (result.includes('Dead End')) return { type: 'deadend' };
  return { type: 'special', subtype: result.toLowerCase() };
};
