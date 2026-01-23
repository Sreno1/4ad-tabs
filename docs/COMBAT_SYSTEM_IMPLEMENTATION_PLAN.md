# Combat System Implementation Plan

**Created:** 2026-01-22
**Based on:** COMBAT_IMPLEMENTATION_AUDIT.md
**Purpose:** Detailed roadmap for implementing missing combat mechanics from Four Against Darkness rules

---

## Overview

This document provides specific implementation instructions for fixing gaps in the combat system. Each section includes:
- Current state assessment
- Required changes with file locations
- Implementation steps
- Testing criteria

**Current Status:** 67% of combat mechanics correctly implemented
**Target:** 100% rules compliance

---

## HIGH PRIORITY FIXES

### 1. Monster Multiple Attacks System

**Status:** ❌ NOT IMPLEMENTED
**Rule Reference:** combat.txt:95 - "Foes with multiple attacks inflict 1 damage with every attack"
**Impact:** Critical - affects boss encounters and major foes

#### Current State
- Monster schema supports `attacks` field but only as a count
- All monster attacks deal 1 damage regardless of attack type
- `attacks_damage` field exists in schema but is not used in combat logic

#### Required Changes

**File:** `src/data/schema/monsterData.js`
- Schema already supports `attacks` (number) and `attacks_damage` (string like "Tier" or "Tier+1")
- Examples already in data:
  - Minotaur: `attacks: 2`
  - Iron Eater: `attacks: 3`
  - Ogre: `attacks: 1, attacks_damage: "Tier+1"`
  - Chimera: `attacks: 3`

**File:** `src/utils/gameActions/combatActions.js`

Current function signature (line ~287):
```javascript
export function foeStrikeDuringEscape(foe, party, options = {})
```

**Implementation Steps:**

1. **Add damage calculation helper** (new function in `combatActions.js`):
```javascript
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
```

2. **Update monster defense resolution** (around line 200-250):

Current defense code applies 1 damage on failure. Change to:
```javascript
// In the defense resolution section
if (!blocked) {
  const damageAmount = calculateMonsterAttackDamage(foe, tier);
  // Apply damageAmount instead of hardcoded 1
}
```

3. **Update foeStrikeDuringEscape** (line ~287):

Each monster should perform its full attack count:
```javascript
export function foeStrikeDuringEscape(foe, party, options = {}) {
  const results = [];
  const attacks = foe.attacks || 1;

  // Loop through all attacks
  for (let attackNum = 0; attackNum < attacks; attackNum++) {
    // Existing single-attack logic here
    // Calculate damage using calculateMonsterAttackDamage()
  }

  return results;
}
```

4. **Update monster melee phase** (Combat.jsx and combatActions.js):

Monsters should perform all their attacks:
```javascript
// When resolving monster melee attacks
const monsterAttacks = monster.attacks || 1;
for (let i = 0; i < monsterAttacks; i++) {
  // Perform attack against target hero
  // Use calculateMonsterAttackDamage() for damage amount
}
```

#### Special Cases

**Multiple Attack Types** (like Chimera - 2 claws + 1 bite):
- Current schema doesn't distinguish attack types
- For now: treat all attacks as identical
- Future enhancement: support `attacks: [{ type: 'bite', damage: 2 }, { type: 'claw', damage: 1 }]`

**Attacks Per PC** (like Cavern Sludge):
- Cavern Sludge has `attacks: "1 per PC"`
- Add special handling in attack distribution logic:
```javascript
if (typeof monster.attacks === 'string' && monster.attacks.includes('per PC')) {
  const attacksPerPC = 1; // Parse from string
  // Each PC receives attacksPerPC attacks
}
```

#### Testing Criteria
- [ ] Minotaur (2 attacks) performs 2 separate attacks per turn
- [ ] Ogre attack deals Tier damage (not 1)
- [ ] Iron Eater performs 3 attacks (but deals 0 damage, destroys items instead)
- [ ] Chimera performs 3 attacks or breath weapon (50% chance)
- [ ] Cavern Sludge attacks all PCs simultaneously

