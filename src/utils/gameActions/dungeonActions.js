/**
 * Dungeon Actions - Doors, traps, special rooms, corridors, puzzles, and boss room
 */
import { d6 } from '../dice.js';
import {
  DOOR_TYPE_TABLE,
  DOOR_TYPES,
  TRAP_TABLE,
  TRAP_TYPES,
  SPECIAL_FEATURE_TABLE,
  SPECIAL_ROOMS,
  PUZZLE_TABLE,
  PUZZLE_TYPES,
  CORRIDOR_DIRECTION_TABLE,
  CORRIDOR_LENGTH_TABLE,
  PASSAGE_CONTENTS_TABLE,
  getTrapDetectionBonus,
  getTrapDisarmBonus,
  checkDoorAccess,
} from '../../data/rooms.js';
import { rollWanderingMonster, spawnMajorFoe } from './monsterActions.js';
import { rollTreasure } from './treasureActions.js';

/**
 * Roll for door type
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Door info
 */
export const rollDoorType = (dispatch) => {
  const roll = d6();
  const typeKey = DOOR_TYPE_TABLE[roll];
  const type = DOOR_TYPES[typeKey];

  dispatch({ type: 'LOG', t: `Door Type d6=${roll}: ${type.name}` });

  return { roll, typeKey, ...type };
};

/**
 * Attempt to open a door
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting to open
 * @param {string} doorType - Door type key
 * @returns {object} Result of attempt
 */
export const attemptOpenDoor = (dispatch, hero, doorType) => {
  const door = DOOR_TYPES[doorType];
  if (!door) return { success: true, message: 'Door opens' };

  // Normal doors always open
  if (doorType === 'normal') {
    dispatch({ type: 'LOG', t: `${hero.name} opens the door freely.` });
    return { success: true, message: 'Door opens freely' };
  }

  // Check for auto-open (Warrior/Barbarian for stuck doors)
  const access = checkDoorAccess(hero, doorType);
  if (access.autoOpen) {
    dispatch({ type: 'LOG', t: `${hero.name} forces open the ${door.name}!` });
    return { success: true, message: `${hero.name} forces it open!` };
  }

  // Roll to open
  const roll = d6();
  const total = roll + access.bonus;
  const success = total >= door.openDC;

  const message = success
    ? `${hero.name} opens the ${door.name}! (${roll}+${access.bonus}=${total} vs DC${door.openDC})`
    : `${hero.name} fails to open the ${door.name}. (${roll}+${access.bonus}=${total} vs DC${door.openDC})`;

  dispatch({ type: 'LOG', t: message });

  return { success, roll, total, dc: door.openDC, message };
};

/**
 * Generate a random trap
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Trap info
 */
export const rollTrap = (dispatch) => {
  const roll = d6();
  const typeKey = TRAP_TABLE[roll];
  const trap = TRAP_TYPES[typeKey];

  dispatch({ type: 'LOG', t: `⚠️ Trap detected: ${trap.name}!` });

  return { roll, typeKey, ...trap };
};

/**
 * Attempt to detect a trap
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero searching for traps
 * @param {string} trapType - Trap type key (if known)
 * @returns {object} Detection result
 */
export const attemptDetectTrap = (dispatch, hero, trapType = null) => {
  // If trap type unknown, roll it
  const roll = d6();
  const actualTrapType = trapType || TRAP_TABLE[d6()];
  const trap = TRAP_TYPES[actualTrapType];

  const { bonus, dc } = getTrapDetectionBonus(hero, actualTrapType);
  const total = roll + bonus;
  const detected = total >= dc;

  const message = detected
    ? `🔍 ${hero.name} detects a ${trap.name}! (${roll}+${bonus}=${total} vs DC${dc})`
    : `${hero.name} searches but finds nothing suspicious. (${roll}+${bonus}=${total} vs DC${dc})`;

  dispatch({ type: 'LOG', t: message });

  return { detected, roll, total, dc, trapType: actualTrapType, trap };
};

/**
 * Attempt to disarm a trap
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting disarm
 * @param {string} trapType - Trap type key
 * @returns {object} Disarm result
 */
