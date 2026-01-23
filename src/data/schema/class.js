/**
 * Class Schema - Character class definitions with combat formulas
 * Based on Four Against Darkness core rules
 */

/**
 * Attack bonus formula types
 * - "L": Full level bonus
 * - "halfL": Half level (rounded down)
 * - "tier": Tier number (1-5)
 * - "none": No bonus
 * - Custom functions for complex cases
 */

export const ClassSchema = {
  required: [
    "id",
    "name",
    "baseHp",
    "lifeFormula", // "L+X" where X is the base
    "attackFormula",
    "defenseFormula",
    "allowedArmor",
    "allowedWeapons",
    "magicUse",
    "stealth",
    "savesAs",
  ],

  enums: {
    attackFormulaType: ["L", "halfL", "tier", "none", "conditional"],
    defenseFormulaType: ["L", "halfL", "tier", "none"],
    armorType: ["none", "light", "heavy", "any"],
    weaponRestriction: ["light", "hand", "twoHanded", "ranged", "any"],
    magicUseType: ["none", "wizard", "cleric", "druid", "elf", "illusionist"],
    stealthFormula: ["L", "halfL", "none"],
    savesAs: ["warrior", "rogue", "wizard", "cleric", "dwarf", "barbarian", "halfling"],
  },

  ranges: {
    baseHp: [1, 20],
  },

  optionals: [
    "attackConditions", // For conditional attack bonuses (rogue outnumber, etc.)
    "defenseConditions", // For conditional defense bonuses (halfling vs large)
    "specialAbilities", // Traits, prayers, spells, tricks
    "startingEquipment",
    "startingWealth",
    "description",
    "darkvision", // Boolean
    "traits", // Available trait list
  ],
};

/**
 * Class combat bonus definitions
 * Used to calculate attack/defense modifiers programmatically
 */
export const ClassCombatBonuses = {
  // Full martial classes
  warrior: {
    attack: { base: "L", melee: true, ranged: true },
    defense: { base: "none" },
    special: [],
  },

  barbarian: {
    attack: { base: "L", melee: true, ranged: true },
    defense: { base: "none" },
    special: [
      { type: "rage", uses: "1+floor(L/2)", effect: "+2 attack, triple roll, double damage" }
    ],
  },

  paladin: {
    attack: { base: "L", melee: true, ranged: true },
    defense: { base: "none" },
    special: [],
  },

  assassin: {
    attack: { base: "L", melee: true, ranged: true },
    defense: { base: "none" },
    special: [
      { type: "hideInShadows", effect: "3x damage on marked target", save: "stealth vs foe.level" }
    ],
  },

  ranger: {
    attack: { base: "L", melee: true, ranged: true },
    defense: { base: "none" },
    special: [
      { type: "dualWield", bonus: "halfL", conditions: ["wielding 2 weapons"] },
      { type: "swornEnemy", bonus: 2, conditions: ["vs sworn enemy"] },
    ],
  },

  // Partial martial classes with two-handed restriction
  elf: {
    attack: { base: "L", melee: true, ranged: true, except: ["twoHandedMelee"] },
    defense: { base: "none" },
    special: [
      { type: "vsOrcs", bonus: 1 },
      { type: "spellcasting", slots: "L", bonus: "L" },
    ],
  },

  // Melee-only martial
  dwarf: {
    attack: { base: "L", melee: true, ranged: false },
    defense: { base: "none", conditional: [{ vs: ["giant", "troll", "ogre"], bonus: 1 }] },
    special: [
      { type: "vsGoblins", bonus: 1 },
    ],
  },

  // Weapon-specific martial
  halfling: {
    attack: { base: "none", conditional: [{ weapon: "sling", bonus: "L" }] },
    defense: { base: "none", conditional: [{ vs: ["giant", "troll", "ogre", "half-giant"], bonus: "L" }] },
    special: [
      { type: "luck", uses: "L+3", effect: "reroll any die" },
    ],
  },

  // Half-level martial classes
  cleric: {
    attack: { base: "halfL", conditional: [{ vs: ["undead"], bonus: "L" }] },
    defense: { base: "none" },
    special: [
      { type: "healing", uses: 3, effect: "heal d6+L" },
      { type: "blessing", uses: 3, effect: "remove curse/petrification" },
    ],
  },

  acrobat: {
    attack: { base: "halfL" },
    defense: { base: "halfL" },
    special: [
      { type: "tricks", uses: "L+3", recharge: "tier per rest" },
    ],
  },

  bulwark: {
    attack: { base: "halfL", rangedBonus: "tier" },
    defense: { base: "halfL" },
    special: [],
  },

  druid: {
    attack: { base: "halfL" },
    defense: { base: "none" },
    special: [
      { type: "spellcasting", slots: "2+L", bonus: "L", spellList: "druid" },
      { type: "animalCompanion", count: 1 },
    ],
  },

  swashbuckler: {
    attack: { base: "halfL" },
    defense: { base: "halfL" },
    special: [
      { type: "panache", uses: "L+3", effect: "+1 attack or +1 defense per point" },
    ],
  },

  gnome: {
    attack: { base: "none" },
    defense: { base: "halfL" },
    special: [
      { type: "spellcasting", slots: "L", single: true, bonus: "L", spellList: "illusionist" },
      { type: "gadgeteer", uses: "L+6" },
    ],
  },

  kukla: {
    attack: { base: "none", conditional: [{ weapon: "lightBlade", bonus: 1 }] },
    defense: { base: "halfL" },
    special: [],
  },

  lightGladiator: {
    attack: { base: "none", conditional: [{ weaponType: "light", bonus: "halfL" }] },
    defense: { base: "halfL" },
    special: [
      { type: "parry", bonus: 2, target: "defense" },
      { type: "dualWield", bonus: "halfL" },
    ],
  },

  mushroomMonk: {
    attack: {
      base: "none",
      conditional: [
        { weapons: ["nunchaku", "bo", "sai", "throwingStars"], bonus: "L" },
        { default: "halfL" }
      ]
    },
    defense: { base: "halfL" },
    special: [],
  },

  // Full defensive classes
  rogue: {
    attack: {
      base: "none",
      conditional: [{ type: "outnumberMinorFoe", bonus: "L" }]
    },
    defense: { base: "L" },
    special: [
      { type: "lockpicking", bonus: "L" },
      { type: "disarmTraps", bonus: "L" },
    ],
  },

  // Spellcaster
  wizard: {
    attack: { base: "none", melee: -1 }, // Light weapon penalty
    defense: { base: "none" },
    special: [
      { type: "spellcasting", slots: "L", bonus: "L", spellList: "wizard" },
    ],
  },
};

