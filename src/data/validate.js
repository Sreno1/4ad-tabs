/**
 * Validation helpers for data schemas
 * Ensures data integrity for classes, monsters, spells, etc.
 */

import { ClassSchema, ClassCombatBonuses } from "./schema/class.js";
import { MonsterSchema } from "./schema/monster.js";
import { SpellSchema } from "./schema/spell.js";
import { EnvironmentSchema } from "./schema/environment.js";

// Import data for validation
import { CLASSES } from "./schema/classData.js";
import { MONSTERS } from "./schema/monsterData.js";
import { SPELLS } from "./schema/spellData.js";
import { ALL_EQUIPMENT } from "./schema/equipmentData.js";
import { TRAITS } from "./schema/traitData.js";
import { SCROLLS } from "./schema/scrollData.js";

/**
 * Generic schema validator
 * @param {object} data - Data to validate
 * @param {object} schema - Schema definition
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateSchema(data, schema) {
  const errors = [];

  // Check required fields
  for (const field of schema.required) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check enums
  if (schema.enums) {
    for (const [field, allowedValues] of Object.entries(schema.enums)) {
      if (field in data && !allowedValues.includes(data[field])) {
        errors.push(
          `Invalid value for ${field}: ${data[field]}. Allowed: ${allowedValues.join(", ")}`
        );
      }
    }
  }

  // Check ranges
  if (schema.ranges) {
    for (const [field, [min, max]] of Object.entries(schema.ranges)) {
      if (field in data) {
        const value = data[field];
        if (value < min || value > max) {
          errors.push(`${field} must be between ${min} and ${max}, got ${value}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate class definition
 * @param {object} classData - Class data
 * @returns {object} Validation result
 */
export function validateClass(classData) {
  const result = validateSchema(classData, ClassSchema);

  // Additional class-specific validation
  if (classData.attackFormula) {
    const validFormulas = ClassSchema.enums.attackFormulaType;
    if (!validFormulas.includes(classData.attackFormula)) {
      result.errors.push(
        `Invalid attackFormula: ${classData.attackFormula}. Must be one of: ${validFormulas.join(", ")}`
      );
      result.valid = false;
    }
  }

  return result;
}

/**
 * Validate monster definition
 * @param {object} monsterData - Monster data
 * @returns {object} Validation result
 */
export function validateMonster(monsterData) {
  const result = validateSchema(monsterData, MonsterSchema);

  // Validate level formula
  if (monsterData.levelFormula) {
    const levelFormulaPattern = /^HCL([+-]\d+)?$/;
    if (!levelFormulaPattern.test(monsterData.levelFormula)) {
      result.errors.push(
        `Invalid levelFormula: ${monsterData.levelFormula}. Must be in format 'HCL', 'HCL+X', or 'HCL-X'`
      );
      result.valid = false;
    }
  }

  // Validate life formula
  if (monsterData.lifeFormula) {
    const lifeFormulaPattern = /^(1|Tier([+-]\d+)?|HCL([+-]\d+)?|N\/A)$/;
    if (!lifeFormulaPattern.test(monsterData.lifeFormula)) {
      result.errors.push(
        `Invalid lifeFormula: ${monsterData.lifeFormula}. Must be '1', 'Tier', 'Tier+X', 'Tier-X', 'HCL', 'HCL+X', 'HCL-X', or 'N/A'`
      );
      result.valid = false;
    }
  }

  // Validate reaction table
  if (monsterData.reactionTable && Array.isArray(monsterData.reactionTable)) {
    for (const reaction of monsterData.reactionTable) {
      if (!reaction.roll || reaction.roll.length !== 2) {
        result.errors.push("Each reaction must have a roll range [min, max]");
        result.valid = false;
      }
      if (!reaction.reaction) {
        result.errors.push("Each reaction must have a reaction type");
        result.valid = false;
      }
    }
  }

  return result;
}

/**
 * Validate spell definition
 * @param {object} spellData - Spell data
 * @returns {object} Validation result
 */