export const attemptDisarmTrap = (dispatch, hero, trapType) => {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { success: false, message: 'Unknown trap type' };

  const roll = d6();
  const { bonus, dc } = getTrapDisarmBonus(hero, trapType);
  const total = roll + bonus;
  const success = total >= dc;

  if (success) {
    dispatch({
      type: 'LOG',
      t: `🔧 ${hero.name} disarms the ${trap.name}! (${roll}+${bonus}=${total} vs DC${dc})`,
    });
    return { success: true, roll, total, dc, message: `Trap disarmed!` };
  } else {
    dispatch({
      type: 'LOG',
      t: `💥 ${hero.name} fails to disarm and triggers the ${trap.name}! (${roll}+${bonus}=${total} vs DC${dc})`,
    });
    return {
      success: false,
      roll,
      total,
      dc,
      triggered: true,
      message: `Trap triggered!`,
    };
  }
};

/**
 * Trigger a trap (deal damage, apply effects)
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero hit by trap
 * @param {string} trapType - Trap type key
 * @returns {object} Trap effect result
 */
export const triggerTrap = (dispatch, hero, trapType) => {
  const trap = TRAP_TYPES[trapType];
  if (!trap) return { damage: 0 };

  const damage = trap.damage;
  const effect = trap.effect;

  if (damage > 0) {
    dispatch({
      type: 'UPD_HERO',
      i: hero.index,
      u: { hp: Math.max(0, hero.hp - damage) },
    });
    dispatch({
      type: 'LOG',
      t: `💀 ${hero.name} takes ${damage} damage from ${trap.name}!`,
    });
  }

  // Handle special effects
  if (effect === 'poison') {
    dispatch({ type: 'LOG', t: `☠️ ${hero.name} is poisoned!` });
  } else if (effect === 'wandering') {
    dispatch({ type: 'LOG', t: `🔔 The alarm attracts wandering monsters!` });
    rollWanderingMonster(dispatch);
  } else if (effect === 'teleport') {
    dispatch({
      type: 'LOG',
      t: `✨ ${hero.name} is teleported back to the entrance!`,
    });
  }

  return { damage, effect, trap };
};

/**
 * Roll for special room type
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Special room info
 */
export const rollSpecialRoom = (dispatch) => {
  const roll = d6();
  const typeKey = SPECIAL_FEATURE_TABLE[roll];
  const room = SPECIAL_ROOMS[typeKey];

  dispatch({ type: 'LOG', t: `✨ Special Feature: ${room.name}` });
  dispatch({ type: 'LOG', t: `📜 ${room.description}` });

  return { roll, typeKey, ...room };
};

/**
 * Make offering at shrine
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero making offering
 * @param {number} goldPaid - Gold offered
 * @returns {object} Shrine result
 */
export const interactShrine = (dispatch, hero, goldPaid = 0) => {
  if (goldPaid < 1) {
    dispatch({
      type: 'LOG',
      t: `The shrine requires an offering of at least 1 gold.`,
    });
    return { success: false, message: 'Requires 1 gold offering' };
  }

  dispatch({ type: 'GOLD', n: -1 });
  const roll = d6();

  let result;
  if (roll <= 2) {
    result = 'curse';
    dispatch({ type: 'LOG', t: `😱 The shrine curses ${hero.name}! -1 Life` });
  } else if (roll <= 4) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The shrine accepts the offering silently.` });
  } else {
    result = 'blessing';
    dispatch({ type: 'LOG', t: `✨ The shrine blesses ${hero.name}! +1 Life` });
  }

  return {
    roll,
    result,
    message:
      result === 'curse'
        ? '-1 Life'
        : result === 'blessing'
          ? '+1 Life'
          : 'Nothing happens',
  };
};

/**
 * Drink from a fountain
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero drinking
 * @returns {object} Fountain result
 */
export const interactFountain = (dispatch, hero) => {
  const roll = d6();

  let result,
    healing = 0;
  if (roll === 1) {
    result = 'poison';
    healing = -1;
    dispatch({
      type: 'LOG',
      t: `☠️ The fountain is poisoned! ${hero.name} takes 1 damage.`,
    });
  } else if (roll <= 3) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The water is stale but harmless.` });
  } else if (roll <= 5) {
    result = 'heal';
    healing = 1;
    dispatch({ type: 'LOG', t: `💧 The fountain heals ${hero.name}! +1 Life` });
  } else {
    result = 'full_heal';
    healing = 999; // Will be capped to max HP
    dispatch({
      type: 'LOG',
      t: `✨ Magical waters! ${hero.name} is fully healed!`,
    });
  }

  return { roll, result, healing, message: result };
};

