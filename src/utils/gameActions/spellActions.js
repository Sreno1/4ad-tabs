/**
 * Spell Actions - Spellcasting and spell slot management
 */
import { SPELLS, getSpellSlots, castSpell } from '../../data/spells.js';
import { getScrollSpell, canUseScroll, getScrollCastingBonus } from '../../data/scrolls.js';
import { getTier } from '../../data/classes.js';
import { getTraitRollModifiers } from '../traitEffects.js';
import { formatRollPrefix } from '../rollLog.js';

/**
 * Cast a spell
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} caster - Hero casting the spell
 * @param {number} casterIdx - Caster's index in party
 * @param {string} spellKey - Spell key from SPELLS
 * @param {object} context - Spell context (targets, etc.)
 * @returns {object} Spell result
 */
export const performCastSpell = (dispatch, caster, casterIdx, spellKey, context = {}, ctx) => {
  const spell = SPELLS[spellKey];
  if (!spell) {
    dispatch({ type: 'LOG', t: `❌ Unknown spell: ${spellKey}` });
    return { success: false };
  }

  // Use a spell slot
  dispatch({ type: 'USE_SPELL', heroIdx: casterIdx });

  // Determine casting bonus from traits (Specialist) and context
  let castingBonus = 0;
  try {
    const traitMods = getTraitRollModifiers(caster, {});
    // Specialist trait handled directly: hero.specialistChoice should contain spell key
    if (caster?.trait) {
      const t = caster.trait;
      if (t === 'specialist' && caster.specialistChoice === spellKey) {
        // use Tier from level
        castingBonus += getTier(caster.lvl);
      }
    }
    // Other trait effects (like Shadow Adept for Shadow Strike) add Tier to specific spells
    if (caster?.trait === 'shadowAdept' && spellKey === 'shadow_strike') {
      castingBonus += getTier(caster.lvl);
    }
    if (traitMods && traitMods.flags && traitMods.flags.spellCastingBonus) {
      castingBonus += traitMods.flags.spellCastingBonus;
    }
  } catch (e) {
    // ignore trait errors
  }

  // Provide castingBonus to castSpell via explicit context.castingBonus
  const spellContext = { ...context, targets: context.targets || [], castingBonus };
  const result = castSpell(spellKey, caster, spellContext, ctx);
  // Log main message
  dispatch({ type: 'LOG', t: `✨ ${result.message}` });

  // If MR check details were recorded, log them for visibility
  if (result.details && result.details.mr) {
    const mr = result.details.mr;
    dispatch({ type: 'LOG', t: `${formatRollPrefix(mr.roll)}🛡️ MR Roll: d6=${mr.roll} + L${caster.lvl} = ${mr.total} vs MR${mr.mr} → ${mr.passed ? 'Pass' : 'Fail'}` });
  }
  if (result.details && result.details.cast) {
    const c = result.details.cast;
    dispatch({ type: 'LOG', t: `${formatRollPrefix(c.roll)}🎲 Cast Roll: d6=${c.roll} + L${caster.lvl} + ${castingBonus} = ${c.total} vs target` });
  }

  // Prefer the computed result.effect (some spells override behavior), else use definition
  const eff = result.effect || spell.effect;
  // Apply spell effects by effect type
  switch (eff) {
    case 'single_damage':
      if (context.targetMonsterIdx !== undefined && result.success && (typeof result.hit === 'undefined' || result.hit)) {
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { hp: Math.max(0, context.targetMonster.hp - (result.value || 0)) } });
      }
      break;

    case 'aoe_damage':
      // Damage all active monsters
      (context.allMonsters || []).forEach((m, idx) => {
        if (!m) return;
        const newHp = Math.max(0, (m.hp || 0) - (result.value || 0));
        dispatch({ type: 'UPD_MONSTER', i: idx, u: { hp: newHp } });
      });
      break;

    case 'sleep':
      // Sleep affects minor foes (reduce count) or a single major (set status)
      if (context.targetMonsterIdx !== undefined) {
        const m = context.targetMonster;
        if (m.count !== undefined) {
          // minor foes: put number to sleep (reduce count)
          const toSleep = Math.min(m.count, result.value || 0);
          const remaining = Math.max(0, m.count - toSleep);
          dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { count: remaining } });
        } else {
          // major foe: mark asleep with numeric turns
          const turns = (typeof result.duration === 'number') ? result.duration : 1;
          dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { status: { ...(m.status||{}), asleep: true }, asleepTurns: turns } });
          dispatch({ type: 'LOG', t: `😴 ${m.name} is put to sleep for ${turns} turn(s).` });
        }
      }
      break;

    case 'defense_buff':
      // Apply protection/barkskin to a hero
      if (context.targetHeroIdx !== undefined) {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: context.targetHeroIdx, statusKey: 'protected', value: true });
        // record bonus if present
        if (result.bonus) {
          dispatch({ type: 'SET_HERO_STATUS', heroIdx: context.targetHeroIdx, statusKey: 'protectBonus', value: result.bonus });
        }
      } else {
        // apply to caster by default
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'protected', value: true });
        if (result.bonus) dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'protectBonus', value: result.bonus });
      }
      break;

    case 'entangle':
      if (context.targetMonsterIdx !== undefined) {
        const turns = (typeof result.duration === 'number') ? result.duration : 0;
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { entangled: true, entangleTurns: turns } });
        dispatch({ type: 'LOG', t: `🕸️ ${context.targetMonster.name} is entangled for ${turns || 'the encounter'} turn(s).` });
      } else if (context.multipleTargetIdxs) {
        const turns = (typeof result.duration === 'number') ? result.duration : 0;
        (context.multipleTargetIdxs || []).forEach(i => {
          const m = (context.allMonsters || [])[i];
          dispatch({ type: 'UPD_MONSTER', i, u: { entangled: true, entangleTurns: turns } });
          dispatch({ type: 'LOG', t: `🕸️ ${m?.name || 'Target'} is entangled for ${turns || 'the encounter'} turn(s).` });
        });
      }
      break;

    case 'bind':
      if (context.targetMonsterIdx !== undefined) {
        const turnsB = (typeof result.duration === 'number') ? result.duration : 1;
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { bound: true, boundTurns: turnsB } });
        dispatch({ type: 'LOG', t: `🔗 ${context.targetMonster.name} is bound for ${turnsB} turn(s).` });
      }
      break;

    case 'summon_companion':
      // Add a simple monster representing the summoned creature
      const summon = result.summon || {};
      const monster = {
        id: `summon_${Date.now()}`,
        name: summon.name || 'Summon',
        level: 3,
        hp: summon.life || 5,
        maxHp: summon.life || 5,
        special: null
      };
      dispatch({ type: 'ADD_MONSTER', m: monster });
      break;

    case 'mirror_images':
      // Set hero status with mirror image copies
      if (context.casterIdx !== undefined) {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: context.casterIdx, statusKey: 'mirrorImages', value: result.copies || spell.copies || 1 });
      } else {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'mirrorImages', value: result.copies || spell.copies || 1 });
      }
      break;

    case 'dispel_illusions':
      // Reveal invisible or remove illusion flags on monsters
      (context.allMonsters || []).forEach((m, idx) => {
        if (!m) return;
        if (m.status && (m.status.invisible || m.status.illusion)) {
          const newStatus = { ...(m.status || {}) };
          delete newStatus.invisible;
          delete newStatus.illusion;
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { status: newStatus } });
        }
      });
      break;

    case 'fog':
      // Set a global combat meta or hero status to indicate fog; keep simple: set caster status
      dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'illusionFog', value: true });
      break;

    case 'subdual_buff':
      // Mark party-wide subdual-friendly flag in combat meta if available; fallback: hero status
      dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'subdualBuff', value: true });
      break;

    case 'food':
      // Add an inventory item or party status; keep simple: log amount in details
      dispatch({ type: 'LOG', t: `🍽️ ${caster.name} conjures ${result.amount} illusory rations.` });
      break;

    case 'subdual_damage':
      if (context.targetMonsterIdx !== undefined && result.success && (typeof result.hit === 'undefined' || result.hit)) {
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { hp: Math.max(0, context.targetMonster.hp - (result.value || 0)) } });
      }
      break;

    default:
      break;
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
export const performCastScrollSpell = (dispatch, caster, casterIdx, scrollKey, context = {}, ctx) => {
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

  const spellKey = spell.key || Object.keys(SPELLS).find(key => SPELLS[key] === spell);
  const spellContext = { ...context, targets: context.targets || [], castingBonus: (context.castingBonus || 0) + bonus };
  const result = castSpell(spellKey, caster, spellContext, ctx);
  result.scrollBonus = bonus;
  result.message = `${caster.name} reads ${scrollKey.replace('scroll_', '')} scroll and casts it (+${bonus} bonus)! ${result.message}`;
  dispatch({ type: 'LOG', t: `✨ ${result.message}` });

  if (result.details && result.details.mr) {
    const mr = result.details.mr;
    dispatch({ type: 'LOG', t: `🛡️ MR Roll: d6=${mr.roll} + L${caster.lvl} = ${mr.total} vs MR${mr.mr} → ${mr.passed ? 'Pass' : 'Fail'}` });
  }
  if (result.details && result.details.cast) {
    const c = result.details.cast;
    dispatch({ type: 'LOG', t: `🎲 Cast Roll: d6=${c.roll} + L${caster.lvl} = ${c.total} vs L${c.total ? c.total : 'target'}` });
  }

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
  // Reuse the same effect application logic as performCastSpell
  switch (spell.effect) {
    case 'single_damage':
      if (context.targetMonsterIdx !== undefined) {
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { hp: Math.max(0, context.targetMonster.hp - (result.value || 0)) } });
      }
      break;
    case 'aoe_damage':
      (context.allMonsters || []).forEach((m, idx) => {
        if (!m) return;
        const newHp = Math.max(0, (m.hp || 0) - (result.value || 0));
        dispatch({ type: 'UPD_MONSTER', i: idx, u: { hp: newHp } });
      });
      break;
    case 'sleep':
      if (context.targetMonsterIdx !== undefined) {
        const m = context.targetMonster;
        if (m.count !== undefined) {
          const toSleep = Math.min(m.count, result.value || 0);
          const remaining = Math.max(0, m.count - toSleep);
          dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { count: remaining } });
        } else {
          const turns = (typeof result.duration === 'number') ? result.duration : 1;
          dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { status: { ...(m.status||{}), asleep: true }, asleepTurns: turns } });
          dispatch({ type: 'LOG', t: `😴 ${m.name} is put to sleep for ${turns} turn(s).` });
        }
      }
      break;
    case 'defense_buff':
      if (context.targetHeroIdx !== undefined) {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: context.targetHeroIdx, statusKey: 'protected', value: true });
        if (result.bonus) dispatch({ type: 'SET_HERO_STATUS', heroIdx: context.targetHeroIdx, statusKey: 'protectBonus', value: result.bonus });
      } else {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'protected', value: true });
        if (result.bonus) dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'protectBonus', value: result.bonus });
      }
      break;
    case 'entangle':
      if (context.targetMonsterIdx !== undefined) {
        const turns = (typeof result.duration === 'number') ? result.duration : 0;
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { entangled: true, entangleTurns: turns } });
        dispatch({ type: 'LOG', t: `🕸️ ${context.targetMonster.name} is entangled for ${turns || 'the encounter'} turn(s).` });
      } else if (context.multipleTargetIdxs) {
        const turns = (typeof result.duration === 'number') ? result.duration : 0;
        (context.multipleTargetIdxs || []).forEach(i => {
          const m = (context.allMonsters || [])[i];
          dispatch({ type: 'UPD_MONSTER', i, u: { entangled: true, entangleTurns: turns } });
          dispatch({ type: 'LOG', t: `🕸️ ${m?.name || 'Target'} is entangled for ${turns || 'the encounter'} turn(s).` });
        });
      }
      break;
    case 'summon_companion':
      const summon = result.summon || {};
      const monster = { id: `summon_${Date.now()}`, name: summon.name || 'Summon', level: 3, hp: summon.life || 5, maxHp: summon.life || 5, special: null };
      dispatch({ type: 'ADD_MONSTER', m: monster });
      break;
    case 'dispel_illusions':
      (context.allMonsters || []).forEach((m, idx) => {
        if (!m) return;
        if (m.status && (m.status.invisible || m.status.illusion)) {
          const newStatus = { ...(m.status || {}) };
          delete newStatus.invisible;
          delete newStatus.illusion;
          dispatch({ type: 'UPD_MONSTER', i: idx, u: { status: newStatus } });
        }
      });
      break;
    case 'bind':
      if (context.targetMonsterIdx !== undefined) {
        const turnsB = (typeof result.duration === 'number') ? result.duration : 1;
        dispatch({ type: 'UPD_MONSTER', i: context.targetMonsterIdx, u: { bound: true, boundTurns: turnsB } });
        dispatch({ type: 'LOG', t: `🔗 ${context.targetMonster.name} is bound for ${turnsB} turn(s).` });
      }
      break;
    case 'fog':
      dispatch({ type: 'SET_HERO_STATUS', heroIdx: casterIdx, statusKey: 'illusionFog', value: true });
      break;
    default:
      break;
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
