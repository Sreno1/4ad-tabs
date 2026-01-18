  /**
 * Combat Actions - Attack, defense, saves, fleeing, and initiative
 */
import { d6, explodingD6 } from "../dice.js";
import { formatRollPrefix } from '../rollLog.js';
import { calculateEquipmentBonuses } from "../../data/equipment.js";
import {
  getSaveThreshold,
  getSaveModifier,
  rollSave,
} from "../../data/saves.js";
import { getTraitRollModifiers } from "../traitEffects.js";
import { getTier, hasDarkvision } from "../../data/classes.js";
import {
  checkMinorFoeMorale,
  checkMajorFoeLevelReduction,
} from "./monsterActions.js";
import {
  getNarrowCorridorPenalty,
  getEquippedMeleeWeapon
} from "../combatLocationHelpers.js";

// Helper: effective monster level after status effects
const getEffectiveMonsterLevel = (monster) => {
  if (!monster) return 1;
  let lvl = monster.level || 1;
  if (monster.entangled) lvl = Math.max(1, lvl - 1);
  return lvl;
};

/**
 * Calculate basic attack result (for simple attacks)
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Target foe level
 * @returns {object} Attack result
 */
export const calculateAttack = (hero, foeLevel, options = {}) => {
  const roll = d6();
  let mod = 0;
  let corridorNote = '';

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "elf", "dwarf"].includes(hero.key)) {
    mod = hero.lvl;
  } else if (hero.key === "cleric") {
    mod = Math.floor(hero.lvl / 2);
  }
  // Rogue gets +L when outnumbered
  if (hero.key === 'rogue' && options.rogueOutnumbers) {
    mod += hero.lvl;
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  mod += equipBonus.attackMod;

  // Narrow corridor penalty (two-handed weapons)
  if (options.location) {
    const weapon = getEquippedMeleeWeapon(hero);
    const corridorPenalty = getNarrowCorridorPenalty(options.location, weapon);
    if (corridorPenalty !== 0) {
      mod += corridorPenalty;
      corridorNote = ` ${corridorPenalty} (narrow corridor)`;
  try { console.debug('NARROW_CORRIDOR_PENALTY', { fn: 'calculateAttack', hero: hero && hero.name, weapon: weapon && weapon.key, corridorPenalty, location: options.location }); } catch (e) {}
    }
  }

  const total = roll + mod;
  const hits = roll === 1 ? 0 : Math.floor(total / foeLevel);
  const exploded = roll === 6;

  return {
    roll,
    mod,
    total,
    hits,
    exploded,
  message: `${hero.name}: ${roll}+${mod}=${total} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " 💥EXPLODE" : ""}${corridorNote}`,
  };
};

/**
 * Calculate enhanced attack with exploding dice (for Major Foes)
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Target foe level
 * @param {object} options - Combat options (dualWielding, blessed, rage, hasLightSource, location, etc.)
 * @returns {object} Attack result
 */
export const calculateEnhancedAttack = (hero, foeLevel, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Trait modifiers
  const traitMods = getTraitRollModifiers(hero, { ranged: !!options.ranged, usingSling: !!options.usingSling, weaponType: options.weaponType });
  if (traitMods.attackMod) {
    mod += traitMods.attackMod;
    modifiers.push(`+${traitMods.attackMod} (trait)`);
  }

  // Bonus vs bound targets
  if (options.boundTarget) {
    mod += 2;
    modifiers.push('+2 (bound target)');
  }

  // Darkness penalty (-2 if no light and character lacks darkvision)
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    mod -= 2;
    modifiers.push("-2 (darkness)");
  }

  // Narrow corridor penalty (two-handed weapons)
  if (options.location) {
    const weapon = getEquippedMeleeWeapon(hero);
    const corridorPenalty = getNarrowCorridorPenalty(options.location, weapon);
    if (corridorPenalty !== 0) {
      mod += corridorPenalty;
      modifiers.push(`${corridorPenalty} (narrow corridor)`);
  try { console.debug('NARROW_CORRIDOR_PENALTY', { fn: 'calculateEnhancedAttack', hero: hero && hero.name, weapon: weapon && weapon.key, corridorPenalty, location: options.location }); } catch (e) {}
    }
  }

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "paladin", "assassin"].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === "elf" && !options.using2H) {
    // Elf gets +L but not with 2H weapons
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === "dwarf" && options.melee) {
    // Dwarf gets +L melee only
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === "halfling" && options.usingSling) {
    // Halfling gets +L with sling
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === "cleric") {
    mod += Math.floor(hero.lvl / 2);
    modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
  } else if (
    ["druid", "acrobat", "gnome", "swashbuckler", "bulwark"].includes(hero.key)
  ) {
    // These classes get +½L
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === "ranger") {
    // Ranger gets +L base
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === "kukla" && options.lightBlade) {
    // Kukla gets +1 with light blades
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === "lightGladiator" && options.lightWeapon) {
    // Light Gladiator gets +½L with light weapons only
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === "mushroomMonk") {
    // Mushroom Monk gets +L martial, +½L other
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  } else if (hero.key === "rogue" && options.rogueOutnumbers) {
    // Rogue gets +L when outnumbered
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (outnumbered)`);
  }

  // Dual wield bonus (Ranger, Swashbuckler, Light Gladiator)
  if (options.dualWielding) {
    if (hero.key === "ranger" || hero.key === "lightGladiator") {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    } else if (hero.key === "swashbuckler") {
      // Swashbuckler dual wield is built into base attack
      modifiers.push("(dual wield)");
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === "ranger") {
    mod += 2;
    modifiers.push("+2 (sworn enemy)");
  }

  // Bonus vs bound targets
  if (options.boundTarget) {
    mod += 2;
    modifiers.push('+2 (bound target)');
  }

  // Assassin hide in shadows (3x damage = +2L to attack)
  if (options.hiddenStrike && hero.key === "assassin") {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(
      `${equipBonus.attackMod >= 0 ? "+" : ""}${equipBonus.attackMod} (equip)`,
    );
  }

  // Rage bonus
  if (options.rageActive && hero.key === "barbarian") {
    mod += 2;
    modifiers.push("+2 (rage)");
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push("+1 (blessed)");
  }

  // Bulwark ranged bonus (uses Tier instead of level)
  if (options.ranged && hero.key === "bulwark") {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / foeLevel); // Natural 1 always misses

  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";

  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " 💥EXPLODED!" : ""}`,
  };
};

