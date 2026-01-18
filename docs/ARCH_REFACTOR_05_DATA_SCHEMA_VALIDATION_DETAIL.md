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
Use minimal schemas with required fields and typed enums.

Example: monster schema
```js
// src/data/schema/monster.js
export const MonsterSchema = {
  required: ["id", "name", "level", "type"],
  enums: {
    type: ["minor", "major"],
  },
  ranges: {
    level: [1, 20],
  },
};
```

Example: equipment schema
```js
// src/data/schema/equipment.js
export const EquipmentSchema = {
  required: ["id", "name", "category", "cost"],
  enums: {
    category: ["weapon", "armor", "shield", "gear"],
  },
  ranges: {
    cost: [0, 10000],
  },
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
