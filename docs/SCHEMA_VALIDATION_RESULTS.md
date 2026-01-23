# Schema Validation Results

## Overview

The schema migration has been completed and validation has been run. This document summarizes the validation results and identifies areas that need attention.

## Validation Status

### Passing Validations
- ✅ **Classes**: All 19 character classes validate successfully
- ✅ **Spells**: All 50+ spells validate successfully
- ✅ **Traits**: All 100+ character traits validate successfully
- ✅ **Scrolls**: All 36 scrolls validate successfully

### Failing Validations

#### Monsters (ALL monsters failing)
**Issue**: Monster data uses abbreviated format instead of full schema format

**Required Fields Missing**:
- `levelFormula` - Currently using `tier` + `levelMod`
- `lifeFormula` - Needs to be derived from category and tier
- `attacks` - Number of attacks (default should be 1)
- `type` - Monster type (animal, undead, humanoid, etc.)
- `treasure` - Treasure modifier (currently using `xp`)

**Example Current Format**:
```javascript
rats: {
  id: 'rats',
  name: 'Rats',
  category: 'dungeonVermin',
  tier: 1,
  levelMod: 0,
  count: 'd6+2',
  special: ['infection'],
  xp: 1,
  reactionTable: { 1: 'flee', 2: 'flee', 3: 'fleeIfOutnumbered', 4: 'fight', 5: 'fight', 6: 'fight' }
}
```

**Required Schema Format** (per MonsterSchema):
```javascript
rats: {
  id: 'rats',
  name: 'Rats',
  category: 'vermin',  // Use MonsterCategories constants
  type: 'animal',      // NEW: Monster type classification
  levelFormula: 'HCL', // NEW: Replaces tier/levelMod
  lifeFormula: '1',    // NEW: Life calculation formula
  attacks: 1,          // NEW: Number of attacks
  count: 'd6+2',       // Keep as is
  treasure: 0,         // NEW: Replaces xp (treasure modifier)
  reactionTable: [...], // Convert object to array format
  special: {           // Convert array to object with details
    infection: { chance: '1-in-6', effect: 'lose 1 life' }
  }
}
```

**Affected Monsters**: All 90+ monsters across all environments

#### Equipment (25 items failing)
**Issue**: Equipment data uses custom type names that don't match the validation schema

**Validation Errors**:
- Weapons marked as type `'melee'` or `'ranged'` → Schema expects `'weapon'`
- Armor/shields missing `type` field entirely
- Consumables missing `type` field entirely
- Utility items using `'utility'` → Schema expects different type

**Example Issues**:
```javascript
// Current (failing):
hand_weapon: { type: 'melee', category: 'weapon', ... }
light_armor: { category: 'armor', ... }  // Missing type
lantern: { type: 'utility', ... }        // Invalid type

// Should be:
hand_weapon: { type: 'weapon', category: 'weapon', ... }
light_armor: { type: 'armor', ... }
lantern: { type: 'item', ... }  // or appropriate valid type
```

## Next Steps

### Option 1: Fix Data to Match Schemas
Transform monster and equipment data to conform to the existing schema definitions:
- Convert all 90+ monsters to proper schema format
- Fix equipment type fields
- Update helper functions to work with new format

**Pros**:
- Schemas are already well-designed
- Validation will pass
- Data will be properly structured

**Cons**:
- Significant work to transform ~100+ monster entries
- Need to carefully map abbreviated format to schema format

### Option 2: Update Schemas to Match Data
Modify the MonsterSchema and equipment validation to accept the current data format:
- Update MonsterSchema.required to accept tier/levelMod instead of levelFormula
- Update equipment validation to accept current type values

**Pros**:
- Faster to implement
- Data doesn't need to change

**Cons**:
- Schemas become less strict
- Loses the benefits of the full schema format
- Helper functions may need updates

### Option 3: Hybrid Approach
Keep current data format but add transformation layer:
- Create converter functions that transform on-the-fly
- Keep data in abbreviated format
- Convert to full format when needed

**Pros**:
- Data stays concise
- Validation can work with full format
- Backwards compatible

**Cons**:
- Additional complexity
- Two representations of same data

## Recommendation

**Option 1** is recommended: Fix the data to match the schemas properly.

The schemas (MonsterSchema, EquipmentSchema concepts) were designed thoughtfully with proper field names and structure. The data migration created abbreviated versions that don't fully conform. Completing the migration properly will result in:

1. **Better validation**: Full schema compliance
2. **Clearer code**: Self-documenting field names
3. **Easier maintenance**: Schema-driven development
4. **Type safety**: Proper structure for future TypeScript migration

The work required is straightforward but needs attention to detail:
- Transform 90+ monsters (can be scripted/automated)
- Fix 25 equipment items (quick manual fixes)
- Update reaction tables from object to array format
- Ensure all helper functions work with new format

## Files Affected

- `src/data/schema/monsterData.js` - Needs complete transformation
- `src/data/schema/equipmentData.js` - Needs type field fixes
- `src/data/validate.js` - May need minor updates
- Any code currently using monster/equipment data

## Summary

The schema migration created the structure but needs a final pass to ensure all data conforms to the schema definitions. Classes, spells, traits, and scrolls are perfect. Monsters and equipment need transformation to match their respective schemas.
