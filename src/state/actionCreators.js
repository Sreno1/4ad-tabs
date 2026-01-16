/**
 * Action Creators - Simplified action dispatching
 *
 * Action creators provide a consistent API for creating action objects.
 * Benefits:
 * - Reduce boilerplate in components
 * - Centralize action structure
 * - Type safety (with JSDoc or TypeScript)
 * - Easier to refactor action payloads
 * - Better testability
 */

import * as A from './actions.js';

// ========== Party Actions ==========

/**
 * Add a hero to the party
 * @param {Object} hero - Hero object to add
 */
export const addHero = (hero) => ({ type: A.ADD_HERO, h: hero });

/**
 * Delete a hero from the party
 * @param {number} index - Hero index to remove
 */
export const deleteHero = (index) => ({ type: A.DEL_HERO, i: index });

/**
 * Update a hero's properties
 * @param {number} index - Hero index to update
 * @param {Object} updates - Properties to update
 */
export const updateHero = (index, updates) => ({ type: A.UPD_HERO, i: index, u: updates });

/**
 * Set hero status flag
 * @param {number} heroIdx - Hero index
 * @param {string} statusKey - Status key to set
 * @param {any} value - Status value
 */
export const setHeroStatus = (heroIdx, statusKey, value) => ({
  type: A.SET_HERO_STATUS,
  heroIdx,
  statusKey,
  value
});

/**
 * Add XP to a hero
 * @param {number} heroIdx - Hero index
 * @param {number} amount - XP amount to add
 */
export const addXP = (heroIdx, amount) => ({
  type: A.ADD_XP,
  heroIdx,
  amount
});

/**
 * Level up a hero
 * @param {number} heroIdx - Hero index
 */
export const levelUp = (heroIdx) => ({
  type: A.LEVEL_UP,
  heroIdx
});

/**
 * Equip an item to a hero
 * @param {number} heroIdx - Hero index
 * @param {string} itemKey - Item key to equip
 */
export const equipItem = (heroIdx, itemKey) => ({
  type: A.EQUIP_ITEM,
  heroIdx,
  itemKey
});

/**
 * Unequip an item from a hero
 * @param {number} heroIdx - Hero index
 * @param {string} itemKey - Item key to unequip
 */
export const unequipItem = (heroIdx, itemKey) => ({
  type: A.UNEQUIP_ITEM,
  heroIdx,
  itemKey
});

/**
 * Add item to hero inventory
 * @param {number} heroIdx - Hero index
 * @param {string} itemKey - Item key to add
 */
export const addToInventory = (heroIdx, itemKey) => ({
  type: A.ADD_TO_INVENTORY,
  heroIdx,
  itemKey
});

/**
 * Remove item from hero inventory
 * @param {number} heroIdx - Hero index
 * @param {number} itemIdx - Item index to remove
 */
export const removeFromInventory = (heroIdx, itemIdx) => ({
  type: A.REMOVE_FROM_INVENTORY,
  heroIdx,
  itemIdx
});

/**
 * Set marching order position
 * @param {number} position - Position (0-3)
 * @param {number} heroIdx - Hero index
 */
export const setMarchingOrder = (position, heroIdx) => ({
  type: A.SET_MARCHING_ORDER,
  position,
  heroIdx
});

// ========== Monster Actions ==========

/**
 * Add a monster to combat
 * @param {Object} monster - Monster object to add
 */
export const addMonster = (monster) => ({ type: A.ADD_MONSTER, m: monster });

/**
 * Update a monster's properties
 * @param {number} index - Monster index to update
 * @param {Object} updates - Properties to update
 */
export const updateMonster = (index, updates) => ({ type: A.UPD_MONSTER, i: index, u: updates });

/**
 * Delete a monster
 * @param {number} index - Monster index to remove
 */
export const deleteMonster = (index) => ({ type: A.DEL_MONSTER, i: index });

/**
 * Clear all monsters
 */
export const clearMonsters = () => ({ type: A.CLEAR_MONSTERS });

