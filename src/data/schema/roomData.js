/**
 * Room and Exploration Data - Tiles, contents, doors, traps, special features
 * Complete dungeon exploration tables for Four Against Darkness
 */

/**
 * Tile Shape Table (d66) - Determines room/corridor layout
 */
export const TILE_SHAPE_TABLE = {
  11: { type: 'corridor' }, 12: { type: 'corridor' }, 13: { type: 'corridor' }, 14: { type: 'corridor' }, 15: { type: 'room' }, 16: { type: 'room' },
  21: { type: 'room' }, 22: { type: 'room' }, 23: { type: 'room' }, 24: { type: 'room' }, 25: { type: 'room' }, 26: { type: 'corridor' },
  31: { type: 'room' }, 32: { type: 'corridor' }, 33: { type: 'corridor' }, 34: { type: 'room' }, 35: { type: 'room' }, 36: { type: 'room' },
  41: { type: 'room' }, 42: { type: 'corridor' }, 43: { type: 'room' }, 44: { type: 'room' }, 45: { type: 'corridor' }, 46: { type: 'room' },
  51: { type: 'corridor' }, 52: { type: 'room' }, 53: { type: 'corridor' }, 54: { type: 'room' }, 55: { type: 'corridor' }, 56: { type: 'room' },
  61: { type: 'room' }, 62: { type: 'corridor' }, 63: { type: 'corridor' }, 64: { type: 'room' }, 65: { type: 'corridor' }, 66: { type: 'room' }
};

/**
 * Tile Contents Table (2d6) - What's in the tile
 */
export const TILE_CONTENTS_TABLE = {
  2: { type: 'treasure', corridorDescription: 'Treasure!', roomDescription: 'Treasure!' },
  3: { type: 'treasure', corridorDescription: 'Treasure protected by a trap', roomDescription: 'Treasure protected by a trap' },
  4: { type: 'special_event', corridorDescription: 'Empty', roomDescription: 'Special Events', corridorType: 'empty', roomType: 'special_event' },
  5: { type: 'special_feature', corridorDescription: 'Empty and may be searched', roomDescription: 'Empty and may be searched. Roll on Special Feature table', corridorType: 'empty', roomType: 'special_feature' },
  6: { type: 'vermin', corridorDescription: 'Roll on Vermin Table', roomDescription: 'Roll on Vermin Table' },
  7: { type: 'minions', corridorDescription: 'Roll on Minion Table', roomDescription: 'Roll on Minion Table' },
  8: { type: 'minions', corridorDescription: 'Empty', roomDescription: 'Minion encounter', corridorType: 'empty', roomType: 'minions' },
  9: { type: 'empty', corridorDescription: 'May search, or spend 2 clues for secret passage', roomDescription: 'May search, or spend 2 clues for secret passage' },
  10: { type: 'weird_monster', corridorDescription: 'Empty', roomDescription: 'Weird Monster', corridorType: 'empty', roomType: 'weird_monster' },
  11: { type: 'major_foe', corridorDescription: 'Major Foe / Boss Encounter', roomDescription: 'Major Foe / Boss Encounter' },
  12: { type: 'dragon', corridorDescription: 'Empty', roomDescription: "Dragon's Lair", corridorType: 'empty', roomType: 'dragon' }
};

/**
 * Boss Rules
 */
export const BOSS_RULES = {
  rollRequired: 6,
  bonusLife: 1,
  bonusAttack: 1,
  treasureMultiplier: 3,
  description: 'Roll d6 + number of major foes faced. On 6+, this is the Boss!'
};

/**
 * Door Types
 */
export const DOOR_TYPES = {
  normal: { name: 'Normal Door', openDC: 0, description: 'Opens freely' },
  stuck: { name: 'Stuck Door', openDC: 4, description: 'Needs d6 ≥ 4 or Warrior/Barbarian auto-open' },
  locked: { name: 'Locked Door', openDC: 5, requiresKey: true, description: 'Rogue can pick (d6+L ≥ 5) or use a key' },
  trapped: { name: 'Trapped Door', openDC: 4, hasTrap: true, description: 'Contains a trap' },
  secret: { name: 'Secret Door', openDC: 5, hidden: true, description: 'Only found by searching (d6 ≥ 5)' }
};

