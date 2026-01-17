/**
 * Room and exploration tables for Four Against Darkness
 * Based on official 4AD tables
 * 
 * IMPORTANT:
 * - d66 determines TILE SHAPE (room layout and doors)
 * - 2d6 determines TILE CONTENTS (what's in the room)
 * - Boss is determined by d6 roll when facing Major Foe (+1 per major foe this dungeon)
 */

// ========== TILE SHAPE TABLE (d66) ==========
// This determines the room/corridor layout and door placement
// Reference: tiles.pdf / tile-gen images
export const TILE_SHAPE_TABLE = {
  11: { type: 'corridor' },
  12: { type: 'corridor' },
  13: { type: 'corridor' },
  14: { type: 'corridor' },
  15: { type: 'room' },
  16: { type: 'room' },
  21: { type: 'room' },
  22: { type: 'room' },
  23: { type: 'room' },
  24: { type: 'room' },
  25: { type: 'room' },
  26: { type: 'corridor' },
  31: { type: 'room' },
  32: { type: 'corridor' },
  33: { type: 'corridor' },
  34: { type: 'room' },
  35: { type: 'room' },
  36: { type: 'room' },
  41: { type: 'room' },
  42: { type: 'corridor' },
  43: { type: 'room' },
  44: { type: 'room' },
  45: { type: 'corridor' },
  46: { type: 'room' },
  51: { type: 'corridor' },
  52: { type: 'room' },
  53: { type: 'corridor' },
  54: { type: 'room' },
  55: { type: 'corridor' },
  56: { type: 'room' },
  61: { type: 'room' },
  62: { type: 'corridor' },
  63: { type: 'corridor' },
  64: { type: 'room' },
  65: { type: 'corridor' },
  66: { type: 'room' }
};

// ========== TILE CONTENTS TABLE (2d6) ==========
// This determines what is in the room AFTER you determine its shape
// Reference: tables.pdf - Tile Content Table
export const TILE_CONTENTS_TABLE = {
  2: { type: 'treasure', corridorDescription: 'Treasure!', roomDescription: 'Treasure!' },
  3: { type: 'treasure', corridorDescription: 'Treasure protected by a trap. Roll on traps table, then treasure.', roomDescription: 'Treasure protected by a trap. Roll on traps table, then treasure.' },
  4: {
    type: 'special',
    corridorDescription: 'Empty',
    roomDescription: 'Special Events (roll on Special Features table)',
    corridorType: 'empty',
    roomType: 'special'
  },
  5: { type: 'special', corridorDescription: 'Empty and may be searched. Then roll on special events in dungeons.', roomDescription: 'Empty and may be searched. Then roll on special events in dungeons.' },
  6: { type: 'vermin', corridorDescription: 'Roll on Vermin Table', roomDescription: 'Roll on Vermin Table' },
  7: { type: 'minions', corridorDescription: 'Roll on Minion Table', roomDescription: 'Roll on Minion Table' },
  8: {
    type: 'minions',
    corridorDescription: 'Empty',
    roomDescription: 'Minion encounter (roll on Minion Table)',
    corridorType: 'empty',
    roomType: 'minions'
  },
  9: { type: 'empty', corridorDescription: 'May search, or spend 2 clues for a secret passage.', roomDescription: 'May search, or spend 2 clues for a secret passage.' },
  10: {
    type: 'weird_monster',
    corridorDescription: 'Empty',
    roomDescription: 'Weird Monster (roll on Weird Monster table)',
    corridorType: 'empty',
    roomType: 'weird_monster'
  },
  11: { type: 'major_foe', corridorDescription: 'Major Foe / Boss Encounter', roomDescription: 'Major Foe / Boss Encounter' },
  12: {
    type: 'dragon',
    corridorDescription: 'Empty',
    roomDescription: "Dragon's Lair",
    corridorType: 'empty',
    roomType: 'dragon'
  }
};

// ========== BOSS MECHANICS ==========
// When you encounter a Major Foe, roll d6 + number of major foes faced this dungeon
// If result is 6+, this Major Foe is the BOSS
// Boss gets: +1 Life, +1 Attack, treasure is tripled
export const BOSS_RULES = {
  rollRequired: 6, // d6 + majorFoesFaced >= 6 means boss
  bonusLife: 1,
  bonusAttack: 1,
  treasureMultiplier: 3,
  description: 'Roll d6 + number of major foes faced. On 6+, this is the Boss! (+1 Life, +1 Attack, 3x Treasure)'
};

/**
 * Count explored tiles on the grid
 * @param {array} grid - 2D grid array (28x20)
 * @returns {number} Count of non-empty cells (rooms + corridors)
 */
export const countExploredTiles = (grid) => {
  let count = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== 0) { // 1=room, 2=corridor
        count++;
      }
    }
  }
  return count;
};

/**
 * Check if grid is nearly full (90% explored)
 * @param {array} grid - 2D grid array (28x20)
 * @returns {boolean} True if >= 90% of grid is explored
 */
