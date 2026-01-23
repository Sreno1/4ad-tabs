/**
 * Combat Actions - Attack, defense, saves, fleeing, and initiative
 */
import { d6, explodingD6 } from "../dice.js";
import { getDefaultContext } from "../../game/context.js";
import { formatRollPrefix } from '../rollLog.js';
import { calculateEquipmentBonuses, getActiveWeapon } from "../../data/equipment.js";
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

import { CLASS_ATTACK_BONUSES, DARKNESS_PENALTY, CORRIDOR_PENALTY } from './combatActions.constants.js';
import { buildAttackModifiers, applyCorridorPenalty, applyDarknessPenalty } from './combatActions.modifiers.js';
import { resolveAttackRoll, resolveMinorFoeKills } from './combatActions.rules.js';
import { logAndUpdateAttack, applyFoeDamage, applyHeroDamage } from './combatActions.effects.js';
import { expandAttackers, selectTargetsRoom, selectTargetsCorridor } from './combatActions.targeting.js';

// Helper: effective monster level after status effects
const getEffectiveMonsterLevel = (monster) => {
  if (!monster) return 1;
  let lvl = monster.level || 1;
  if (monster.entangled) lvl = Math.max(1, lvl - 1);
  return lvl;
};

/**
 * Check if a monster hates a specific hero's class
 * Per 4AD rules (combat.txt p.169):
 * - Trolls, goblins, kobolds hate dwarves
 * - Orcs hate elves
 * - Undead hate clerics
 * @param {object} monster - Monster with template reference
 * @param {object} hero - Hero with class property
 * @returns {boolean} True if monster hates hero's class
 */
export function monsterHatesHero(monster, hero) {
  if (!monster || !hero || !hero.class) return false;

  // Check explicit hatred from monster template
  if (monster.template && monster.template.hates) {
    if (monster.template.hates === hero.class) return true;
  }

  // Check undead hatred of clerics
  if (monster.template && monster.template.special && Array.isArray(monster.template.special)) {
    const isUndead = monster.template.special.includes('undead');
    if (isUndead && hero.class === 'cleric') return true;
  }

  return false;
}

/**
 * Calculate damage from a single monster attack
 * @param {object} monster - Monster data
 * @param {number} tier - Party tier
 * @returns {number} Damage amount (minimum 1)
 */
export function calculateMonsterAttackDamage(monster, tier) {
  if (!monster.attacks_damage) return 1;

  // Parse formula: "Tier", "Tier+1", "Tier-1", etc.
  if (monster.attacks_damage === "Tier") return tier;

  const match = monster.attacks_damage.match(/Tier([+-]\d+)/);
  if (match) {
    const modifier = parseInt(match[1]);
    return Math.max(1, tier + modifier);
  }

  // If numeric string
  const numDamage = parseInt(monster.attacks_damage);
  if (!isNaN(numDamage)) return Math.max(1, numDamage);

  return 1;
}

export const calculateAttack = (hero, foeLevel, options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);
  const { mod, modifiers } = buildAttackModifiers(hero, options);
  const result = resolveAttackRoll(roll, mod, foeLevel);
  return {
    ...result,
    message: `${hero.name}: ${roll}+${mod}=${result.total} vs L${foeLevel} → ${result.hits > 0 ? result.hits + " kill(s)" : "Miss"}${result.exploded ? " EXPLODE" : ""} ${modifiers.join(' ')}`,
  };
};