/**
 * Search a statue
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero searching
 * @returns {object} Statue result
 */
export const interactStatue = (dispatch, hero) => {
  const roll = d6();

  let result;
  if (roll <= 2) {
    result = 'trap';
    dispatch({
      type: 'LOG',
      t: `⚠️ The statue is trapped! Roll on trap table...`,
    });
    return { roll, result, triggered: true };
  } else if (roll <= 4) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The statue is just a statue. Nothing hidden.` });
  } else {
    result = 'treasure';
    dispatch({
      type: 'LOG',
      t: `💎 ${hero.name} finds treasure hidden in the statue!`,
    });
    rollTreasure(dispatch);
  }

  return { roll, result };
};

/**
 * Make offering at altar
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} goldPaid - Gold offered
 * @returns {object} Altar result
 */
export const interactAltar = (dispatch, goldPaid = 0) => {
  if (goldPaid < 2) {
    dispatch({ type: 'LOG', t: `The altar demands a sacrifice of 2 gold.` });
    return { success: false, message: 'Requires 2 gold sacrifice' };
  }

  dispatch({ type: 'GOLD', n: -2 });
  const roll = d6();

  let result;
  if (roll <= 3) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The altar consumes the gold. Nothing happens.` });
  } else if (roll <= 5) {
    result = 'clue';
    dispatch({ type: 'CLUE', n: 1 });
    dispatch({ type: 'LOG', t: `🔮 A vision reveals a clue!` });
  } else {
    result = 'magic_item';
    dispatch({ type: 'LOG', t: `✨ A magic item materializes!` });
  }

  return { roll, result };
};

/**
 * Search a library
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero searching
 * @returns {object} Library result
 */