/**
 * Calculate multi-kill against Minor Foes (Vermin/Minions)
 * Per 4AD rules: Attack roll ÷ Foe Level = number of foes killed
 * @param {number} attackTotal - Total attack roll (with modifiers)
 * @param {number} foeLevel - Level of the Minor Foes
 * @param {number} foeCount - Number of foes remaining
 * @returns {object} { kills, message }
 */
export const calculateMinorFoeKills = (attackTotal, foeLevel, foeCount) => {
  // Natural 1 always misses
  if (attackTotal < foeLevel) {
    return { kills: 0, message: "Miss!" };
  }

  // Number killed = attack total ÷ foe level (rounded down)
  const potentialKills = Math.floor(attackTotal / foeLevel);
  const actualKills = Math.min(potentialKills, foeCount);

  return {
    kills: actualKills,
    potentialKills,
    message:
      actualKills > 1
        ? `${actualKills} foes slain!`
        : actualKills === 1
          ? "1 foe slain!"
          : "Miss!",
  };
};

/**
 * Attack Minor Foe with multi-kill calculation
 * @param {object} hero - Attacking hero
 * @param {object} foe - Minor foe group
 * @param {object} options - Combat options (hasLightSource, location, etc.)
 * @returns {object} Attack result
 */
export const attackMinorFoe = (hero, foe, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Darkness penalty (-2 if no light and character lacks darkvision)
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    mod -= 2;
    modifiers.push("-2 (darkness)");
  }

  // Narrow corridor penalty (two-handed weapons)
  if (options.location) {
    const weapon = getEquippedMeleeWeapon(hero);
    const corridorPenalty = getNarrowCorridorPenalty(options.location, weapon);
    if (corridorPenalty !== 0) {
      mod += corridorPenalty;
      modifiers.push(`${corridorPenalty} (narrow corridor)`);
  try { console.debug('NARROW_CORRIDOR_PENALTY', { fn: 'attackMinorFoe', hero: hero && hero.name, weapon: weapon && weapon.key, corridorPenalty, location: options.location }); } catch (e) {}
    }
  }

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "paladin", "assassin"].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === "elf" && !options.using2H) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === "dwarf" && options.melee) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === "halfling" && options.usingSling) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === "cleric") {
    // Clerics get +L vs undead
    const isUndead = foe.special?.includes("undead");
    if (isUndead) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (vs undead)`);
    } else {
      mod += Math.floor(hero.lvl / 2);
      modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
    }
  } else if (
    ["druid", "acrobat", "gnome", "swashbuckler", "bulwark"].includes(hero.key)
  ) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === "ranger") {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === "kukla" && options.lightBlade) {
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === "lightGladiator" && options.lightWeapon) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === "mushroomMonk") {
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  } else if (hero.key === "rogue") {
    // Rogue gets +L when attacking outnumbered Minor Foes
    if (options.rogueOutnumbers) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (outnumbered)`);
    }
  }

  // Dual wield bonus
  if (options.dualWielding) {
    if (hero.key === "ranger" || hero.key === "lightGladiator") {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === "ranger") {
    mod += 2;
    modifiers.push("+2 (sworn enemy)");
  }

  // Assassin hide in shadows
  if (options.hiddenStrike && hero.key === "assassin") {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(
      `${equipBonus.attackMod >= 0 ? "+" : ""}${equipBonus.attackMod} (equip)`,
    );
  }

  // Rage bonus
  if (options.rageActive && hero.key === "barbarian") {
    mod += 2;
    modifiers.push("+2 (rage)");
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push("+1 (blessed)");
  }

  // Bulwark ranged bonus
  if (options.ranged && hero.key === "bulwark") {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;

  // Calculate multi-kill
  const killResult = calculateMinorFoeKills(
    finalTotal,
    foe.level,
    foe.count || 1,
  );

  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";

  return {
    rolls,
    total,
    mod,
    finalTotal,
    kills: killResult.kills,
    exploded,
    isMinorFoe: true,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foe.level} → ${killResult.message}${exploded ? " 💥EXPLODED!" : ""}`,
  };
};

/**
 * Calculate defense result
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Attacking foe level
 * @param {object} options - Additional options (largeEnemy, parry, hasLightSource, etc.)
 * @returns {object} Defense result
 */
export const calculateDefense = (hero, foeLevel, options = {}) => {
  const roll = d6();
  let mod = 0;
  const modifiers = [];

  // Trait modifiers for defense (use imported helper)
  try {
    const traitMods = getTraitRollModifiers(hero, { firstAttackTarget: !!options.firstAttackTarget, rangedDefense: !!options.rangedDefense });
    if (traitMods && traitMods.defenseMod) {
      mod += traitMods.defenseMod;
      modifiers.push(`+${traitMods.defenseMod} (trait)`);
    }
  } catch (e) {
    // ignore errors from trait effects
  }

  // Darkness penalty (-2 if no light and character lacks darkvision)
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    mod -= 2;
    modifiers.push("-2 (darkness)");
  }

  // Class-specific defense bonuses
  if (hero.key === "rogue") {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (rogue)`);
  } else if (hero.key === "halfling" && options.largeEnemy) {
    // Halfling gets +L vs large enemies
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (vs large)`);
  } else if (hero.key === "dwarf" && options.largeEnemy) {
    // Dwarf gets +1 vs large enemies
    mod += 1;
    modifiers.push("+1 (vs large)");
  } else if (
    [
      "acrobat",
      "swashbuckler",
      "bulwark",
      "gnome",
      "kukla",
      "lightGladiator",
      "mushroomMonk",
    ].includes(hero.key)
  ) {
    // These classes get +½L to defense
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  }

  // Parry (Light Gladiator)
  if (options.parry && hero.key === "lightGladiator") {
    mod += 2;
    modifiers.push("+2 (parry)");
  }

  // Panache dodge (Swashbuckler)
  if (options.panacheDodge) {
    mod += 2;
    modifiers.push("+2 (panache)");
  }

  // Acrobat trick
  if (options.acrobatTrick) {
    mod += 2;
    modifiers.push("+2 (trick)");
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  // Equipment bonuses - allow ignoring shields for surprise/ambush cases
  let appliedEquipBonus = equipBonus.defenseMod || 0;
  if (options.ignoreShield) {
    try {
      const eq = hero.equipment || [];
      const hasShield = Array.isArray(eq) && eq.some(k => {
        const it = require('../../data/equipment.js').getEquipment ? require('../../data/equipment.js').getEquipment(k) : null;
        return it && (it.category === 'shield' || it.key === 'shield');
      });
      if (hasShield) {
        // Subtract a baseline shield bonus (assumed +1)
        appliedEquipBonus -= 1;
        modifiers.push('-1 (no shield allowed)');
      }
    } catch (e) {
      // ignore any require-time issues
    }
  }
  if (appliedEquipBonus !== 0) {
    mod += appliedEquipBonus;
    modifiers.push(
      `${appliedEquipBonus >= 0 ? "+" : ""}${appliedEquipBonus} (equip)`,
    );
  }

  const total = roll + mod;
  const blocked = total > foeLevel;

  const modStr = modifiers.length > 0 ? ` (${modifiers.join(" ")})` : "";

  return {
    roll,
    mod,
    total,
    blocked,
    damage: blocked ? 0 : 1,
    message: `${hero.name} DEF: ${roll}${modStr}=${total} vs L${foeLevel} → ${blocked ? "Block!" : "HIT -1 Life"}`,
  };
};

/**
 * Perform a save roll when taking lethal damage
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero taking damage
 * @param {number} heroIdx - Hero index in party
 * @param {string} damageSource - Source of damage (trap type, monster type)
 * @param {object} options - Additional options (hasLightSource, etc.)
 * @returns {object} Save result
 */
export const performSaveRoll = (
  dispatch,
  hero,
  heroIdx,
  damageSource = "default",
  options = {},
) => {
  const threshold = getSaveThreshold(damageSource);
  const { bonus, reasons } = getSaveModifier(hero);

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  let totalBonus = bonus + equipBonus.saveMod;
  const allReasons = [...reasons];
  if (equipBonus.saveMod !== 0) {
    allReasons.push(
      `${equipBonus.saveMod >= 0 ? "+" : ""}${equipBonus.saveMod} equip`,
    );
  }

  // Darkness penalty (-2 if no light and character lacks darkvision)
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    totalBonus -= 2;
    allReasons.push("-2 (darkness)");
  }

  const result = rollSave(threshold, totalBonus);

  const modStr = allReasons.length > 0 ? ` (${allReasons.join(", ")})` : "";

  if (result.success) {
    // Survived - set to 1 HP and mark as wounded
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 1 } });
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "wounded",
      value: true,
    });
  dispatch({ type: "LOG", t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
  dispatch({ type: "LOG", t: `${formatRollPrefix(result.roll)}✅ ${result.message}` });
  } else {
    // Dead - set to 0 HP and mark as dead
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 0 } });
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "dead",
      value: true,
    });
  dispatch({ type: "LOG", t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
  dispatch({ type: "LOG", t: `${formatRollPrefix(result.roll)}❌ ${result.message}` });
  }

  return result;
};

/**
 * Use Cleric Blessing to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Cleric's index
 * @param {object} targetHero - Hero who needs re-roll
 * @param {number} targetIdx - Target hero's index
 * @param {string} damageSource - Original damage source
 * @param {object} options - Additional options (hasLightSource, etc.)
 * @returns {object} New save result
 */
export const useBlessingForSave = (
  dispatch,
  heroIdx,
  targetHero,
  targetIdx,
  damageSource = "default",
  options = {},
) => {
  dispatch({ type: "USE_BLESS", heroIdx });
  dispatch({ type: "LOG", t: `🙏 Cleric uses Blessing to grant a re-roll!` });

  return performSaveRoll(dispatch, targetHero, targetIdx, damageSource, options);
};

/**
 * Use Halfling Luck to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Halfling's index
 * @param {object} hero - Halfling hero
 * @param {string} damageSource - Original damage source
 * @param {object} options - Additional options (hasLightSource, etc.)
 * @returns {object} New save result
 */
export const useLuckForSave = (
  dispatch,
  heroIdx,
  hero,
  damageSource = "default",
  options = {},
) => {
  dispatch({ type: "USE_LUCK", heroIdx });
  dispatch({ type: "LOG", t: `🍀 Halfling uses Luck to re-roll!` });

  return performSaveRoll(dispatch, hero, heroIdx, damageSource, options);
};

/**
 * Attempt to flee from combat
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting to flee
 * @param {number} heroIdx - Hero index
 * @param {number} monsterLevel - Monster level to flee from
 * @returns {object} Flee result
 */
export const attemptFlee = (dispatch, hero, heroIdx, monsterLevel) => {
  const roll = d6();
  let mod = 0;

  // Rogue and Halfling get bonuses to flee
  if (hero.key === "rogue") mod = hero.lvl;
  if (hero.key === "halfling") mod = Math.floor(hero.lvl / 2);

  const total = roll + mod;
  const success = total > monsterLevel;

  if (success) {
    dispatch({
      type: "LOG",
  t: `${formatRollPrefix(roll)}🏃 ${hero.name} escapes! (${roll}+${mod}=${total} vs L${monsterLevel})`,
    });
  } else {
    // Failed flee = free attack from monsters
    dispatch({
      type: "LOG",
  t: `${formatRollPrefix(roll)}❌ ${hero.name} fails to escape! (${roll}+${mod}=${total} vs L${monsterLevel})`,
    });
    dispatch({ type: "LOG", t: `⚔️ Monsters get a free attack!` });
  }

  return { success, roll, mod, total, freeAttack: !success };
};

/**
 * Foes strike heroes during escape (Flee or Withdraw)
 * Each foe gets one attack as party retreats
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} party - Party array
 * @param {array} monsters - Monster array
 * @param {boolean} isWithdraw - True if withdrawing (PCs get +1 Defense)
 * @returns {object} Strike results
 */
export const foeStrikeDuringEscape = (dispatch, party, monsters, isWithdraw = false, options = {}) => {
  if (!monsters || monsters.length === 0) return { totalDamage: 0, hitCount: 0 };

  dispatch({
    type: "LOG",
    t: isWithdraw
      ? `⚔️ Foes strike as party withdraws! (PCs get +1 Defense)`
      : `⚔️ Foes strike as party flees!`,
  });

  let totalDamage = 0;
  let hitCount = 0;
  const aliveHeroes = party.filter((h) => h.hp > 0);

  if (aliveHeroes.length === 0) return { totalDamage: 0, hitCount: 0 };

  // Each monster gets ONE attack
  // If monster.ambush is true, prefer rear-most alive heroes (end of party array)
  let rearTargetsAllocated = 0;
  monsters.forEach((monster) => {
    let target;
    if (monster.ambush) {
      // Find nth rear-most alive hero that hasn't been targeted yet
      const aliveOrdered = party.filter(h => h.hp > 0);
      // Sort by position in party array: rear is end, so reverse
      const reversed = aliveOrdered.slice().reverse();
      target = reversed[rearTargetsAllocated] || reversed[0];
      rearTargetsAllocated += 1;
    } else {
      // Determine target (random alive hero)
      const targetIdx = Math.floor(Math.random() * aliveHeroes.length);
      target = aliveHeroes[targetIdx];
    }

    // Skip asleep monsters
    if (monster.status && monster.status.asleep) {
      dispatch({ type: 'LOG', t: `😴 ${monster.name} is asleep and does not attack.` });
      return;
    }

  // Roll d6 for monster attack
  const roll = d6();
    let targetDefense = isWithdraw ? target.lvl + 1 : target.lvl; // +1 Defense when withdrawing
    let defenseMod = isWithdraw ? 1 : 0;
    if (!isWithdraw && options.environment === 'fungal_grottoes') {
      const exempt = ['ranger', 'rogue', 'acrobat', 'halfling', 'mushroomMonk'];
      if (!exempt.includes(target.key)) {
        targetDefense -= 1;
        defenseMod -= 1;
      }
    }

    // Monster hits if roll + effective monster level > target defense
    const effectiveLevel = getEffectiveMonsterLevel(monster);
    const monsterAttack = roll + effectiveLevel;
    const hits = monsterAttack > targetDefense;

    if (hits) {
      totalDamage += 1;
      hitCount += 1;
      dispatch({
        type: "LOG",
        t: `${formatRollPrefix(roll)}❌ ${monster.name} hits ${target.name}! (${roll}+${monster.level}=${monsterAttack} vs ${targetDefense})`,
      });

      // Apply damage
      const partyIdx = party.indexOf(target);
      if (partyIdx >= 0) {
        dispatch({
          type: "UPD_HERO",
          i: partyIdx,
          u: { hp: Math.max(0, target.hp - 1) },
        });

        if (target.hp - 1 <= 0) {
          dispatch({ type: "LOG", t: `💀 ${target.name} is defeated!` });
        }
      }
    } else {
      dispatch({
        type: "LOG",
        t: `${formatRollPrefix(roll)}✅ ${target.name} avoids ${monster.name}'s attack! (${roll}+${monster.level}=${monsterAttack} vs ${targetDefense}${defenseMod === 1 ? '+1' : defenseMod === -1 ? '-1' : ''})`,
      });
    }
  });

  return { totalDamage, hitCount, foeAttacksCount: monsters.length };
};