// Implementation for calculateEnhancedAttack (refactored, using helpers)
export const calculateEnhancedAttack = (hero, foeLevel, options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();

  // Check if hero has masterwork weapon
  const activeWeapon = getActiveWeapon(hero);
  const explodeThreshold = activeWeapon?.explodeThreshold || 6;

  // Use explodingD6 for enhanced attacks with appropriate threshold
  const { total, rolls, exploded } = explodingD6(rng, 0, rollLog, explodeThreshold);
  const { mod, modifiers } = buildAttackModifiers(hero, options);
  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / foeLevel); // Natural 1 always misses
  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";
  const explodeMsg = exploded ? (explodeThreshold === 5 ? " MASTERWORK EXPLODED!" : " EXPLODED!") : "";
  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${explodeMsg}`,
  };
};

// Implementation for calculateMinorFoeKills (refactored, using helpers)
export const calculateMinorFoeKills = (attackTotal, foeLevel, foeCount) => {
  return resolveMinorFoeKills(attackTotal, foeLevel, foeCount);
};

// Implementation for attackMinorFoe (refactored, using helpers)
export const attackMinorFoe = (hero, foe, options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();

  // Check if hero has masterwork weapon
  const activeWeapon = getActiveWeapon(hero);
  const explodeThreshold = activeWeapon?.explodeThreshold || 6;

  const { total, rolls, exploded } = explodingD6(rng, 0, rollLog, explodeThreshold);
  const { mod, modifiers } = buildAttackModifiers(hero, options);
  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / (foe.level || 1)); // Natural 1 always misses
  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";
  const explodeMsg = exploded ? (explodeThreshold === 5 ? " MASTERWORK EXPLODED!" : " EXPLODED!") : "";
  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foe.level || 1} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${explodeMsg}`,
  };
};

// Initiative (restored for public API compatibility)
export function determineInitiative({ partyAttacksFirst = false, reaction = null, hasRanged = false } = {}) {
  // Initiative logic per 4AD rules:
  // 1. If partyAttacksFirst, party goes first
  // 2. If reaction is hostile (initiative === 'monster'), monsters go first
  // 3. If reaction is friendly/neutral (initiative === 'party'), party goes first
  // 4. If hasRanged, party goes first
  // 5. Otherwise, monsters go first (default)
  let order = [];
  let reason = '';
  let monsterFirst = false;

  if (partyAttacksFirst) {
    order = ['party_ranged', 'party_spells', 'party_melee', 'monster_ranged', 'monster_melee'];
    reason = 'Party attacks first!';
  } else if (reaction && reaction.initiative === 'party') {
    // Friendly/neutral reactions: party goes first
    order = ['party_ranged', 'party_spells', 'party_melee', 'monster_ranged', 'monster_melee'];
    reason = `${reaction.name || 'Friendly'} reaction - Party goes first!`;
  } else if (reaction && reaction.initiative === 'monster') {
    // Hostile reactions: monsters go first
    order = ['monster_ranged', 'monster_melee', 'party_ranged', 'party_spells', 'party_melee'];
    reason = `${reaction.name || 'Hostile'} reaction - Monsters attack first!`;
    monsterFirst = true;
  } else if (hasRanged) {
    order = ['party_ranged', 'monster_ranged', 'party_spells', 'party_melee', 'monster_melee'];
    reason = 'Party has ranged weapons and attacks first!';
  } else {
    order = ['monster_ranged', 'party_ranged', 'monster_melee', 'party_spells', 'party_melee'];
    reason = 'Monsters attack first!';
    monsterFirst = true;
  }

  return { order, reason, monsterFirst };
}

export function processMinorFoeAttack(dispatch, hero, heroIdx, foe, foeIdx, options = {}, ctx) {
  if (foe && foe.bound) options.boundTarget = true;
  const attackResult = attackMinorFoe(hero, foe, options, ctx);
  dispatch({ type: "LOG", t: attackResult.message });
  if (options.blessed) {
    dispatch({ type: "SET_HERO_STATUS", heroIdx, statusKey: "blessed", value: false });
  }
  if (attackResult.hits > 0 || attackResult.kills > 0) {
    const newCount = Math.max(0, (foe.count || 1) - (attackResult.kills || attackResult.hits));
    const initialCount = foe.initialCount || foe.count || 1;

    if (newCount === 0) {
      // Check if this was a subdual attack
      if (options.subdual) {
        const canSubdue = !foe.template?.special?.includes('unliving') &&
                         !foe.template?.special?.includes('horde') &&
                         !foe.template?.special?.includes('vermin');

        if (canSubdue) {
          dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: 0, subdued: true } });
          dispatch({ type: "LOG", t: ` All ${foe.name} subdued! Can be tied and treasure taken.` });
        } else {
          dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: 0 } });
          dispatch({ type: "LOG", t: ` All ${foe.name} defeated! (Cannot subdue this type of foe)` });
        }
      } else {
        dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: 0 } });
        dispatch({ type: "LOG", t: ` All ${foe.name} defeated!` });
      }
    } else {
      dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: newCount } });
      const actionWord = options.subdual ? 'subdued' : 'killed';
      dispatch({ type: "LOG", t: ` ${attackResult.kills || attackResult.hits} ${foe.name} ${actionWord}! ${newCount} remaining.` });
      if (!foe.moraleChecked) {
        const moraleResult = checkMinorFoeMorale(foe, initialCount, newCount, ctx);
        if (moraleResult.checked) {
          dispatch({ type: "LOG", t: moraleResult.message });
          dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { moraleChecked: true } });
          if (moraleResult.fled) {
            dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: 0, fled: true } });
            dispatch({ type: "LOG", t: ` The remaining ${foe.name} flee!` });
          }
        }
      }
    }
  }
  return attackResult;
}