export const interactLibrary = (dispatch, hero) => {
  const roll = d6();

  let result;
  if (roll <= 2) {
    result = 'trap';
    dispatch({
      type: 'LOG',
      t: `📖 A trapped book! ${hero.name} takes 1 damage.`,
    });
  } else if (roll <= 4) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The books are too damaged to read.` });
  } else {
    result = 'clue';
    dispatch({ type: 'CLUE', n: 1 });
    dispatch({
      type: 'LOG',
      t: `📚 ${hero.name} finds useful information! +1 Clue`,
    });
  }

  return { roll, result };
};

/**
 * Search an armory
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero searching
 * @returns {object} Armory result
 */
export const interactArmory = (dispatch, hero) => {
  const roll = d6();

  let result;
  if (roll <= 2) {
    result = 'rusty';
    dispatch({ type: 'LOG', t: `Everything here is rusted and useless.` });
  } else if (roll <= 4) {
    result = 'weapon';
    dispatch({
      type: 'LOG',
      t: `⚔️ ${hero.name} finds a weapon! +1 to next attack.`,
    });
  } else {
    result = 'shield';
    dispatch({
      type: 'LOG',
      t: `🛡️ ${hero.name} finds a shield! +1 to next defense.`,
    });
  }

  return { roll, result };
};

/**
 * Roll puzzle type
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Puzzle info
 */
export const rollPuzzle = (dispatch) => {
  const roll = d6();
  const typeKey = PUZZLE_TABLE[roll];
  const puzzle = PUZZLE_TYPES[typeKey];

  dispatch({ type: 'LOG', t: `🧩 Puzzle Room: ${puzzle.name}` });
  dispatch({ type: 'LOG', t: `📜 ${puzzle.description}` });

  return { roll, typeKey, ...puzzle };
};

/**
 * Attempt to solve a puzzle
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting
 * @param {string} puzzleType - Puzzle type key
 * @returns {object} Puzzle result
 */
export const attemptPuzzle = (dispatch, hero, puzzleType) => {
  const puzzle = PUZZLE_TYPES[puzzleType];
  if (!puzzle) return { success: false };

  const roll = d6();
  let bonus = 0;

  // Class bonuses for puzzles
  if (puzzleType === 'riddle' && ['wizard', 'elf'].includes(hero.key)) {
    bonus = hero.lvl;
  } else if (
    puzzleType === 'pressure' &&
    ['rogue', 'halfling'].includes(hero.key)
  ) {
    bonus = hero.lvl;
  }

  const total = roll + bonus;
  const success = total >= puzzle.successDC;

  dispatch({
    type: 'LOG',
    t: `${hero.name} attempts the ${puzzle.name}: ${roll}+${bonus}=${total} vs DC${puzzle.successDC}`,
  });

  if (success) {
    dispatch({ type: 'LOG', t: `✅ ${hero.name} solves the puzzle!` });
    // Many puzzles give clues on success
    if (['riddle', 'symbol'].includes(puzzleType)) {
      dispatch({ type: 'CLUE', n: 1 });
    }
  } else {
    dispatch({ type: 'LOG', t: `❌ ${hero.name} fails the puzzle.` });
  }

  return { success, roll, total, dc: puzzle.successDC };
};

/**
 * Generate a corridor/passage
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Corridor info
 */
export const generateCorridor = (dispatch) => {
  const dirRoll = d6();
  const lenRoll = d6();
  const contentsRoll = d6();

  const direction = CORRIDOR_DIRECTION_TABLE[dirRoll];
  const length = CORRIDOR_LENGTH_TABLE[lenRoll];
  const contents = PASSAGE_CONTENTS_TABLE[contentsRoll];

  dispatch({
    type: 'LOG',
    t: `🚪 Passage: ${direction}, ${length} squares long`,
  });

  if (contents === 'door') {
    dispatch({ type: 'LOG', t: `A door at the end of the passage.` });
  } else if (contents === 'trap') {
    dispatch({ type: 'LOG', t: `⚠️ There's a trap in the passage!` });
  } else if (contents === 'wandering') {
    dispatch({ type: 'LOG', t: `👹 Wandering monster in the passage!` });
    rollWanderingMonster(dispatch);
  }

  return { direction, length, contents, dirRoll, lenRoll, contentsRoll };
};

/**
 * Check if party can enter boss room
 * @param {number} clues - Number of clues found
 * @returns {object} Access info
 */
export const checkBossRoomAccess = (clues) => {
  const minClues = 3;
  const canEnter = clues >= minClues;

  let bonus = 0;
  if (clues >= 6) bonus = 3;
  else if (clues >= 5) bonus = 2;
  else if (clues >= 4) bonus = 1;

  return {
    canEnter,
    clues,
    required: minClues,
    bonus,
    message: canEnter
      ? `You have ${clues} clues. The boss room is accessible!${bonus > 0 ? ` (+${bonus} attack bonus)` : ''}`
      : `You need ${minClues} clues to find the boss room. You have ${clues}.`,
  };
};

/**
 * Enter the boss room
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} clues - Number of clues
 * @param {number} hcl - Party HCL
 * @returns {object} Boss room entry result
 */
export const enterBossRoom = (dispatch, clues, hcl) => {
  const access = checkBossRoomAccess(clues);

  if (!access.canEnter) {
    dispatch({ type: 'LOG', t: `❌ ${access.message}` });
    return { success: false, ...access };
  }

  dispatch({ type: 'LOG', t: `🏰 Entering the Boss Room!` });
  dispatch({ type: 'LOG', t: access.message });

  // Spawn the boss
  spawnMajorFoe(dispatch, hcl, true);
  dispatch({ type: 'BOSS' });

  return { success: true, ...access };
};