/**
 * Allocate immediate wandering-monster ambush strikes when monsters appear.
 * - If location is 'corridor': target rear marching positions (positions 2 & 3 — zero-based indices 2 and 3 in marchingOrder mapping)
 * - If location is 'room': if enough foes to hit all PCs, assign 1 attack each; extra attacks to hated then lowest HP
 * This function applies damage immediately and logs results.
 */
export const initialWanderingStrikes = (dispatch, state) => {
  const monsters = state.monsters || [];
  if (!monsters || monsters.length === 0) return;
  const party = state.party || [];
  const marchingOrder = state.marchingOrder || [0,1,2,3];
  const location = state.currentCombatLocation?.type || null;

  dispatch({ type: 'LOG', t: `⚠️ Wandering Monsters ambush! They strike immediately.` });

  // Build list of alive hero indices
  const aliveIdx = party.map((h, idx) => ({ h, idx })).filter(x => x.h && x.h.hp > 0).map(x => x.idx);
  if (aliveIdx.length === 0) return;

  // Expand monsters into individual attackers (for minor foes with counts, expand count times)
  const attackers = [];
  monsters.forEach(m => {
    const count = m.count && m.isMinorFoe ? m.count : 1;
    for (let i = 0; i < count; i++) attackers.push(m);
  });

  // Helper: resolve a single monster attack against heroIdx (simple d6 vs hero.lvl check)
  const resolveAttack = (monster, heroIdx) => {
    const hero = party[heroIdx];
    if (!hero || hero.hp <= 0) return false;
    // Skip asleep monsters
    if (monster.status && monster.status.asleep) {
      dispatch({ type: 'LOG', t: `😴 ${monster.name} is asleep and does not attack.` });
      return false;
    }
  const roll = d6();
    const defense = hero.lvl; // no withdraw modifier here
    const effectiveLevel = getEffectiveMonsterLevel(monster);
    const hits = (roll + effectiveLevel) > defense;
    if (hits) {
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}❌ ${monster.name} hits ${hero.name}! (${roll}+${monster.level} vs ${defense})` });
      dispatch({ type: 'UPD_HERO', i: heroIdx, u: { hp: Math.max(0, hero.hp - 1) } });
      if (hero.hp - 1 <= 0) dispatch({ type: 'LOG', t: `💀 ${hero.name} is defeated!` });
    } else {
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}✅ ${hero.name} avoids ${monster.name}'s attack (${roll}+${monster.level} vs ${defense})` });
    }
    return hits;
  };

  if (location === 'corridor') {
    // Rear positions per MarchingOrder layout: positions 2 and 3 (zero-based indices 2,3) map to rear PCs
    const rearPositions = [2,3];
    const rearHeroIdx = [];
    rearPositions.forEach(pos => {
      const heroIdx = marchingOrder[pos];
      if (typeof heroIdx === 'number' && party[heroIdx] && party[heroIdx].hp > 0) rearHeroIdx.push(heroIdx);
    });

    // Assign attackers to rear heroes first (round-robin)
    let ai = 0;
    attackers.forEach(attacker => {
      const target = rearHeroIdx[ai % rearHeroIdx.length] || aliveIdx[0];
      resolveAttack(attacker, target);
      ai += 1;
    });
    return;
  }

  // Room logic: ensure each PC gets at least one attack if enough attackers
  if (attackers.length >= aliveIdx.length) {
    // Shuffle attackers for assignment fairness
    const shuffled = attackers.slice();
    // Simple Fisher-Yates
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }

    // First, assign one attacker per hero
    const assignments = {};
    let attackerIdx = 0;
    aliveIdx.forEach(heroIdx => {
      const attacker = shuffled[attackerIdx++];
      if (attacker) assignments[heroIdx] = [attacker];
    });

    // Remaining attackers: prefer hated character, then lowest HP
    const hatedIdx = party.findIndex(h => h && h.hated);
    const hpOrder = aliveIdx.slice().sort((a,b) => (party[a].hp - party[b].hp) || 0);
    while (attackerIdx < shuffled.length) {
      let target = null;
      if (hatedIdx !== -1 && party[hatedIdx] && party[hatedIdx].hp > 0) target = hatedIdx;
      else target = hpOrder.shift() || aliveIdx[0];
      if (!assignments[target]) assignments[target] = [];
      assignments[target].push(shuffled[attackerIdx++]);
    }

    // Resolve assignments
    Object.keys(assignments).forEach(k => {
      const heroIdx = parseInt(k, 10);
      assignments[k].forEach(att => resolveAttack(att, heroIdx));
    });
    return;
  }

  // Fallback: fewer attackers than PCs, target lowest HP then hated then random
  const hpSorted = aliveIdx.slice().sort((a,b) => party[a].hp - party[b].hp);
  let ai2 = 0;
  attackers.forEach(att => {
    let target = hpSorted[ai2 % hpSorted.length];
    resolveAttack(att, target);
    ai2 += 1;
  });
};

