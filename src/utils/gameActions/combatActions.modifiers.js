// Modifier builders for combat actions using schemas
import { DARKNESS_PENALTY, CORRIDOR_PENALTY } from './combatActions.constants.js';
import { hasDarkvision } from '../../data/classes.js';
import { getEquippedMeleeWeapon } from '../combatLocationHelpers.js';
import { calculateEquipmentBonuses } from '../../data/equipment.js';
import { calculateClassAttackBonus, calculateClassDefenseBonus } from '../../data/schema/class.js';
import { calculateWeaponAttackMod, calculateArmorDefenseMod } from '../../data/schema/equipment.js';
import { EnvironmentalModifiers, CombatStateModifiers, SpellModifiers, TraitModifiers, getTraitModifier } from '../../data/schema/combatModifiers.js';

/**
 * Check if hero has darkvision (moved from classes.js eventually)
 */
function hasHeroDarkvision(heroKey) {
  return hasDarkvision(heroKey);
}

/**
 * Apply darkness penalty
 */
export function applyDarknessPenalty(hero, options) {
  if (options.hasLightSource === false && !hasHeroDarkvision(hero.key)) {
    return DARKNESS_PENALTY;
  }
  return 0;
}

/**
 * Apply corridor penalty (weapon-specific)
 */
export function applyCorridorPenalty(hero, options) {
  if (options.location?.narrow) {
    const weapon = getEquippedMeleeWeapon(hero);
    // Two-handed weapons get -1 in narrow corridors
    if (weapon && weapon.category === 'twoHandedWeapon') {
      return -1; // Loses the +1 bonus, becomes -1
    }
    // Light weapons have penalty negated
    if (weapon && weapon.category === 'lightMelee') {
      return 1; // Negates the -1 penalty
    }
  }
  return 0;
}

/**
 * Build complete attack modifiers using schemas
 * @param {object} hero - Hero object
 * @param {object} options - Combat options
 * @returns {object} { mod: number, modifiers: string[] }
 */
