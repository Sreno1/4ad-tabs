/**
 * Exploration Actions - Searching, clues, secret doors, etc.
 * Per 4AD rules (Exploration.txt p.107-108)
 */

import { d6 } from "../dice.js";
import { getDefaultContext } from "../../game/context.js";

/**
 * Perform a search roll on current tile
 * Per 4AD rules:
 * - Roll d6
 * - 0-1 (with corridor -1 modifier): Wandering Monsters
 * - 2-4: Nothing found
 * - 5-6: Found something (choice of 4 options)
 *
 * @param {object} options - { isInCorridor: boolean, environment: string, party: array }
 * @returns {object} Search result
 */
export const performSearchRoll = (options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);
  const modifier = options.isInCorridor ? -1 : 0;
  const total = roll + modifier;
  const environment = options.environment || 'dungeon';
  const party = Array.isArray(options.party) ? options.party : [];

  const hasCavernListener = party.some(h => h && h.hp > 0 && [
    'elf',
    'ranger',
    'rogue',
    'halfling',
    'shadow'
  ].includes(h.key));
  const hasFungalSearchBonus = party.some(h => h && h.hp > 0 && ['mushroomMonk', 'halfling'].includes(h.key));

  if (total <= 1) {
    return {
      type: 'wandering_monsters',
      message: '⚠️ Your search attracted Wandering Monsters!',
      roll,
      total
    };
  }

  if (environment === 'caverns') {
    if (total >= 5) {
      return {
        type: 'found_something',
        message: '✨ You found something! Choose what you discovered:',
        choices: [
          { key: 'clue', label: '🔍 Clue', description: 'Gather information (need 3 to reveal a secret)' },
          { key: 'listen', label: '👂 Listen', description: 'Roll the next tile contents before entering' }
        ],
        roll,
        total
      };
    }
    if (total === 4 && hasCavernListener) {
      return {
        type: 'found_something',
        message: '👂 You can Listen for clues beyond the next opening:',
        choices: [
          { key: 'listen', label: '👂 Listen', description: 'Roll the next tile contents before entering' }
        ],
        roll,
        total,
        listenOnly: true
      };
    }
  } else if (environment === 'fungal_grottoes') {
    if (total >= 5 || (total === 4 && hasFungalSearchBonus)) {
      return {
        type: 'found_something',
        message: '🍄 You found something! Choose what you discovered:',
        choices: [
          { key: 'clue', label: '🔍 Clue', description: 'Gather information (need 3 to reveal a secret)' },
          { key: 'rare_mushroom', label: '🍄 Rare Mushroom', description: 'Roll on the Rare Mushroom table' }
        ],
        roll,
        total
      };
    }
  } else if (total >= 5) {
    return {
      type: 'found_something',
      message: '✨ You found something! Choose what you discovered:',
      choices: [
        { key: 'clue', label: '🔍 Clue', description: 'Gather information (need 3 to reveal a secret)' },
        { key: 'hidden_treasure', label: '💰 Hidden Treasure', description: '(2d6+HCL)×(2d6+HCL) gold' },
        { key: 'secret_door', label: '🚪 Secret Door', description: 'Leads to new tile (1-in-6 shortcut out)' },
        { key: 'secret_passage', label: '🗺️ Secret Passage', description: 'Passage to different environment' }
      ],
      roll,
      total
    };
  }

  return {
    type: 'nothing',
    message: 'Nothing found in this tile.',
    roll,
    total
  };
};

/**
 * Find a clue (player selected this choice)
 * Per 4AD rules: Clues are discovered by a specific PC but shared with allies
 * Max 3 clues per hero before spending to reveal a secret
 * @param {function} dispatch - Redux dispatch
 * @param {number} heroIdx - Hero who found the clue
 * @param {string} heroName - Hero's name
 */
export const findClue = (dispatch, heroIdx, heroName) => {
  dispatch({ type: 'ADD_HERO_CLUE', heroIdx, amount: 1 });
  dispatch({
    type: 'LOG',
    t: `🔍 ${heroName} discovered a Clue!`
  });

  return { success: true, message: 'Clue discovered!' };
};

/**
 * Calculate hidden treasure amount
 * Per 4AD rules: (2d6+HCL) × (2d6+HCL) gold
 * @param {number} hcl - Highest Character Level
 * @returns {object} Treasure result
 */
export const calculateHiddenTreasure = (hcl, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll1 = d6(rng, rollLog) + d6(rng, rollLog) + hcl;
  const roll2 = d6(rng, rollLog) + d6(rng, rollLog) + hcl;
  const gold = roll1 * roll2;

  return {
    gold,
    roll1,
    roll2,
    formula: `(${roll1}) × (${roll2}) = ${gold}gp`
  };
};

/**
 * Roll for hidden treasure complication
 * Per 4AD rules (Exploration.txt p.108):
 * 1-2: Alarm (wandering monsters)
 * 3-5: Trap (rogue can disarm, HCL+1)
 * 6: Ghost (cleric can banish)
 *
 * @returns {object} Complication result
 */