/**
 * Helper function to calculate attack bonus
 * @param {string} classKey - Class identifier
 * @param {number} level - Character level
 * @param {object} options - Context (weapon type, target, etc.)
 * @returns {number} Attack bonus
 */
export function calculateClassAttackBonus(classKey, level, options = {}) {
  const classDef = ClassCombatBonuses[classKey];
  if (!classDef) return 0;

  const { attack } = classDef;
  let bonus = 0;

  // Base bonus
  if (attack.base === "L") {
    // Check for exceptions (like elf with two-handed)
    if (attack.except && options.weaponCategory && attack.except.includes(options.weaponCategory)) {
      bonus = 0;
    } else {
      bonus = level;
    }
  } else if (attack.base === "halfL") {
    bonus = Math.floor(level / 2);
  }

  // Ranged bonus (e.g., Bulwark)
  if (options.ranged && attack.rangedBonus === "tier") {
    const tier = getTierFromLevel(level);
    bonus += tier;
  }

  // Conditional bonuses
  if (attack.conditional) {
    for (const cond of attack.conditional) {
      if (cond.type === "outnumberMinorFoe" && options.outnumberMinorFoe) {
        bonus += level; // Rogue special
      } else if (cond.vs && options.targetType && cond.vs.includes(options.targetType)) {
        // Cleric vs undead, etc.
        if (cond.bonus === "L") bonus += level;
        else if (typeof cond.bonus === "number") bonus += cond.bonus;
      } else if (cond.weapon && options.weaponKey === cond.weapon) {
        // Halfling sling
        if (cond.bonus === "L") bonus += level;
      } else if (cond.weaponType && options.weaponType === cond.weaponType) {
        // Light Gladiator light weapons
        if (cond.bonus === "halfL") bonus += Math.floor(level / 2);
      } else if (cond.weapons && options.weaponKey && cond.weapons.includes(options.weaponKey)) {
        // Mushroom Monk martial weapons
        if (cond.bonus === "L") bonus += level;
      } else if (cond.default) {
        // Mushroom Monk other weapons
        if (cond.bonus === "halfL") bonus += Math.floor(level / 2);
      }
    }
  }

  // Special abilities
  if (classDef.special) {
    for (const special of classDef.special) {
      if (special.type === "vsOrcs" && options.targetRace === "orc") {
        bonus += special.bonus;
      } else if (special.type === "vsGoblins" && options.targetRace === "goblin") {
        bonus += special.bonus;
      } else if (special.type === "dualWield" && options.dualWielding) {
        if (special.bonus === "halfL") bonus += Math.floor(level / 2);
      } else if (special.type === "swornEnemy" && options.swornEnemy) {
        bonus += special.bonus;
      } else if (special.type === "hideInShadows" && options.hiddenStrike) {
        bonus += level * 2; // 3x damage = +2L modifier
      }
    }
  }

  return bonus;
}

/**
 * Helper function to calculate defense bonus
 * @param {string} classKey - Class identifier
 * @param {number} level - Character level
 * @param {object} options - Context (enemy type, etc.)
 * @returns {number} Defense bonus
 */
export function calculateClassDefenseBonus(classKey, level, options = {}) {
  const classDef = ClassCombatBonuses[classKey];
  if (!classDef) return 0;

  const { defense } = classDef;
  let bonus = 0;

  // Base bonus
  if (defense.base === "L") {
    bonus = level;
  } else if (defense.base === "halfL") {
    bonus = Math.floor(level / 2);
  }

  // Conditional bonuses
  if (defense.conditional) {
    for (const cond of defense.conditional) {
      if (cond.vs && options.enemyType && cond.vs.includes(options.enemyType)) {
        if (cond.bonus === "L") bonus += level;
        else if (typeof cond.bonus === "number") bonus += cond.bonus;
      }
    }
  }

  // Special abilities
  if (classDef.special) {
    for (const special of classDef.special) {
      if (special.type === "parry" && options.parry) {
        bonus += special.bonus;
      } else if (special.type === "panache" && options.panacheDodge) {
        bonus += 2; // Standard panache dodge
      }
    }
  }

  return bonus;
}

/**
 * Get tier from level
 */
function getTierFromLevel(level) {
  if (level >= 20) return 5;
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

export { getTierFromLevel as getTier };
