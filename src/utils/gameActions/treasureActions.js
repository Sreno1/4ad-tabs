/**
 * Treasure Actions - Rolling treasure and searching
 */
import { d6, r2d6 } from '../dice.js';
import { TREASURE_TABLE } from '../../data/treasure.js';
import { ASSIGN_TREASURE, SHOW_MODAL } from '../../state/actions.js';

/**
 * Roll on treasure table and award result
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} options - Optional params { multiplier, minGold }
 * @returns {object} Treasure result
 */
export const rollTreasure = (dispatch, options = {}) => {
  const { multiplier = 1, minGold = 0 } = options;
  const roll = d6();
  const result = TREASURE_TABLE[roll];

  if (result.includes('Gold (d6)')) {
    let gold = d6() * multiplier;
    gold = Math.max(gold, minGold); // Apply minimum if specified
  // Assign treasure respecting per-hero carry limits; leftover goes to party gold
  dispatch({ type: ASSIGN_TREASURE, amount: gold });

  const multiplierText = multiplier > 1 ? ` (×${multiplier})` : '';
  const minText = minGold > 0 && gold === minGold ? ` (min ${minGold}gp)` : '';
  const logText = `Treasure: Found ${gold} gold!${multiplierText}${minText}`;
  dispatch({ type: 'LOG', t: logText });
  // Show modal for treasure
  dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 4000 });
  return { roll, type: 'gold', amount: gold, multiplier };
  }

  if (result.includes('Gold (2d6)')) {
    let gold = r2d6() * multiplier;
    gold = Math.max(gold, minGold); // Apply minimum if specified
  // Assign treasure respecting per-hero carry limits; leftover goes to party gold
  dispatch({ type: ASSIGN_TREASURE, amount: gold });

  const multiplierText = multiplier > 1 ? ` (×${multiplier})` : '';
  const minText = minGold > 0 && gold === minGold ? ` (min ${minGold}gp)` : '';
  const logText = `Treasure: Found ${gold} gold!${multiplierText}${minText}`;
  dispatch({ type: 'LOG', t: logText });
  dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 4000 });
  return { roll, type: 'gold', amount: gold, multiplier };
  }

  if (result.includes('Clue')) {
  const logText = 'Treasure: Found a Clue!';
  dispatch({ type: 'CLUE', n: 1 });
  dispatch({ type: 'LOG', t: logText });
  dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 3500 });
  return { roll, type: 'clue' };
  }

  const logText = `Treasure: ${result}`;
  dispatch({ type: 'LOG', t: logText });
  // Show non-gold treasure entries as info modal
  dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 3500 });
  return { roll, type: result.toLowerCase() };
};

/**
 * Preview a treasure roll without dispatching state changes.
 * Useful for abilities that reveal potential treasure (e.g., Dwarf Gold Sense)
 * @returns {object} preview result similar to rollTreasure but without dispatch
 */
export const previewTreasureRoll = () => {
  const roll = d6();
  const result = TREASURE_TABLE[roll];

  if (result.includes('Gold (d6)')) {
    const gold = d6();
    return { roll, type: 'gold', amount: gold };
  }

  if (result.includes('Gold (2d6)')) {
    const gold = r2d6();
    return { roll, type: 'gold', amount: gold };
  }

  if (result.includes('Clue')) {
    return { roll, type: 'clue' };
  }

  return { roll, type: 'other', description: result };
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
