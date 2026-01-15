# Bug Fix: Minor Foes (Vermin/Minions) Count Tracking

## Issue

When vermin or minions were spawned from tile generation, they appeared in the event log but combat wouldn't start properly in the action pane. Users would only see a "Done/Continue" button instead of combat options.

## Root Cause

The `createMonster()` function in `src/data/monsters.js` was not handling Minor Foes (vermin/minions) properly. It was creating them as single monsters with HP instead of as groups with a `count` property.

According to 4AD rules:

- **Vermin**: Roll 2d6 for count (2-12 creatures)
- **Minions**: Roll d6+2 for count (3-8 creatures)
- Both have 1 HP each

## Files Modified

### 1\. `src/data/monsters.js`

#### Added Alias for Minions

```javascript
// Line ~586
minions: { name: 'Minions', level: 2, baseHP: 2, special: null, xp: 2 }, // Alias for plural
```

**Why**: The code uses both `'minion'` and `'minions'` as type strings, so we added an alias to support both.

#### Updated `createMonster()` Function

```javascript
// Lines ~640-695
export const createMonster = (type, level = null) => {
  const template = MONSTER_TEMPLATES[type];
  if (!template) return null;

  const effectiveLevel = level || template.level;

  // Check if this is a Minor Foe (Vermin or Minion)
  const isMinorFoe = (type === 'vermin' || type === 'minion' || type === 'minions');

  if (isMinorFoe) {
    // Minor Foes spawn as groups with count
    let count;
    if (type === 'vermin') {
      // Vermin: Roll 2d6
      count = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    } else if (type === 'minion' || type === 'minions') {
      // Minions: Roll d6+2
      count = Math.floor(Math.random() * 6) + 1 + 2;
    }

    return {
      id: Date.now() + Math.random(),
      name: template.name,
      level: effectiveLevel,
      hp: 1, // Minor Foes always have 1 HP each
      maxHp: 1,
      count, // Current count
      initialCount: count, // Starting count for morale checks
      type,
      special: template.special,
      xp: template.xp || effectiveLevel,
      reaction: null,
      statuses: [],
      isMinorFoe: true // Flag for easier detection
    };
  }

  // Major Foes and other monsters (unchanged)
  const hp = calculateMonsterHP(type, effectiveLevel);

  return {
    id: Date.now() + Math.random(),
    name: template.name,
    level: effectiveLevel,
    hp,
    maxHp: hp,
    type,
    special: template.special,
    xp: template.xp || effectiveLevel,
    reaction: null,
    statuses: []
  };
};
```

**Key Changes**:

1. Detect if monster type is `vermin`, `minion`, or `minions`
2. Roll appropriate count (2d6 for vermin, d6+2 for minions)
3. Set `hp: 1` (Minor Foes always have 1 HP each)
4. Add `count` and `initialCount` properties for tracking
5. Add `isMinorFoe: true` flag for easier detection
6. Keep existing logic for Major Foes and bosses

### 2\. `src/utils/gameActions.js`

#### Updated `spawnMonster()` Function

```javascript
// Lines ~25-43
export const spawnMonster = (dispatch, type, level = null) => {
  const monster = createMonster(type, level);
  if (!monster) return;

  dispatch({ type: 'ADD_MONSTER', m: monster });

  // Log message - show count for Minor Foes, HP for others
  if (monster.isMinorFoe && monster.count) {
    dispatch({ type: 'LOG', t: `${monster.count} ${monster.name} L${monster.level} appear!` });
  } else {
    dispatch({ type: 'LOG', t: `${monster.name} L${monster.level} (${monster.hp}HP) appears!` });
  }
};
```

**Why**: The log message now shows the count for Minor Foes instead of HP, making it clearer how many creatures appeared.

## How Combat Detection Works

The action pane in `App.jsx` uses `getActiveMonsters()` to check if combat should start:

```javascript
const getActiveMonsters = () => {
  return state.monsters?.filter(m => 
    m.hp > 0 && (m.count === undefined || m.count > 0)
  ) || [];
};
```

This filter returns monsters that are:

- Still alive (`m.hp > 0`)
- AND either:

  - Don't have a count property (Major Foes), OR
  - Have count > 0 (Minor Foes with remaining creatures)

With our fix, Minor Foes now have proper `count` properties, so they'll appear in combat correctly.

## Testing

1. **Generate tiles until you get Vermin (2d6 roll of 3-4)**

  - Expected: "X Vermin L1 appear!" where X is 2-12
  - Combat should start with group shown as "👥 Vermin L1" with count displayed

2. **Generate tiles until you get Minions (2d6 roll of 5-6)**

  - Expected: "X Minion L2 appear!" where X is 3-8
  - Combat should start with group shown as "👥 Minion L2" with count displayed

3. **Attack Minor Foes**

  - Each successful hit should kill multiple creatures based on your level
  - Count should decrease properly
  - When all are dead, combat should end with victory

## UI Display

Minor Foes now display in the Active Foes section as:

```
👥 Vermin L1        [5/7]  (showing 5 remaining out of 7 initial)
👥 Minion L2        [3/6]  (showing 3 remaining out of 6 initial)
```

Major Foes display as:

```
👹 Major Foe L3     [4/5 HP]
```

## Related Code

The complete combat flow for Minor Foes:

1. **Spawn**: `createMonster()` creates group with count
2. **Detection**: `getActiveMonsters()` filters living groups
3. **Display**: Action pane shows 👥 with count
4. **Attack**: Attack rolls kill multiple based on level difference
5. **Victory**: When count reaches 0, combat ends

## Status

✅ **Fixed** - Minor Foes now spawn with proper count tracking and combat starts correctly.