export function processMajorFoeAttack(dispatch, hero, heroIdx, foe, foeIdx, options = {}, ctx) {
  if (foe && foe.bound) options.boundTarget = true;
  const attackResult = calculateEnhancedAttack(hero, foe.level, options, ctx);
  dispatch({ type: "LOG", t: attackResult.message });
  if (options.blessed) {
    dispatch({ type: "SET_HERO_STATUS", heroIdx, statusKey: "blessed", value: false });
  }
  if (attackResult.hits > 0) {
    const newHP = Math.max(0, foe.hp - attackResult.hits);

    if (newHP === 0) {
      // Check if this was a subdual attack
      if (options.subdual) {
        // Check if monster can be subdued (per 4AD rules p.211)
        const canSubdue = !foe.template?.special?.includes('unliving') &&
                         !foe.template?.special?.includes('horde') &&
                         !foe.template?.special?.includes('vermin');

        if (canSubdue) {
          dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: 0, subdued: true } });
          dispatch({ type: "LOG", t: ` ${foe.name} subdued! Can be tied and treasure taken.` });
        } else {
          dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: 0 } });
          dispatch({ type: "LOG", t: ` ${foe.name} defeated! (Cannot subdue this type of foe)` });
        }
      } else {
        dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: 0 } });
        dispatch({ type: "LOG", t: ` ${foe.name} defeated!` });
      }
    } else {
      dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: newHP } });
      dispatch({ type: "LOG", t: `️ ${foe.name} takes ${attackResult.hits} damage! (${newHP}/${foe.maxHp} HP)` });
      const levelCheck = checkMajorFoeLevelReduction({ ...foe, hp: newHP });
      if (levelCheck.shouldReduce) {
        dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { level: levelCheck.newLevel, levelReduced: true } });
        dispatch({ type: "LOG", t: levelCheck.message });
      }
    }
  }
  return attackResult;
}

export function calculateDefense(hero, foeLevel, options = {}, ctx) {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);
  let mod = 0;
  const modifiers = [];
  try {
    const traitMods = getTraitRollModifiers(hero, { firstAttackTarget: !!options.firstAttackTarget, rangedDefense: !!options.rangedDefense });
    if (traitMods && traitMods.defenseMod) {
      mod += traitMods.defenseMod;
      modifiers.push(`+${traitMods.defenseMod} (trait)`);
    }
  } catch (e) {}
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    mod -= 2;
    modifiers.push("-2 (darkness)");
  }
  if (hero.key === "rogue") {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (rogue)`);
  } else if (hero.key === "halfling" && options.largeEnemy) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (vs large)`);
  } else if (hero.key === "dwarf" && options.largeEnemy) {
    mod += 1;
    modifiers.push("+1 (vs large)");
  } else if (["acrobat","swashbuckler","bulwark","gnome","kukla","lightGladiator","mushroomMonk"].includes(hero.key)) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  }
  if (options.parry && hero.key === "lightGladiator") { mod += 2; modifiers.push("+2 (parry)"); }
  if (options.panacheDodge) { mod += 2; modifiers.push("+2 (panache)"); }
  if (options.acrobatTrick) { mod += 2; modifiers.push("+2 (trick)"); }
  const equipBonus = calculateEquipmentBonuses(hero);
  let appliedEquipBonus = equipBonus.defenseMod || 0;
  if (options.ignoreShield) { appliedEquipBonus -= 1; modifiers.push('-1 (no shield allowed)'); }
  if (appliedEquipBonus !== 0) { mod += appliedEquipBonus; modifiers.push(`${appliedEquipBonus >= 0 ? "+" : ""}${appliedEquipBonus} (equip)`); }
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
}

