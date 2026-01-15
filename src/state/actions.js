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

// Marching order
export const SET_MARCHING_ORDER = 'SET_MARCHING_ORDER';

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

// Phase 3: Door mechanics
export const SET_DOOR_TYPE = 'SET_DOOR_TYPE';
export const OPEN_DOOR = 'OPEN_DOOR';

// Phase 3: Trap mechanics
export const TRIGGER_TRAP = 'TRIGGER_TRAP';
export const DISARM_TRAP = 'DISARM_TRAP';
export const ADD_TRAP = 'ADD_TRAP';
export const CLEAR_TRAPS = 'CLEAR_TRAPS';

// Phase 3: Special rooms
export const SET_SPECIAL_ROOM = 'SET_SPECIAL_ROOM';
export const RESOLVE_SPECIAL = 'RESOLVE_SPECIAL';

// Phase 3: Passage/corridor
export const GENERATE_PASSAGE = 'GENERATE_PASSAGE';

// Phase 3: Boss room
export const SET_BOSS_ROOM = 'SET_BOSS_ROOM';
export const ENTER_BOSS_ROOM = 'ENTER_BOSS_ROOM';

// Phase 4: Save System
export const TRIGGER_SAVE_ROLL = 'TRIGGER_SAVE_ROLL';
export const RESOLVE_SAVE_ROLL = 'RESOLVE_SAVE_ROLL';
export const SET_HERO_STATUS = 'SET_HERO_STATUS';

// Phase 4: Advanced Combat
export const ADD_XP = 'ADD_XP';
export const LEVEL_UP = 'LEVEL_UP';
export const USE_SPELL = 'USE_SPELL';
export const USE_RAGE = 'USE_RAGE';
export const USE_LUCK = 'USE_LUCK';
export const USE_HEAL = 'USE_HEAL';
export const USE_BLESS = 'USE_BLESS';
export const ATTEMPT_FLEE = 'ATTEMPT_FLEE';
export const SET_MONSTER_REACTION = 'SET_MONSTER_REACTION';
export const APPLY_MONSTER_ABILITY = 'APPLY_MONSTER_ABILITY';
