/**
 * Dice rolling utilities for Four Against Darkness
 */

/**
 * Roll n dice with given sides and optional modifier
 * @param {number} n - Number of dice to roll
 * @param {number} sides - Number of sides on each die (default 6)
 * @param {number} mod - Modifier to add to total (default 0)
 * @returns {number} Total roll result
 */
export const roll = (n, sides = 6, mod = 0) => {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total + mod;
};

/** Roll a single d6 */
export const d6 = () => roll(1);

/** Roll 2d6 and sum */
export const r2d6 = () => d6() + d6();

/** Roll d66 (d6 × 10 + d6, giving 11-66) */
export const d66 = () => d6() * 10 + d6();

/**
 * Roll with exploding 6s (4AD rule)
 * When you roll a 6, roll again and add the result
 * @param {number} mod - Modifier to add
 * @returns {{total: number, rolls: number[], exploded: boolean}}
 */
export const explodingD6 = (mod = 0) => {
  const rolls = [];
  let current = d6();
  rolls.push(current);
  
  while (current === 6) {
    current = d6();
    rolls.push(current);
  }
  
  const total = rolls.reduce((sum, r) => sum + r, 0) + mod;
  return { total, rolls, exploded: rolls.length > 1 };
};
