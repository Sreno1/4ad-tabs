/**
 * Spell Schema - Magic spell definitions and effects
 * Based on Four Against Darkness core rules
 */

/**
 * Spell types
 */
export const SpellTypes = {
  WIZARD: "wizard",
  CLERIC: "cleric", // Prayers
  DRUID: "druid",
  ILLUSIONIST: "illusionist",
  ELF: "elf", // Can use wizard spells
};

/**
 * Spell targeting
 */
export const SpellTargeting = {
  SELF: "self",
  SINGLE_FOE: "singleFoe",
  SINGLE_ALLY: "singleAlly",
  ALL_FOES: "allFoes",
  ALL_ALLIES: "allAllies",
  SINGLE_MINOR_FOE_GROUP: "singleMinorFoeGroup",
  AREA: "area",
  NONE: "none",
};

/**
 * Spell school
 */
export const SpellSchools = {
  EVOCATION: "evocation",
  ABJURATION: "abjuration",
  TRANSMUTATION: "transmutation",
  CONJURATION: "conjuration",
  ENCHANTMENT: "enchantment",
  DIVINATION: "divination",
  NECROMANCY: "necromancy",
  ILLUSION: "illusion",
};

/**
 * Spell schema definition
 */
export const SpellSchema = {
  required: [
    "id",
    "name",
    "type", // wizard, cleric, druid, illusionist
    "targeting",
    "requiresRoll", // Boolean - does it need a spellcasting roll?
    "effect",
  ],

  optionals: [
    "school",
    "damage",
    "duration",
    "saveDC",
    "immunities", // Foe types immune
    "special", // Special rules
    "rollBonus", // Caster adds +L or other
    "multiTarget", // Can affect multiple targets
    "automatic", // Automatic effect, no roll needed
  ],
};

/**
 * Basic wizard spells
 */
export const WizardSpells = {
  blessing: {
    id: "blessing",
    name: "Blessing",
    type: SpellTypes.WIZARD,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: "remove curse or petrification",
    special: {
      notUsableBy: ["elf"], // Divine law restriction
      alsoClericPrayer: true,
    },
  },

  escape: {
    id: "escape",
    name: "Escape",
    type: SpellTypes.WIZARD,
    school: SpellSchools.CONJURATION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    effect: "teleport to entrance tile",
    special: {
      canCastDuringDefense: true,
      canCastDuringTurn: true,
    },
  },

  lightning: {
    id: "lightning",
    name: "Lightning",
    type: SpellTypes.WIZARD,
    school: SpellSchools.EVOCATION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "L",
    damage: { minor: 1, major: 2 },
    immunities: ["lightning elemental"],
    effect: "lightning bolt strike",
  },

  fireball: {
    id: "fireball",
    name: "Fireball",
    type: SpellTypes.WIZARD,
    school: SpellSchools.EVOCATION,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "L",
    damage: { minor: "roll - foeLevel, min 1", major: 1 },
    immunities: ["fire dragon"],
    effect: "explosive fireball",
    special: {
      minorFoes: {
        formula: "max(1, attackRoll - foeLevel)",
        alwaysKillsOne: true,
      },
      vsFlammable: { bonus: 2, destroysScrolls: true },
    },
  },

  protection: {
    id: "protection",
    name: "Protection",
    type: SpellTypes.WIZARD,
    school: SpellSchools.ABJURATION,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    effect: "+1 defense until end of encounter",
    duration: "encounter",
    special: {
      worksOnAntiMagic: true, // Works on barbarians etc.
    },
  },

  sleep: {
    id: "sleep",
    name: "Sleep",
    type: SpellTypes.WIZARD,
    school: SpellSchools.ENCHANTMENT,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "L",
    effect: "put target to sleep (can subdue or slay)",
    immunities: [
      "dragon", // Most dragons
      "undead",
      "elemental",
      "clockwork",
      "artificial",
      "spirit",
    ],
    maxLevel: 10, // Doesn't work on L11+
    special: {
      majorFoe: { count: 1 },
      minorFoes: { count: "d6 + casterLevel" },
    },
  },
};

/**
 * Cleric prayers
 */
