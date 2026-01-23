# Combat Initiative Bug - Analysis & Fix

## User-Reported Issue

"when I click 'new round' in the combat section of the action pane, i'm automatically brought to defend, never get the chance to attack"

## Root Cause

The combat system incorrectly **toggles** initiative every round instead of maintaining the initial initiative order throughout the encounter.

### Current Broken Behavior

In `Combat.jsx:330` (handleNewRound function):
```javascript
} else {
  // Alternate attack/defend each new round
  setRoundStartsWith(prev => (prev === 'attack' ? 'defend' : 'attack'));
}
```

This causes:
- **Round 1**: Initiative chosen → starts with 'attack' (correct)
- **Round 2**: "New Round" clicked → toggles to 'defend' (WRONG!)
- **Round 3**: "New Round" clicked → toggles back to 'attack'
- Continues alternating...

## Official Rules (from tables.txt)

Initiative is determined **ONCE** at combat start and remains constant throughout the encounter.

### Two Initiative Scenarios:

**1. If Foes Surprise:**
   - Step 1: Reactions
   - Step 2: Ranged (PCs)
   - Step 3: Melee (Foes attack first)
   - Step 4: PCs attack

**2. If No Surprise (Normal):**
   - Step 1: Choose Attack or Reactions
   - Step 2: Ranged (Foes)
   - Step 3: Melee (PCs first)
   - Step 4: Melee (Foes)

**Key Point**: Initiative order is set at encounter start and **DOES NOT CHANGE** between rounds.

## Fix Required

In `Combat.jsx` line 330, change from:

```javascript
// WRONG - toggles every round
setRoundStartsWith(prev => (prev === 'attack' ? 'defend' : 'attack'));
```

To:

```javascript
// CORRECT - maintains initiative throughout encounter
const start = combatInitiative.monsterFirst ? 'defend' : 'attack';
setRoundStartsWith(start);
```

## Why This Fixes It

1. **Reference stored initiative**: `combatInitiative` is set once at encounter start
2. **Use monsterFirst flag**: This boolean determines who goes first
   - `true` → Monsters attack first → show defend module
   - `false` → Party attacks first → show attack module
3. **Consistent across rounds**: Same logic applies every round

## Implementation Details

The `combatInitiative` object structure:
```javascript
{
  order: ['party_ranged', 'party_spells', 'party_melee', 'monster_melee'],
  reason: 'Party attacks first!',
  monsterFirst: false  // Key flag used for determining round start
}
```

This object is set once by `InitiativePhase.jsx` and stored in state. Every subsequent round should reference this same object to determine the starting phase.

## Files Modified

- `src/components/Combat.jsx` - Line 330 in `handleNewRound` function

## Testing

After fix, verify:
1. Start combat, choose "Attack" initiative
2. Click "New Round" → Should show attack module (not defend)
3. Click "New Round" again → Should still show attack module
4. Complete encounter, start new one with "Reaction" (monsters first)
5. Click "New Round" → Should show defend module
6. Click "New Round" again → Should still show defend module

## Related Code

The initiative determination happens in:
- `src/utils/gameActions/combatActions.js:96-122` - `determineInitiative()` function
- `src/components/combat/phases/InitiativePhase.jsx` - UI for choosing initiative
- `src/components/Combat.jsx:315-335` - `handleNewRound()` function (needs fix)

All other parts are working correctly. Only the round toggle logic is broken.
