import { explodingD6 } from '../../utils/dice.js';
import { formatRollPrefix } from '../rollLog.js';
import { calculateEquipmentBonuses, hasEquipment } from '../../data/equipment.js';
import { logMessage } from '../../state/actionCreators.js';
import { SHOW_MODAL } from '../../state/actions.js';

/**
 * Compute stealth modifier and reasons for a single hero
 * @param {object} hero
 * @param {object} options - { environment: 'dungeon'|'outdoors'|'caverns', applyTraits: bool }
 * @returns {{mod:number, reasons:string[]}}
 */
export const computeStealthModifier = (hero, options = {}) => {
  const reasons = [];
  let mod = 0;

  if (!hero) return { mod: 0, reasons };

  // Class-based bonuses (based on public/characters.txt rules)
  switch (hero.key) {
    case 'rogue':
    case 'assassin':
    case 'acrobat':
      mod += hero.lvl || 0;
      reasons.push(`+${hero.lvl || 0} (${hero.key})`);
      break;
    case 'halfling':
    case 'cleric':
    case 'barbarian':
    case 'ranger':
      // +1/2 L -> round down
      const half = Math.floor((hero.lvl || 0) / 2);
      if (half !== 0) {
        mod += half;
        reasons.push(`+${half} (1/2 L ${hero.key})`);
      }
      break;
    case 'elf':
      mod += 1;
      reasons.push(`+1 (elf)`);
      break;
    default:
      break;
  }

  // Equipment penalties/bonuses
  const equip = calculateEquipmentBonuses(hero);
  if (equip.stealthMod && equip.stealthMod !== 0) {
    mod += equip.stealthMod;
    reasons.push(`${equip.stealthMod >= 0 ? '+' : ''}${equip.stealthMod} (equip)`);
  }

  // Shields impose -1 to stealth unless some magic item overrides (no such item currently)
  if (hasEquipment(hero, 'shield')) {
    mod -= 1;
    reasons.push('-1 (shield)');
  }

  // Trait: stealthMaster (implemented elsewhere) - optional outdoors bonus
  if (options.applyTraits && hero.traits && hero.traits.includes && hero.traits.includes('stealthMaster')) {
    const tier = Math.max(0, Math.floor((hero.lvl || 0) / 4));
    // The trait in data describes +Tier outdoors; derive Tier from level via getTier in classes if desired
    // For safety use Math.ceil(lvl/4) as a small bonus, but only apply if environment === 'outdoors'
    if (options.environment === 'outdoors') {
      mod += tier;
      if (tier > 0) reasons.push(`+${tier} (stealthMaster outdoors)`);
    }
  }

  return { mod, reasons };
};

/**
 * Perform a Stealth Save for a hero (or group using worst modifier)
 * @param {function} dispatch
 * @param {object|array} heroOrHeroes - single hero object or array of heroes
 * @param {number} foeLevel - level of the foe/group being sneaked past
 * @param {object} options - passthrough options
 * @returns {{success:boolean, roll:number, total:number, mod:number, reasons:string[]}}
 */
export const performStealthSave = (dispatch, heroOrHeroes, foeLevel = 1, options = {}) => {
  const heroes = Array.isArray(heroOrHeroes) ? heroOrHeroes : [heroOrHeroes];
  if (!heroes || heroes.length === 0) return null;

  // Compute each hero's modifier and use the WORST (minimum) for group rolls
  const mods = heroes.map(h => {
    const { mod, reasons } = computeStealthModifier(h, options);
    return { hero: h, mod, reasons };
  });

  // Worst modifier: choose minimum mod value
  const worst = mods.reduce((acc, cur) => (cur.mod < acc.mod ? cur : acc), mods[0]);

  // Roll exploding d6
  const rollResult = explodingD6(worst.mod);
  const rawRollSum = rollResult.rolls.reduce((s, r) => s + r, 0);

  const total = rollResult.total;
  // Rule: a roll of 1 or below is always a failure
  const autoFail = rawRollSum <= 1;
  const success = !autoFail && total > foeLevel;

  // Construct message
  const reasonsStr = (worst.reasons && worst.reasons.length > 0) ? ` (${worst.reasons.join(', ')})` : '';
  const heroNames = heroes.map(h => h.name).join(', ');

  const message = `🕶️ Stealth: ${heroNames} ${success ? 'succeed' : 'fail'}! Roll: ${rollResult.rolls.join('+')}+${worst.mod} = ${total} vs L${foeLevel}${reasonsStr}`;
  dispatch(logMessage(`${formatRollPrefix(rollResult)}${message}`, 'exploration'));
  // Show modal for immediate feedback
  dispatch({ type: SHOW_MODAL, message, msgType: success ? 'success' : 'failure', autoClose: 3500 });

  return {
    success,
    roll: rollResult.rolls[0],
    rolls: rollResult.rolls,
    total,
    mod: worst.mod,
    reasons: worst.reasons,
  };
};

export default { computeStealthModifier, performStealthSave };