export const ClericPrayers = {
  blessing: {
    id: "blessing",
    name: "Blessing",
    type: SpellTypes.CLERIC,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    uses: 3,
    effect: "remove curse or petrification",
    special: {
      vsMagicResistance: { requiresRoll: true, rollBonus: "L" },
    },
  },

  healing: {
    id: "healing",
    name: "Healing",
    type: SpellTypes.CLERIC,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    uses: 3,
    effect: "heal d6+L life",
    formula: "d6 + clericLevel",
  },
};

/**
 * Druid spells
 */
export const DruidSpells = {
  disperseVermin: {
    id: "disperseVermin",
    name: "Disperse Vermin",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "2xL",
    effect: "disperse vermin (not kill, no loot)",
    immunities: ["undead vermin", "mechanical vermin", "animated objects"],
  },

  summonBeast: {
    id: "summonBeast",
    name: "Summon Beast",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.NONE,
    requiresRoll: false,
    automatic: true,
    effect: "summon L3 warrior beast with 5 life",
    duration: "encounter or until slain",
    special: {
      attacks: 1,
      damage: 1,
      disappearsOn: ["encounter end", "druid slain", "druid petrified", "druid killed"],
    },
  },

  waterJet: {
    id: "waterJet",
    name: "Water Jet",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "L",
    effect: "shoot water jet",
    options: [
      { option: "2 damage to fire creature or natural fire" },
      { option: "Disperse 2 vermin" },
      { option: "Knock out 1 minion" },
      { option: "Distract major foe (party can flee)" },
      { option: "Generate water for party for 1 day" },
    ],
    special: {
      nearWater: { bonus: 1 },
      inDesert: { penalty: -2 },
    },
  },

  bearForm: {
    id: "bearForm",
    name: "Bear Form",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    duration: "encounter",
    effect: "transform into bear",
    special: {
      life: "max(8, druidCurrentLife)",
      fightsAs: "max(L3, druidLevel) warrior",
      cannotCastSpells: true,
      damageAfter: "half damage taken in bear form (round down)",
    },
  },

  warpWood: {
    id: "warpWood",
    name: "Warp Wood",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: false,
    automatic: true,
    effect: "destroy wooden object or deal 2 damage to wood creature",
    targets: ["door", "chest", "bridge", "stockade", "wood golem", "treeman", "dryad", "wood elemental", "plant"],
  },

  barkskin: {
    id: "barkskin",
    name: "Barkskin",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_ALLY,
    requiresRoll: false,
    automatic: true,
    duration: "encounter",
    effect: "+2 defense, -2 agility saves",
    special: {
      vsFire: { defense: -2 },
      vsFireBasedDragon: { defense: -2 },
      onFoe: {
        levelIncrease: 1,
        vsFire: { bonus: 3, minDamage: 2 },
      },
    },
  },

  lightningStrike: {
    id: "lightningStrike",
    name: "Lightning Strike",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: true,
    rollBonus: "L",
    effect: "same as wizard lightning",
    damage: { minor: 1, major: 2 },
    special: {
      outdoorsOnly: true,
    },
  },

  spiderweb: {
    id: "spiderweb",
    name: "Spiderweb",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: false,
    automatic: true,
    effect: "entangle targets, -1L for attack/defense",
    targets: { major: 1, minor: "d6" },
    immunities: ["fire creature", "spider", "elemental"],
    special: {
      fire: { removes: true },
      moraleFailWhileWebbed: "surrender and subdue",
    },
  },

  entangle: {
    id: "entangle",
    name: "Entangle",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.SINGLE_FOE,
    requiresRoll: false,
    automatic: true,
    effect: "entangle with plants, -1L for attack/defense",
    targets: { major: 1, minor: "d6" },
    special: {
      outdoorsOnly: true,
      environments: ["forest", "swamp", "jungle"],
      fireCreatures: { affected: true, breakFree: "after 2 turns" },
      fire: { doesNotFree: true },
    },
  },

  subdual: {
    id: "subdual",
    name: "Subdual",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.ALL_ALLIES,
    requiresRoll: false,
    automatic: true,
    duration: "encounter",
    effect: "ignore -1 penalty on subdual attacks",
  },

  forestPathway: {
    id: "forestPathway",
    name: "Forest Pathway",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.NONE,
    requiresRoll: false,
    automatic: true,
    duration: "10 minutes x druidLevel",
    effect: "vegetation moves aside, party walks through",
    special: {
      druidPosition: [1, 2], // Must be position 1 or 2
      noCutting: true,
    },
  },

  alterWeather: {
    id: "alterWeather",
    name: "Alter Weather",
    type: SpellTypes.DRUID,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    duration: "10 minutes",
    effect: "summon bad weather or stop it",
    special: {
      outdoorsOnly: true,
      effects: [
        { effect: "all ranged attacks -1L (including PC ranged)" },
        { effect: "druid lightning strike +1" },
        { effect: "2 damage to fire/air elemental (automatic)" },
        { effect: "douse natural fire" },
        { effect: "stop storm or harsh weather" },
      ],
    },
  },
};

