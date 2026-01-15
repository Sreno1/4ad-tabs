/**
 * Game action helpers - shared logic for spawning monsters, rolling treasure, etc.
 * Eliminates duplicate code across components
 */
import { d6, r2d6, explodingD6 } from './dice.js';
import { createMonster, WANDERING_TABLE, rollReaction, applyMonsterAbility, getXPForNextLevel, canLevelUp } from '../data/monsters.js';
import { TREASURE_TABLE } from '../data/treasure.js';
import { 
  DOOR_TYPE_TABLE, DOOR_TYPES,
  TRAP_TABLE, TRAP_TYPES,
  SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS,
  PUZZLE_TABLE, PUZZLE_TYPES,
  CORRIDOR_DIRECTION_TABLE, CORRIDOR_LENGTH_TABLE, PASSAGE_CONTENTS_TABLE,
  getTrapDetectionBonus, getTrapDisarmBonus, checkDoorAccess
} from '../data/rooms.js';
import { getSaveThreshold, getSaveModifier, getRerollOptions, isLifeThreatening, rollSave } from '../data/saves.js';
import { SPELLS, getAvailableSpells, getSpellSlots, castSpell } from '../data/spells.js';
import { calculateEquipmentBonuses } from '../data/equipment.js';
import { getTier, getFlurryAttacks } from '../data/classes.js';

/**
 * Spawn a monster and dispatch it to state
 * @param {function} dispatch - Reducer dispatch function
 * @param {string} type - Monster template key
 * @param {number} level - Override level (optional)
 */
