/**
 * Equipment Schema - Weapon and armor definitions with combat modifiers
 * Based on Four Against Darkness core rules
 */

/**
 * Weapon categories and their base modifiers
 */
export const WeaponCategories = {
  // Melee weapons
  lightMelee: {
    attackMod: -1,
    hands: 1,
    types: ["slashing", "crushing"],
    examples: ["dagger", "knife", "club", "stick"],
    cost: 5,
    special: {
      narrowCorridor: { attackMod: 0 }, // Penalty negated in narrow corridors
    },
  },

  handWeapon: {
    attackMod: 0,
    hands: 1,
    types: ["slashing", "crushing"],
    examples: ["sword", "axe", "mace", "scimitar", "flail", "hammer"],
    cost: 6,
  },

  twoHandedWeapon: {
    attackMod: 1,
    hands: 2,
    types: ["slashing", "crushing"],
    examples: ["greatsword", "battleaxe", "halberd", "maul", "two-handed hammer"],
    cost: 15,
    special: {
      narrowCorridor: { attackMod: -1 }, // Becomes -1 in narrow corridors (loses +1)
    },
  },

  // Ranged weapons
  bow: {
    attackMod: 0,
    hands: 2,
    ranged: true,
    type: "slashing",
    cost: 15,
    special: {
      beforeMelee: true, // Can shoot before melee
      rangerElf: { shots: 2 }, // Rangers/elves shoot twice outdoors
    },
  },

  crossbow: {
    attackMod: 1,
    hands: 2,
    ranged: true,
    type: "slashing",
    cost: 15,
    special: {
      beforeMelee: true,
      reload: 1, // Takes 1 turn to reload after shooting
    },
  },

  sling: {
    attackMod: -1,
    hands: 2,
    ranged: true,
    type: "crushing",
    cost: 4,
    special: {
      beforeMelee: true,
      openPlains: { shots: 2 }, // Shoot twice in open plains/deserts
    },
  },

  handgun: {
    attackMod: 2,
    hands: 1,
    ranged: true,
    type: "slashing",
    cost: 30,
    special: {
      beforeMelee: true,
      reload: 2, // Takes 2 turns to reload
      explosion: { damage: 1, onRoll: 1 }, // Explodes on natural 1
      wanderingMonsters: { increase: 1 }, // +1 to WM rolls after use
    },
  },

  blackPowderRifle: {
    attackMod: 3,
    hands: 2,
    ranged: true,
    type: "slashing",
    cost: 90,
    special: {
      beforeMelee: true,
      reload: 2,
      explosion: { damage: 1, onRoll: 1 },
      wanderingMonsters: { increase: 1 },
    },
  },

  throwingStars: {
    attackMod: -1,
    hands: 1,
    ranged: true,
    type: "slashing",
    cost: 2,
    special: {
      beforeMelee: true,
      maxDamage: 1, // Never inflicts more than 1 damage
      attacks: 2, // Can throw 2 per turn
    },
  },

  // Special weapons
  torch: {
    attackMod: -1,
    hands: 1,
    type: "crushing",
    cost: 0.083, // 1gp per dozen
    special: {
      light: true,
      extinguish: { onRoll: 1 }, // Extinguishes on natural 1
      vsFlammable: { attackMod: 2 }, // +2 vs flammable (mummies, etc.)
      duration: 6, // Lasts 6 rooms
    },
  },

  stake: {
    attackMod: -1, // vs normal targets
    hands: 1,
    type: "slashing",
    cost: 6,
    special: {
      vsVampires: { attackMod: 0 }, // Counts as hand weapon vs vampires
      holyWaterDip: { damageBonus: 1 }, // +1 damage if dipped in holy water
    },
  },

  pole: {
    attackMod: "byClass", // Varies by class restriction
    hands: 2,
    cost: 2,
    special: {
      trapSave: { bonus: 1 }, // +1 to trap saves (except party-wide)
      searchReroll: { range: [2, 4] }, // Reroll search on 2-4
    },
  },

  unarmed: {
    attackMod: -2,
    hands: 0,
    type: "crushing",
    cost: 0,
  },
};