/**
 * Perform standard monster turn attacks following allocation rules.
 * Applies rules for room vs corridor, attacker/PC counts, hatred targeting,
 * and respects wandering ambush meta when present.
 */
export const performMonsterAttacks = (dispatch, state) => {
  const monsters = state.monsters || [];
  if (!monsters || monsters.length === 0) return;
  const party = state.party || [];
  const marchingOrder = state.marchingOrder || [0,1,2,3];
  const location = state.currentCombatLocation?.type || null;

  dispatch({ type: 'LOG', t: `⚔️ Monsters strike!` });

  // Build list of alive hero indices
  const aliveIdx = party.map((h, idx) => ({ h, idx })).filter(x => x.h && x.h.hp > 0).map(x => x.idx);
  if (aliveIdx.length === 0) return;

  // Expand monsters into individual attackers (for minor foes with counts, expand count times)
  const attackers = [];
  monsters.forEach(m => {
    const count = m.count && m.isMinorFoe ? m.count : 1;
    for (let i = 0; i < count; i++) attackers.push(m);
  });
  if (attackers.length === 0) return;

  // Helper to resolve a single monster attack
  const resolveAttack = (monster, heroIdx) => {
    const hero = party[heroIdx];
    if (!hero || hero.hp <= 0) return false;
    if (monster.status && monster.status.asleep) {
      dispatch({ type: 'LOG', t: `😴 ${monster.name} is asleep and does not attack.` });
      return false;
    }
  const roll = d6();
    const defense = hero.lvl;
    const effectiveLevel = getEffectiveMonsterLevel(monster);
    const hits = (roll + effectiveLevel) > defense;
    if (hits) {
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}❌ ${monster.name} hits ${hero.name}! (${roll}+${monster.level} vs ${defense})` });
      dispatch({ type: 'UPD_HERO', i: heroIdx, u: { hp: Math.max(0, hero.hp - 1) } });
      if (hero.hp - 1 <= 0) dispatch({ type: 'LOG', t: `💀 ${hero.name} is defeated!` });
    } else {
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}✅ ${hero.name} avoids ${monster.name}'s attack (${roll}+${monster.level} vs ${defense})` });
    }
    return hits;
  };

  // If this encounter is a wandering ambush meta, prefer the ambush rules
  const isWandering = !!(state && state.combatMeta && state.combatMeta.wanderingEncounter && state.combatMeta.wanderingEncounter.ambush);
  if (isWandering && location === 'corridor') {
    // Ambush in corridor: target rear marching positions (2 & 3)
    const rearPositions = [2,3];
    const rearHeroIdx = [];
    rearPositions.forEach(pos => {
      const heroIdx = marchingOrder[pos];
      if (typeof heroIdx === 'number' && party[heroIdx] && party[heroIdx].hp > 0) rearHeroIdx.push(heroIdx);
    });
    let ai = 0;
    attackers.forEach(attacker => {
      const target = rearHeroIdx[ai % rearHeroIdx.length] || aliveIdx[0];
      resolveAttack(attacker, target);
      ai += 1;
    });
    return;
  }

  // Corridor (non-ambush): at most TWO foes attack positions 1 and 2 (marchingOrder[0,1])
  if (location === 'corridor') {
    const frontPositions = [marchingOrder[0], marchingOrder[1]].filter(i => typeof i === 'number' && party[i] && party[i].hp > 0);
    // If only one PC present, they can be attacked by up to two foes
    if (frontPositions.length === 1) {
      const target = frontPositions[0];
      // Use up to two attackers
      for (let i = 0; i < Math.min(2, attackers.length); i++) resolveAttack(attackers[i], target);
      if (attackers.length > 2) dispatch({ type: 'LOG', t: `⚠️ ${attackers.length-2} foes cannot reach the front in the corridor.` });
      return;
    }
    // Two front positions: assign first two attackers to them
    for (let i = 0; i < Math.min(2, attackers.length); i++) {
      const target = frontPositions[i % frontPositions.length];
      resolveAttack(attackers[i], target);
    }
    if (attackers.length > 2) dispatch({ type: 'LOG', t: `⚠️ ${attackers.length-2} foes cannot reach the front in the corridor.` });
    return;
  }

  // Room logic
  const N = attackers.length;
  const M = aliveIdx.length;

  // Helper: find hated index if any (monster-level hatred isn't stored per attacker here, so check party for .hated flag)
  const hatedIdx = party.findIndex(h => h && h.hated && h.hp > 0);

  if (N < M) {
    // Fewer foes than PCs: choose targets by priority (prefer warriors/clerics/defenders)
    const classPriority = ['warrior','cleric','barbarian','paladin','ranger','rogue','wizard','halfling'];
    const sortedTargets = aliveIdx.slice().sort((a,b) => {
      const ca = classPriority.indexOf((party[a].class || '').toLowerCase());
      const cb = classPriority.indexOf((party[b].class || '').toLowerCase());
      if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
      return (party[b].hp - party[a].hp); // prefer higher HP among same class
    });
    // Assign each attacker to next preferred target (no hero gets >1 unless attackers exceed preferred list)
    attackers.forEach((att, i) => {
      const target = sortedTargets[i % sortedTargets.length];
      resolveAttack(att, target);
    });
    return;
  }

  if (N === M) {
    // One attacker per hero
    for (let i = 0; i < M; i++) resolveAttack(attackers[i], aliveIdx[i]);
    return;
  }

  // N > M: distribute equally then assign remaining to hated or lowest HP
  const base = Math.floor(N / M);
  const rem = N % M;
  // assignments: counts per hero index
  const counts = {};
  aliveIdx.forEach(idx => counts[idx] = base);

  // Distribute remainder: first to any hated heroes, then lowest HP
  let remaining = rem;
  if (hatedIdx !== -1 && counts[hatedIdx] !== undefined) {
    counts[hatedIdx] += 1;
    remaining -= 1;
  }
  if (remaining > 0) {
    const hpOrder = aliveIdx.slice().sort((a,b) => (party[a].hp - party[b].hp)); // lowest HP first
    let i = 0;
    while (remaining > 0) {
      const t = hpOrder[i % hpOrder.length];
      counts[t] += 1;
      remaining -= 1;
      i += 1;
    }
  }

  // Now resolve attacks in order: iterate attackers and apply to heroes according to counts
  let attackerIdx = 0;
  aliveIdx.forEach(heroIdx => {
    const c = counts[heroIdx] || 0;
    for (let k = 0; k < c && attackerIdx < attackers.length; k++) {
      resolveAttack(attackers[attackerIdx++], heroIdx);
    }
  });
};