/**
 * Door Type Table (d6)
 */
export const DOOR_TYPE_TABLE = {
  1: 'normal', 2: 'normal', 3: 'stuck', 4: 'stuck', 5: 'locked', 6: 'trapped'
};

/**
 * Trap Types
 */
export const TRAP_TYPES = {
  // Dungeon Traps
  pit: { name: 'Pit Trap', damage: 1, detectDC: 4, disarmDC: 4, description: 'Fall into a pit! -1 Life' },
  dart: { name: 'Dart Trap', damage: 1, detectDC: 5, disarmDC: 4, description: 'Poisoned darts! -1 Life' },
  blade: { name: 'Blade Trap', damage: 2, detectDC: 5, disarmDC: 5, description: 'Swinging blades! -2 Life' },
  poison: { name: 'Poison Gas Trap', damage: 1, effect: 'poison', detectDC: 6, disarmDC: 5, description: 'Poison gas fills the room!' },
  alarm: { name: 'Alarm Trap', damage: 0, effect: 'wandering', detectDC: 4, disarmDC: 3, description: 'Alert! Triggers a wandering monster' },

  // Caverns Traps
  stalactite: { name: 'Falling Stalactite', damage: 1, detectDC: 4, disarmDC: 4, description: 'A stalactite falls from above' },
  rockslide: { name: 'Rockslide', damage: 1, detectDC: 4, disarmDC: 4, description: 'Loose stones cascade' },
  hidden_pit: { name: 'Hidden Pit', damage: 1, detectDC: 4, disarmDC: 4, description: 'A concealed pit opens underfoot' },
  swinging_log: { name: 'Swinging Log', damage: 2, detectDC: 4, disarmDC: 4, description: 'A heavy log swings down' },
  toxic_spores: { name: 'Toxic Spores', damage: 0, effect: 'poison', detectDC: 4, disarmDC: 4, description: 'Mushrooms release toxic spores' },
  rolling_boulder: { name: 'Rolling Boulder', damage: 2, detectDC: 4, disarmDC: 4, description: 'A massive boulder rolls through' },

  // Fungal Grottoes Traps
  sleep_spores: { name: 'Sleep Spores', damage: 0, effect: 'sleep_spores', detectDC: 4, disarmDC: 4, description: 'Spores threaten to put party to sleep' },
  spore_cloud: { name: 'Spore Cloud', damage: 1, effect: 'poison', detectDC: 4, disarmDC: 4, description: 'A toxic spore cloud erupts' },
  slime_patch: { name: 'Slime Patch', damage: 0, effect: 'wandering', detectDC: 4, disarmDC: 4, description: 'Slippery slime risks wandering encounter' },
  mycelium_snare: { name: 'Mycelium Snare', damage: 0, effect: 'snare', detectDC: 4, disarmDC: 4, description: 'Fungal fibers snatch gear' },
  shrieking_mushroom: { name: 'Shrieking Mushroom', damage: 0, effect: 'wandering', detectDC: 4, disarmDC: 4, description: 'A shriek risks drawing monsters' },
  cordyceps: { name: 'Cordyceps Trap', damage: 0, effect: 'mind_control', detectDC: 4, disarmDC: 4, description: 'Parasitic fungus attempts to control a hero' }
};

/**
 * Trap Tables by Environment
 */
export const DUNGEON_TRAP_TABLE = { 1: 'pit', 2: 'dart', 3: 'dart', 4: 'blade', 5: 'poison', 6: 'alarm' };
export const CAVERNS_TRAP_TABLE = { 1: 'stalactite', 2: 'rockslide', 3: 'hidden_pit', 4: 'swinging_log', 5: 'toxic_spores', 6: 'rolling_boulder' };
export const FUNGAL_TRAP_TABLE = { 1: 'sleep_spores', 2: 'spore_cloud', 3: 'slime_patch', 4: 'mycelium_snare', 5: 'shrieking_mushroom', 6: 'cordyceps' };

export const TRAP_TABLES = {
  dungeon: DUNGEON_TRAP_TABLE,
  caverns: CAVERNS_TRAP_TABLE,
  fungal_grottoes: FUNGAL_TRAP_TABLE
};

