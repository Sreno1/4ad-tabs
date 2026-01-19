// Side-effect layers for combat actions

export function logAndUpdateAttack(dispatch, result, meta) {
  // Log the attack result and update state
  dispatch({ type: 'LOG_ATTACK', payload: { result, meta } });
  // ...other state updates as needed
}

export function applyFoeDamage(dispatch, foe, foeIdx, hits) {
  dispatch({ type: 'APPLY_FOE_DAMAGE', payload: { foe, foeIdx, hits } });
}

export function applyHeroDamage(dispatch, heroIdx, delta) {
  dispatch({ type: 'APPLY_HERO_DAMAGE', payload: { heroIdx, delta } });
}
// ...add more side-effect helpers as needed