/**
 * Attempt party flee (all must succeed)
 * During flee, foes also get to strike once
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} party - Party array
 * @param {array} monsters - Monster array
 * @param {number} monsterLevel - Highest monster level
 * @returns {object} Party flee result
 */
export const attemptPartyFlee = (dispatch, party, monsters, monsterLevel, options = {}) => {
  dispatch({ type: "LOG", t: `🏃 Party attempts to flee!` });

  const results = party
    .filter((h) => h.hp > 0)
    .map((hero, idx) => attemptFlee(dispatch, hero, idx, monsterLevel));

  const allEscaped = results.every((r) => r.success);
  const failedCount = results.filter((r) => !r.success).length;

  if (allEscaped) {
    // Foes strike once during escape
    const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, false, options);
    dispatch({ type: "LOG", t: `✅ Party escapes successfully!` });
    dispatch({ type: "CLEAR_MONSTERS" });
    return { allEscaped, results, failedCount, strikeResult };
  } else {
    // Foes strike once during failed escape attempt
    const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, false, options);
    dispatch({
      type: "LOG",
      t: `❌ ${failedCount} hero(es) failed to escape and combat continues!`,
    });
    return { allEscaped, results, failedCount, strikeResult };
  }
};

/**
 * Attempt party withdraw
 * Requirements: Door must exist to slam shut behind party
 * Effects: Foes strike once (+1 Defense for PCs), party retreats, 1-in-6 Wandering Monsters
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} party - Party array
 * @param {array} monsters - Monster array
 * @param {array} doors - Door array (check if any door at current location)
 * @returns {object} Withdraw result
 */
