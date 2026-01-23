// Side-effect layers for combat actions

export function logAndUpdateAttack(dispatch, result, meta) {
  // Log the attack result and update state
  dispatch({ type: 'LOG_ATTACK', payload: { result, meta } });
  if (result && result.attackerIdx !== undefined) {
    dispatch({ type: 'MARK_ATTACKER_ACTED', payload: { idx: result.attackerIdx } });
  }
}

export function applyFoeDamage(dispatch, foe, foeIdx, hits) {
  // Apply damage to foe and check for defeat
  dispatch({ type: 'APPLY_FOE_DAMAGE', payload: { foe, foeIdx, hits } });
  if (hits > 0) {
    dispatch({ type: 'CHECK_FOE_DEFEAT', payload: { foeIdx } });
  }
}

export function applyHeroDamage(dispatch, heroIdx, delta) {
  // Apply damage to hero and check for defeat
  dispatch({ type: 'APPLY_HERO_DAMAGE', payload: { heroIdx, delta } });
  if (delta < 0) {
    dispatch({ type: 'CHECK_HERO_DEFEAT', payload: { heroIdx } });
  }
}
// ...add more side-effect helpers as needed