---

### 2. Weapon Switching Turn Cost

**Status:** ❌ NOT IMPLEMENTED
**Rule Reference:** combat.txt:92 - "During combat, a PC must spend 1 turn to exchange weapons"
**Impact:** High - affects tactical choices and rear-line PCs drawing melee weapons

#### Current State
- Heroes can switch between ranged/melee weapons instantly with no penalty
- No turn tracking for weapon switching state

#### Required Changes

**File:** `src/state/initialState.js`

Add to hero state:
```javascript
// In the hero object structure
{
  // ... existing fields
  combatState: {
    switchingWeapon: false, // True if spending turn to switch weapons
    weaponSwitchTarget: null, // The weapon being switched to
  }
}
```

**File:** `src/components/Combat.jsx`

Add weapon switch UI and logic:

1. **Add switch weapon button** (in hero action section):
```jsx
{!hero.combatState?.switchingWeapon && (
  <button
    onClick={() => handleStartWeaponSwitch(heroIdx)}
    className="bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded text-xs"
  >
    Switch Weapon
  </button>
)}

{hero.combatState?.switchingWeapon && (
  <div className="text-yellow-400 text-xs">
    Switching to {hero.combatState.weaponSwitchTarget}... (skip turn)
  </div>
)}
```

2. **Add handler function**:
```javascript
const handleStartWeaponSwitch = (heroIdx) => {
  // Show modal to select target weapon
  // Set hero.combatState.switchingWeapon = true
  // Hero skips this turn
  // Next turn, complete the switch
  dispatch({
    type: 'START_WEAPON_SWITCH',
    payload: { heroIdx, targetWeapon: selectedWeapon }
  });
};
```

**File:** `src/state/reducer.js`

Add action cases:
```javascript
case 'START_WEAPON_SWITCH': {
  const { heroIdx, targetWeapon } = action.payload;
  const updatedParty = [...state.party];
  updatedParty[heroIdx] = {
    ...updatedParty[heroIdx],
    combatState: {
      switchingWeapon: true,
      weaponSwitchTarget: targetWeapon
    }
  };
  return { ...state, party: updatedParty };
}

case 'COMPLETE_WEAPON_SWITCH': {
  const { heroIdx } = action.payload;
  const hero = state.party[heroIdx];
  const updatedParty = [...state.party];

  // Actually switch the weapon
  updatedParty[heroIdx] = {
    ...hero,
    equipment: {
      ...hero.equipment,
      weapon: hero.combatState.weaponSwitchTarget
    },
    combatState: {
      switchingWeapon: false,
      weaponSwitchTarget: null
    }
  };

  return { ...state, party: updatedParty };
}
```

**File:** `src/utils/gameActions/combatActions.js`

Add detection for when weapon switch is needed:
```javascript
/**
 * Check if hero needs to switch weapons
 * @param {object} hero - Hero data
 * @param {string} desiredType - 'ranged' or 'melee'
 * @returns {boolean} True if switch is needed
 */
export function needsWeaponSwitch(hero, desiredType) {
  const currentWeapon = hero.equipment?.weapon;
  if (!currentWeapon) return false;

  const weaponData = getWeaponData(currentWeapon);
  if (!weaponData) return false;

  // Check if current weapon matches desired type
  if (desiredType === 'ranged') {
    return !['bow', 'crossbow', 'sling', 'handgun', 'rifle'].includes(weaponData.category);
  } else {
    return ['bow', 'crossbow', 'sling', 'handgun', 'rifle'].includes(weaponData.category);
  }
}
```

#### Initiative Integration

During initiative phase, check weapon types:
```javascript
// In InitiativePhase or Combat setup
const rearPositionHeroes = party.filter((h, idx) => idx >= 2);
rearPositionHeroes.forEach(hero => {
  if (hasOnlyRangedWeapon(hero)) {
    // Warn: "This hero will need to spend 1 turn drawing melee weapon if engaged"
  }
});
```