export function buildAttackModifiers(hero, options = {}) {
  let mod = 0;
  let modifiers = [];

  // 1. CLASS-BASED ATTACK BONUS
  const classBonus = calculateClassAttackBonus(hero.key, hero.lvl, {
    weaponCategory: options.weapon?.category,
    weaponKey: options.weapon?.id,
    weaponType: options.weapon?.weaponType,
    ranged: options.ranged,
    targetType: options.target?.type,
    targetRace: options.target?.race,
    outnumberMinorFoe: options.outnumberMinorFoe,
    dualWielding: options.dualWielding,
    swornEnemy: options.swornEnemy,
    hiddenStrike: options.hiddenStrike,
  });

  if (classBonus !== 0) {
    mod += classBonus;
    modifiers.push(`${classBonus >= 0 ? '+' : ''}${classBonus} (class)`);
  }

  // 2. WEAPON MODIFIERS (from schema)
  if (options.weapon) {
    const weaponMod = calculateWeaponAttackMod(options.weapon, {
      location: options.location,
      target: options.target,
    });
    if (weaponMod !== 0) {
      mod += weaponMod;
      modifiers.push(`${weaponMod >= 0 ? '+' : ''}${weaponMod} (weapon)`);
    }
  }

  // 3. ENVIRONMENTAL MODIFIERS
  const darkness = applyDarknessPenalty(hero, options);
  if (darkness !== 0) {
    mod += darkness;
    modifiers.push(`${darkness} (darkness)`);
  }

  const corridor = applyCorridorPenalty(hero, options);
  if (corridor !== 0) {
    mod += corridor;
    modifiers.push(`${corridor >= 0 ? '+' : ''}${corridor} (corridor)`);
  }

  // 4. COMBAT STATE MODIFIERS
  if (options.unarmed) {
    mod += CombatStateModifiers.unarmed.attackMod;
    modifiers.push(`${CombatStateModifiers.unarmed.attackMod} (unarmed)`);
  }

  if (options.subdual) {
    mod += CombatStateModifiers.subdual.attackMod;
    modifiers.push(`${CombatStateModifiers.subdual.attackMod} (subdual)`);
  }

  if (options.target?.bound) {
    mod += CombatStateModifiers.bound.targetBonus;
    modifiers.push(`+${CombatStateModifiers.bound.targetBonus} (bound target)`);
  }

  if (options.mounted && !options.target?.mounted) {
    mod += CombatStateModifiers.mounted.vsFootTarget.attackMod;
    modifiers.push(`+${CombatStateModifiers.mounted.vsFootTarget.attackMod} (mounted)`);
  }

  if (options.rageActive && hero.key === 'barbarian') {
    mod += CombatStateModifiers.rage.attackMod;
    modifiers.push(`+${CombatStateModifiers.rage.attackMod} (rage)`);
  }

  if (options.blessed) {
    mod += CombatStateModifiers.blessed.attackMod;
    modifiers.push(`+${CombatStateModifiers.blessed.attackMod} (blessed)`);
  }

  if (options.attackingFleeingFoe) {
    mod += CombatStateModifiers.attackingFleeingFoe.attackMod;
    modifiers.push(`+${CombatStateModifiers.attackingFleeingFoe.attackMod} (fleeing foe)`);
  }

  // 5. TRAIT MODIFIERS
  if (hero.traits) {
    for (const trait of hero.traits) {
      const traitMod = getTraitModifier(trait, {
        hero,
        weapon: options.weapon,
        target: options.target,
        terrain: options.terrain,
        mounted: options.mounted,
      });
      if (traitMod && typeof traitMod === 'number') {
        mod += traitMod;
        modifiers.push(`${traitMod >= 0 ? '+' : ''}${traitMod} (${trait})`);
      }
    }
  }

  // 6. LEGACY TRAIT SYSTEM (fallback for compatibility)
  try {
    const traitEffects = require('../traitEffects.js');
    const traitMods = traitEffects.getTraitRollModifiers(hero, {
      target: options.target,
      weapon: options.weapon,
    });
    if (traitMods && traitMods.attackMod) {
      mod += traitMods.attackMod;
      modifiers.push(`+${traitMods.attackMod} (trait)`);
    }
  } catch (e) {
    // Legacy trait system not available
  }

  // 7. EQUIPMENT BONUSES (legacy system)
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod) {
    mod += equipBonus.attackMod;
    modifiers.push(`${equipBonus.attackMod >= 0 ? '+' : ''}${equipBonus.attackMod} (equip)`);
  }

  return { mod, modifiers };
}

/**
 * Build complete defense modifiers using schemas
 * @param {object} hero - Hero object
 * @param {object} options - Combat options
 * @returns {object} { mod: number, modifiers: string[] }
 */
