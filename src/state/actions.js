/**
 * Action type constants for the reducer
 */

// Party management
export const ADD_HERO = 'ADD_HERO';
export const DEL_HERO = 'DEL_HERO';
export const UPD_HERO = 'UPD_HERO';

// Resources
export const GOLD = 'GOLD';
export const CLUE = 'CLUE'; // Legacy: global clues (deprecated)
export const ADD_HERO_CLUE = 'ADD_HERO_CLUE'; // Add clue to specific hero (max 3)
export const REMOVE_HERO_CLUE = 'REMOVE_HERO_CLUE'; // Remove clues from hero (for spending)
export const ASSIGN_TREASURE = 'ASSIGN_TREASURE'; // Assign found treasure to heroes' carriedTreasureWeight, spillover to party gold

// Encounter tracking
export const MINOR = 'MINOR';
export const MAJOR = 'MAJOR';
export const BOSS = 'BOSS';
// Adjustable counters (allow manual +/- for header controls)
export const ADJUST_MAJOR = 'ADJUST_MAJOR';
export const ADJUST_MINOR = 'ADJUST_MINOR';

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
export const SET_CELL = 'SET_CELL'; // Set cell to specific value (0, 1, or 2)
export const CYCLE_CELL_STYLE = 'CYCLE_CELL_STYLE'; // Cycle visual style for a filled cell
export const TOGGLE_DOOR = 'TOGGLE_DOOR';
export const CLEAR_GRID = 'CLEAR_GRID';
export const SET_WALLS = 'SET_WALLS';
export const SET_DOORS = 'SET_DOORS';
export const SET_DUNGEON_STATE = 'SET_DUNGEON_STATE';

// Environment
export const CHANGE_ENVIRONMENT = 'CHANGE_ENVIRONMENT';

// Logging
export const LOG = 'LOG';
export const CLEAR_LOG = 'CLEAR_LOG';
export const ARCHIVE_LOG = 'ARCHIVE_LOG'; // Archive current log and clear it
export const SHOW_MODAL = 'SHOW_MODAL'; // Show a transient modal message
export const HIDE_MODAL = 'HIDE_MODAL'; // Hide modal
// Story beats / narrative
export const ADD_STORY_BEAT = 'ADD_STORY_BEAT';
export const DEL_STORY_BEAT = 'DEL_STORY_BEAT';
export const UPD_STORY_BEAT = 'UPD_STORY_BEAT';

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
export const USE_BANDAGE = 'USE_BANDAGE';
export const USE_BLESS = 'USE_BLESS';
export const ATTEMPT_FLEE = 'ATTEMPT_FLEE';
export const SET_MONSTER_REACTION = 'SET_MONSTER_REACTION';
export const APPLY_MONSTER_ABILITY = 'APPLY_MONSTER_ABILITY';

// Scroll casting (Phase 7d)
export const USE_SCROLL = 'USE_SCROLL';
export const COPY_SCROLL = 'COPY_SCROLL';
export const ADD_LEARNED_SPELL = 'ADD_LEARNED_SPELL';

// Advanced Class Abilities (Phase 7c)
export const SET_ABILITY_STATE = 'SET_ABILITY_STATE';
export const USE_PANACHE = 'USE_PANACHE';
export const USE_TRICK = 'USE_TRICK';
export const USE_PRAYER = 'USE_PRAYER';

// Light source (darkness mechanics)
export const TOGGLE_LIGHT_SOURCE = 'TOGGLE_LIGHT_SOURCE';

// Combat location (corridor/room restrictions)
export const SET_COMBAT_LOCATION = 'SET_COMBAT_LOCATION';
export const CLEAR_COMBAT_LOCATION = 'CLEAR_COMBAT_LOCATION';
// Wandering encounter meta (used to mark ambushes and shield restrictions)
export const SET_WANDERING_ENCOUNTER = 'SET_WANDERING_ENCOUNTER';
export const CLEAR_WANDERING_ENCOUNTER = 'CLEAR_WANDERING_ENCOUNTER';

// Tile exploration
export const MARK_TILE_SEARCHED = 'MARK_TILE_SEARCHED';

// Weapon switching (turn cost)
export const SWITCH_WEAPON = 'SWITCH_WEAPON';

// Ranged engagement (first round restriction)
export const SET_RANGED_ENGAGEMENT = 'SET_RANGED_ENGAGEMENT';
