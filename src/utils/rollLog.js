/**
 * rollLog helper — formats roll details for log prefixes
 * Accepts either a single roll number, an array of individual die values, or
 * an object returned by explodingD6() ({ total, rolls, exploded }).
 */
export function formatRollPrefix(rollLike) {
  if (rollLike == null) return '';
  // explodingD6 shape
  if (typeof rollLike === 'object') {
    if (Array.isArray(rollLike.rolls)) {
      return `[${rollLike.rolls.join('+')}]=${rollLike.total} `;
    }
    // fallback for { total, rolls }
    if (Array.isArray(rollLike)) {
      return `[${rollLike.join('+')}] `;
    }
  }
  if (Array.isArray(rollLike)) return `[${rollLike.join('+')}] `;
  // primitive number
  if (typeof rollLike === 'number') return `(${rollLike}) `;
  return '';
}

export default { formatRollPrefix };