export const attemptWithdraw = (dispatch, party, monsters, doors) => {
  dispatch({ type: "LOG", t: `🚪 Party attempts to withdraw!` });

  // Check if there's at least one door to slam shut
  if (!doors || doors.length === 0) {
    dispatch({
      type: "LOG",
      t: `❌ Cannot withdraw! No door to slam shut behind the party.`,
    });
    return { success: false, reason: "No door available" };
  }

  // Foes strike once as party retreats (with +1 Defense)
  const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, true);

  // Withdrawal succeeds - clear monsters and leave them in the tile
  dispatch({
    type: "LOG",
    t: `✅ Party successfully withdraws and slams the door! Foes remain in this tile.`,
  });

  // Roll for Wandering Monsters (1-in-6)
  const wanderingRoll = d6();
  if (wanderingRoll === 1) {
    dispatch({
      type: "LOG",
      t: `${formatRollPrefix(wanderingRoll)}⚠️ Party encounters a Wandering Monster during retreat! (rolled ${wanderingRoll})`,
    });
    // Actual wandering monster spawning handled by caller
    return { success: true, wanderingMonster: true, strikeResult };
  } else {
    dispatch({
      type: "LOG",
      t: `${formatRollPrefix(wanderingRoll)}✅ Party retreats safely! (wandering check: ${wanderingRoll}, no encounter)`,
    });
    dispatch({ type: "CLEAR_MONSTERS" });
    return { success: true, wanderingMonster: false, strikeResult };
  }
};