/**
 * Set monster reaction
 * @param {number} monsterIdx - Monster index
 * @param {string} reaction - Reaction type
 */
export const setMonsterReaction = (monsterIdx, reaction) => ({
  type: A.SET_MONSTER_REACTION,
  monsterIdx,
  reaction
});

/**
 * Apply monster ability effect
 * @param {number} monsterIdx - Monster index
 * @param {string} effect - Effect type
 * @param {any} value - Effect value
 */
export const applyMonsterAbility = (monsterIdx, effect, value) => ({
  type: A.APPLY_MONSTER_ABILITY,
  monsterIdx,
  effect,
  value
});

// ========== Encounter Tracking ==========

/**
 * Increment minor encounter count
 */
export const incrementMinorEncounter = () => ({ type: A.MINOR });

/**
 * Increment major foe count
 */
export const incrementMajorFoe = () => ({ type: A.MAJOR });

/**
 * Mark boss as encountered
 */
export const encounterBoss = () => ({ type: A.BOSS });

// ========== Ability Actions ==========

/**
 * Set ability value
 * @param {number} heroIdx - Hero index
 * @param {string} ability - Ability key
 * @param {any} value - Ability value
 */
export const setAbility = (heroIdx, ability, value) => ({
  type: A.SET_ABILITY,
  heroIdx,
  ability,
  value
});

/**
 * Use a spell
 * @param {number} heroIdx - Hero index
 */
export const useSpell = (heroIdx) => ({ type: A.USE_SPELL, heroIdx });

/**
 * Use a heal
 * @param {number} heroIdx - Hero index
 */
export const useHeal = (heroIdx) => ({ type: A.USE_HEAL, heroIdx });

/**
 * Use a blessing
 * @param {number} heroIdx - Hero index
 */
export const useBless = (heroIdx) => ({ type: A.USE_BLESS, heroIdx });

/**
 * Use luck ability
 * @param {number} heroIdx - Hero index
 */
export const useLuck = (heroIdx) => ({ type: A.USE_LUCK, heroIdx });

/**
 * Toggle rage ability
 * @param {number} heroIdx - Hero index
 * @param {boolean} active - Rage state
 */
export const useRage = (heroIdx, active) => ({
  type: A.USE_RAGE,
  heroIdx,
  active
});

/**
 * Set ability state (generic)
 * @param {number} heroIdx - Hero index
 * @param {string} key - Ability key
 * @param {any} value - Ability value
 */
export const setAbilityState = (heroIdx, key, value) => ({
  type: A.SET_ABILITY_STATE,
  heroIdx,
  key,
  value
});

/**
 * Use panache ability
 * @param {number} heroIdx - Hero index
 */
export const usePanache = (heroIdx) => ({ type: A.USE_PANACHE, heroIdx });

/**
 * Use trick ability
 * @param {number} heroIdx - Hero index
 */
export const useTrick = (heroIdx) => ({ type: A.USE_TRICK, heroIdx });

/**
 * Use prayer ability
 * @param {number} heroIdx - Hero index
 */
export const usePrayer = (heroIdx) => ({ type: A.USE_PRAYER, heroIdx });

// ========== Inventory Actions ==========

/**
 * Add or subtract gold
 * @param {number} amount - Amount to add (negative to subtract)
 */
export const adjustGold = (amount) => ({ type: A.GOLD, n: amount });

/**
 * Add or subtract clues
 * @param {number} amount - Amount to add (negative to subtract)
 */
export const adjustClues = (amount) => ({ type: A.CLUE, n: amount });

// ========== Dungeon Actions ==========

/**
 * Toggle a grid cell state
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export const toggleCell = (x, y) => ({ type: A.TOGGLE_CELL, x, y });

/**
 * Set a cell to a specific value (for drag-to-fill)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} value - Cell value (0 = empty, 1 = room, 2 = corridor)
 */
export const setCell = (x, y, value) => ({ type: A.SET_CELL, x, y, value });

/**
 * Clear the dungeon grid
 */
export const clearGrid = () => ({ type: A.CLEAR_GRID });