export function performSaveRoll(dispatch, hero, heroIdx, damageSource = "default", options = {}, ctx) {
  const threshold = getSaveThreshold(damageSource);
  const { bonus, reasons } = getSaveModifier(hero);
  const equipBonus = calculateEquipmentBonuses(hero);
  let totalBonus = bonus + equipBonus.saveMod;
  const allReasons = [...reasons];
  if (equipBonus.saveMod !== 0) {
    allReasons.push(`${equipBonus.saveMod >= 0 ? "+" : ""}${equipBonus.saveMod} equip`);
  }
  if (options.hasLightSource === false && !hasDarkvision(hero.key)) {
    totalBonus -= 2;
    allReasons.push("-2 (darkness)");
  }
  const result = rollSave(threshold, totalBonus, ctx);
  const modStr = allReasons.length > 0 ? ` (${allReasons.join(", ")})` : "";
  if (result.success) {
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 1 } });
    dispatch({ type: "SET_HERO_STATUS", heroIdx, statusKey: "wounded", value: true });
    dispatch({ type: "LOG", t: ` ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: "LOG", t: `${formatRollPrefix(result.roll)} ${result.message}` });
  } else {
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 0 } });
    dispatch({ type: "SET_HERO_STATUS", heroIdx, statusKey: "dead", value: true });
    dispatch({ type: "LOG", t: ` ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: "LOG", t: `${formatRollPrefix(result.roll)} ${result.message}` });
  }
  return result;
}

export function useBlessingForSave(dispatch, heroIdx, targetHero, targetIdx, damageSource = "default", options = {}, ctx) {
  dispatch({ type: "USE_BLESS", heroIdx });
  dispatch({ type: "LOG", t: ` Cleric uses Blessing to grant a re-roll!` });
  return performSaveRoll(dispatch, targetHero, targetIdx, damageSource, options, ctx);
}

export function useLuckForSave(dispatch, heroIdx, hero, damageSource = "default", options = {}, ctx) {
  dispatch({ type: "USE_LUCK", heroIdx });
  dispatch({ type: "LOG", t: ` Halfling uses Luck to re-roll!` });
  return performSaveRoll(dispatch, hero, heroIdx, damageSource, options, ctx);
}

export function attemptFlee(dispatch, hero, heroIdx, monsterLevel, ctx) {
  const { rng, rollLog } = ctx || getDefaultContext();
  const roll = d6(rng, rollLog);
  let mod = 0;
  if (hero.key === "rogue") mod = hero.lvl;
  if (hero.key === "halfling") mod = Math.floor(hero.lvl / 2);
  const total = roll + mod;
  const success = total > monsterLevel;
  if (success) {
    dispatch({ type: "LOG", t: `${formatRollPrefix(roll)} ${hero.name} escapes! (${roll}+${mod}=${total} vs L${monsterLevel})` });
  } else {
    dispatch({ type: "LOG", t: `${formatRollPrefix(roll)} ${hero.name} fails to escape! (${roll}+${mod}=${total} vs L${monsterLevel})` });
    dispatch({ type: "LOG", t: `️ Monsters get a free attack!` });
  }
  return { success, roll, mod, total, freeAttack: !success };
}