/**
 * Special Features
 */
export const SPECIAL_FEATURES = {
  shrine: { name: 'Shrine', description: 'Make offering (1 gold) → d6: 1-2 curse, 3-4 nothing, 5-6 blessing', requiresGold: 1 },
  fountain: { name: 'Fountain', description: 'Drink? d6: 1 poison, 2-3 nothing, 4-5 heal 1, 6 full heal' },
  statue: { name: 'Statue', description: 'Search it: d6: 1-2 trap, 3-4 nothing, 5-6 treasure' },
  altar: { name: 'Altar', description: 'Sacrifice 2 gold → d6: 1-3 nothing, 4-5 clue, 6 magic item', requiresGold: 2 },
  library: { name: 'Library', description: 'Search: d6: 1-2 trapped book, 3-4 nothing, 5-6 clue' },
  armory: { name: 'Armory', description: 'Search: d6: 1-2 rusty, 3-4 weapon bonus, 5-6 shield bonus' }
};

export const CAVERN_SPECIAL_FEATURES = {
  stalactites: { name: 'Stalactites', description: 'Explosive attacks may drop stalactites' },
  stalagmites: { name: 'Stalagmites', description: 'Hinder movement; PCs cannot explode attacks' },
  boulders: { name: 'Boulders', description: '+1 Defense vs ranged, -1 to ranged attacks' },
  echo: { name: 'Echo', description: 'Stealth at -1; wandering monsters more likely' },
  water_pools: { name: 'Water Pools', description: 'Roll on Water Pool table' }
};

export const FUNGAL_SPECIAL_FEATURES = {
  secret_passage: { name: 'Secret Passage', description: 'Hidden passage to different environment', effect: 'secret_passage' }
};

/**
 * Special Feature Tables
 */
export const SPECIAL_FEATURE_TABLE = { 1: 'shrine', 2: 'fountain', 3: 'statue', 4: 'altar', 5: 'library', 6: 'armory' };
export const CAVERN_SPECIAL_FEATURE_TABLE = { 1: 'stalactites', 2: 'stalagmites', 3: 'boulders', 4: 'echo', 5: 'water_pools', 6: 'water_pools' };
export const FUNGAL_SPECIAL_FEATURE_TABLE = { 1: 'secret_passage', 2: 'secret_passage', 3: 'secret_passage', 4: 'secret_passage', 5: 'secret_passage', 6: 'secret_passage' };

export const SPECIAL_FEATURE_TABLES = {
  dungeon: SPECIAL_FEATURE_TABLE,
  caverns: CAVERN_SPECIAL_FEATURE_TABLE,
  fungal_grottoes: FUNGAL_SPECIAL_FEATURE_TABLE
};

export const SPECIAL_FEATURES_BY_ENV = {
  dungeon: SPECIAL_FEATURES,
  caverns: CAVERN_SPECIAL_FEATURES,
  fungal_grottoes: FUNGAL_SPECIAL_FEATURES
};

/**
 * Water Pool Table
 */
export const WATER_POOL_TABLE = {
  1: 'Contaminated water: -1 to Saves until healed.',
  2: 'No effect.',
  3: 'No effect.',
  4: 'No effect.',
  5: 'Refreshing water: heal 1 Life (once per adventure).',
  6: 'Refreshing water: heal 1 Life (once per adventure).'
};

/**
 * Special Events Tables
 */
