# Data Schema and Validation - Detailed Plan and Code Samples

## Goals
- Normalize content data into predictable shapes with stable ids.
- Validate data early (dev and CI) to catch errors before runtime.
- Keep content authoring simple and low friction.

## Scope
- Content datasets: monsters, equipment, traits, rooms, spells, classes, reactions.
- Save data and user state are out of scope (separate decision).

## Assumptions
- Deterministic rules and test harness are available or planned.
- Data currently lives in JS modules with mixed shapes.

## Design Overview
### Data structure
- Raw JSON lives in `src/data/raw/`.
- A loader normalizes and validates into `src/data/indexes/`.
- Rules and UI only import normalized accessors.

### Validation strategy
- Dev runtime validation to surface errors fast.
- Optional CI script to validate all data files.
- Keep validation light enough to run quickly.

## Step-by-step Implementation Plan
### Step 0: Inventory and map references
- Find all data imports and direct lookups.
- Note cross references (equipment keys in heroes, monster traits, spell keys).

### Step 1: Define schemas (domain by domain)
Use strict schemas with all required fields, enums, and ranges as described in the rules and data files.

Example: monster schema
```js
// src/data/schema/monster.js
export const MonsterSchema = {
  required: [
    "id", "name", "level", "type", "life", "attacks", "traits", "lootTable", "special",
  ],
  enums: {
    type: ["minor", "major", "vermin", "weird", "boss"],
  },
  ranges: {
    level: [1, 20],
    life: [1, 99],
    attacks: [1, 10],
    amount: [1, 99], // Only for minor/vermin
  },
  optionals: [
    "special", "morale", "xp", "amount", "isMinorFoe", "isBoss", "reactionTable", "lootIds", "immunities", "vulnerabilities", "abilities", "description"
  ],
  // Rule-level invariants:
  // - If type is "minor" or "vermin": life must be 1, amount is required and >=1.
  // - If type is "major", "boss", or "weird": life is required (1+), amount must not be present or must be 1.
};
```

Example: equipment schema
```js
// src/data/schema/equipment.js
export const EquipmentSchema = {
  required: ["id", "name", "category", "cost"],
  enums: {
    category: ["weapon", "armor", "shield", "gear", "light", "ranged", "two-handed", "magic", "consumable"],
    weaponType: ["melee", "ranged", "thrown", "magic", "crushing", "slashing", "firearm"],
    armorType: ["light", "heavy"],
  },
  ranges: {
    cost: [0, 10000],
    attackMod: [-10, 20],
    defenseMod: [-10, 20],
    saveMod: [-10, 20],
    uses: [0, 99],
  },
  optionals: ["attackMod", "defenseMod", "saveMod", "uses", "lightSource", "description", "special", "weight", "gpValue", "isSilvered", "isMagic", "isConsumable"],
};
```

Example: trait schema
```js
// src/data/schema/trait.js
export const TraitSchema = {
  required: ["id", "name", "effect"],
  enums: {
    type: ["combat", "exploration", "magic", "defense", "utility", "stealth", "trick", "class"],
  },
  optionals: ["uses", "points", "recharge", "description", "classRestriction", "levelRestriction"],
};
```

Example: spell schema
```js
// src/data/schema/spell.js
export const SpellSchema = {
  required: ["id", "name", "level", "school", "effect", "target"],
  enums: {
    school: ["arcane", "divine", "nature", "shadow", "elemental", "druid", "wizard", "cleric"],
    target: ["single", "all_enemies", "all_allies", "self", "area", "vermin", "major", "minor"],
  },
  ranges: {
    level: [1, 9],
    cost: [0, 100],
  },
  optionals: ["description", "requiresTrait", "requiresTraitId", "isPrayer", "isRitual", "isScroll", "isAutomatic", "damage", "heal", "special"],
};
```

Example: class schema
```js
// src/data/schema/class.js
export const ClassSchema = {
  required: ["id", "name", "baseHp", "baseAttack", "baseDefense", "allowedArmor", "allowedWeapons", "traits", "magicUse", "saves", "stealth", "lifeFormula"],
  enums: {
    role: ["warrior", "rogue", "mage", "priest", "ranger", "specialist", "barbarian", "assassin", "druid", "elf", "halfling", "cleric", "wizard"],
    alignment: ["neutral", "evil", "good", "chaotic", "lawful"],
  },
  ranges: {
    baseHp: [1, 99],
    baseAttack: [0, 20],
    baseDefense: [0, 20],
    trickPoints: [0, 99],
  },
  optionals: ["advancedSkills", "startingEquipment", "startingWealth", "optionalTraitTable", "description", "spellSlots", "trickList", "specialRules"],
};
```

