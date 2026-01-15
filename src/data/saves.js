/**
 * Save System definitions for Four Against Darkness (Phase 4)
 * Based on saves.pdf - survival rolls when taking life-threatening damage
 */

/**
 * Save thresholds by damage source
 * Lower = easier to survive
 */
export const SAVE_THRESHOLDS = {
  // Trap damage
  pit: 4,           // Pit trap
  dart: 3,          // Dart trap
  blade: 4,         // Blade trap
  poison: 5,        // Poison trap (harder to survive)
  
  // Monster damage
  vermin: 2,        // Vermin attacks
  minion: 3,        // Standard minions
  major: 4,         // Major foes
  boss: 5,          // Boss monsters
  
  // Environmental
  fire: 4,          // Fire damage
  magic: 5,         // Magical damage
  
  // Default for unknown sources
  default: 4
};

/**
 * Get save threshold for a damage source
 * @param {string} source - Damage source type
 * @returns {number} Save DC
 */
export const getSaveThreshold = (source) => {
  return SAVE_THRESHOLDS[source] || SAVE_THRESHOLDS.default;
};

/**
 * Calculate save modifier for a hero
 * @param {object} hero - Hero object
 * @returns {object} { bonus, reasons }
 */
export const getSaveModifier = (hero) => {
  let bonus = 0;
  const reasons = [];
  
  // Shield provides +1 to saves
  if (hero.equipment?.offhand?.type === 'shield') {
    bonus += 1;
    reasons.push('Shield +1');
  }
  
  // Some armor might provide save bonuses
  if (hero.equipment?.armor?.saveBonus) {
    bonus += hero.equipment.armor.saveBonus;
    reasons.push(`${hero.equipment.armor.name} +${hero.equipment.armor.saveBonus}`);
  }
  
  // Dwarf has natural toughness (+1 to saves vs physical)
  if (hero.key === 'dwarf') {
    bonus += 1;
    reasons.push('Dwarf Toughness +1');
  }
  
  return { bonus, reasons };
};

/**
 * Check if hero can use a re-roll ability for saves
 * @param {object} hero - Hero object
 * @param {object} abilities - Current ability usage state
 * @returns {object} { canUseBless, canUseLuck }
 */
export const getRerollOptions = (hero, abilities) => {
  const heroAbilities = abilities[hero.id] || {};
  
  // Cleric can use Bless to re-roll saves (3 per adventure)
  const canUseBless = hero.key === 'cleric' && 
    (heroAbilities.blessingsUsed || 0) < 3;
  
  // Halfling can use Luck to re-roll saves (L+1 per adventure)
  const maxLuck = hero.lvl + 1;
  const canUseLuck = hero.key === 'halfling' && 
    (heroAbilities.luckUsed || 0) < maxLuck;
  
  return { canUseBless, canUseLuck };
};

/**
 * Determine if damage is life-threatening (triggers save roll)
 * @param {object} hero - Hero object
 * @param {number} damage - Incoming damage
 * @returns {boolean} True if save roll needed
 */
export const isLifeThreatening = (hero, damage) => {
  // Save roll needed if damage would reduce HP to 0 or below
  return (hero.hp - damage) <= 0;
};

/**
 * Perform a save roll
 * @param {number} threshold - DC to meet or exceed
 * @param {number} modifier - Save modifier
 * @returns {object} { roll, total, success, message }
 */
export const rollSave = (threshold, modifier = 0) => {
  const roll = Math.floor(Math.random() * 6) + 1;
  const total = roll + modifier;
  const success = total >= threshold;
  
  return {
    roll,
    modifier,
    total,
    threshold,
    success,
    message: success 
      ? `Save successful! ${roll}+${modifier}=${total} vs DC${threshold} - Wounded but alive!`
      : `Save failed! ${roll}+${modifier}=${total} vs DC${threshold} - Character dies!`
  };
};

export default {
  SAVE_THRESHOLDS,
  getSaveThreshold,
  getSaveModifier,
  getRerollOptions,
  isLifeThreatening,
  rollSave
};
