/**
 * Treasure Actions - Rolling treasure and searching
 */
import { d6, r2d6 } from '../dice.js';
import { TREASURE_TABLE } from '../../data/treasure.js';

/**
 * Roll on treasure table and award result
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Treasure result
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