#### Testing Criteria
- [ ] Hero with ranged weapon in rear position (3/4) needs to spend turn drawing melee if engaged
- [ ] Switching weapons shows "Switching weapon..." status for 1 turn
- [ ] After weapon switch turn, hero can use new weapon normally
- [ ] Can't perform attacks while switching weapons
- [ ] Can still defend while switching

---

### 3. Ranged Weapons Limited to First Turn in Rooms

**Status:** ❌ NOT IMPLEMENTED
**Rule Reference:** combat.txt:125 - "Ranged weapons may be used only for one turn. After that, the PCs with ranged weapons will be engaged in close combat"
**Impact:** High - significantly affects room combat tactics

#### Current State
- Heroes with ranged weapons can use them indefinitely in room encounters
- No tracking of whether ranged weapons have been used

#### Required Changes

**File:** `src/state/initialState.js`

Add per-encounter tracking:
```javascript
// In combat state or as separate state
{
  rangedUsedInRoom: {}, // Map of heroIdx -> boolean
  encounterLocation: null, // 'room' or 'corridor'
}
```

**File:** `src/components/Combat.jsx`

Add state initialization:
```javascript
const [rangedUsedInRoom, setRangedUsedInRoom] = useState({});
const [encounterLocation, setEncounterLocation] = useState(null);

// On combat start, detect location
useEffect(() => {
  if (state.monsters.length > 0 && encounterLocation === null) {
    // Determine if in room or corridor
    const currentTile = getCurrentTile();
    const isRoom = currentTile?.type === 'room';
    setEncounterLocation(isRoom ? 'room' : 'corridor');
  }
}, [state.monsters]);

// Reset on new encounter
useEffect(() => {
  if (state.monsters.length === 0) {
    setRangedUsedInRoom({});
    setEncounterLocation(null);
  }
}, [state.monsters]);
```

Add ranged weapon restriction logic:
```javascript
const canUseRanged = (heroIdx) => {
  if (encounterLocation !== 'room') return true; // No restriction in corridors
  if (rangedUsedInRoom[heroIdx]) return false; // Already used ranged this encounter
  return true;
};

const handleRangedAttack = (heroIdx) => {
  // Perform attack
  performRangedAttack(heroIdx);

  // Mark ranged as used if in room
  if (encounterLocation === 'room') {
    setRangedUsedInRoom(prev => ({ ...prev, [heroIdx]: true }));
  }
};
```

**File:** `src/components/combat/phases/AttackPhase.jsx`

Update ranged attack UI:
```jsx
{encounterLocation === 'room' && rangedUsedInRoom[heroIdx] && (
  <div className="text-red-400 text-xs mb-1">
    ⚠ Engaged in melee - must use melee weapon or fight unarmed (-2)
  </div>
)}

<button
  disabled={encounterLocation === 'room' && rangedUsedInRoom[heroIdx]}
  onClick={() => handleRangedAttack(heroIdx)}
  className={`px-2 py-1 rounded text-xs ${
    encounterLocation === 'room' && rangedUsedInRoom[heroIdx]
      ? 'bg-gray-600 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-500'
  }`}
>
  Ranged Attack {encounterLocation === 'room' && !rangedUsedInRoom[heroIdx] ? '(1st turn only)' : ''}
</button>
```

#### Special Cases