export const SPECIAL_EVENTS_TABLES = {
  dungeon: [
    null,
    { key: 'ghost', name: 'Ghost', description: 'Ghost passes through; fear or madness save' },
    { key: 'wandering', name: 'Wandering Monsters', description: 'Wandering Monsters attack!', effect: 'wandering' },
    { key: 'lady', name: 'Lady in White', description: 'A Lady in White offers a quest' },
    { key: 'trap', name: 'Trap', description: 'Roll on Trap table', effect: 'trap' },
    { key: 'healer', name: 'Wandering Healer', description: 'Heal for 10gp per Life (once per adventure)' },
    { key: 'alchemist', name: 'Wandering Alchemist', description: 'Buy potions or poison (once per adventure)' }
  ],
  caverns: [
    null,
    { key: 'goblin_scout', name: 'Cave Goblin Scout', description: 'Pay 10gp to avoid surprise and gain +1 Saves' },
    { key: 'cavemen', name: 'Cavemen Explorers', description: 'Give 2 Food rations or fight d6 cavemen' },
    { key: 'morlock_spy', name: 'Morlock Spy', description: 'Pay 5gp to avoid surprise by morlocks' },
    { key: 'trap', name: 'Trap', description: 'Roll on Caverns Trap table', effect: 'trap' },
    { key: 'dwarf_gem', name: 'Dwarven Find', description: 'If dwarf present, find gem worth d6x10gp' },
    { key: 'dwarf_miner', name: 'Dwarf Miner', description: 'Trade gems; reveals next tile contents' }
  ],
  fungal_grottoes: [
    null,
    { key: 'halfling_scout', name: 'Halfling Scout', description: 'Pay 10gp to avoid surprise and gain +1 Saves' },
    { key: 'cavemen_mushrooms', name: 'Hungry Cavemen', description: 'Give 4 Food rations or 1 rare mushroom, or fight' },
    { key: 'spore_cloud', name: 'Spore Cloud', description: 'All living PCs save vs HCL poison or lose 2 Life' },
    { key: 'trap', name: 'Trap', description: 'Roll on Fungal Trap table, then Rare Item table', effect: 'trap' },
    { key: 'mushroom_monk', name: 'Mushroom Monk Warning', description: 'If mushroom monk present, ignore next trap/wandering' },
    { key: 'merchant', name: 'Merchant', description: 'Buy items at +20%; sell gems/rare mushrooms at full value' }
  ]
};

/**
 * Helper Functions
 */
export function parseTileContents(roll) {
  return TILE_CONTENTS_TABLE[roll] || { type: 'empty', description: 'Empty' };
}

export function getTrap(trapType) {
  return TRAP_TYPES[trapType] || null;
}

export function getDoorType(doorKey) {
  return DOOR_TYPES[doorKey] || null;
}

export function getTrapDetectionBonus(hero, trapType) {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { bonus: 0, dc: 4 };

  let bonus = 0;
  if (hero.key === 'rogue') bonus = hero.lvl;
  if (hero.key === 'dwarf' && ['pit', 'blade'].includes(trapType)) bonus = 1;

  return { bonus, dc: trap.detectDC };
}

export function getTrapDisarmBonus(hero, trapType) {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { bonus: 0, dc: 4 };

  let bonus = 0;
  if (hero.key === 'rogue') bonus = hero.lvl;

  return { bonus, dc: trap.disarmDC };
}

export function checkDoorAccess(hero, doorType) {
  const door = DOOR_TYPES[doorType];
  if (!door) return { canOpen: true, autoOpen: true, bonus: 0 };

  if (doorType === 'normal') return { canOpen: true, autoOpen: true, bonus: 0 };

  if (doorType === 'stuck' && ['warrior', 'barbarian'].includes(hero.key)) {
    return { canOpen: true, autoOpen: true, bonus: 0 };
  }

  if (doorType === 'locked' && hero.key === 'rogue') {
    return { canOpen: true, autoOpen: false, bonus: hero.lvl };
  }

  return { canOpen: true, autoOpen: false, bonus: 0 };
}

export function checkForBoss(majorFoesFaced, roll, options = {}) {
  const { isLastTile = false } = options;

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
}

export default {
  TILE_SHAPE_TABLE,
  TILE_CONTENTS_TABLE,
  BOSS_RULES,
  DOOR_TYPES,
  DOOR_TYPE_TABLE,
  TRAP_TYPES,
  TRAP_TABLES,
  SPECIAL_FEATURES,
  SPECIAL_FEATURE_TABLES,
  SPECIAL_FEATURES_BY_ENV,
  WATER_POOL_TABLE,
  SPECIAL_EVENTS_TABLES,
  parseTileContents,
  getTrap,
  getDoorType,
  getTrapDetectionBonus,
  getTrapDisarmBonus,
  checkDoorAccess,
  checkForBoss
};
