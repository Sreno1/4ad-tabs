/**
 * Combat Actions - Attack, defense, saves, fleeing, and initiative
 */
import { d6, explodingD6 } from "../dice.js";
import { getDefaultContext } from "../../game/context.js";
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
  // Use explodingD6 for enhanced attacks
  const { total, rolls, exploded } = explodingD6(rng, 0, rollLog);
  const { mod, modifiers } = buildAttackModifiers(hero, options);
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
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " EXPLODED!" : ""}`,
  };
};

// Implementation for calculateMinorFoeKills (refactored, using helpers)
export const calculateMinorFoeKills = (attackTotal, foeLevel, foeCount) => {
  return resolveMinorFoeKills(attackTotal, foeLevel, foeCount);
};

// Implementation for attackMinorFoe (refactored, using helpers)
export const attackMinorFoe = (hero, foe, options = {}, ctx) => {
  const { rng, rollLog } = ctx || getDefaultContext();
  const { total, rolls, exploded } = explodingD6(rng, 0, rollLog);
  const { mod, modifiers } = buildAttackModifiers(hero, options);
  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / (foe.level || 1)); // Natural 1 always misses
  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";
  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foe.level || 1} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " EXPLODED!" : ""}`,
  };
};

// Initiative (restored for public API compatibility)
export function determineInitiative(/* args */) {
  // Placeholder: implement or delegate to rules/effects as needed
  // For now, return a stub or throw if called
  throw new Error('determineInitiative is not yet implemented.');
}

// Stubs for processMinorFoeAttack and processMajorFoeAttack to maintain API compatibility
export function processMinorFoeAttack(/* args */) {
  throw new Error('processMinorFoeAttack is not yet implemented.');
}

export function processMajorFoeAttack(/* args */) {
  throw new Error('processMajorFoeAttack is not yet implemented.');
}

// Stub for calculateDefense to maintain API compatibility
export function calculateDefense(/* args */) {
  throw new Error('calculateDefense is not yet implemented.');
}

// Stub for performSaveRoll to maintain API compatibility
export function performSaveRoll(/* args */) {
  throw new Error('performSaveRoll is not yet implemented.');
}

// Stubs for useBlessingForSave and useLuckForSave to maintain API compatibility
export function useBlessingForSave(/* args */) {
  throw new Error('useBlessingForSave is not yet implemented.');
}

export function useLuckForSave(/* args */) {
  throw new Error('useLuckForSave is not yet implemented.');
}

// Stub for attemptPartyFlee to maintain API compatibility
export function attemptPartyFlee(/* args */) {
  throw new Error('attemptPartyFlee is not yet implemented.');
}

// Stub for attemptWithdraw to maintain API compatibility
export function attemptWithdraw(/* args */) {
  throw new Error('attemptWithdraw is not yet implemented.');
}

// Stub for performMonsterAttacks to maintain API compatibility
export function performMonsterAttacks(/* args */) {
  throw new Error('performMonsterAttacks is not yet implemented.');
}

// Stub for attemptFlee to maintain API compatibility
export function attemptFlee(/* args */) {
  throw new Error('attemptFlee is not yet implemented.');
}

// Stub for foeStrikeDuringEscape to maintain API compatibility
export function foeStrikeDuringEscape(/* args */) {
  throw new Error('foeStrikeDuringEscape is not yet implemented.');
}

// Additional functions like calculateEnhancedAttack, attackMinorFoe, etc., would follow the same pattern,
// delegating logic to the imported helpers and keeping this file as a thin facade for public functions.