/**
 * Illusionist spells
 */
export const IllusionistSpells = {
  illusionaryArmor: {
    id: "illusionaryArmor",
    name: "Illusionary Armor",
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    duration: "encounter",
    effect: "+Tier to defense",
    immunities: ["vermin", "undead", "artificial", "elemental"],
  },

  illusionaryMirrorImage: {
    id: "illusionaryMirrorImage",
    name: "Illusionary Mirror Image",
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.SELF,
    requiresRoll: false,
    automatic: true,
    duration: "encounter or until caster moves",
    effect: "create Tier+1 copies, each can absorb 1 attack",
    special: {
      copies: "Tier+1",
      life: 1,
      autoHit: true,
      disappearOn: ["hit", "disbelief cast", "caster flees", "area attack"],
    },
  },

  disbelief: {
    id: "disbelief",
    name: "Disbelief",
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    effect: "dispel all illusions",
    special: {
      invisibleFoes: { becomesVisible: true, levelReduction: 2 },
      invisibleGremlins: { becomesVisible: true, stats: "d6+1 L3 Minions" },
    },
  },

  illusionaryFog: {
    id: "illusionaryFog",
    name: "Illusionary Fog",
    type: SpellTypes.ILLUSIONIST,
    school: SpellSchools.ILLUSION,
    targeting: SpellTargeting.AREA,
    requiresRoll: false,
    automatic: true,
    duration: "until caster leaves or dies",
    effect: "create mist",
    special: {
      rangedAttacks: "suspended",
      gazeAttacks: "suspended",
      search: "disabled",
      fleeing: { defense: 2 },
      canCastBeforeAttack: true,
    },
  },
};

/**
 * Calculate spell effectiveness
 * @param {object} spell - Spell definition
 * @param {number} casterLevel - Caster's level
 * @param {number} targetLevel - Target's level (if applicable)
 * @returns {object} Spell results
 */
export function calculateSpellEffect(spell, casterLevel, targetLevel = 0) {
  const result = {
    requiresRoll: spell.requiresRoll,
    bonus: 0,
    damage: 0,
    count: 1,
    automatic: spell.automatic || false,
  };

  // Calculate roll bonus
  if (spell.rollBonus === "L") {
    result.bonus = casterLevel;
  } else if (spell.rollBonus === "2xL") {
    result.bonus = casterLevel * 2;
  }

  // Calculate damage
  if (spell.damage) {
    if (spell.damage.major) {
      result.damage = spell.damage.major;
    }
  }

  // Calculate multi-target count
  if (spell.special?.minorFoes?.count) {
    const count = spell.special.minorFoes.count;
    if (count.includes("d6")) {
      // Would need to actually roll, this is just the formula
      result.countFormula = count;
    }
  }

  return result;
}

/**
 * Check if target is immune to spell
 * @param {object} spell - Spell definition
 * @param {object} target - Target creature
 * @returns {boolean} True if immune
 */
export function isImmuneToSpell(spell, target) {
  if (!spell.immunities) return false;

  return spell.immunities.some((immunity) => {
    return (
      target.type === immunity ||
      target.race === immunity ||
      target.category === immunity
    );
  });
}