/**
 * Determine initiative for combat
 * Per 4AD rules:
 * - If party attacks immediately: Party goes first (ranged/spells before melee)
 * - If party waits for reaction: Based on reaction roll
 * - Surprise: Monsters go first
 * @param {object} options - Initiative options
 * @returns {object} Initiative result with order and reason
 */
export const determineInitiative = (options = {}) => {
  const { partyAttacksFirst, reaction, isSurprise, hasRanged, hasSpells } =
    options;

  // Surprise always gives monsters first attack
  if (isSurprise) {
    return {
      order: ["monster_ranged", "party_ranged", "monster_melee", "party_melee"],
      monsterFirst: true,
      reason: "Monsters surprise the party!",
    };
  }

  // Party attacks immediately
  if (partyAttacksFirst) {
    return {
      order: [
        "party_ranged",
        "party_spells",
        "monster_ranged",
        "party_melee",
        "monster_melee",
      ],
      monsterFirst: false,
      reason: "Party attacks first!",
    };
  }

  // Reaction-based initiative
  if (reaction) {
    const reactionKey = reaction.reactionKey || reaction;
    // This would need REACTION_TYPES import if we have it
    // For now, check hostile property
    if (reaction.hostile === true) {
      // Fight or Fight to the Death - monsters go first
      return {
        order: [
          "party_ranged",
          "party_spells",
          "monster_ranged",
          "monster_melee",
          "party_melee",
        ],
        monsterFirst: true,
        reason: `${reaction.name || reactionKey}: Monsters attack first!`,
      };
    }
  }

  // Default: party first (ranged/spells, then melee alternating)
  return {
    order: [
      "party_ranged",
      "party_spells",
      "monster_ranged",
      "party_melee",
      "monster_melee",
    ],
    monsterFirst: false,
    reason: "Standard initiative",
  };
};

