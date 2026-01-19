// Modifier builders for combat actions
import { DARKNESS_PENALTY, CORRIDOR_PENALTY } from './combatActions.constants.js';
import { hasDarkvision } from '../../data/classes.js';
import { getEquippedMeleeWeapon } from '../combatLocationHelpers.js';
import { calculateEquipmentBonuses } from '../../data/equipment.js';

export function applyDarknessPenalty(hero, options) {
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    return DARKNESS_PENALTY;
  }
  return 0;
}

export function applyCorridorPenalty(hero, options) {
  if (options.location) {
    const weapon = getEquippedMeleeWeapon(hero);
    // You may want to use a more complex penalty logic here
    return CORRIDOR_PENALTY;
  }
  return 0;
}

export function buildAttackModifiers(hero, options) {
  let mod = 0;
  let modifiers = [];
  // Example: apply darkness
  const darkness = applyDarknessPenalty(hero, options);
  if (darkness) {
    mod += darkness;
    modifiers.push(`${darkness} (darkness)`);
  }
  // Example: apply corridor
  const corridor = applyCorridorPenalty(hero, options);
  if (corridor) {
    mod += corridor;
    modifiers.push(`${corridor} (corridor)`);
  }
  // Equipment
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod) {
    mod += equipBonus.attackMod;
    modifiers.push(`${equipBonus.attackMod} (equip)`);
  }
  // ...add more class, trait, and situational bonuses here
  return { mod, modifiers };
}
// ...add buildDefenseModifiers, buildSaveModifiers as needed