export function validateSpell(spellData) {
  const result = validateSchema(spellData, SpellSchema);

  // Validate targeting
  if (spellData.targeting) {
    const validTargeting = [
      "self",
      "singleFoe",
      "singleAlly",
      "allFoes",
      "allAllies",
      "singleMinorFoeGroup",
      "area",
      "none",
    ];
    if (!validTargeting.includes(spellData.targeting)) {
      result.errors.push(
        `Invalid targeting: ${spellData.targeting}. Must be one of: ${validTargeting.join(", ")}`
      );
      result.valid = false;
    }
  }

  return result;
}

/**
 * Validate environment definition
 * @param {object} envData - Environment data
 * @returns {object} Validation result
 */
export function validateEnvironment(envData) {
  return validateSchema(envData, EnvironmentSchema);
}

/**
 * Validate all classes in ClassCombatBonuses
 * @returns {object} { valid: boolean, errors: object }
 */
export function validateAllClasses() {
  const results = {};
  let allValid = true;

  for (const [classKey, classData] of Object.entries(ClassCombatBonuses)) {
    const classDefData = {
      id: classKey,
      name: classKey,
      // Build minimal required fields from ClassCombatBonuses structure
      attackFormula: classData.attack?.base || "none",
      defenseFormula: classData.defense?.base || "none",
      // These would need to be defined elsewhere, this is just validation
      baseHp: 6, // placeholder
      lifeFormula: "L+6", // placeholder
      allowedArmor: ["any"],
      allowedWeapons: ["any"],
      magicUse: "none",
      stealth: "none",
      savesAs: "warrior", // placeholder
    };

    const validation = validateClass(classDefData);
    results[classKey] = validation;

    if (!validation.valid) {
      allValid = false;
    }
  }

  return {
    valid: allValid,
    errors: results,
  };
}

/**
 * Check if value is within expected range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean}
 */
export function inRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Validate hero object
 * @param {object} hero - Hero object from state
 * @returns {object} Validation result
 */