/**
 * Process a full attack against a Minor Foe group with multi-kill and morale
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Minor foe group
 * @param {number} foeIdx - Foe index in monsters array
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMinorFoeAttack = (
  dispatch,
  hero,
  heroIdx,
  foe,
  foeIdx,
  options = {},
) => {
  // If foe is bound, inform attack routine to apply +2
  if (foe && foe.bound) options.boundTarget = true;
  // Perform the attack
  const attackResult = attackMinorFoe(hero, foe, options);

  dispatch({ type: "LOG", t: attackResult.message });

  // Clear blessed status after use
  if (options.blessed) {
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "blessed",
      value: false,
    });
  }

  if (attackResult.kills > 0) {
    // Update foe count
    const newCount = Math.max(0, (foe.count || 1) - attackResult.kills);
    const initialCount = foe.initialCount || foe.count || 1;

    dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: newCount } });

    if (newCount === 0) {
      dispatch({ type: "LOG", t: `💀 All ${foe.name} defeated!` });
    } else {
      dispatch({
        type: "LOG",
        t: `💀 ${attackResult.kills} ${foe.name} killed! ${newCount} remaining.`,
      });

      // Check morale if not already checked this encounter
      if (!foe.moraleChecked) {
        const moraleResult = checkMinorFoeMorale(foe, initialCount, newCount);

        if (moraleResult.checked) {
          dispatch({ type: "LOG", t: moraleResult.message });
          dispatch({
            type: "UPD_MONSTER",
            i: foeIdx,
            u: { moraleChecked: true },
          });

          if (moraleResult.fled) {
            // Foes flee - mark as defeated but no treasure
            dispatch({
              type: "UPD_MONSTER",
              i: foeIdx,
              u: { count: 0, fled: true },
            });
            dispatch({ type: "LOG", t: `🏃 The remaining ${foe.name} flee!` });
          }
        }
      }
    }
  }

  return attackResult;
};

/**
 * Process attack against a Major Foe with level reduction check
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Major foe
 * @param {number} foeIdx - Foe index
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMajorFoeAttack = (
  dispatch,
  hero,
  heroIdx,
  foe,
  foeIdx,
  options = {},
) => {
  // If foe is bound, inform attack routine to apply +2
  if (foe && foe.bound) options.boundTarget = true;
  // Use existing enhanced attack
  const attackResult = calculateEnhancedAttack(hero, foe.level, options);

  dispatch({ type: "LOG", t: attackResult.message });

  // Clear blessed status after use
  if (options.blessed) {
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "blessed",
      value: false,
    });
  }

  if (attackResult.hits > 0) {
    const newHP = Math.max(0, foe.hp - attackResult.hits);
    dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: newHP } });

    if (newHP === 0) {
      dispatch({ type: "LOG", t: `💀 ${foe.name} defeated!` });
    } else {
      dispatch({
        type: "LOG",
        t: `⚔️ ${foe.name} takes ${attackResult.hits} damage! (${newHP}/${foe.maxHp} HP)`,
      });

      // Check for level reduction at half HP
      const levelCheck = checkMajorFoeLevelReduction({ ...foe, hp: newHP });
      if (levelCheck.shouldReduce) {
        dispatch({
          type: "UPD_MONSTER",
          i: foeIdx,
          u: { level: levelCheck.newLevel, levelReduced: true },
        });
        dispatch({ type: "LOG", t: levelCheck.message });
      }
    }
  }

  return attackResult;
};
