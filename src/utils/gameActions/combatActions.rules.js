// Pure combat math and resolution helpers

export function resolveAttackRoll(roll, mod, foeLevel) {
  const total = roll + mod;
  const hits = roll === 1 ? 0 : Math.floor(total / foeLevel);
  const exploded = roll === 6;
  return { roll, mod, total, hits, exploded };
}

export function resolveMinorFoeKills(total, foeLevel, foeCount) {
  if (total < foeLevel) return { kills: 0, message: 'Miss!' };
  const potentialKills = Math.floor(total / foeLevel);
  const actualKills = Math.min(potentialKills, foeCount);
  return {
    kills: actualKills,
    potentialKills,
    message: actualKills > 1 ? `${actualKills} foes slain!` : actualKills === 1 ? '1 foe slain!' : 'Miss!'
  };
}
// ...add more pure math helpers as needed