/**
 * Toggle a door
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} edge - Edge ('N', 'S', 'E', 'W')
 */
export const toggleDoor = (x, y, edge) => ({ type: A.TOGGLE_DOOR, x, y, edge });

/**
 * Set door type
 * @param {number} doorIdx - Door index
 * @param {string} doorType - Door type
 */
export const setDoorType = (doorIdx, doorType) => ({
  type: A.SET_DOOR_TYPE,
  doorIdx,
  doorType
});

/**
 * Open a door
 * @param {number} doorIdx - Door index
 */
export const openDoor = (doorIdx) => ({ type: A.OPEN_DOOR, doorIdx });

/**
 * Add a trap
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} trapType - Trap type
 * @param {boolean} detected - Whether trap is detected
 */
export const addTrap = (x, y, trapType, detected = false) => ({
  type: A.ADD_TRAP,
  x,
  y,
  trapType,
  detected
});

/**
 * Trigger a trap
 * @param {number} trapIdx - Trap index
 */
export const triggerTrap = (trapIdx) => ({ type: A.TRIGGER_TRAP, trapIdx });

/**
 * Disarm a trap
 * @param {number} trapIdx - Trap index
 */
export const disarmTrap = (trapIdx) => ({ type: A.DISARM_TRAP, trapIdx });

/**
 * Clear all traps
 */
export const clearTraps = () => ({ type: A.CLEAR_TRAPS });

/**
 * Set a special room
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} roomType - Room type
 */
export const setSpecialRoom = (x, y, roomType) => ({
  type: A.SET_SPECIAL_ROOM,
  x,
  y,
  roomType
});

/**
 * Resolve a special room
 * @param {number} roomIdx - Room index
 * @param {any} result - Resolution result
 */
export const resolveSpecial = (roomIdx, result) => ({
  type: A.RESOLVE_SPECIAL,
  roomIdx,
  result
});

/**
 * Set boss room location
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
export const setBossRoom = (x, y) => ({ type: A.SET_BOSS_ROOM, x, y });

/**
 * Enter boss room
 */
export const enterBossRoom = () => ({ type: A.ENTER_BOSS_ROOM });

// ========== Log Actions ==========

/**
 * Add a message to the log
 * @param {string} message - Message text
 * @param {string} type - Log entry type (combat, exploration, equipment, system)
 */
export const logMessage = (message, type = 'system') => ({ 
  type: A.LOG, 
  t: message, 
  logType: type,
  timestamp: new Date().toISOString()
});

/**
 * Clear the log
 */
export const clearLog = () => ({ type: A.CLEAR_LOG });

/**
 * Archive current log
 */
export const archiveLog = () => ({ type: A.ARCHIVE_LOG });

// ========== Campaign & Adventure Actions ==========

/**
 * Start campaign mode
 * @param {string} name - Campaign name
 */
export const startCampaign = (name) => ({ type: A.START_CAMPAIGN, name });

/**
 * End campaign mode
 */
export const endCampaign = () => ({ type: A.END_CAMPAIGN });

/**
 * Sync current state to campaign
 */
export const syncToCampaign = () => ({ type: A.SYNC_TO_CAMPAIGN });

/**
 * Start a new adventure
 * @param {string} name - Adventure name
 */
export const newAdventure = (name) => ({ type: A.NEW_ADVENTURE, name });

/**
 * Start a new adventure (alias)
 * @param {string} name - Adventure name
 */
export const startAdventure = (name) => ({ type: A.START_ADVENTURE, name });

/**
 * End current adventure
 * @param {Object} payload - Adventure results
 */
export const endAdventure = (payload) => ({ type: A.END_ADVENTURE, payload });

/**
 * Reset game state
 */
export const resetGame = () => ({ type: A.RESET });

/**
 * Reset campaign (full reset)
 */
export const resetCampaign = () => ({ type: A.RESET_CAMPAIGN });

/**
 * Load saved state
 * @param {Object} state - State object to load
 */
export const loadState = (state) => ({ type: A.LOAD_STATE, state });