export function buildDefenseModifiers(hero, options = {}) {
  let mod = 0;
  let modifiers = [];

  // 1. CLASS-BASED DEFENSE BONUS
  const classBonus = calculateClassDefenseBonus(hero.key, hero.lvl, {
    enemyType: options.enemyType,
    parry: options.parry,
    panacheDodge: options.panacheDodge,
  });

  if (classBonus !== 0) {
    mod += classBonus;
    modifiers.push(`${classBonus >= 0 ? '+' : ''}${classBonus} (class)`);
  }

  // 2. ARMOR MODIFIERS (from schema)
  if (hero.armor) {
    for (const armor of hero.armor) {
      const armorMod = calculateArmorDefenseMod(armor, {
        fleeing: options.fleeing,
        enemyWeapon: options.enemyWeapon,
      });
      if (armorMod !== 0) {
        mod += armorMod;
        modifiers.push(`+${armorMod} (${armor.type})`);
      }
    }
  }

  // 3. ENVIRONMENTAL MODIFIERS
  const darkness = applyDarknessPenalty(hero, options);
  if (darkness !== 0) {
    mod += darkness;
    modifiers.push(`${darkness} (darkness)`);
  }

  // 4. COMBAT STATE MODIFIERS
  if (options.withdrawing) {
    mod += CombatStateModifiers.withdrawing.defenseMod;
    modifiers.push(`+${CombatStateModifiers.withdrawing.defenseMod} (withdrawing)`);
  }

  if (options.cursed) {
    mod += CombatStateModifiers.cursed.defenseMod;
    modifiers.push(`${CombatStateModifiers.cursed.defenseMod} (cursed)`);
  }

  if (options.sleeping || options.paralyzed) {
    // Auto-hit, no defense roll
    modifiers.push('AUTO-HIT (sleeping/paralyzed)');
    return { mod: -999, modifiers }; // Very negative mod to ensure failure
  }

  // 5. SPELL EFFECTS
  if (options.protectionActive) {
    mod += SpellModifiers.protection.defenseMod;
    modifiers.push(`+${SpellModifiers.protection.defenseMod} (protection)`);
  }

  if (options.barkskinActive) {
    mod += SpellModifiers.barkskin.defenseMod;
    if (options.enemyType === 'fire') {
      mod += SpellModifiers.barkskin.vsFire.defenseMod;
      modifiers.push(`${SpellModifiers.barkskin.vsFire.defenseMod} (barkskin vs fire)`);
    } else {
      modifiers.push(`+${SpellModifiers.barkskin.defenseMod} (barkskin)`);
    }
  }

  if (options.illusionaryArmorActive && !['vermin', 'undead', 'artificial', 'elemental'].includes(options.enemyType)) {
    const tier = Math.floor((hero.lvl - 1) / 4) + 1;
    mod += tier;
    modifiers.push(`+${tier} (illusionary armor)`);
  }

  // 6. TRAIT MODIFIERS
  if (hero.traits) {
    for (const trait of hero.traits) {
      const traitMod = getTraitModifier(trait, {
        hero,
        target: options.target,
        enemyType: options.enemyType,
        isFirstAttackOfEncounter: options.firstAttackTarget,
      });
      if (traitMod && typeof traitMod === 'number') {
        mod += traitMod;
        modifiers.push(`${traitMod >= 0 ? '+' : ''}${traitMod} (${trait})`);
      }
    }
  }

  // 7. SPECIAL MODIFIERS
  if (options.parry && hero.key === 'lightGladiator') {
    mod += 2;
    modifiers.push('+2 (parry)');
  }

  if (options.panacheDodge) {
    mod += 2;
    modifiers.push('+2 (panache dodge)');
  }

  if (options.acrobatTrick) {
    mod += 2;
    modifiers.push('+2 (acrobat trick)');
  }

  // 8. LEGACY TRAIT SYSTEM (fallback)
  try {
    const traitEffects = require('../traitEffects.js');
    const traitMods = traitEffects.getTraitRollModifiers(hero, {
      firstAttackTarget: !!options.firstAttackTarget,
      rangedDefense: !!options.rangedDefense,
    });
    if (traitMods && traitMods.defenseMod) {
      mod += traitMods.defenseMod;
      modifiers.push(`+${traitMods.defenseMod} (trait)`);
    }
  } catch (e) {
    // Legacy trait system not available
  }

  // 9. EQUIPMENT BONUSES (legacy system)
  const equipBonus = calculateEquipmentBonuses(hero);
  let appliedEquipBonus = equipBonus.defenseMod || 0;

  if (options.ignoreShield) {
    appliedEquipBonus -= 1;
    modifiers.push('-1 (no shield)');
  }

  if (appliedEquipBonus !== 0) {
    mod += appliedEquipBonus;
    modifiers.push(`${appliedEquipBonus >= 0 ? '+' : ''}${appliedEquipBonus} (equip)`);
  }

  return { mod, modifiers };
}

/**
 * Build save modifiers
 * @param {object} hero - Hero object
 * @param {object} options - Save options
 * @returns {object} { mod: number, modifiers: string[] }
 */
export function buildSaveModifiers(hero, options = {}) {
  let mod = 0;
  let modifiers = [];

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.saveMod) {
    mod += equipBonus.saveMod;
    modifiers.push(`${equipBonus.saveMod >= 0 ? '+' : ''}${equipBonus.saveMod} (equip)`);
  }

  // Darkness penalty
  const darkness = applyDarknessPenalty(hero, options);
  if (darkness !== 0) {
    mod += darkness;
    modifiers.push(`${darkness} (darkness)`);
  }

  // Add class-specific save bonuses here as needed
  // (e.g., halfling luck, dwarf vs poison, etc.)

  return { mod, modifiers };
}