/**
 * Armor types and their defense bonuses
 */
export const ArmorTypes = {
  none: {
    defenseMod: 0,
    cost: 0,
    metallic: false,
    stealthMod: 0,
    swimmingMod: 0,
    climbingMod: 0,
  },

  lightArmor: {
    defenseMod: 1,
    cost: 10,
    metallic: false,
    stealthMod: 0,
    swimmingMod: -1,
    climbingMod: 0,
    examples: ["leather", "padded", "hide"],
  },

  heavyArmor: {
    defenseMod: 2,
    cost: 30,
    metallic: true,
    stealthMod: -1,
    swimmingMod: -2,
    climbingMod: -2,
    examples: ["chainmail", "plate", "banded"],
  },

  shield: {
    defenseMod: 1,
    cost: 5,
    hands: 1,
    stealthMod: -1,
    special: {
      fleeing: { defenseMod: 0 }, // No bonus when fleeing
      vsFlail: { defenseMod: 0 }, // No bonus vs flails
      replaceable: true, // Can carry replacement
    },
  },

  leafsteelArmor: {
    defenseMod: 2,
    cost: 0, // Found as loot
    metallic: false,
    stealthMod: 0,
    swimmingMod: -1,
    climbingMod: 0,
    duration: 3, // Lasts 3 adventures
  },
};

/**
 * Weapon material modifiers
 */
export const WeaponMaterials = {
  silver: {
    cost: 20, // Light weapon, hand weapon, arrows
    costTwoHanded: 40,
    vsWereCreatures: { attackMod: 1 },
  },

  gilded: {
    cost: 50,
    vsElementals: { attackMod: 2 },
  },

  magic: {
    attackMod: 1,
    permanent: true,
    resaleValue: "100gp + 2x weapon cost",
  },

  envenomed: {
    cost: 30, // blade poison
    attackMod: 1,
    oneUse: true,
    weaponTypes: ["slashing"], // Only slashing weapons
    notVs: ["undead", "demon", "blob", "automaton", "mold", "fungi", "elemental", "statue"],
  },
};

/**
 * Special weapon properties
 */
export const WeaponProperties = {
  crushing: {
    vsSkeletons: { attackMod: 1 },
  },

  slashing: {
    // No special properties by default
  },

  ranged: {
    requiresLight: true,
    darkness: { attackMod: -2 },
  },
};

/**
 * Calculate weapon attack modifier
 * @param {object} weapon - Weapon object
 * @param {object} context - Combat context
 * @returns {number} Attack modifier
 */
export function calculateWeaponAttackMod(weapon, context = {}) {
  const category = WeaponCategories[weapon.category];
  if (!category) return 0;

  let mod = category.attackMod;

  // Check for narrow corridor
  if (context.location?.narrow && category.special?.narrowCorridor) {
    mod = category.special.narrowCorridor.attackMod;
  }

  // Check weapon type bonuses
  if (weapon.weaponType === "crushing" && context.target?.race === "skeleton") {
    mod += 1;
  }

  // Check material modifiers
  if (weapon.material === "silver" && context.target?.type === "were") {
    mod += WeaponMaterials.silver.vsWereCreatures.attackMod;
  }

  if (weapon.material === "gilded" && context.target?.type === "elemental") {
    mod += WeaponMaterials.gilded.vsElementals.attackMod;
  }

  if (weapon.material === "magic") {
    mod += WeaponMaterials.magic.attackMod;
  }

  if (weapon.envenomed && !WeaponMaterials.envenomed.notVs.includes(context.target?.type)) {
    mod += 1;
  }

  // Special weapon bonuses
  if (weapon.id === "torch" && context.target?.flammable) {
    mod += 2;
  }

  if (weapon.id === "stake" && context.target?.race === "vampire") {
    mod = 0; // Hand weapon vs vampires
    if (weapon.holyWaterDipped) {
      // Damage bonus handled separately
    }
  }

  return mod;
}

