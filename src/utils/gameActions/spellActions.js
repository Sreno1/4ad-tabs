/**
 * Spell Actions - Spellcasting and spell slot management
 */
import { SPELLS, getSpellSlots, castSpell } from '../../data/spells.js';

/**
 * Cast a spell
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} caster - Hero casting the spell
 * @param {number} casterIdx - Caster's index in party
 * @param {string} spellKey - Spell key from SPELLS
 * @param {object} context - Spell context (targets, etc.)
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
