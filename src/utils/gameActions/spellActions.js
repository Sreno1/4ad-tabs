/**
 * Spell Actions - Spellcasting and spell slot management
 */
import { SPELLS, getSpellSlots, castSpell } from '../../data/spells.js';
import { getScrollSpell, canUseScroll, getScrollCastingBonus } from '../../data/scrolls.js';

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

/**
 * Cast a spell from a scroll
 * Scrolls can be used by any hero except barbarians
 * Bonus: +1 for non-spellcasters, +L for spellcasters
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} caster - Hero casting the scroll
 * @param {number} casterIdx - Caster's index in party
 * @param {string} scrollKey - Scroll key (e.g., 'scroll_fireball')
 * @param {object} context - Spell context (targets, etc.)
 * @returns {object} Spell result
 */
export const performCastScrollSpell = (dispatch, caster, casterIdx, scrollKey, context = {}) => {
  // Check if hero can use scrolls
  if (!canUseScroll(caster)) {
    dispatch({ type: 'LOG', t: `❌ ${caster.name} cannot read magical scrolls!` });
    return { success: false, message: 'Barbarians cannot read scrolls' };
  }

  // Get the spell from the scroll
  const spell = getScrollSpell(scrollKey);
  if (!spell) {
    dispatch({ type: 'LOG', t: `❌ Unknown scroll: ${scrollKey}` });
    return { success: false };
  }

  // Calculate casting bonus
  const bonus = getScrollCastingBonus(caster, spell);

  // Cast the spell (reuse existing spell logic, but don't consume spell slot)
  const result = castSpell(spell.key || Object.keys(SPELLS).find(key => SPELLS[key] === spell), caster, context.targets || []);

  // Add the scroll bonus to the result
  result.scrollBonus = bonus;
  result.message = `${caster.name} reads ${scrollKey.replace('scroll_', '')} scroll and casts it (+${bonus} bonus)! ${result.message}`;

  // Log the scroll usage
  dispatch({ type: 'LOG', t: `✨ ${result.message}` });

  // Remove scroll from inventory
  const scrollIdx = caster.inventory?.indexOf(scrollKey);
  if (scrollIdx !== undefined && scrollIdx >= 0) {
    dispatch({
      type: 'REMOVE_FROM_INVENTORY',
      heroIdx: casterIdx,
      itemIdx: scrollIdx
    });
  }

  // Apply spell effects (same as memorized spell)
  if (spell.effect === 'single_damage' && context.targetMonsterIdx !== undefined) {
    const damageAmount = result.value || 0;
    dispatch({
      type: 'UPD_MONSTER',
      i: context.targetMonsterIdx,
      u: { hp: Math.max(0, context.targetMonster.hp - damageAmount) }
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
 * Copy a scroll spell to wizard's spellbook
 * Only wizards can copy scrolls
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} caster - Hero (must be wizard)
 * @param {number} casterIdx - Caster's index in party
 * @param {string} scrollKey - Scroll key to copy
 * @returns {object} Result { success, message }
 */
export const performCopyScroll = (dispatch, caster, casterIdx, scrollKey) => {
  // Check if hero is a wizard
  if (caster.key !== 'wizard') {
    dispatch({ type: 'LOG', t: `❌ Only wizards can copy scrolls into their spellbook!` });
    return { success: false, message: 'Only wizards can copy scrolls' };
  }

  // Get the spell from the scroll
  const spell = getScrollSpell(scrollKey);
  if (!spell) {
    dispatch({ type: 'LOG', t: `❌ Unknown scroll: ${scrollKey}` });
    return { success: false };
  }

  // Find spell key
  const spellKey = Object.keys(SPELLS).find(key => SPELLS[key] === spell);
  if (!spellKey) {
    dispatch({ type: 'LOG', t: `❌ Could not identify spell in scroll` });
    return { success: false };
  }

  // Check if spell is already learned
  if (caster.learnedSpells?.includes(spellKey)) {
    dispatch({ type: 'LOG', t: `❌ ${caster.name} has already learned this spell!` });
    return { success: false, message: 'Spell already learned' };
  }

  // Add spell to learned spells
  dispatch({
    type: 'ADD_LEARNED_SPELL',
    heroIdx: casterIdx,
    spellKey
  });

  // Remove scroll from inventory
  const scrollIdx = caster.inventory?.indexOf(scrollKey);
  if (scrollIdx !== undefined && scrollIdx >= 0) {
    dispatch({
      type: 'REMOVE_FROM_INVENTORY',
      heroIdx: casterIdx,
      itemIdx: scrollIdx
    });
  }

  const message = `${caster.name} copies ${spell.name} into her spellbook and learns it permanently!`;
  dispatch({ type: 'LOG', t: `📖 ${message}` });

  return { success: true, message };
};
