/**
 * Trait Effects - small helper to translate selected traits into modifiers
 * This module centralizes trait-related runtime effects so selecting a trait
 * immediately affects stats where appropriate and contributes modifiers to
 * attack/defense/save calculations.
 */

import { getTrait } from '../data/traits.js';

/**
 * Get runtime modifiers for rolls based on a hero's selected trait.
 * @param {object} hero
 * @param {object} options - context (ranged, usingSling, firstAttack, etc.)
 * @returns {object} { attackMod, defenseMod, saveMod, flags }
 */
export function getTraitRollModifiers(hero, options = {}) {
  const mods = { attackMod: 0, defenseMod: 0, saveMod: 0, flags: {} };
  if (!hero || !hero.trait) return mods;

  const trait = getTrait(hero.key, hero.trait);
  if (!trait) return mods;

  const tkey = trait.key;

  // Good Shot: +1 to attack rolls with ranged weapons
  if (tkey === 'goodShot') {
    if (options.ranged || options.usingSling || options.weaponType === 'ranged') {
      mods.attackMod += 1;
    }
  }

  // Scrapper: +1 Defense rolls and ignore light weapon penalty (partial)
  if (tkey === 'scrapper') {
    mods.defenseMod += 1;
    mods.flags.ignoreLightWeaponPenalty = true;
  }

  // Tight Guard: +1 Defense vs first attack - caller must pass options.firstAttackTarget
  if (tkey === 'tightGuard') {
    if (options.firstAttackTarget) mods.defenseMod += 1;
  }

  // Clockwork Reflexes: reroll defense vs ranged and reroll trap saves - supply flags
  if (tkey === 'clockworkReflexes') {
    if (options.rangedDefense) mods.flags.rerollRangedDefense = true;
    if (options.trapSave) mods.flags.rerollTrapSave = true;
  }

  // Default: no modifiers
  return mods;
}

/**
 * Apply immediate, persistent effects of selecting a trait to a hero object.
 * Returns an object of fields to merge into the hero.
 * Only apply non-reversible stat changes here (e.g., +1 maxHp from trait).
 */
export function applyImmediateTraitEffects(hero, traitKey) {
  if (!hero || !traitKey) return {};

  const updates = {};

  if (traitKey === 'reinforcedBody') {
    // Gain +1 Life (maxHp and current hp go up by 1)
    updates.maxHp = (hero.maxHp || 1) + 1;
    updates.hp = Math.min((hero.hp || 0) + 1, updates.maxHp);
  }

  // Arcane Memory: tracking extraSpellSlots would require integration with spell code
  // so we don't modify spells here.

  return updates;
}