Example: room schema
```js
// src/data/schema/room.js
export const RoomSchema = {
  required: ["id", "name", "type", "size", "doors"],
  enums: {
    type: ["corridor", "chamber", "lair", "vault", "trap", "special", "entrance", "boss"],
    size: ["tiny", "small", "medium", "large", "huge"],
  },
  optionals: ["description", "features", "loot", "encounters", "traps", "connections"],
};
```

Example: reaction schema
```js
// src/data/schema/reaction.js
export const ReactionSchema = {
  required: ["id", "name", "reactionKey", "hostile", "description"],
  enums: {
    reactionKey: ["fight", "flee", "parley", "bribe", "wait", "ambush", "ignore", "surprise", "boss_fight"],
  },
  optionals: ["checksMorale", "initiative", "special", "bribeAmount", "isFinalBoss"],
};
```

### Step 2: Build a small validation helper
```js
// src/data/validate.js
export const validateRecord = (schema, record, ctx) => {
  const errors = [];
  schema.required.forEach((key) => {
    if (record[key] === undefined || record[key] === null) {
      errors.push(`${ctx}: missing required field '${key}'`);
    }
  });
  if (schema.enums) {
    Object.entries(schema.enums).forEach(([key, values]) => {
      if (record[key] !== undefined && !values.includes(record[key])) {
        errors.push(`${ctx}: invalid ${key} '${record[key]}'`);
      }
    });
  }
  if (schema.ranges) {
    Object.entries(schema.ranges).forEach(([key, [min, max]]) => {
      const val = record[key];
      if (val !== undefined && (val < min || val > max)) {
        errors.push(`${ctx}: ${key} out of range (${val})`);
      }
    });
  }
  return errors;
};
```

### Step 3: Create loader and normalizer
```js
// src/data/loader.js
import { validateRecord } from "./validate.js";

export const normalizeById = (records, schema, sourceName) => {
  const byId = {};
  const errors = [];
  records.forEach((record, i) => {
    const ctx = `${sourceName}[${i}]`;
    errors.push(...validateRecord(schema, record, ctx));
    if (record.id && byId[record.id]) {
      errors.push(`${ctx}: duplicate id '${record.id}'`);
    }
    byId[record.id] = record;
  });
  return { byId, errors };
};
```

### Step 4: Add cross reference checks
```js
// src/data/checkRefs.js
export const checkRefs = ({ monsters, equipment, spells }) => {
  const errors = [];
  Object.values(monsters.byId).forEach((m) => {
    (m.lootIds || []).forEach((id) => {
      if (!equipment.byId[id]) {
        errors.push(`monsters.${m.id}: unknown loot id '${id}'`);
      }
    });
  });
  Object.values(spells.byId).forEach((s) => {
    if (s.requiresTrait && !s.requiresTraitId) {
      errors.push(`spells.${s.id}: requiresTrait but no requiresTraitId`);
    }
  });
  return errors;
};
```

### Step 5: Build indexes and accessors
```js
// src/data/index.js
import rawMonsters from "./raw/monsters.json";
import { MonsterSchema } from "./schema/monster.js";
import { normalizeById } from "./loader.js";
import { checkRefs } from "./checkRefs.js";

const monsters = normalizeById(rawMonsters, MonsterSchema, "monsters");
const refErrors = checkRefs({ monsters });

if (import.meta.env.DEV) {
  const allErrors = [...monsters.errors, ...refErrors];
  if (allErrors.length) {
    throw new Error(allErrors.join("\n"));
  }
}

export const getMonsterById = (id) => monsters.byId[id];
export const allMonsters = () => Object.values(monsters.byId);
```

### Step 6: Add data versioning and migrations
```js
// src/data/migrate.js
export const migrateDataset = (data, fromVersion) => {
  let current = data;
  if (fromVersion < 2) {
    current = current.map((r) => ({ ...r, id: r.id || r.key }));
  }
  return { version: 2, data: current };
};
```

### Step 7: Migrate datasets one by one
Recommended order:
1. equipment
2. monsters
3. traits
4. spells
5. rooms

### Step 8: Add CI validation script (optional)
```js
// scripts/validate-data.js
import { execSync } from "node:child_process";
execSync("node src/data/validateAll.js", { stdio: "inherit" });
```

## Folder Layout Proposal
```
src/
  data/
    raw/
      monsters.json
      equipment.json
      traits.json
    schema/
      monster.js
      equipment.js
    loader.js
    checkRefs.js
    index.js
```

## Migration Notes by Area
- `src/data/monsters.js`: replace direct exports with normalized accessors.
- `src/utils/gameActions/monsterActions.js`: use id-based lookups.
- `src/components/Combat.jsx`: replace name-based monster selection with ids.

## Validation Levels
- Level 1: required fields and type checks.
- Level 2: cross reference integrity.
- Level 3: rule-level invariants (example: minor foes must have count).

## Verification Checklist
- All content data loads through a single normalization path.
- No direct imports of raw data from rules or UI.
- Dev startup fails fast with clear data errors.
- Tests cover at least one dataset validation and reference check.