**After first turn in room:**
- Hero can draw melee weapon (costs 1 turn - see Fix #2)
- Hero can fight unarmed at -2 penalty
- Hero can still cast spells

**Corridor combat:**
- No restriction on ranged weapon use
- Can use ranged every turn

**Wandering monsters:**
- If rear attack in corridor, rear positions CAN use ranged

#### Testing Criteria
- [ ] In room encounter, ranged attack button shows "(1st turn only)"
- [ ] After using ranged in room, button becomes disabled
- [ ] Warning appears: "Engaged in melee - must use melee weapon or fight unarmed"
- [ ] In corridor, no restriction on ranged use
- [ ] Starting new encounter resets ranged usage tracking

---

### 4. Masterwork Weapon Explosion Threshold

**Status:** ❌ NOT IMPLEMENTED
**Rule Reference:** combat.txt:220-221 - "Masterwork weapons increase the chance of an Explosion by 1. For example, a Masterwork sword's Attack roll will Explode on a 5 and 6"
**Impact:** High - affects high-level play and treasure value

#### Current State
- Equipment schema has `quality: 'masterwork'` field
- Explosion logic in dice.js always explodes on 6 only
- No check for weapon quality affecting explosion threshold

#### Required Changes

**File:** `src/utils/dice.js`

Current explosion function:
```javascript
export function explodingD6() {
  let total = 0;
  let roll;
  do {
    roll = d6();
    total += roll;
  } while (roll === 6);
  return { total, rolls: [/* all rolls */] };
}
```

Change to accept explosion threshold:
```javascript
/**
 * Roll exploding d6 with custom explosion threshold
 * @param {number} explodeOn - Threshold for explosion (default 6)
 * @returns {object} { total, rolls }
 */
export function explodingD6(explodeOn = 6) {
  const rolls = [];
  let total = 0;
  let roll;

  do {
    roll = d6();
    rolls.push(roll);
    total += roll;
  } while (roll >= explodeOn);

  return { total, rolls };
}
```

**File:** `src/utils/gameActions/combatActions.js`

Update attack functions to detect masterwork:

1. **Add helper function**:
```javascript
/**
 * Get explosion threshold for hero's weapon
 * @param {object} hero - Hero data
 * @returns {number} Threshold (5 for masterwork, 6 for normal)
 */
export function getWeaponExplosionThreshold(hero) {
  const weapon = hero.equipment?.weapon;
  if (!weapon) return 6;

  const weaponData = getEquipmentData(weapon);
  if (!weaponData) return 6;

  // Check for masterwork quality
  if (weaponData.quality === 'masterwork') return 5;

  return 6;
}
```

2. **Update performAttack** (around line 38):
```javascript
export function performAttack(hero, foe, options = {}) {
  const explosionThreshold = getWeaponExplosionThreshold(hero);
  const diceResult = explodingD6(explosionThreshold);

  // Rest of attack logic...
}
```

**File:** `src/components/combat/phases/AttackPhase.jsx`

Show masterwork indicator:
```jsx
{hero.equipment?.weapon && getWeaponQuality(hero.equipment.weapon) === 'masterwork' && (
  <div className="text-yellow-400 text-xs">
    ⭐ Masterwork: Explodes on 5-6
  </div>
)}
```

**File:** `src/data/schema/equipmentData.js`

Ensure masterwork weapons exist in data:
```javascript
{
  id: "masterworkLongsword",
  name: "Masterwork Longsword",
  type: "weapon",
  category: "handWeapon",
  quality: "masterwork",
  attackMod: 0,
  cost: 300,
  description: "Expertly crafted blade. Attack rolls explode on 5-6.",
}
```

#### Testing Criteria
- [ ] Hero with masterwork weapon sees "Explodes on 5-6" indicator
- [ ] Rolling a 5 on attack triggers additional die roll
- [ ] Rolling a 6 on attack triggers additional die roll
- [ ] Normal weapons still only explode on 6
- [ ] Explosion works correctly for multi-roll sequences (5→6→5→6→3)

---

## MEDIUM PRIORITY FIXES

### 5. Reaction System Affecting Initiative

**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Rule Reference:** tables.txt:12-14 - Initiative determined by player choice and reaction results
**Impact:** Medium - affects tactical decision-making

#### Current State
- Reaction rolling exists in `MonsterReaction` component
- Initiative determination exists in `determineInitiative()`
- No connection between reaction results and initiative order

#### Required Changes

**File:** `src/components/combat/phases/InitiativePhase.jsx`

Current code (lines 30-57):
```javascript
const handleByReaction = () => {
  // Rolls reaction but doesn't use result for initiative
  const reaction = rollMonsterReaction(dispatch, monsterIdx);
  const init = determineInitiative({ reaction, hasRanged });
  // ...
}
```

**Implementation Steps:**

1. **Update determineInitiative** in `combatActions.js`:
```javascript
export function determineInitiative(options = {}) {
  const { partyAttacksFirst, reaction, hasRanged } = options;

  // If party chose to attack immediately
  if (partyAttacksFirst) {
    return {
      order: ['party_ranged', 'party_spells', 'monster_ranged', 'party_melee', 'monster_melee'],
      reason: 'Party attacks first!',
      monsterFirst: false
    };
  }

  // If waiting for reaction
  if (reaction) {
    const hostile = ['ALWAYS_FIGHT', 'ALWAYS_FIGHT_TO_DEATH'].includes(reaction.type);

    if (hostile) {
      // Monsters attack first (surprise)
      return {
        order: ['monster_ranged', 'monster_melee', 'party_ranged', 'party_spells', 'party_melee'],
        reason: 'Monsters attack first! (hostile reaction)',
        monsterFirst: true
      };
    } else {
      // Non-hostile reaction, party can respond first
      return {
        order: ['party_ranged', 'party_spells', 'monster_ranged', 'party_melee', 'monster_melee'],
        reason: 'Non-hostile reaction - party responds',
        monsterFirst: false
      };
    }
  }

  // Default: party first
  return {
    order: ['party_ranged', 'party_spells', 'monster_ranged', 'party_melee', 'monster_melee'],
    reason: 'Party goes first (default)',
    monsterFirst: false
  };
}
```

2. **Update InitiativePhase.jsx** to properly pass reaction:
```javascript
const handleByReaction = () => {
  const monsterIdx = monsters.findIndex(m => !m.reaction);
  if (monsterIdx === -1) return;

  // Roll reaction via dispatch
  const reaction = rollMonsterReaction(dispatch, monsterIdx);

  // IMPORTANT: Use reaction result for initiative
  const init = determineInitiative({
    reaction: reaction,
    hasRanged: party.some(h => h.equipment?.ranged)
  });

  setCombatInitiative(init);
  addToCombatLog(`${init.reason}`);
};
```

#### Testing Criteria
- [ ] Choosing "Reaction" rolls monster reaction
- [ ] If reaction is "Fight" or "Fight to Death", monsters attack first
- [ ] If reaction is "Flee", "Bribe", or other non-hostile, party attacks first
- [ ] Initiative order matches reaction result
- [ ] Combat log shows correct reason for initiative order

---

### 6. Race-Based Monster Hate Targeting

**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Rule Reference:** combat.txt:169 - "Foes who HATE one character class always perform outstanding attacks on that class"
**Impact:** Medium - affects combat difficulty for specific classes

#### Current State
- Generic `hero.hated` flag exists
- Not automatically set based on monster type vs hero class
- Attack distribution uses flag but doesn't check race

#### Required Changes

**File:** `src/utils/gameActions/combatActions.targeting.js` (if exists) or `combatActions.js`

Add helper function:
```javascript
/**
 * Check if monster hates hero based on race/type
 * @param {object} monster - Monster data
 * @param {object} hero - Hero data
 * @returns {boolean} True if monster hates this hero
 */
export function doesMonsterHateHero(monster, hero) {
  // Undead hate clerics
  if (monster.type === 'UNDEAD' && hero.class === 'cleric') {
    return true;
  }

  // Trolls, goblins, kobolds hate dwarves
  if (monster.race === 'goblin' && hero.class === 'dwarf') {
    return true;
  }
  if (monster.type === 'HUMANOID' && monster.name.toLowerCase().includes('troll') && hero.class === 'dwarf') {
    return true;
  }

  // Orcs hate elves
  if (monster.race === 'orc' && hero.class === 'elf') {
    return true;
  }

  return false;
}
```

**File:** `src/utils/gameActions/combatActions.js`

Update attack distribution (around line 448-474):
```javascript
// In distributeMonsterAttacks function
export function distributeMonsterAttacks(monsters, party, location) {
  const alivePCs = party.filter(h => h.hp > 0);
  const counts = new Array(party.length).fill(0);

  // Find hated targets dynamically
  const hatedIndices = [];
  alivePCs.forEach((hero, idx) => {
    const actualIdx = party.indexOf(hero);
    // Check each monster to see if any hate this hero
    const isHated = monsters.some(m => doesMonsterHateHero(m, hero));
    if (isHated) {
      hatedIndices.push(actualIdx);
    }
  });

  // Distribute extra attacks to hated targets
  let remaining = totalAttacks;
  hatedIndices.forEach(hatedIdx => {
    if (remaining > 0) {
      counts[hatedIdx] += 1;
      remaining -= 1;
    }
  });

  // Distribute remaining attacks evenly...
  // (existing distribution logic)
}
```

**File:** `src/components/Combat.jsx`

Add visual indicator for hated heroes:
```jsx
{doesMonsterHateHero(currentMonster, hero) && (
  <div className="text-red-400 text-xs font-bold">
    ⚠ HATED BY MONSTERS - Priority target!
  </div>
)}
```

#### Monster Hate Rules Reference
- **Undead** → Clerics
- **Trolls** → Dwarves
- **Goblins** → Dwarves
- **Orcs** → Elves

#### Testing Criteria
- [ ] Cleric in party vs undead: undead prioritize cleric
- [ ] Dwarf in party vs trolls/goblins: they prioritize dwarf
- [ ] Elf in party vs orcs: orcs prioritize elf
- [ ] UI shows "HATED BY MONSTERS" indicator
- [ ] Extra attacks distributed to hated targets first

---

### 7. Subdual Attacks UI

**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Rule Reference:** combat.txt:210-211 - "To take a Foe alive, PCs may attack with a -1 modifier"
**Impact:** Low - niche use case but important for some quests

#### Current State
- Modifier exists: `CombatStateModifiers.subdual.attackMod = -1`
- No UI to trigger subdual attacks

#### Required Changes

**File:** `src/components/combat/phases/AttackPhase.jsx`

Add subdual attack option:
```jsx
{canAttack(heroIdx) && (
  <div className="flex gap-1">
    <button
      onClick={() => handleAttack(heroIdx, { subdual: false })}
      className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
    >
      Lethal Attack
    </button>

    <button
      onClick={() => handleAttack(heroIdx, { subdual: true })}
      className="bg-yellow-600 hover:bg-yellow-500 px-2 py-1 rounded text-xs"
    >
      Subdual (-1)
    </button>
  </div>
)}
```

**File:** `src/utils/gameActions/combatActions.js`

Ensure subdual flag is passed through:
```javascript
export function performAttack(hero, foe, options = {}) {
  const { subdual = false } = options;

  // Build modifiers includes subdual check
  const modifiers = buildAttackModifiers(hero, foe, { ...options, subdual });

  // ... rest of attack logic
}
```

Add special handling for subdual success:
```javascript
// After successful subdual attack that reduces foe to 0 HP
if (subdual && foe.hp <= 0) {
  return {
    success: true,
    captured: true,
    message: `${hero.name} subdues the ${foe.name}! Foe is unconscious.`
  };
}
```

**File:** `src/state/reducer.js`

Add captured state to monsters:
```javascript
// In monster object
{
  // ... existing fields
  captured: false,
  unconscious: false
}
```

#### Testing Criteria
- [ ] "Subdual (-1)" button appears in attack phase
- [ ] Subdual attack applies -1 penalty to roll
- [ ] Reducing foe to 0 HP with subdual marks them as captured
- [ ] Captured foes don't count as killed for XP/morale
- [ ] Combat log shows "subdued" instead of "killed"

---

### 8. Attacking Fleeing Foes

**Status:** ❌ NOT IMPLEMENTED
**Rule Reference:** combat.txt:116 - "If you want to kill fleeing Foes... all PCs may perform one last Attack at +1"
**Impact:** Low - rare situation but affects morale system

#### Current State
- Morale system works, foes flee when morale breaks
- No option to attack fleeing foes

#### Required Changes

**File:** `src/utils/gameActions/combatActions.js`

When morale breaks (around line 139-149):
```javascript
// After morale check fails
if (moraleRoll <= 3 && !foe.moraleChecked) {
  return {
    flee: true,
    allowPursuitAttacks: true, // NEW FLAG
    message: `${foe.name} group loses morale and attempts to flee!`
  };
}
```

**File:** `src/components/Combat.jsx`

Add pursuit attack phase:
```javascript
const [fleeingFoes, setFleeingFoes] = useState([]);

// When foe flees
useEffect(() => {
  const fleeing = state.monsters.filter(m => m.fleeing && !m.pursuitAttacksResolved);
  if (fleeing.length > 0) {
    setFleeingFoes(fleeing);
    // Show pursuit attack UI
  }
}, [state.monsters]);
```

Add UI for pursuit attacks:
```jsx
{fleeingFoes.length > 0 && (
  <div className="bg-yellow-900/50 border border-yellow-600 rounded p-2 mb-2">
    <div className="text-yellow-400 font-bold text-sm mb-1">
      Foes are fleeing! Attack now at +1 bonus?
    </div>

    {party.filter(h => h.hp > 0).map((hero, idx) => (
      <button
        key={idx}
        onClick={() => handlePursuitAttack(idx, fleeingFoes[0])}
        className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs mr-1"
      >
        {hero.name} Attack (+1)
      </button>
    ))}

    <button
      onClick={() => handleLetFleeFoes()}
      className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs"
    >
      Let Them Flee
    </button>
  </div>
)}
```

Handler functions:
```javascript
const handlePursuitAttack = (heroIdx, foe) => {
  const hero = party[heroIdx];
  const result = performAttack(hero, foe, {
    pursuitBonus: 1, // +1 bonus to attack
    pursuingFleeing: true
  });

  // Apply result, update foe
  dispatch({ type: 'APPLY_PURSUIT_ATTACK', payload: result });
};

const handleLetFleeFoes = () => {
  // Mark all fleeing foes as escaped
  dispatch({ type: 'FOES_ESCAPE' });
  setFleeingFoes([]);
};
```

#### Testing Criteria
- [ ] When minor foes fail morale, UI shows "Foes are fleeing!"
- [ ] Each PC can perform one attack at +1
- [ ] Attack uses +1 bonus correctly
- [ ] Can choose to let foes flee without attacking
- [ ] Fleeing foes that survive escape (no XP)

---

## LOW PRIORITY FIXES

### 9. Automatic Unarmed Detection

**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Rule Reference:** combat.txt:67 - "Unarmed PCs have -2 on Attack rolls"
**Impact:** Low - edge case, usually players have weapons

#### Implementation
Add automatic detection in attack phase:
```javascript
export function performAttack(hero, foe, options = {}) {
  // Check if hero has weapon equipped
  const hasWeapon = hero.equipment?.weapon;
  const unarmed = !hasWeapon && !options.unarmed; // Auto-detect

  const modifiers = buildAttackModifiers(hero, foe, { ...options, unarmed });
  // ... rest of logic
}
```

---

### 10. Shield Negation Verification

**Status:** ⚠️ NEEDS VERIFICATION
**Rule Reference:** combat.txt:145 - "Surprise attacks from Wandering Monsters negate the bonus from shields on the first turn"
**Impact:** Low - flag exists, needs testing

#### Verification Steps
1. Check `Combat.jsx` line 376, 386 for `shieldsDisabledFirst` flag
2. Verify flag is set when `isWandering` is true
3. Verify defense calculation excludes shield bonus when flag is true
4. Test with wandering monster encounter

---

### 11. Crushing Weapon Bonuses

**Status:** ⚠️ NEEDS VERIFICATION
**Rule Reference:** combat.txt:76-81 - Crushing weapons +1 vs skeletons
**Impact:** Low - equipment system exists, bonus application needs verification

#### Verification Steps
1. Check weapon schema has `damageType: 'crushing'` field
2. Check monster schema has vulnerability flags
3. Verify bonus applied in `calculateWeaponBonus()` function
4. Test with club/mace vs skeleton

---

## TESTING PROTOCOL

### Unit Tests Needed

**File:** `src/utils/gameActions/__tests__/combatActions.test.js`

```javascript
describe('Monster Multiple Attacks', () => {
  test('Minotaur performs 2 attacks', () => {
    // ...
  });

  test('Ogre deals Tier damage', () => {
    // ...
  });
});

describe('Weapon Switching', () => {
  test('Switching weapon costs 1 turn', () => {
    // ...
  });
});

describe('Masterwork Weapons', () => {
  test('Masterwork explodes on 5-6', () => {
    // ...
  });
});
```

### Integration Tests

1. **Full Combat Scenario Tests**
   - Room encounter with ranged weapons
   - Corridor encounter with weapon switching
   - Boss fight with multiple attacks
   - Morale break with pursuit attacks

2. **Edge Case Tests**
   - Monster with "1 per PC" attacks
   - Subdual capture of boss
   - Reaction-based initiative changes
   - Hate targeting with multiple races

---

## IMPLEMENTATION ORDER RECOMMENDATION

Based on impact and dependencies:

1. **Phase 1: Core Combat Mechanics** (Week 1)
   - Monster multiple attacks (#1)
   - Monster attack damage (#1)
   - Masterwork weapon explosions (#4)

2. **Phase 2: Tactical Systems** (Week 2)
   - Weapon switching turn cost (#2)
   - Ranged weapon room restrictions (#3)

3. **Phase 3: Targeting & Initiative** (Week 3)
   - Reaction-initiative integration (#5)
   - Race-based hate targeting (#6)

4. **Phase 4: Combat Options** (Week 4)
   - Subdual attacks UI (#7)
   - Attacking fleeing foes (#8)

5. **Phase 5: Polish & Verification** (Week 5)
   - Verify all low-priority items
   - Full integration testing
   - Bug fixes and edge cases

---

## DEFINITION OF DONE

Each fix is considered complete when:
- [ ] Code implemented and committed
- [ ] Unit tests written and passing
- [ ] Integration test passing
- [ ] UI elements functional (if applicable)
- [ ] Combat log messages accurate
- [ ] Matches official rules exactly
- [ ] Edge cases handled
- [ ] Performance acceptable (<100ms per action)
- [ ] No regressions in existing features

---

## SUCCESS METRICS

**Target:** 100% combat rules compliance

Current: 67% implemented (20/30 mechanics)
After fixes: 100% implemented (30/30 mechanics)

### Specific Metrics
- All 10 high/medium priority fixes complete
- All 3 low priority items verified
- 0 critical combat bugs
- All boss fights work correctly
- All special attacks function
- Initiative system matches official flowchart
- Morale system fully functional

---

## NOTES FOR FUTURE DEVELOPMENT

### Potential Enhancements (Beyond Rules)

1. **Combat Animation System**
   - Visual feedback for attacks/damage
   - Explosion indicators
   - Status effect animations

2. **AI Combat Tactics**
   - Smart target selection
   - Reaction-based monster behavior
   - Boss special ability usage

3. **Combat Statistics**
   - Damage dealt tracking
   - Accuracy percentages
   - Encounter difficulty ratings

4. **Extended Monster Attacks**
   - Full attack array support: `[{ type: 'bite', damage: 2 }, { type: 'claw', damage: 1 }]`
   - Per-attack special effects
   - Conditional attack patterns

### Technical Debt to Address

1. Combat state management could use refactoring into smaller hooks
2. Attack/defense calculations could be more modular
3. Consider moving combat UI into separate component library
4. Add TypeScript types for combat actions

---

**End of Implementation Plan**

This document should be updated as fixes are implemented. Mark completed items with dates and PR/commit references.