export function foeStrikeDuringEscape(dispatch, party, monsters, isWithdraw = false, options = {}, ctx) {
  const { rng, rollLog } = ctx || getDefaultContext();
  if (!monsters || monsters.length === 0) return { totalDamage: 0, hitCount: 0 };
  dispatch({ type: "LOG", t: isWithdraw ? `️ Foes strike as party withdraws! (PCs get +1 Defense)` : `️ Foes strike as party flees!` });
  let totalDamage = 0;
  let hitCount = 0;
  const aliveHeroes = party.filter((h) => h.hp > 0);
  if (aliveHeroes.length === 0) return { totalDamage: 0, hitCount: 0 };

  // Get tier for damage calculation
  const tier = options.tier || getTier(party);

  let rearTargetsAllocated = 0;
  monsters.forEach((monster) => {
    let target;
    if (monster.ambush) {
      const aliveOrdered = party.filter(h => h.hp > 0);
      const reversed = aliveOrdered.slice().reverse();
      target = reversed[rearTargetsAllocated] || reversed[0];
      rearTargetsAllocated += 1;
    } else {
      // Per 4AD rules (combat.txt p.187): When fleeing with fewer Foes than PCs,
      // target first: PCs with lowest Life, then hated PCs, then random
      if (!isWithdraw && monsters.length < aliveHeroes.length) {
        // Find PC with lowest Life
        const sortedByLife = [...aliveHeroes].sort((a, b) => a.hp - b.hp);
        const lowestLife = sortedByLife[0].hp;
        const lowestLifeHeroes = sortedByLife.filter(h => h.hp === lowestLife);

        // If multiple at lowest life, prioritize hated ones
        const hatedLowLife = lowestLifeHeroes.filter(h => monsterHatesHero(monster, h));
        if (hatedLowLife.length > 0) {
          const idx = rng.nextInt(hatedLowLife.length);
          target = hatedLowLife[idx];
        } else {
          // No hated heroes at lowest life, target any lowest life hero
          const idx = rng.nextInt(lowestLifeHeroes.length);
          target = lowestLifeHeroes[idx];
        }
      } else {
        // Normal case: random target
        const targetIdx = rng.nextInt(aliveHeroes.length);
        target = aliveHeroes[targetIdx];
      }
    }
    if (monster.status && monster.status.asleep) {
      dispatch({ type: 'LOG', t: ` ${monster.name} is asleep and does not attack.` });
      return;
    }

    // Handle multiple attacks per monster
    const numAttacks = monster.attacks || 1;
    const damagePerAttack = calculateMonsterAttackDamage(monster, tier);

    for (let attackNum = 0; attackNum < numAttacks; attackNum++) {
      const roll = d6(rng, rollLog);
      let targetDefense = isWithdraw ? target.lvl + 1 : target.lvl;
      let defenseMod = isWithdraw ? 1 : 0;
      if (!isWithdraw && options.environment === 'fungal_grottoes') {
        const exempt = ['ranger', 'rogue', 'acrobat', 'halfling', 'mushroomMonk'];
        if (!exempt.includes(target.key)) {
          targetDefense -= 1;
          defenseMod -= 1;
        }
      }
      const effectiveLevel = getEffectiveMonsterLevel(monster);
      const monsterAttack = roll + effectiveLevel;
      const hits = monsterAttack > targetDefense;

      const attackLabel = numAttacks > 1 ? ` (attack ${attackNum + 1}/${numAttacks})` : '';

      if (hits) {
        totalDamage += damagePerAttack;
        hitCount += 1;
        const damageMsg = damagePerAttack > 1 ? ` -${damagePerAttack} Life` : '';
        dispatch({ type: "LOG", t: `${formatRollPrefix(roll)} ${monster.name}${attackLabel} hits ${target.name}!${damageMsg} (${roll}+${monster.level}=${monsterAttack} vs ${targetDefense})` });
        const partyIdx = party.indexOf(target);
        if (partyIdx >= 0) {
          dispatch({ type: "UPD_HERO", i: partyIdx, u: { hp: Math.max(0, target.hp - damagePerAttack) } });
          if (target.hp - damagePerAttack <= 0) {
            dispatch({ type: "LOG", t: ` ${target.name} is defeated!` });
          }
        }
      } else {
        dispatch({ type: "LOG", t: `${formatRollPrefix(roll)} ${target.name} avoids ${monster.name}'s${attackLabel} attack! (${roll}+${monster.level}=${monsterAttack} vs ${targetDefense}${defenseMod === 1 ? '+1' : defenseMod === -1 ? '-1' : ''})` });
      }
    }
  });
  return { totalDamage, hitCount, foeAttacksCount: monsters.length };
}