export const isGridNearlyFull = (grid) => {
  const totalCells = grid.length * grid[0].length; // 28 * 20 = 560
  const explored = countExploredTiles(grid);
  const percentFull = (explored / totalCells) * 100;
  return percentFull >= 90; // Grid is 90%+ full
};

/**
 * Check if a Major Foe encounter is actually the Boss
 * @param {number} majorFoesFaced - Number of major foes faced this dungeon
 * @param {number} roll - d6 roll result
 * @param {object} options - Optional params { isLastTile: boolean }
 * @returns {object} { isBoss, roll, total, reason }
 */
export const checkForBoss = (majorFoesFaced, roll, options = {}) => {
  const { isLastTile = false } = options;

  // If this is the last tile, it's automatically the boss
  if (isLastTile) {
    return {
      isBoss: true,
      roll,
      total: roll + majorFoesFaced,
      modifier: majorFoesFaced,
      reason: 'last_tile',
      message: `Last tile reached → IT'S THE BOSS!`
    };
  }

  // Normal boss check
  const total = roll + majorFoesFaced;
  const isBoss = total >= BOSS_RULES.rollRequired;
  return {
    isBoss,
    roll,
    total,
    modifier: majorFoesFaced,
    reason: isBoss ? 'roll_trigger' : 'not_boss',
    message: isBoss
      ? `${roll} + ${majorFoesFaced} = ${total} → IT'S THE BOSS!`
      : `${roll} + ${majorFoesFaced} = ${total} → Major Foe (not the boss)`
  };
};

// ========== DOOR MECHANICS ==========

export const DOOR_TYPES = {
  normal: { 
    name: 'Normal Door', 
    openDC: 0, 
    description: 'Opens freely' 
  },
  stuck: { 
    name: 'Stuck Door', 
    openDC: 4, 
    description: 'Needs d6 ≥ 4 or Warrior/Barbarian auto-open' 
  },
  locked: { 
    name: 'Locked Door', 
    openDC: 5, 
    requiresKey: true,
    description: 'Rogue can pick (d6+L ≥ 5) or use a key' 
  },
  trapped: { 
    name: 'Trapped Door', 
    openDC: 4, 
    hasTrap: true, 
    description: 'Contains a trap - detect or trigger!' 
  },
  secret: {
    name: 'Secret Door',
    openDC: 5,
    hidden: true,
    description: 'Only found by searching (d6 ≥ 5)'
  }
};

// Door type table (d6)
export const DOOR_TYPE_TABLE = {
  1: 'normal',
  2: 'normal',
  3: 'stuck',
  4: 'stuck',
  5: 'locked',
  6: 'trapped'
};

// ========== TRAP MECHANICS ==========

export const TRAP_TYPES = {
  pit: { 
    name: 'Pit Trap', 
    damage: 1, 
    detectDC: 4,
    disarmDC: 4,
    description: 'Fall into a pit! -1 Life'
  },
  dart: { 
    name: 'Dart Trap', 
    damage: 1, 
    detectDC: 5,
    disarmDC: 4,
    description: 'Poisoned darts! -1 Life'
  },
  blade: { 
    name: 'Blade Trap', 
    damage: 2, 
    detectDC: 5,
    disarmDC: 5,
    description: 'Swinging blades! -2 Life'
  },
  poison: { 
    name: 'Poison Gas Trap', 
    damage: 1, 
    effect: 'poison', 
    detectDC: 6,
    disarmDC: 5,
    description: 'Poison gas fills the room! -1 Life + poison'
  },
  alarm: {
    name: 'Alarm Trap',
    damage: 0,
    effect: 'wandering',
    detectDC: 4,
    disarmDC: 3,
    description: 'Alert! Triggers a wandering monster'
  }
};

export const TRAP_TABLE = {
  1: 'pit',
  2: 'dart',
  3: 'dart',
  4: 'blade',
  5: 'poison',
  6: 'alarm'
};

// ========== SPECIAL FEATURES ==========

export const SPECIAL_FEATURES = {
  shrine: { 
    name: 'Shrine', 
    description: 'Make offering (1 gold) → d6: 1-2 curse, 3-4 nothing, 5-6 blessing',
    requiresGold: 1
  },
  fountain: { 
    name: 'Fountain', 
    description: 'Drink? d6: 1 poison, 2-3 nothing, 4-5 heal 1, 6 full heal'
  },
  statue: { 
    name: 'Statue', 
    description: 'Search it: d6: 1-2 trap, 3-4 nothing, 5-6 treasure'
  },
  altar: { 
    name: 'Altar', 
    description: 'Sacrifice 2 gold → d6: 1-3 nothing, 4-5 clue, 6 magic item',
    requiresGold: 2
  },
  library: {
    name: 'Library',
    description: 'Search: d6: 1-2 trapped book, 3-4 nothing, 5-6 clue'
  },
  armory: {
    name: 'Armory',
    description: 'Search: d6: 1-2 rusty, 3-4 weapon bonus, 5-6 shield bonus'
  }
};

