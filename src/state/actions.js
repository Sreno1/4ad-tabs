/**
 * Action type constants for the reducer
 */

// Party management
export const ADD_HERO = 'ADD_HERO';
export const DEL_HERO = 'DEL_HERO';
export const UPD_HERO = 'UPD_HERO';

// Resources
export const GOLD = 'GOLD';
export const CLUE = 'CLUE';

// Encounter tracking
export const MINOR = 'MINOR';
export const MAJOR = 'MAJOR';
export const BOSS = 'BOSS';

// Monster management
export const ADD_MONSTER = 'ADD_MONSTER';
export const UPD_MONSTER = 'UPD_MONSTER';
export const DEL_MONSTER = 'DEL_MONSTER';
export const CLEAR_MONSTERS = 'CLEAR_MONSTERS';

// Abilities
export const SET_ABILITY = 'SET_ABILITY';

// Dungeon grid
export const TOGGLE_CELL = 'TOGGLE_CELL';
export const TOGGLE_DOOR = 'TOGGLE_DOOR';
export const CLEAR_GRID = 'CLEAR_GRID';

// Logging
export const LOG = 'LOG';
export const CLEAR_LOG = 'CLEAR_LOG';
export const ARCHIVE_LOG = 'ARCHIVE_LOG'; // Archive current log and clear it

// Game state
export const RESET = 'RESET';
export const LOAD_STATE = 'LOAD_STATE';
export const RESET_CAMPAIGN = 'RESET_CAMPAIGN'; // Full reset including archive

// Adventure management (Phase 5+)
export const START_ADVENTURE = 'START_ADVENTURE';
export const END_ADVENTURE = 'END_ADVENTURE';
export const SAVE_ADVENTURE = 'SAVE_ADVENTURE';
export const NEW_ADVENTURE = 'NEW_ADVENTURE'; // Start fresh dungeon, keep party/gold/clues

// Campaign management (Phase 6)
export const START_CAMPAIGN = 'START_CAMPAIGN';
export const END_CAMPAIGN = 'END_CAMPAIGN';
export const SYNC_TO_CAMPAIGN = 'SYNC_TO_CAMPAIGN';

// Equipment (Phase 3+)
export const EQUIP_ITEM = 'EQUIP_ITEM';
export const UNEQUIP_ITEM = 'UNEQUIP_ITEM';
export const ADD_TO_INVENTORY = 'ADD_TO_INVENTORY';
export const REMOVE_FROM_INVENTORY = 'REMOVE_FROM_INVENTORY';