export function attemptPartyFlee(dispatch, party, monsters, monsterLevel, options = {}, ctx) {
  dispatch({ type: "LOG", t: ` Party attempts to flee!` });
  const results = party.filter((h) => h.hp > 0).map((hero, idx) => attemptFlee(dispatch, hero, idx, monsterLevel, ctx));
  const allEscaped = results.every((r) => r.success);
  const failedCount = results.filter((r) => !r.success).length;
  if (allEscaped) {
    const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, false, options, ctx);
    dispatch({ type: "LOG", t: ` Party escapes successfully!` });
    dispatch({ type: "CLEAR_MONSTERS" });
    return { allEscaped, results, failedCount, strikeResult };
  } else {
    const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, false, options, ctx);
    dispatch({ type: "LOG", t: ` ${failedCount} hero(es) failed to escape and combat continues!` });
    return { allEscaped, results, failedCount, strikeResult };
  }
}

export function attemptWithdraw(dispatch, party, monsters, doors, ctx) {
  const { rng, rollLog } = ctx || getDefaultContext();
  dispatch({ type: "LOG", t: ` Party attempts to withdraw!` });
  if (!doors || doors.length === 0) {
    dispatch({ type: "LOG", t: ` Cannot withdraw! No door to slam shut behind the party.` });
    return { success: false, reason: "No door available" };
  }
  const strikeResult = foeStrikeDuringEscape(dispatch, party, monsters, true, {}, ctx);
  dispatch({ type: "LOG", t: ` Party successfully withdraws and slams the door! Foes remain in this tile.` });
  const wanderingRoll = d6(rng, rollLog);
  if (wanderingRoll === 1) {
    dispatch({ type: "LOG", t: `${formatRollPrefix(wanderingRoll)}️ Party encounters a Wandering Monster during retreat! (rolled ${wanderingRoll})` });
    return { success: true, wanderingMonster: true, strikeResult };
  } else {
    dispatch({ type: "LOG", t: `${formatRollPrefix(wanderingRoll)} Party retreats safely! (wandering check: ${wanderingRoll}, no encounter)` });
    dispatch({ type: "CLEAR_MONSTERS" });
    return { success: true, wanderingMonster: false, strikeResult };
  }
}