// Alias for backward compatibility
export const SPECIAL_ROOMS = SPECIAL_FEATURES;

export const SPECIAL_FEATURE_TABLE = {
  1: 'shrine',
  2: 'fountain',
  3: 'statue',
  4: 'altar',
  5: 'library',
  6: 'armory'
};

// ========== CORRIDOR/PASSAGE ==========

export const CORRIDOR_DIRECTION_TABLE = {
  1: 'straight',
  2: 'straight',
  3: 'left',
  4: 'right',
  5: 'T-junction',
  6: 'dead-end'
};

export const CORRIDOR_LENGTH_TABLE = {
  1: 1,
  2: 2,
  3: 2,
  4: 3,
  5: 3,
  6: 4
};

// Passage Contents Table (d6)
export const PASSAGE_CONTENTS_TABLE = {
  1: 'empty',
  2: 'empty',
  3: 'door',
  4: 'door',
  5: 'trap',
  6: 'wandering'
};

// ========== PUZZLE ROOMS ==========

export const PUZZLE_TYPES = {
  riddle: {
    name: 'Riddle',
    description: 'd6+INT (Wizard/Elf +L): ≥5 gain clue',
    successDC: 5
  },
  lever: {
    name: 'Lever Puzzle',
    description: 'd6: 1-2 trap, 3-4 nothing, 5-6 secret door',
    successDC: 5
  },
  pressure: {
    name: 'Pressure Plates',
    description: 'd6+DEX (Rogue/Halfling +L): ≥4 safe',
    successDC: 4
  },
  symbol: {
    name: 'Symbol Matching',
    description: 'd6: 1 curse, 2-3 nothing, 4-5 treasure, 6 treasure+clue',
    successDC: 4
  }
};

export const PUZZLE_TABLE = {
  1: 'riddle',
  2: 'riddle',
  3: 'lever',
  4: 'lever',
  5: 'pressure',
  6: 'symbol'
};

// ========== HELPER FUNCTIONS ==========

/**
 * Parse tile contents result
 * @param {number} roll - 2d6 result
 * @returns {object} Parsed content info
 */
export const parseTileContents = (roll) => {
  const content = TILE_CONTENTS_TABLE[roll];
  if (!content) return { type: 'empty', description: 'Empty' };
  return content;
};

/**
 * Get trap detection bonus for hero
 * @param {object} hero - Hero object
 * @param {string} trapType - Trap type key
 * @returns {object} { bonus, dc }
 */
export const getTrapDetectionBonus = (hero, trapType) => {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { bonus: 0, dc: 4 };
  
  let bonus = 0;
  // Rogues get +L to trap detection
  if (hero.key === 'rogue') bonus = hero.lvl;
  // Dwarves get +1 to detect stone traps
  if (hero.key === 'dwarf' && ['pit', 'blade'].includes(trapType)) bonus = 1;
  
  return { bonus, dc: trap.detectDC };
};

/**
 * Get trap disarm bonus for hero
 * @param {object} hero - Hero object
 * @param {string} trapType - Trap type key
 * @returns {object} { bonus, dc }
 */
export const getTrapDisarmBonus = (hero, trapType) => {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { bonus: 0, dc: 4 };
  
  let bonus = 0;
  // Rogues get +L to trap disarm
  if (hero.key === 'rogue') bonus = hero.lvl;
  
  return { bonus, dc: trap.disarmDC };
};

/**
 * Check door access for hero
 * @param {object} hero - Hero object
 * @param {string} doorType - Door type key
 * @returns {object} { canOpen, autoOpen, bonus }
 */
export const checkDoorAccess = (hero, doorType) => {
  const door = DOOR_TYPES[doorType];
  if (!door) return { canOpen: true, autoOpen: true, bonus: 0 };
  
  if (doorType === 'normal') return { canOpen: true, autoOpen: true, bonus: 0 };
  
  // Warriors and Barbarians auto-open stuck doors
  if (doorType === 'stuck' && ['warrior', 'barbarian'].includes(hero.key)) {
    return { canOpen: true, autoOpen: true, bonus: 0 };
  }
  
  // Rogues get bonus to pick locks
  if (doorType === 'locked' && hero.key === 'rogue') {
    return { canOpen: true, autoOpen: false, bonus: hero.lvl };
  }
  
  return { canOpen: true, autoOpen: false, bonus: 0 };
};

// ========== LEGACY COMPATIBILITY ==========
// Keep old ROOM_TABLE for backward compatibility but mark as deprecated
// This should NOT be used for room contents - use TILE_CONTENTS_TABLE instead

/**
 * @deprecated Use TILE_SHAPE_TABLE for tile shape and TILE_CONTENTS_TABLE for contents
 */
export const ROOM_TABLE = TILE_SHAPE_TABLE;

/**
 * @deprecated Use parseTileContents instead
 */
export const parseRoomResult = (result) => {
  // This function is deprecated - the new system separates shape from contents
  console.warn('parseRoomResult is deprecated. Use parseTileContents for 2d6 content rolls.');
  return { type: 'empty' };
};
