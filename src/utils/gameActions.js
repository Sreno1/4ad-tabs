/**
 * Game action helpers - shared logic for spawning monsters, rolling treasure, etc.
 * Eliminates duplicate code across components
 */
import { d6, r2d6 } from './dice.js';
import { createMonster, WANDERING_TABLE } from '../data/monsters.js';
import { TREASURE_TABLE } from '../data/treasure.js';

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
  dispatch({ type: 'LOG', t: `${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
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
 * @returns {object} Defense result
 */
export const calculateDefense = (hero, foeLevel) => {
  const roll = d6();
  let mod = 0;
  
  // Rogue gets +L to defense
  if (hero.key === 'rogue') {
    mod = hero.lvl;
  }
  // Halfling gets +L vs large enemies (handled separately)
  // Dwarf gets +1 vs large enemies (handled separately)
  
  const total = roll + mod;
  const blocked = total > foeLevel;
  
  return {
    roll,
    mod,
    total,
    blocked,
    damage: blocked ? 0 : 1,
    message: `${hero.name} DEF: ${roll}+${mod}=${total} vs L${foeLevel} → ${blocked ? 'Block!' : 'HIT -1 Life'}`
  };
};