export const spawnMonster = (dispatch, type, level = null) => {
  const monster = createMonster(type, level);
  if (!monster) return;
  
  dispatch({ type: 'ADD_MONSTER', m: monster });
  
  // Log message - show count for Minor Foes, HP for others
  if (monster.isMinorFoe && monster.count) {
    dispatch({ type: 'LOG', t: `${monster.count} ${monster.name} L${monster.level} appear!` });
  } else {
    dispatch({ type: 'LOG', t: `${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
  }
};

/**
 * Spawn a Major Foe, with boss check already done
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} hcl - Party HCL (Hero Challenge Level)
 * @param {boolean} isBoss - Whether this is THE BOSS (gets +1 Life, +1 Attack, 3x treasure)
 */
export const spawnMajorFoe = (dispatch, hcl, isBoss = false) => {
  const monster = createMonster('major', hcl);
  if (!monster) return;
  
  if (isBoss) {
    // Boss gets +1 Life, +1 Attack
    monster.hp += 1;
    monster.maxHp += 1;
    monster.attack = (monster.attack || 0) + 1;
    monster.isBoss = true;
    monster.treasureMultiplier = 3; // 3x treasure
    monster.name = `${monster.name} [BOSS]`;
  }
  
  dispatch({ type: 'ADD_MONSTER', m: monster });
  
  if (isBoss) {
    dispatch({ type: 'LOG', t: `👑 ${monster.name} L${monster.level} (${monster.hp}HP, +1 ATK) appears! THE BOSS!` });
  } else {
    dispatch({ type: 'LOG', t: `⚔️ ${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
  }
};

/**
 * Roll on wandering monster table and spawn result
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Roll result info
 */
export const rollWanderingMonster = (dispatch) => {
  const roll = d6();
  const monsterType = WANDERING_TABLE[roll];
  
  if (roll >= 1 && roll <= 5) {
    spawnMonster(dispatch, monsterType, roll);
  }
  
  const displayNames = ['', 'Goblin (L1)', 'Orc (L2)', 'Troll (L3)', 'Ogre (L4)', 'Dragon (L5)', 'Special'];
  dispatch({ type: 'LOG', t: `Wandering Monster d6=${roll}: ${displayNames[roll]}` });
  
  return { roll, type: monsterType };
};

/**
 * Roll treasure and dispatch results
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Treasure result info
 */
export const rollTreasure = (dispatch) => {
  const roll = d6();
  const result = TREASURE_TABLE[roll];
  
  if (result.includes('Gold (d6)')) {
    const gold = d6();
    dispatch({ type: 'GOLD', n: gold });
    dispatch({ type: 'LOG', t: `Treasure: Found ${gold} gold!` });
    return { roll, type: 'gold', amount: gold };
  }
  
  if (result.includes('Gold (2d6)')) {
    const gold = r2d6();
    dispatch({ type: 'GOLD', n: gold });
    dispatch({ type: 'LOG', t: `Treasure: Found ${gold} gold!` });
    return { roll, type: 'gold', amount: gold };
  }
  
  if (result.includes('Clue')) {
    dispatch({ type: 'CLUE', n: 1 });
    dispatch({ type: 'LOG', t: 'Treasure: Found a Clue!' });
    return { roll, type: 'clue' };
  }
  
  dispatch({ type: 'LOG', t: `Treasure: ${result}` });
  return { roll, type: result.toLowerCase() };
};

/**
 * Perform a search action
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Search result info
 */
export const performSearch = (dispatch) => {
  const roll = d6();
  let result;
  
  if (roll <= 1) {
    result = 'Wandering Monsters!';
  } else if (roll <= 4) {
    result = 'Nothing';
  } else {
    result = 'Found! (Clue/Door/Treasure/Passage)';
    dispatch({ type: 'CLUE', n: 1 });
  }
  
  dispatch({ type: 'LOG', t: `Search ${roll}: ${result}` });
  return { roll, result };
};

// ========== Phase 3: Door Mechanics ==========

/**
 * Generate a random door type
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Door type info
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

// ========== Phase 3: Trap Mechanics ==========

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
    dispatch({ type: 'LOG', t: `🔧 ${hero.name} disarms the ${trap.name}! (${roll}+${bonus}=${total} vs DC${dc})` });
    return { success: true, roll, total, dc, message: `Trap disarmed!` };
  } else {
    dispatch({ type: 'LOG', t: `💥 ${hero.name} fails to disarm and triggers the ${trap.name}! (${roll}+${bonus}=${total} vs DC${dc})` });
    return { success: false, roll, total, dc, triggered: true, message: `Trap triggered!` };
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
    dispatch({ type: 'UPD_HERO', i: hero.index, u: { hp: Math.max(0, hero.hp - damage) } });
    dispatch({ type: 'LOG', t: `💀 ${hero.name} takes ${damage} damage from ${trap.name}!` });
  }
  
  // Handle special effects
  if (effect === 'poison') {
    dispatch({ type: 'LOG', t: `☠️ ${hero.name} is poisoned!` });
  } else if (effect === 'wandering') {
    dispatch({ type: 'LOG', t: `🔔 The alarm attracts wandering monsters!` });
    rollWanderingMonster(dispatch);
  } else if (effect === 'teleport') {
    dispatch({ type: 'LOG', t: `✨ ${hero.name} is teleported back to the entrance!` });
  }
  
  return { damage, effect, trap };
};

// ========== Phase 3: Special Rooms ==========

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
 * Interact with a shrine
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero interacting
 * @param {number} goldPaid - Gold offered
 * @returns {object} Shrine result
 */
export const interactShrine = (dispatch, hero, goldPaid = 0) => {
  if (goldPaid < 1) {
    dispatch({ type: 'LOG', t: `The shrine requires an offering of at least 1 gold.` });
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
  
  return { roll, result, message: result === 'curse' ? '-1 Life' : result === 'blessing' ? '+1 Life' : 'Nothing happens' };
};

/**
 * Drink from a fountain
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero drinking
 * @returns {object} Fountain result
 */
export const interactFountain = (dispatch, hero) => {
  const roll = d6();
  
  let result, healing = 0;
  if (roll === 1) {
    result = 'poison';
    healing = -1;
    dispatch({ type: 'LOG', t: `☠️ The fountain is poisoned! ${hero.name} takes 1 damage.` });
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
    dispatch({ type: 'LOG', t: `✨ Magical waters! ${hero.name} is fully healed!` });
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
    dispatch({ type: 'LOG', t: `⚠️ The statue is trapped! Roll on trap table...` });
    return { roll, result, triggered: true };
  } else if (roll <= 4) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The statue is just a statue. Nothing hidden.` });
  } else {
    result = 'treasure';
    dispatch({ type: 'LOG', t: `💎 ${hero.name} finds treasure hidden in the statue!` });
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
    dispatch({ type: 'LOG', t: `📖 A trapped book! ${hero.name} takes 1 damage.` });
  } else if (roll <= 4) {
    result = 'nothing';
    dispatch({ type: 'LOG', t: `The books are too damaged to read.` });
  } else {
    result = 'clue';
    dispatch({ type: 'CLUE', n: 1 });
    dispatch({ type: 'LOG', t: `📚 ${hero.name} finds useful information! +1 Clue` });
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
    dispatch({ type: 'LOG', t: `⚔️ ${hero.name} finds a weapon! +1 to next attack.` });
  } else {
    result = 'shield';
    dispatch({ type: 'LOG', t: `🛡️ ${hero.name} finds a shield! +1 to next defense.` });
  }
  
  return { roll, result };
};

// ========== Phase 3: Puzzle Rooms ==========

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
  } else if (puzzleType === 'pressure' && ['rogue', 'halfling'].includes(hero.key)) {
    bonus = hero.lvl;
  }
  
  const total = roll + bonus;
  const success = total >= puzzle.successDC;
  
  dispatch({ type: 'LOG', t: `${hero.name} attempts the ${puzzle.name}: ${roll}+${bonus}=${total} vs DC${puzzle.successDC}` });
  
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

// ========== Phase 3: Corridor/Passage System ==========

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
  
  dispatch({ type: 'LOG', t: `🚪 Passage: ${direction}, ${length} squares long` });
  
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

// ========== Phase 3: Boss Room ==========

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
      : `You need ${minClues} clues to find the boss room. You have ${clues}.`
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
  spawnMonster(dispatch, 'boss', hcl + 1);
  dispatch({ type: 'BOSS' });
  
  return { success: true, ...access };
};

/**
 * Calculate attack result
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Target foe level
 * @returns {object} Attack result
 */
export const calculateAttack = (hero, foeLevel) => {
  const roll = d6();
  let mod = 0;

  // Class-specific attack bonuses
  if (['warrior', 'barbarian', 'elf', 'dwarf'].includes(hero.key)) {
    mod = hero.lvl;
  } else if (hero.key === 'cleric') {
    mod = Math.floor(hero.lvl / 2);
  }
  // Rogue gets +L when outnumbered (handled separately)

  // Equipment bonuses (Phase 7b)
  const equipBonus = calculateEquipmentBonuses(hero);
  mod += equipBonus.attackMod;

  const total = roll + mod;
  const hits = roll === 1 ? 0 : Math.floor(total / foeLevel);
  const exploded = roll === 6;

  return {
    roll,
    mod,
    total,
    hits,
    exploded,
    message: `${hero.name}: ${roll}+${mod}=${total} vs L${foeLevel} → ${hits > 0 ? hits + ' kill(s)' : 'Miss'}${exploded ? ' 💥EXPLODE' : ''}`
  };
};

/**
 * Calculate defense result
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Attacking foe level
 * @param {object} options - Additional options (largeEnemy, parry, etc.)
 * @returns {object} Defense result
 */
export const calculateDefense = (hero, foeLevel, options = {}) => {
  const roll = d6();
  let mod = 0;
  const modifiers = [];

  // Class-specific defense bonuses
  if (hero.key === 'rogue') {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (rogue)`);
  } else if (hero.key === 'halfling' && options.largeEnemy) {
    // Halfling gets +L vs large enemies
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (vs large)`);
  } else if (hero.key === 'dwarf' && options.largeEnemy) {
    // Dwarf gets +1 vs large enemies
    mod += 1;
    modifiers.push('+1 (vs large)');
  } else if (['acrobat', 'swashbuckler', 'bulwark', 'gnome', 'kukla', 'lightGladiator', 'mushroomMonk'].includes(hero.key)) {
    // These classes get +½L to defense
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  }

  // Parry (Light Gladiator)
  if (options.parry && hero.key === 'lightGladiator') {
    mod += 2;
    modifiers.push('+2 (parry)');
  }

  // Panache dodge (Swashbuckler)
  if (options.panacheDodge) {
    mod += 2;
    modifiers.push('+2 (panache)');
  }

  // Acrobat trick
  if (options.acrobatTrick) {
    mod += 2;
    modifiers.push('+2 (trick)');
  }

  // Equipment bonuses (Phase 7b)
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.defenseMod !== 0) {
    mod += equipBonus.defenseMod;
    modifiers.push(`${equipBonus.defenseMod >= 0 ? '+' : ''}${equipBonus.defenseMod} (equip)`);
  }

  const total = roll + mod;
  const blocked = total > foeLevel;

  const modStr = modifiers.length > 0 ? ` (${modifiers.join(' ')})` : '';

  return {
    roll,
    mod,
    total,
    blocked,
    damage: blocked ? 0 : 1,
    message: `${hero.name} DEF: ${roll}${modStr}=${total} vs L${foeLevel} → ${blocked ? 'Block!' : 'HIT -1 Life'}`
  };
};

// ========== Phase 4: Save System ==========

/**
 * Perform a save roll when taking lethal damage
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero taking damage
 * @param {number} heroIdx - Hero index in party
 * @param {string} damageSource - Source of damage (trap type, monster type)
 * @returns {object} Save result
 */
export const performSaveRoll = (dispatch, hero, heroIdx, damageSource = 'default') => {
  const threshold = getSaveThreshold(damageSource);
  const { bonus, reasons } = getSaveModifier(hero);

  // Equipment bonuses (Phase 7b)
  const equipBonus = calculateEquipmentBonuses(hero);
  const totalBonus = bonus + equipBonus.saveMod;
  const allReasons = [...reasons];
  if (equipBonus.saveMod !== 0) {
    allReasons.push(`${equipBonus.saveMod >= 0 ? '+' : ''}${equipBonus.saveMod} equip`);
  }

  const result = rollSave(threshold, totalBonus);

  const modStr = allReasons.length > 0 ? ` (${allReasons.join(', ')})` : '';

  if (result.success) {
    // Survived - set to 1 HP and mark as wounded
    dispatch({ type: 'UPD_HERO', i: heroIdx, u: { hp: 1 } });
    dispatch({ type: 'SET_HERO_STATUS', heroIdx, statusKey: 'wounded', value: true });
    dispatch({ type: 'LOG', t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: 'LOG', t: `✅ ${result.message}` });
  } else {
    // Dead - set to 0 HP and mark as dead
    dispatch({ type: 'UPD_HERO', i: heroIdx, u: { hp: 0 } });
    dispatch({ type: 'SET_HERO_STATUS', heroIdx, statusKey: 'dead', value: true });
    dispatch({ type: 'LOG', t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: 'LOG', t: `❌ ${result.message}` });
  }

  return result;
};

/**
 * Use Cleric Blessing to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Cleric's index
 * @param {object} targetHero - Hero who needs re-roll
 * @param {number} targetIdx - Target hero's index
 * @param {string} damageSource - Original damage source
 * @returns {object} New save result
 */
export const useBlessingForSave = (dispatch, heroIdx, targetHero, targetIdx, damageSource = 'default') => {
  dispatch({ type: 'USE_BLESS', heroIdx });
  dispatch({ type: 'LOG', t: `🙏 Cleric uses Blessing to grant a re-roll!` });
  
  return performSaveRoll(dispatch, targetHero, targetIdx, damageSource);
};

/**
 * Use Halfling Luck to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Halfling's index
 * @param {string} damageSource - Original damage source
 * @returns {object} New save result
 */
export const useLuckForSave = (dispatch, heroIdx, hero, damageSource = 'default') => {
  dispatch({ type: 'USE_LUCK', heroIdx });
  dispatch({ type: 'LOG', t: `🍀 Halfling uses Luck to re-roll!` });
  
  return performSaveRoll(dispatch, hero, heroIdx, damageSource);
};

// ========== Phase 4: Magic System ==========

/**
 * Cast a spell
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} caster - Hero casting the spell
 * @param {number} casterIdx - Caster's index in party
 * @param {string} spellKey - Spell to cast
 * @param {object} context - Additional context (targets, monsters, etc.)
 * @returns {object} Spell result
 */
export const performCastSpell = (dispatch, caster, casterIdx, spellKey, context = {}) => {
  const spell = SPELLS[spellKey];
  if (!spell) {
    dispatch({ type: 'LOG', t: `❌ Unknown spell: ${spellKey}` });
    return { success: false };
  }
  
  // Use a spell slot
  dispatch({ type: 'USE_SPELL', heroIdx: casterIdx });
  
  const result = castSpell(spellKey, caster, context.targets || []);
  dispatch({ type: 'LOG', t: `✨ ${result.message}` });
  
  // Apply spell effects
  if (spell.effect === 'single_damage' && context.targetMonsterIdx !== undefined) {
    dispatch({ 
      type: 'UPD_MONSTER', 
      i: context.targetMonsterIdx, 
      u: { hp: Math.max(0, context.targetMonster.hp - result.value) }
    });
  }
  
  if (spell.effect === 'heal' && context.targetHeroIdx !== undefined) {
    const targetHero = context.targetHero;
    dispatch({
      type: 'UPD_HERO',
      i: context.targetHeroIdx,
      u: { hp: Math.min(targetHero.maxHp, targetHero.hp + result.value) }
    });
  }
  
  return result;
};

/**
 * Get remaining spell slots for a hero
 * @param {object} hero - Hero object
 * @param {object} abilities - Current ability usage
 * @returns {object} { max, used, remaining }
 */
export const getRemainingSpells = (hero, abilities) => {
  const max = getSpellSlots(hero.key, hero.lvl);
  const used = abilities[hero.id]?.spellsUsed || 0;
  return { max, used, remaining: max - used };
};

// ========== Phase 4: Class Abilities ==========

/**
 * Use Cleric Heal ability
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} clericIdx - Cleric's index
 * @param {number} targetIdx - Target hero's index
 * @param {object} targetHero - Target hero object
 * @returns {object} Heal result
 */
export const useClericHeal = (dispatch, clericIdx, targetIdx, targetHero) => {
  const healAmount = d6();
  const newHP = Math.min(targetHero.maxHp, targetHero.hp + healAmount);
  
  dispatch({ type: 'USE_HEAL', heroIdx: clericIdx });
  dispatch({ type: 'UPD_HERO', i: targetIdx, u: { hp: newHP } });
  dispatch({ type: 'LOG', t: `💚 Cleric heals ${targetHero.name} for ${healAmount} HP! (${targetHero.hp}→${newHP})` });
  
  return { healAmount, newHP };
};

/**
 * Use Cleric Blessing for combat bonus
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} clericIdx - Cleric's index
 * @param {number} targetIdx - Target hero's index
 * @param {object} targetHero - Target hero object
 * @returns {object} Bless result
 */
export const useClericBless = (dispatch, clericIdx, targetIdx, targetHero) => {
  dispatch({ type: 'USE_BLESS', heroIdx: clericIdx });
  dispatch({ type: 'SET_HERO_STATUS', heroIdx: targetIdx, statusKey: 'blessed', value: true });
  dispatch({ type: 'LOG', t: `✨ Cleric blesses ${targetHero.name}! +1 to next roll.` });
  
  return { blessed: true };
};

/**
 * Activate Barbarian Rage
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} barbarianIdx - Barbarian's index
 * @param {boolean} activate - True to activate, false to deactivate
 * @returns {object} Rage result
 */
export const useBarbarianRage = (dispatch, barbarianIdx, activate = true) => {
  dispatch({ type: 'USE_RAGE', heroIdx: barbarianIdx, active: activate });
  
  if (activate) {
    dispatch({ type: 'LOG', t: `😤 Barbarian enters RAGE! +2 to attack, -1 to defense.` });
  } else {
    dispatch({ type: 'LOG', t: `😌 Barbarian calms down. Rage ends.` });
  }
  
  return { rageActive: activate };
};

/**
 * Use Halfling Luck for re-roll
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} halflingIdx - Halfling's index
 * @returns {object} Luck result
 */
export const useHalflingLuck = (dispatch, halflingIdx) => {
  dispatch({ type: 'USE_LUCK', heroIdx: halflingIdx });
  dispatch({ type: 'LOG', t: `🍀 Halfling uses Luck! Re-roll available.` });

  return { luckUsed: true };
};

// ========== Phase 7c: Advanced Class Abilities ==========

/**
 * Toggle Assassin hide in shadows
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} assassinIdx - Assassin's index
 * @param {boolean} hidden - Whether to hide or unhide
 */
export const useAssassinHide = (dispatch, assassinIdx, hidden = true) => {
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx: assassinIdx,
    key: 'hidden',
    value: hidden
  });

  if (hidden) {
    dispatch({ type: 'LOG', t: `🥷 Assassin hides in shadows! Next attack deals 3x damage!` });
  } else {
    dispatch({ type: 'LOG', t: `Assassin revealed.` });
  }
};

/**
 * Set Ranger sworn enemy
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} rangerIdx - Ranger's index
 * @param {string} enemyType - Type of sworn enemy
 */
export const setRangerSwornEnemy = (dispatch, rangerIdx, enemyType) => {
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx: rangerIdx,
    key: 'swornEnemy',
    value: enemyType
  });
  dispatch({ type: 'LOG', t: `🎯 Ranger declares ${enemyType} as sworn enemy! +2 vs this type.` });
};

/**
 * Use Swashbuckler panache point
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} swashIdx - Swashbuckler's index
 * @param {string} action - Action type (dodge, riposte, flourish)
 */
export const useSwashbucklerPanache = (dispatch, swashIdx, action = 'dodge') => {
  dispatch({
    type: 'USE_PANACHE',
    heroIdx: swashIdx
  });

  const actions = {
    dodge: '🤺 Swashbuckler dodges with style! +2 Defense this turn.',
    riposte: '⚔️ Swashbuckler ripostes! Counter-attack on next hit.',
    flourish: '✨ Swashbuckler flourishes! +2 Attack this turn.'
  };

  dispatch({ type: 'LOG', t: actions[action] || actions.dodge });
};

/**
 * Activate Mushroom Monk flurry
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} monkIdx - Monk's index
 * @param {number} level - Monk's level
 */
export const useMonkFlurry = (dispatch, monkIdx, level) => {
  const attacks = getFlurryAttacks(level);
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx: monkIdx,
    key: 'flurryActive',
    value: attacks
  });
  dispatch({ type: 'LOG', t: `🥋 Mushroom Monk activates Flurry! ${attacks} attacks this turn!` });
};

/**
 * Use Acrobat trick
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} acrobatIdx - Acrobat's index
 * @param {string} trick - Trick type
 */
export const useAcrobatTrick = (dispatch, acrobatIdx, trick = 'dodge') => {
  dispatch({
    type: 'USE_TRICK',
    heroIdx: acrobatIdx
  });

  const tricks = {
    dodge: '🤸 Acrobat tumbles! +2 Defense this turn.',
    leap: '🦘 Acrobat leaps! Move to any position.',
    distract: '👋 Acrobat distracts! Target at -1 to attack.'
  };

  dispatch({ type: 'LOG', t: tricks[trick] || tricks.dodge });
};

/**
 * Use Paladin prayer point
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} paladinIdx - Paladin's index
 * @param {string} prayer - Prayer type (smite, protect, heal)
 */
export const usePaladinPrayer = (dispatch, paladinIdx, prayer = 'smite') => {
  dispatch({
    type: 'USE_PRAYER',
    heroIdx: paladinIdx
  });

  const prayers = {
    smite: '⚡ Paladin smites evil! +2 damage vs undead/demons.',
    protect: '🛡️ Divine protection! +2 Defense for party this turn.',
    heal: '✨ Lay on hands! Restore 1d6 HP to target.'
  };

  dispatch({ type: 'LOG', t: prayers[prayer] || prayers.smite });
};

/**
 * Activate Light Gladiator parry
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} gladiatorIdx - Light Gladiator's index
 */
export const useLightGladiatorParry = (dispatch, gladiatorIdx) => {
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx: gladiatorIdx,
    key: 'parryActive',
    value: true
  });
  dispatch({ type: 'LOG', t: `⚔️ Light Gladiator parries! Next attack blocked, riposte on attacker.` });
};

/**
 * Use Bulwark sacrifice to protect ally
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} bulwarkIdx - Bulwark's index
 * @param {number} targetIdx - Ally to protect
 */
export const useBulwarkSacrifice = (dispatch, bulwarkIdx, targetIdx) => {
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx: bulwarkIdx,
    key: 'protecting',
    value: targetIdx
  });
  dispatch({ type: 'LOG', t: `🛡️ Bulwark protects ally! Takes damage for them this turn.` });
};

/**
 * Toggle dual wielding mode
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Hero's index
 * @param {boolean} active - Whether dual wielding
 */
export const toggleDualWield = (dispatch, heroIdx, active = true) => {
  dispatch({
    type: 'SET_ABILITY_STATE',
    heroIdx,
    key: 'dualWielding',
    value: active
  });

  if (active) {
    dispatch({ type: 'LOG', t: `⚔️⚔️ Dual wielding activated! +½L to attacks.` });
  }
};

// ========== Phase 4: Flee/Escape ==========

/**
 * Attempt to flee from combat
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting to flee
 * @param {number} heroIdx - Hero's index
 * @param {number} monsterLevel - Highest monster level in encounter
 * @returns {object} Flee result
 */
export const attemptFlee = (dispatch, hero, heroIdx, monsterLevel) => {
  const roll = d6();
  let mod = 0;
  
  // Rogue and Halfling get bonuses to flee
  if (hero.key === 'rogue') mod = hero.lvl;
  if (hero.key === 'halfling') mod = Math.floor(hero.lvl / 2);
  
  const total = roll + mod;
  const success = total > monsterLevel;
  
  if (success) {
    dispatch({ type: 'LOG', t: `🏃 ${hero.name} escapes! (${roll}+${mod}=${total} vs L${monsterLevel})` });
  } else {
    // Failed flee = free attack from monsters
    dispatch({ type: 'LOG', t: `❌ ${hero.name} fails to escape! (${roll}+${mod}=${total} vs L${monsterLevel})` });
    dispatch({ type: 'LOG', t: `⚔️ Monsters get a free attack!` });
  }
  
  return { success, roll, mod, total, freeAttack: !success };
};

/**
 * Attempt party flee (all must succeed)
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} party - Party array
 * @param {number} monsterLevel - Highest monster level
 * @returns {object} Party flee result
 */
export const attemptPartyFlee = (dispatch, party, monsterLevel) => {
  dispatch({ type: 'LOG', t: `🏃 Party attempts to flee!` });
  
  const results = party
    .filter(h => h.hp > 0)
    .map((hero, idx) => attemptFlee(dispatch, hero, idx, monsterLevel));
  
  const allEscaped = results.every(r => r.success);
  const failedCount = results.filter(r => !r.success).length;
  
  if (allEscaped) {
    dispatch({ type: 'LOG', t: `✅ Party escapes successfully!` });
    dispatch({ type: 'CLEAR_MONSTERS' });
  } else {
    dispatch({ type: 'LOG', t: `❌ ${failedCount} hero(es) failed to escape!` });
  }
  
  return { allEscaped, results, failedCount };
};

/**
 * Roll reaction for a monster
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} monsterIdx - Monster's index
 * @returns {object} Reaction result
 */
export const rollMonsterReaction = (dispatch, monsterIdx) => {
  const reaction = rollReaction();
  
  dispatch({ type: 'SET_MONSTER_REACTION', monsterIdx, reaction: reaction.reaction });
  dispatch({ type: 'LOG', t: `🎲 Reaction d6=${reaction.roll}: ${reaction.description}` });
  
  if (reaction.initiative === 'monster') {
    dispatch({ type: 'LOG', t: `⚠️ Monster attacks first!` });
  } else if (reaction.initiative === 'party') {
    dispatch({ type: 'LOG', t: `✅ Party acts first!` });
  } else {
    dispatch({ type: 'LOG', t: `⚔️ Roll for initiative!` });
  }
  
  return reaction;
};

// ========== Phase 4: XP & Leveling ==========

/**
 * Award XP to party for defeating a monster
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} monster - Defeated monster
 * @param {array} party - Party array
 * @returns {object} XP distribution result
 */
export const awardXP = (dispatch, monster, party) => {
  const xp = monster.xp || monster.level;
  const aliveHeroes = party.filter(h => h.hp > 0);
  
  if (aliveHeroes.length === 0) return { xp: 0 };
  
  // Split XP among surviving party members
  const xpEach = Math.ceil(xp / aliveHeroes.length);
  
  party.forEach((hero, idx) => {
    if (hero.hp > 0) {
      dispatch({ type: 'ADD_XP', heroIdx: idx, amount: xpEach });
    }
  });
  
  dispatch({ type: 'LOG', t: `⭐ Party gains ${xp} XP! (${xpEach} each)` });
  
  return { xp, xpEach, recipients: aliveHeroes.length };
};

/**
 * Check and perform level up for a hero
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero to check
 * @param {number} heroIdx - Hero's index
 * @returns {object} Level up result
 */
export const checkLevelUp = (dispatch, hero, heroIdx) => {
  if (!canLevelUp(hero)) {
    return { leveledUp: false };
  }
  
  const oldLevel = hero.lvl;
  dispatch({ type: 'LEVEL_UP', heroIdx });
  dispatch({ type: 'LOG', t: `🎉 ${hero.name} levels up! L${oldLevel} → L${oldLevel + 1}` });
  
  return { leveledUp: true, oldLevel, newLevel: oldLevel + 1 };
};

/**
 * Process monster round start abilities (like regeneration)
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} monsters - Current monsters
 */
export const processMonsterRoundStart = (dispatch, monsters) => {
  monsters.forEach((monster, idx) => {
    if (monster.hp > 0 && monster.special) {
      const result = applyMonsterAbility(monster, 'round_start', {});
      if (result) {
        dispatch({ type: 'LOG', t: result.message });
        if (result.effect === 'heal') {
          dispatch({ type: 'APPLY_MONSTER_ABILITY', monsterIdx: idx, effect: 'heal', value: result.value });
        }
      }
    }
  });
};

/**
 * Enhanced attack calculation with exploding dice and class abilities
 * @param {object} hero - Hero attacking
 * @param {number} foeLevel - Target foe level
 * @param {object} options - Additional options (rageActive, blessed, etc.)
 * @returns {object} Attack result
 */
export const calculateEnhancedAttack = (hero, foeLevel, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Class-specific attack bonuses
  if (['warrior', 'barbarian', 'paladin', 'assassin'].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === 'elf' && !options.using2H) {
    // Elf gets +L but not with 2H weapons
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === 'dwarf' && options.melee) {
    // Dwarf gets +L melee only
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === 'halfling' && options.usingSling) {
    // Halfling gets +L with sling
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === 'cleric') {
    mod += Math.floor(hero.lvl / 2);
    modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
  } else if (['druid', 'acrobat', 'gnome', 'swashbuckler', 'bulwark'].includes(hero.key)) {
    // These classes get +½L
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === 'ranger') {
    // Ranger gets +L base
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === 'kukla' && options.lightBlade) {
    // Kukla gets +1 with light blades
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === 'lightGladiator' && options.lightWeapon) {
    // Light Gladiator gets +½L with light weapons only
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === 'mushroomMonk') {
    // Mushroom Monk gets +L martial, +½L other
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  }

  // Dual wield bonus (Ranger, Swashbuckler, Light Gladiator)
  if (options.dualWielding) {
    if (hero.key === 'ranger' || hero.key === 'lightGladiator') {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    } else if (hero.key === 'swashbuckler') {
      // Swashbuckler dual wield is built into base attack
      modifiers.push('(dual wield)');
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === 'ranger') {
    mod += 2;
    modifiers.push('+2 (sworn enemy)');
  }

  // Assassin hide in shadows (3x damage = +2L to attack)
  if (options.hiddenStrike && hero.key === 'assassin') {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses (Phase 7b)
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(`${equipBonus.attackMod >= 0 ? '+' : ''}${equipBonus.attackMod} (equip)`);
  }

  // Rage bonus
  if (options.rageActive && hero.key === 'barbarian') {
    mod += 2;
    modifiers.push('+2 (rage)');
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push('+1 (blessed)');
  }

  // Bulwark ranged bonus (uses Tier instead of level)
  if (options.ranged && hero.key === 'bulwark') {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / foeLevel); // Natural 1 always misses

  const rollStr = exploded ? `[${rolls.join('+')}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(' ')}` : '';

  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foeLevel} → ${hits > 0 ? hits + ' kill(s)' : 'Miss'}${exploded ? ' 💥EXPLODED!' : ''}`
  };
};

// ========== Phase 7a: Core Combat Fixes ==========

/**
 * Calculate multi-kill against Minor Foes (Vermin/Minions)
 * Per 4AD rules: Attack roll ÷ Foe Level = number of foes killed
 * @param {number} attackTotal - Total attack roll (with modifiers)
 * @param {number} foeLevel - Level of the Minor Foes
 * @param {number} foeCount - Number of foes remaining
 * @returns {object} { kills, message }
 */
export const calculateMinorFoeKills = (attackTotal, foeLevel, foeCount) => {
  // Natural 1 always misses
  if (attackTotal < foeLevel) {
    return { kills: 0, message: 'Miss!' };
  }
  
  // Number killed = attack total ÷ foe level (rounded down)
  const potentialKills = Math.floor(attackTotal / foeLevel);
  const actualKills = Math.min(potentialKills, foeCount);
  
  return {
    kills: actualKills,
    potentialKills,
    message: actualKills > 1 
      ? `${actualKills} foes slain!` 
      : actualKills === 1 
        ? '1 foe slain!' 
        : 'Miss!'
  };
};

/**
 * Enhanced attack against Minor Foes with multi-kill
 * @param {object} hero - Hero attacking
 * @param {object} foe - Minor foe group (with count)
 * @param {object} options - Combat options (rageActive, blessed, etc.)
 * @returns {object} Attack result with kills
 */
export const attackMinorFoe = (hero, foe, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Class-specific attack bonuses
  if (['warrior', 'barbarian', 'paladin', 'assassin'].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === 'elf' && !options.using2H) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === 'dwarf' && options.melee) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === 'halfling' && options.usingSling) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === 'cleric') {
    // Clerics get +L vs undead
    const isUndead = foe.special?.includes('undead');
    if (isUndead) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (vs undead)`);
    } else {
      mod += Math.floor(hero.lvl / 2);
      modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
    }
  } else if (['druid', 'acrobat', 'gnome', 'swashbuckler', 'bulwark'].includes(hero.key)) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === 'ranger') {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === 'kukla' && options.lightBlade) {
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === 'lightGladiator' && options.lightWeapon) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === 'mushroomMonk') {
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  } else if (hero.key === 'rogue') {
    // Rogue gets +L when attacking outnumbered Minor Foes
    if (options.rogueOutnumbers) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (outnumbered)`);
    }
  }

  // Dual wield bonus
  if (options.dualWielding) {
    if (hero.key === 'ranger' || hero.key === 'lightGladiator') {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === 'ranger') {
    mod += 2;
    modifiers.push('+2 (sworn enemy)');
  }

  // Assassin hide in shadows
  if (options.hiddenStrike && hero.key === 'assassin') {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(`${equipBonus.attackMod >= 0 ? '+' : ''}${equipBonus.attackMod} (equip)`);
  }

  // Rage bonus
  if (options.rageActive && hero.key === 'barbarian') {
    mod += 2;
    modifiers.push('+2 (rage)');
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push('+1 (blessed)');
  }

  // Bulwark ranged bonus
  if (options.ranged && hero.key === 'bulwark') {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;
  
  // Calculate multi-kill
  const killResult = calculateMinorFoeKills(finalTotal, foe.level, foe.count || 1);
  
  const rollStr = exploded ? `[${rolls.join('+')}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(' ')}` : '';
  
  return {
    rolls,
    total,
    mod,
    finalTotal,
    kills: killResult.kills,
    exploded,
    isMinorFoe: true,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foe.level} → ${killResult.message}${exploded ? ' 💥EXPLODED!' : ''}`
  };
};

/**
 * Check morale for Minor Foes when below 50%
 * Per 4AD rules: Roll d6 - on 1-3 they flee, 4+ they keep fighting
 * @param {object} foe - Minor foe group
 * @param {number} initialCount - Starting count
 * @param {number} currentCount - Remaining count
 * @returns {object} Morale check result
 */
export const checkMinorFoeMorale = (foe, initialCount, currentCount) => {
  // Skip if morale never checked (fight to death) or not at 50%
  if (foe.neverChecksMorale || currentCount >= Math.ceil(initialCount / 2)) {
    return { checked: false, fled: false };
  }
  
  const roll = d6();
  const moraleMod = foe.moraleMod || 0;
  const adjustedRoll = roll + moraleMod;
  
  // 1-3 = flee, 4+ = keep fighting
  const fled = adjustedRoll <= 3;
  
  return {
    checked: true,
    roll,
    moraleMod,
    adjustedRoll,
    fled,
    message: fled 
      ? `🏃 Morale check: ${roll}${moraleMod ? '+'+moraleMod+'='+adjustedRoll : ''} - ${foe.name} flee!`
      : `⚔️ Morale check: ${roll}${moraleMod ? '+'+moraleMod+'='+adjustedRoll : ''} - ${foe.name} keep fighting!`
  };
};

/**
 * Check if Major Foe should have level reduced (at half HP)
 * Per 4AD rules: When below 50% Life, reduce Level by 1
 * @param {object} foe - Major foe
 * @returns {object} { shouldReduce, newLevel }
 */
export const checkMajorFoeLevelReduction = (foe) => {
  const halfHP = Math.ceil(foe.maxHp / 2);
  const shouldReduce = foe.hp <= halfHP && foe.hp > 0 && !foe.levelReduced;
  
  return {
    shouldReduce,
    newLevel: shouldReduce ? Math.max(1, foe.level - 1) : foe.level,
    message: shouldReduce 
      ? `📉 ${foe.name} is wounded! Level reduced to L${Math.max(1, foe.level - 1)}`
      : null
  };
};

/**
 * Determine initiative for combat
 * Per 4AD rules:
 * - If party attacks immediately: Party goes first (ranged/spells before melee)
 * - If party waits for reaction: Based on reaction roll
 * - Surprise: Monsters go first
 * @param {object} options - { partyAttacksFirst, reaction, isSurprise, hasRanged }
 * @returns {object} Initiative order
 */
export const determineInitiative = (options = {}) => {
  const { partyAttacksFirst, reaction, isSurprise, hasRanged, hasSpells } = options;
  
  // Surprise always gives monsters first attack
  if (isSurprise) {
    return {
      order: ['monster_ranged', 'party_ranged', 'monster_melee', 'party_melee'],
      monsterFirst: true,
      reason: 'Monsters surprise the party!'
    };
  }
  
  // Party attacks immediately
  if (partyAttacksFirst) {
    return {
      order: ['party_ranged', 'party_spells', 'monster_ranged', 'party_melee', 'monster_melee'],
      monsterFirst: false,
      reason: 'Party attacks first!'
    };
  }
  
  // Reaction-based initiative
  if (reaction) {
    const reactionKey = reaction.reactionKey || reaction;
    const reactionDetails = REACTION_TYPES?.[reactionKey];
    
    if (reactionDetails?.hostile === true) {
      // Fight or Fight to the Death - monsters go first
      return {
        order: ['party_ranged', 'party_spells', 'monster_ranged', 'monster_melee', 'party_melee'],
        monsterFirst: true,
        reason: `${reaction.name || reactionKey}: Monsters attack first!`
      };
    }
  }
  
  // Default: party first (ranged/spells, then melee alternating)
  return {
    order: ['party_ranged', 'party_spells', 'monster_ranged', 'party_melee', 'monster_melee'],
    monsterFirst: false,
    reason: 'Standard initiative'
  };
};

/**
 * Roll for surprise
 * @param {object} monster - Monster with optional surprise chance
 * @returns {object} Surprise result
 */
export const rollSurprise = (monster) => {
  const surpriseChance = monster?.surpriseChance || 0; // e.g., 2 for 2-in-6
  
  if (surpriseChance <= 0) {
    return { surprised: false, roll: null, chance: 0 };
  }
  
  const roll = d6();
  const surprised = roll <= surpriseChance;
  
  return {
    surprised,
    roll,
    chance: surpriseChance,
    message: surprised 
      ? `⚠️ Surprise! (${roll} ≤ ${surpriseChance}-in-6) Monsters attack first!`
      : `✅ No surprise (${roll} > ${surpriseChance}-in-6)`
  };
};

/**
 * Process a full attack against a Minor Foe group with multi-kill and morale
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Minor foe group
 * @param {number} foeIdx - Foe index in monsters array
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMinorFoeAttack = (dispatch, hero, heroIdx, foe, foeIdx, options = {}) => {
  // Perform the attack
  const attackResult = attackMinorFoe(hero, foe, options);
  
  dispatch({ type: 'LOG', t: attackResult.message });
  
  // Clear blessed status after use
  if (options.blessed) {
    dispatch({ type: 'SET_HERO_STATUS', heroIdx, statusKey: 'blessed', value: false });
  }
  
  if (attackResult.kills > 0) {
    // Update foe count
    const newCount = Math.max(0, (foe.count || 1) - attackResult.kills);
    const initialCount = foe.initialCount || foe.count || 1;
    
    dispatch({ type: 'UPD_MONSTER', i: foeIdx, u: { count: newCount } });
    
    if (newCount === 0) {
      dispatch({ type: 'LOG', t: `💀 All ${foe.name} defeated!` });
    } else {
      dispatch({ type: 'LOG', t: `💀 ${attackResult.kills} ${foe.name} killed! ${newCount} remaining.` });
      
      // Check morale if not already checked this encounter
      if (!foe.moraleChecked) {
        const moraleResult = checkMinorFoeMorale(foe, initialCount, newCount);
        
        if (moraleResult.checked) {
          dispatch({ type: 'LOG', t: moraleResult.message });
          dispatch({ type: 'UPD_MONSTER', i: foeIdx, u: { moraleChecked: true } });
          
          if (moraleResult.fled) {
            // Foes flee - mark as defeated but no treasure
            dispatch({ type: 'UPD_MONSTER', i: foeIdx, u: { count: 0, fled: true } });
            dispatch({ type: 'LOG', t: `🏃 The remaining ${foe.name} flee!` });
          }
        }
      }
    }
  }
  
  return attackResult;
};

/**
 * Process attack against a Major Foe with level reduction check
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Major foe
 * @param {number} foeIdx - Foe index
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMajorFoeAttack = (dispatch, hero, heroIdx, foe, foeIdx, options = {}) => {
  // Use existing enhanced attack
  const attackResult = calculateEnhancedAttack(hero, foe.level, options);
  
  dispatch({ type: 'LOG', t: attackResult.message });
  
  // Clear blessed status after use
  if (options.blessed) {
    dispatch({ type: 'SET_HERO_STATUS', heroIdx, statusKey: 'blessed', value: false });
  }
  
  if (attackResult.hits > 0) {
    const newHP = Math.max(0, foe.hp - attackResult.hits);
    dispatch({ type: 'UPD_MONSTER', i: foeIdx, u: { hp: newHP } });
    
    if (newHP === 0) {
      dispatch({ type: 'LOG', t: `💀 ${foe.name} defeated!` });
    } else {
      dispatch({ type: 'LOG', t: `⚔️ ${foe.name} takes ${attackResult.hits} damage! (${newHP}/${foe.maxHp} HP)` });
      
      // Check for level reduction at half HP
      const levelCheck = checkMajorFoeLevelReduction({ ...foe, hp: newHP });
      if (levelCheck.shouldReduce) {
        dispatch({ type: 'UPD_MONSTER', i: foeIdx, u: { level: levelCheck.newLevel, levelReduced: true } });
        dispatch({ type: 'LOG', t: levelCheck.message });
      }
    }
  }
  
  return attackResult;
};

// Need to import REACTION_TYPES for initiative logic
import { REACTION_TYPES } from '../data/monsters.js';