export function validateHero(hero) {
  const errors = [];

  // Required fields
  const required = ["id", "name", "class", "level", "life", "maxLife"];
  for (const field of required) {
    if (!(field in hero)) {
      errors.push(`Hero missing required field: ${field}`);
    }
  }

  // Validate level
  if (hero.level !== undefined && !inRange(hero.level, 1, 20)) {
    errors.push(`Hero level must be between 1 and 20, got ${hero.level}`);
  }

  // Validate life
  if (hero.life !== undefined && hero.maxLife !== undefined) {
    if (hero.life > hero.maxLife) {
      errors.push(`Hero life (${hero.life}) cannot exceed maxLife (${hero.maxLife})`);
    }
    if (hero.life < 0) {
      errors.push(`Hero life cannot be negative, got ${hero.life}`);
    }
  }

  // Validate class exists
  if (hero.class && !ClassCombatBonuses[hero.class]) {
    errors.push(`Unknown hero class: ${hero.class}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate monster instance
 * @param {object} monster - Monster object from state
 * @returns {object} Validation result
 */
export function validateMonsterInstance(monster) {
  const errors = [];

  // Required fields for monster instance
  const required = ["id", "name", "level", "life", "category"];
  for (const field of required) {
    if (!(field in monster)) {
      errors.push(`Monster missing required field: ${field}`);
    }
  }

  // Validate level
  if (monster.level !== undefined && !inRange(monster.level, 1, 20)) {
    errors.push(`Monster level must be between 1 and 20, got ${monster.level}`);
  }

  // Validate life
  if (monster.life !== undefined) {
    if (monster.life < 0) {
      errors.push(`Monster life cannot be negative, got ${monster.life}`);
    }
  }

  // Validate category
  if (monster.category) {
    const validCategories = ["vermin", "minion", "weirdMonster", "boss"];
    if (!validCategories.includes(monster.category)) {
      errors.push(
        `Invalid monster category: ${monster.category}. Must be one of: ${validCategories.join(", ")}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate equipment item
 * @param {object} item - Equipment item
 * @returns {object} Validation result
 */
export function validateEquipment(item) {
  const errors = [];

  // Required fields
  if (!item.id) errors.push("Equipment missing id");
  if (!item.name) errors.push("Equipment missing name");
  if (!item.type) errors.push("Equipment missing type");

  // Validate type
  const validTypes = ["weapon", "armor", "shield", "item", "consumable", "magic"];
  if (item.type && !validTypes.includes(item.type)) {
    errors.push(`Invalid equipment type: ${item.type}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all data in the schema system
 * @returns {object} Validation results for all data types
 */
export function validateAllData() {
  const results = {
    classes: { valid: true, errors: [] },
    monsters: { valid: true, errors: [] },
    spells: { valid: true, errors: [] },
    equipment: { valid: true, errors: [] },
    traits: { valid: true, errors: [] },
    scrolls: { valid: true, errors: [] }
  };

  // Validate all classes
  for (const [classId, classData] of Object.entries(CLASSES)) {
    const validation = validateClass(classData);
    if (!validation.valid) {
      results.classes.valid = false;
      results.classes.errors.push({ classId, errors: validation.errors });
    }
  }

  // Validate all monsters
  for (const [monsterId, monsterData] of Object.entries(MONSTERS)) {
    const validation = validateMonster(monsterData);
    if (!validation.valid) {
      results.monsters.valid = false;
      results.monsters.errors.push({ monsterId, errors: validation.errors });
    }
  }

  // Validate all spells
  for (const [spellId, spellData] of Object.entries(SPELLS)) {
    const validation = validateSpell(spellData);
    if (!validation.valid) {
      results.spells.valid = false;
      results.spells.errors.push({ spellId, errors: validation.errors });
    }
  }

  // Validate all equipment
  for (const [equipId, equipData] of Object.entries(ALL_EQUIPMENT)) {
    const validation = validateEquipment(equipData);
    if (!validation.valid) {
      results.equipment.valid = false;
      results.equipment.errors.push({ equipId, errors: validation.errors });
    }
  }

  // Validate all traits
  for (const [classKey, traits] of Object.entries(TRAITS)) {
    for (const trait of traits) {
      if (!trait.key || !trait.name || !trait.description || !trait.benefit) {
        results.traits.valid = false;
        results.traits.errors.push({
          classKey,
          traitKey: trait.key,
          errors: ['Missing required fields: key, name, description, or benefit']
        });
      }
    }
  }

  // Validate all scrolls
  for (const [scrollId, scrollData] of Object.entries(SCROLLS)) {
    if (!scrollData.key || !scrollData.name || !scrollData.spellKey) {
      results.scrolls.valid = false;
      results.scrolls.errors.push({
        scrollId,
        errors: ['Missing required fields: key, name, or spellKey']
      });
    }
  }

  return results;
}

/**
 * Run all validations and log results
 * @returns {boolean} True if all validations pass
 */
export function runAllValidations() {
  console.log("Running comprehensive schema validations...");

  const results = validateAllData();
  let allValid = true;

  // Check each data type
  for (const [dataType, result] of Object.entries(results)) {
    if (!result.valid) {
      console.error(`${dataType} validation errors:`, result.errors);
      allValid = false;
    } else {
      console.log(`✓ ${dataType} validation passed`);
    }
  }

  if (allValid) {
    console.log("✓ All schema validations passed!");
  } else {
    console.error("✗ Some validations failed. See errors above.");
  }

  return allValid;
}

/**
 * Assert that a condition is true, throw error if not
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message
 */
export function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Type guards for runtime type checking
 */

export function isHero(obj) {
  return obj && typeof obj === "object" && "class" in obj && "level" in obj;
}

export function isMonster(obj) {
  return obj && typeof obj === "object" && "category" in obj && "level" in obj;
}

export function isWeapon(obj) {
  return obj && typeof obj === "object" && obj.type === "weapon";
}

export function isArmor(obj) {
  return obj && typeof obj === "object" && ["armor", "shield"].includes(obj.type);
}

/**
 * Sanitize user input for IDs and names
 * @param {string} input - User input
 * @returns {string} Sanitized string
 */
export function sanitizeId(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 32);
}

export function sanitizeName(input) {
  return input.substring(0, 64).trim();
}