export function performMonsterAttacks(dispatch, state, ctx) {
  const { rng, rollLog } = ctx || getDefaultContext();
  const monsters = state.monsters || [];
  if (!monsters || monsters.length === 0) return;
  const party = state.party || [];
  const marchingOrder = state.marchingOrder || [0,1,2,3];
  const location = state.currentCombatLocation?.type || null;
  const tier = getTier(party);

  dispatch({ type: 'LOG', t: `️ Monsters strike!` });
  const aliveIdx = party.map((h, idx) => ({ h, idx })).filter(x => x.h && x.h.hp > 0).map(x => x.idx);
  if (aliveIdx.length === 0) return;

  // Build attackers array - each monster with multiple attacks creates multiple entries
  const attackers = [];
  monsters.forEach(m => {
    if (m.count && m.isMinorFoe) {
      // Minor foes: each individual attacks once
      for (let i = 0; i < m.count; i++) {
        attackers.push({ monster: m, attackNum: 1, totalAttacks: 1 });
      }
    } else {
      // Major foes/bosses: perform all their attacks
      const numAttacks = m.attacks || 1;
      for (let i = 0; i < numAttacks; i++) {
        attackers.push({ monster: m, attackNum: i + 1, totalAttacks: numAttacks });
      }
    }
  });

  if (attackers.length === 0) return;

  const resolveAttack = (attackerData, heroIdx) => {
    const { monster, attackNum, totalAttacks } = attackerData;
    const hero = party[heroIdx];
    if (!hero || hero.hp <= 0) return false;
    if (monster.status && monster.status.asleep) {
      if (attackNum === 1) {
        dispatch({ type: 'LOG', t: ` ${monster.name} is asleep and does not attack.` });
      }
      return false;
    }

    const roll = d6(rng, rollLog);
    const defense = hero.lvl;
    const effectiveLevel = getEffectiveMonsterLevel(monster);
    const hits = (roll + effectiveLevel) > defense;
    const damage = calculateMonsterAttackDamage(monster, tier);

    const attackLabel = totalAttacks > 1 ? ` (attack ${attackNum}/${totalAttacks})` : '';

    if (hits) {
      const damageMsg = damage > 1 ? ` -${damage} Life` : '';
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)} ${monster.name}${attackLabel} hits ${hero.name}!${damageMsg} (${roll}+${monster.level} vs ${defense})` });
      dispatch({ type: 'UPD_HERO', i: heroIdx, u: { hp: Math.max(0, hero.hp - damage) } });
      if (hero.hp - damage <= 0) dispatch({ type: 'LOG', t: ` ${hero.name} is defeated!` });
    } else {
      dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)} ${hero.name} avoids ${monster.name}'s${attackLabel} attack (${roll}+${monster.level} vs ${defense})` });
    }
    return hits;
  };
  const isWandering = !!(state && state.combatMeta && state.combatMeta.wanderingEncounter && state.combatMeta.wanderingEncounter.ambush);
  if (isWandering && location === 'corridor') {
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
  if (location === 'corridor') {
    const frontPositions = [marchingOrder[0], marchingOrder[1]].filter(i => typeof i === 'number' && party[i] && party[i].hp > 0);
    if (frontPositions.length === 1) {
      const target = frontPositions[0];
      for (let i = 0; i < Math.min(2, attackers.length); i++) resolveAttack(attackers[i], target);
      if (attackers.length > 2) dispatch({ type: 'LOG', t: `️ ${attackers.length-2} foes cannot reach the front in the corridor.` });
      return;
    }
    for (let i = 0; i < Math.min(2, attackers.length); i++) {
      const target = frontPositions[i % frontPositions.length];
      resolveAttack(attackers[i], target);
    }
    if (attackers.length > 2) dispatch({ type: 'LOG', t: `️ ${attackers.length-2} foes cannot reach the front in the corridor.` });
    return;
  }
  const N = attackers.length;
  const M = aliveIdx.length;

  // Fewer Foes than PCs - distribute normally
  if (N < M) {
    const classPriority = ['warrior','cleric','barbarian','paladin','ranger','rogue','wizard','halfling'];
    const sortedTargets = aliveIdx.slice().sort((a,b) => {
      const ca = classPriority.indexOf((party[a].class || '').toLowerCase());
      const cb = classPriority.indexOf((party[b].class || '').toLowerCase());
      if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb);
      return (party[b].hp - party[a].hp);
    });
    attackers.forEach((att, i) => {
      const target = sortedTargets[i % sortedTargets.length];
      resolveAttack(att, target);
    });
    return;
  }

  // Equal number - each hero gets one attack
  if (N === M) {
    for (let i = 0; i < M; i++) resolveAttack(attackers[i], aliveIdx[i]);
    return;
  }

  // More Foes than PCs - distribute with hatred priority for extra attacks
  // Per 4AD rules (combat.txt p.169): Outstanding extra attacks target hated classes
  const base = Math.floor(N / M);
  const rem = N % M;
  const counts = {};
  aliveIdx.forEach(idx => counts[idx] = base);
  let remaining = rem;

  // Allocate outstanding extra attacks to hated heroes first
  if (remaining > 0) {
    const hatedHeroIndices = aliveIdx.filter(idx => {
      // Check if ANY monster hates this hero
      return attackers.some(att => monsterHatesHero(att.monster, party[idx]));
    });

    // Give extra attacks to hated heroes first
    for (let i = 0; i < hatedHeroIndices.length && remaining > 0; i++) {
      const idx = hatedHeroIndices[i];
      counts[idx] += 1;
      remaining -= 1;
    }
  }

  // If still remaining attacks, distribute by lowest HP
  if (remaining > 0) {
    const hpOrder = aliveIdx.slice().sort((a,b) => (party[a].hp - party[b].hp));
    let i = 0;
    while (remaining > 0) {
      const t = hpOrder[i % hpOrder.length];
      counts[t] += 1;
      remaining -= 1;
      i += 1;
    }
  }

  // Execute attacks
  let attackerIdx = 0;
  aliveIdx.forEach(heroIdx => {
    const c = counts[heroIdx] || 0;
    for (let k = 0; k < c && attackerIdx < attackers.length; k++) {
      resolveAttack(attackers[attackerIdx++], heroIdx);
    }
  });
}
