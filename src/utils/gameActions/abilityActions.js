/**
 * Ability Actions - Class-specific abilities and special powers
 */
import { d6 } from '../dice.js';
import { getDefaultContext } from '../../game/context.js';
import { getFlurryAttacks } from '../../data/classes.js';

/**
 * Use Cleric Heal ability
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} clericIdx - Cleric's index
 * @param {number} targetIdx - Target hero's index
 * @param {object} targetHero - Target hero object
 * @returns {object} Heal result
 */
export const useClericHeal = (dispatch, clericIdx, targetIdx, targetHero, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const healAmount = d6(rng, rollLog);
  const newHP = Math.min(targetHero.maxHp, targetHero.hp + healAmount);

  dispatch({ type: 'USE_HEAL', heroIdx: clericIdx });
  dispatch({ type: 'UPD_HERO', i: targetIdx, u: { hp: newHP } });
  dispatch({
    type: 'LOG',
    t: `💚 Cleric heals ${targetHero.name} for ${healAmount} HP! (${targetHero.hp}→${newHP})`,
  });

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
  dispatch({
    type: 'SET_HERO_STATUS',
    heroIdx: targetIdx,
    statusKey: 'blessed',
    value: true,
  });
  dispatch({
    type: 'LOG',
    t: `✨ Cleric blesses ${targetHero.name}! +1 to next roll.`,
  });

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
    dispatch({
      type: 'LOG',
      t: `😤 Barbarian enters RAGE! +2 to attack, -1 to defense.`,
    });
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
    value: hidden,
  });

  if (hidden) {
    dispatch({
      type: 'LOG',
      t: `🥷 Assassin hides in shadows! Next attack deals 3x damage!`,
    });
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
    value: enemyType,
  });
  dispatch({
    type: 'LOG',
    t: `🎯 Ranger declares ${enemyType} as sworn enemy! +2 vs this type.`,
  });
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
    heroIdx: swashIdx,
  });

  const actions = {
    dodge: '🤺 Swashbuckler dodges with style! +2 Defense this turn.',
    riposte: '⚔️ Swashbuckler ripostes! Counter-attack on next hit.',
    flourish: '✨ Swashbuckler flourishes! +2 Attack this turn.',
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
    value: attacks,
  });
  dispatch({
    type: 'LOG',
    t: `🥋 Mushroom Monk activates Flurry! ${attacks} attacks this turn!`,
  });
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
    heroIdx: acrobatIdx,
  });

  const tricks = {
    dodge: '🤸 Acrobat tumbles! +2 Defense this turn.',
    leap: '🦘 Acrobat leaps! Move to any position.',
    distract: '👋 Acrobat distracts! Target at -1 to attack.',
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
    heroIdx: paladinIdx,
  });

  const prayers = {
    smite: '⚡ Paladin smites evil! +2 damage vs undead/demons.',
    protect: '🛡️ Divine protection! +2 Defense for party this turn.',
    heal: '✨ Lay on hands! Restore 1d6 HP to target.',
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
    value: true,
  });
  dispatch({
    type: 'LOG',
    t: `⚔️ Light Gladiator parries! Next attack blocked, riposte on attacker.`,
  });
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
    value: targetIdx,
  });
  dispatch({
    type: 'LOG',
    t: `🛡️ Bulwark protects ally! Takes damage for them this turn.`,
  });
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
    value: active,
  });

  if (active) {
    dispatch({ type: 'LOG', t: `⚔️⚔️ Dual wielding activated! +½L to attacks.` });
  }
};