/**
 * Calculate armor defense modifier
 * @param {object} armor - Armor object
 * @param {object} context - Combat context
 * @returns {number} Defense modifier
 */
export function calculateArmorDefenseMod(armor, context = {}) {
  const armorType = ArmorTypes[armor.type];
  if (!armorType) return 0;

  let mod = armorType.defenseMod;

  // Check for fleeing (shield doesn't apply)
  if (context.fleeing && armor.type === "shield") {
    return 0;
  }

  // Check for flail attack (shield doesn't apply)
  if (context.enemyWeapon === "flail" && armor.type === "shield") {
    return 0;
  }

  return mod;
}

/**
 * Equipment slot definitions
 */
export const EquipmentSlots = {
  mainHand: {
    accepts: ["weapon", "shield", "lantern", "torch"],
  },
  offHand: {
    accepts: ["weapon", "shield", "lantern", "torch"],
  },
  armor: {
    accepts: ["lightArmor", "heavyArmor", "none"],
  },
  amulet: {
    accepts: ["amulet"],
    max: 1,
  },
  talisman: {
    accepts: ["talisman"],
    max: 1,
  },
};

/**
 * Starting equipment packages by class
 */
export const StartingEquipment = {
  warrior: {
    gold: 25,
    items: [
      { type: "weapon", category: "handWeapon", weaponType: "slashing" },
      { type: "armor", armorType: "lightArmor" },
      { type: "shield" },
      { type: "lantern" },
    ],
  },

  wizard: {
    gold: 15,
    items: [
      { type: "weapon", category: "lightMelee", weaponType: "slashing", id: "dagger" },
      { type: "lantern" },
    ],
  },

  cleric: {
    gold: 20,
    items: [
      { type: "weapon", category: "handWeapon", weaponType: "crushing", id: "mace" },
      { type: "armor", armorType: "lightArmor" },
      { type: "shield" },
      { type: "lantern" },
    ],
  },

  rogue: {
    gold: 20,
    items: [
      { type: "weapon", category: "lightMelee", weaponType: "slashing", id: "dagger" },
      { type: "armor", armorType: "lightArmor" },
      { type: "lantern" },
    ],
  },

  barbarian: {
    gold: 15,
    items: [
      { type: "weapon", category: "twoHandedWeapon", weaponType: "slashing" },
      { type: "torch", count: 12 },
    ],
  },

  elf: {
    gold: 30,
    items: [
      { type: "weapon", category: "bow" },
      { type: "weapon", category: "handWeapon", weaponType: "slashing" },
      { type: "armor", armorType: "lightArmor" },
      { type: "lantern" },
    ],
  },

  dwarf: {
    gold: 20,
    items: [
      { type: "weapon", category: "handWeapon", weaponType: "crushing" },
      { type: "armor", armorType: "heavyArmor" },
      { type: "shield" },
      { type: "lantern" },
    ],
  },

  halfling: {
    gold: 25,
    items: [
      { type: "weapon", category: "sling" },
      { type: "weapon", category: "lightMelee", weaponType: "slashing", id: "dagger" },
      { type: "armor", armorType: "lightArmor" },
      { type: "lantern" },
    ],
  },
};

/**
 * Magic items and their effects
 */
export const MagicItemTypes = {
  weapon: {
    attackMod: 1,
    permanent: true,
    hitsGhosts: true,
  },

  armor: {
    defenseMod: 1,
    permanent: true,
  },

  shield: {
    defenseMod: 1,
    permanent: true,
  },

  amulet: {
    luck: 1,
    oneUse: true,
  },

  talisman: {
    saveMod: 1,
    oneUse: true,
  },

  ringOfTeleportation: {
    autoDefense: true,
    oneUse: true,
  },

  wandOfSleep: {
    charges: 3,
    spell: "sleep",
    spellMod: "L",
  },

  fireballStaff: {
    charges: 2,
    spell: "fireball",
    spellMod: "L",
  },

  healingPotion: {
    healFull: true,
    oneUse: true,
    maxPerAdventure: 1,
  },

  foolsGold: {
    autoBribe: true,
    oneUse: true,
  },
};
