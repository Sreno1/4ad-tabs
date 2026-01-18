/**
 * Dice rolling utilities for Four Against Darkness
 */
import { defaultRng } from "../game/rng.js";
import { logRoll } from "./rollLog.js";

/**
 * Roll n dice with given sides and optional modifier
 * @param {number} n - Number of dice to roll
 * @param {number} sides - Number of sides on each die (default 6)
 * @param {number} mod - Modifier to add to total (default 0)
 * @returns {number} Total roll result
 */
export const roll = (n, sides = 6, mod = 0, rng = defaultRng, rollLog = null) => {
  let total = 0;
  const rolls = [];
  for (let i = 0; i < n; i++) {
    const value = rng.nextInt(sides) + 1;
    rolls.push(value);
    total += value;
  }
  const finalTotal = total + mod;
  logRoll(rollLog, { type: `d${sides}`, sides, rolls, total: finalTotal, mod });
  return finalTotal;
};

/** Roll a single d6 */
export const d6 = (rng = defaultRng, rollLog = null) => roll(1, 6, 0, rng, rollLog);

/** Roll 2d6 and sum */
export const r2d6 = (rng = defaultRng, rollLog = null) => d6(rng, rollLog) + d6(rng, rollLog);

/** Roll d66 (d6 A- 10 + d6, giving 11-66) */
export const d66 = (rng = defaultRng, rollLog = null) => d6(rng, rollLog) * 10 + d6(rng, rollLog);

/**
 * Roll with exploding 6s (4AD rule)
 * When you roll a 6, roll again and add the result
 * @param {number} mod - Modifier to add
 * @returns {{total: number, rolls: number[], exploded: boolean}}
 */
export const explodingD6 = (rng = defaultRng, mod = 0, rollLog = null) => {
  const rolls = [];
  let current = d6(rng);
  rolls.push(current);

  while (current === 6) {
    current = d6(rng);
    rolls.push(current);
  }

  const total = rolls.reduce((sum, r) => sum + r, 0) + mod;
  const exploded = rolls.length > 1;
  logRoll(rollLog, { type: "explodingD6", rolls, total, mod, exploded });
  return { total, rolls, exploded };
};