export const rollHiddenTreasureComplication = (ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);

  if (roll <= 2) {
    return {
      type: 'alarm',
      message: '🔔 Alarm! Wandering Monsters attack!',
      roll
    };
  }

  if (roll <= 5) {
    return {
      type: 'trap',
      message: '⚠️ The treasure is trapped! Rogue can attempt to disarm.',
      roll
    };
  }

  return {
    type: 'ghost',
    message: '👻 A ghost guards the treasure! Cleric can attempt to banish.',
    roll
  };
};

/**
 * Find hidden treasure (player selected this choice)
 * @param {function} dispatch - Redux dispatch
 * @param {number} hcl - Highest Character Level
 * @returns {object} Treasure and complication result
 */
export const findHiddenTreasure = (dispatch, hcl, ctx) => {
  // First, roll for complication
  const complication = rollHiddenTreasureComplication(ctx);

  // Then calculate treasure amount
  const treasure = calculateHiddenTreasure(hcl, ctx);

  dispatch({
    type: 'LOG',
    t: `💰 Hidden treasure: ${treasure.formula}`
  });

  dispatch({
    type: 'LOG',
    t: complication.message
  });

  return {
    treasure,
    complication
  };
};

/**
 * Find secret door (player selected this choice)
 * Per 4AD rules: 1-in-6 chance it's a shortcut out
 * @param {function} dispatch - Redux dispatch
 * @returns {object} Secret door result
 */
export const findSecretDoor = (dispatch, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const isShortcut = d6(rng, rollLog) === 6;

  if (isShortcut) {
    dispatch({
      type: 'LOG',
      t: '🚪✨ Secret door found! It\'s a safe shortcut out of the dungeon!'
    });

    return {
      isShortcut: true,
      message: 'Safe shortcut out! You can exit through this door.',
      treasureMultiplier: 2
    };
  }

  dispatch({
    type: 'LOG',
    t: '🚪 Secret door found! Leads to a new tile. Treasure behind it is DOUBLED.'
  });

  return {
    isShortcut: false,
    message: 'Secret door to new tile. Treasure doubled!',
    treasureMultiplier: 2
  };
};

/**
 * Find secret passage (player selected this choice)
 * @param {function} dispatch - Redux dispatch
 * @param {string} currentEnvironment - Current environment
 * @returns {object} Passage result with new environment
 */
export const findSecretPassage = (dispatch, currentEnvironment, chosenEnvironment = null) => {
  const environments = ['dungeon', 'fungal_grottoes', 'caverns'];
  const otherEnvironments = environments.filter(e => e !== currentEnvironment);

  const envNames = {
    dungeon: 'Dungeon',
    fungal_grottoes: 'Fungal Grottoes',
    caverns: 'Caverns'
  };

  if (chosenEnvironment) {
    const nextEnv = otherEnvironments.includes(chosenEnvironment) ? chosenEnvironment : otherEnvironments[0];
    dispatch({
      type: 'LOG',
      t: `🗺️ Secret passage found! Leads to the ${envNames[nextEnv]}!`
    });
    dispatch({ type: 'CHANGE_ENVIRONMENT', environment: nextEnv });
    return {
      newEnvironment: nextEnv,
      message: `Passage to ${envNames[nextEnv]}`
    };
  }

  return {
    choices: otherEnvironments,
    envNames,
    message: 'Choose which environment the passage leads to.'
  };
};

/**
 * Spend clues to reveal a secret
 * Per 4AD rules: Spend 3 clues to reveal a secret
 * @param {function} dispatch - Redux dispatch
 * @param {number} heroIdx - Hero index (whose clues to spend)
 * @param {number} currentClues - Current clue count for that hero
 * @param {string} heroName - Hero's name for logging
 * @returns {object} Result of spending clues
 */
export const spendCluesForSecret = (dispatch, heroIdx, currentClues, heroName, ctx) => {
  if (currentClues < 3) {
    return {
      success: false,
      message: `Need 3 clues to reveal a secret. You have ${currentClues}.`
    };
  }

  dispatch({ type: 'REMOVE_HERO_CLUE', heroIdx, amount: 3 });

  // Roll for what secret is revealed (this could be expanded)
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);
  let secret;

  if (roll <= 2) {
    secret = 'Shortcut path revealed - you may skip the next tile.';
  } else if (roll <= 4) {
    secret = 'Monster weakness revealed - +1 to attacks this encounter.';
  } else {
    secret = 'Hidden cache revealed - gain bonus treasure!';
  }

  dispatch({
    type: 'LOG',
    t: `🔮 Secret revealed: ${secret}`
  });

  return {
    success: true,
    secret,
    message: 'Secret revealed!'
  };
};

/**
 * Mark tile as searched
 * @param {function} dispatch - Redux dispatch
 * @param {number} x - Grid X
 * @param {number} y - Grid Y
 */
export const markTileSearched = (dispatch, x, y) => {
  // TODO: Add tile metadata tracking
  // For now, just log it
  dispatch({
    type: 'LOG',
    t: `📍 Tile (${x},${y}) searched`
  });
};
