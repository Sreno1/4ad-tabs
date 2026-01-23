/**
 * Environment Schema - Dungeon environment definitions
 * Based on Four Against Darkness core rules
 */

/**
 * Environment types
 */
export const EnvironmentTypes = {
  DUNGEON: "dungeon",
  FUNGAL_GROTTOES: "fungalGrottoes",
  CAVERNS: "caverns",
};

/**
 * Environment schema definition
 */
export const EnvironmentSchema = {
  required: [
    "id",
    "name",
    "description",
    "specialRules",
    "searchTable",
    "specialFeatureTable",
    "specialEventsTable",
    "verminTable",
    "minionsTable",
    "weirdMonstersTable",
    "bossTable",
    "trapsTable",
    "treasureTable",
  ],

  optionals: [
    "movementModifiers",
    "combatModifiers",
    "doorRules",
    "lightRules",
    "wanderingMonstersModifier",
  ],
};

/**
 * Environment definitions
 */
export const Environments = {
  dungeon: {
    id: "dungeon",
    name: "Dungeon",
    description: "Underground chambers and corridors",
    specialRules: {
      doors: true,
      lanternRequired: true,
    },

    searchTable: {
      roll: "d6",
      corridorModifier: -1,
      results: [
        { roll: [0, 1], result: "wanderingMonsters" },
        { roll: [2, 4], result: "empty" },
        {
          roll: [5, 6],
          result: "found",
          options: ["hiddenTreasure", "secretDoor", "secretPassage", "clue"],
        },
      ],
    },

    specialFeatureTable: {
      roll: "d6",
      results: [
        {
          roll: [1, 1],
          feature: "fountain",
          effect: "heal 1 life (first time per adventure)",
        },
        {
          roll: [2, 2],
          feature: "blessedTemple",
          effect: "+1 vs undead/demons until kill one",
        },
        {
          roll: [3, 3],
          feature: "armory",
          effect: "change weapons or get replacement",
        },
        {
          roll: [4, 4],
          feature: "cursedAltar",
          effect: "random PC cursed (-1 defense)",
        },
        {
          roll: [5, 5],
          feature: "statue",
          effect: "touch: 1-3 awakens (HCL+3 boss), 4-6 breaks (treasure)",
        },
        {
          roll: [6, 6],
          feature: "puzzleBox",
          effect: "solve vs L or take 1 damage per fail",
        },
      ],
    },

    specialEventsTable: {
      roll: "d6",
      results: [
        { roll: [1, 1], event: "ghost", effect: "save L4 fear or lose 1 life or 1 madness" },
        { roll: [2, 2], event: "wanderingMonsters" },
        { roll: [3, 3], event: "ladyInWhite", effect: "offers quest" },
        { roll: [4, 4], event: "trap" },
        { roll: [5, 5], event: "wanderingHealer", effect: "heal 10gp per life" },
        { roll: [6, 6], event: "wanderingAlchemist", effect: "sell potions/poison" },
      ],
    },

    verminTable: "dungeonVermin",
    minionsTable: "dungeonMinions",
    weirdMonstersTable: "dungeonWeirdMonsters",
    bossTable: "dungeonBoss",
    trapsTable: "dungeonTraps",
    treasureTable: "dungeonTreasure",

    movementModifiers: {},
    combatModifiers: {},

    secretPassageDestinations: ["fungalGrottoes", "caverns"],
  },

  fungalGrottoes: {
    id: "fungalGrottoes",
    name: "Fungal Grottoes",
    description: "Underground mushroom forests",
    specialRules: {
      doors: false, // Large mushrooms instead
      slippery: {
        fleeing: {
          defenseMod: -1,
          except: ["ranger", "rogue", "acrobat", "halfling", "mushroomMonk"],
        },
      },
      lanternRequired: true,
    },

    searchTable: {
      roll: "d6",
      corridorModifier: -1,
      mushroomMonkHalflingBonus: { 4: 5 }, // Count 4 as 5
      results: [
        { roll: [0, 1], result: "wanderingMonsters" },
        { roll: [2, 4], result: "empty" },
        {
          roll: [5, 6],
          result: "found",
          options: ["clue", "rareMushroom"],
        },
      ],
    },

    specialEventsTable: {
      roll: "d6",
      results: [
        {
          roll: [1, 1],
          event: "halflingScout",
          effect: "10gp for +1 saves and no surprise until exit",
        },
        {
          roll: [2, 2],
          event: "cavemen",
          effect: "d6+2 cavemen want 4 food or fight (HCL+3 minions)",
        },
        {
          roll: [3, 3],
          event: "sporeCloud",
          effect: "save HCL poison or lose 2 life",
        },
        {
          roll: [4, 4],
          event: "trap",
          effect: "roll on fungal grottoes trap table + rare item",
        },
        {
          roll: [5, 5],
          event: "mushroomMonkWarning",
          effect: "avoid next trap/WM in fungal grottoes",
          condition: "mushroomMonk in party",
        },
        {
          roll: [6, 6],
          event: "merchant",
          effect: "buy/sell items at +20% prices",
        },
      ],
    },

    verminTable: "fungalVermin",
    minionsTable: "fungalMinions",
    weirdMonstersTable: "fungalWeirdMonsters",
    bossTable: "fungalBoss",
    trapsTable: "fungalTraps",
    treasureTable: "fungalTreasure",

    movementModifiers: {
      slippery: true,
    },

    combatModifiers: {
      fleeingPenalty: -1,
      exceptions: ["ranger", "rogue", "acrobat", "halfling", "mushroomMonk"],
    },

    secretPassageDestinations: ["dungeon", "caverns"],
  },

  caverns: {
    id: "caverns",
    name: "Caverns",
    description: "Natural cave systems",
    specialRules: {
      doors: false, // Openings never have doors
      lanternRequired: true,
      specialFeatures: {
        chance: "1-2 on d6 when entering",
        types: ["stalactites", "stalagmites", "boulders", "echo", "waterPools"],
      },
    },

    specialFeatures: {
      stalactites: {
        effect: "explosive 2H attack: 3-in-6 stalactite falls",
        damage: 1,
        targetRoll: "d6: 1-3 random PC, 4-6 random foe",
        defense: "vs HCL",
      },

      stalagmites: {
        effect: "hinder movement, PCs can't explode attack rolls",
      },

      boulders: {
        effect: "+1 defense vs ranged, -1 attack with ranged, +1 to surprise, +1 stealth saves",
      },

      echo: {
        effect: "-1 stealth saves, 2-in-6 WM chance, spells echo on 6 (cast again free)",
      },

      waterPools: {
        roll: "d6 when PC dips",
        results: [
          { roll: [1, 1], effect: "contaminated, -1 saves until end/heal/blessing" },
          { roll: [2, 4], effect: "no effect" },
          { roll: [5, 6], effect: "heal 1 life (once per PC per adventure)" },
        ],
      },
    },

    searchTable: {
      roll: "d6",
      corridorModifier: -1,
      classBonus: ["elf", "ranger", "rogue", "shadow", "halfling"], // Count 4 as 5 for listening
      results: [
        { roll: [0, 1], result: "wanderingMonsters" },
        { roll: [2, 4], result: "empty" },
        {
          roll: [5, 6],
          result: "found",
          options: ["clue", "listen"], // Listen: roll next tile before entering
        },
      ],
    },

    specialEventsTable: {
      roll: "d6",
      results: [
        {
          roll: [1, 1],
          event: "caveGoblinScout",
          effect: "10gp for no surprise and +1 saves until exit",
        },
        {
          roll: [2, 2],
          event: "cavemenExplorers",
          effect: "d6 cavemen want 2 food or fight (HCL+3 minions)",
        },
        {
          roll: [3, 3],
          event: "morlockSpy",
          effect: "5gp to not be surprised by morlocks until exit",
        },
        { roll: [4, 4], event: "trap" },
        {
          roll: [5, 5],
          event: "dwarfMinerGem",
          effect: "find gem worth d6x10gp (1-in-6 WM to collect)",
          condition: "dwarf in party",
        },
        {
          roll: [6, 6],
          event: "dwarfMiner",
          effect: "trade gems, reveals next tile if trade",
        },
      ],
    },

    verminTable: "cavernsVermin",
    minionsTable: "cavernsMinions",
    weirdMonstersTable: "cavernsWeirdMonsters",
    bossTable: "cavernsBoss",
    trapsTable: "cavernsTraps",
    treasureTable: "cavernsTreasure",

    movementModifiers: {},
    combatModifiers: {},

    secretPassageDestinations: ["dungeon", "fungalGrottoes"],
  },
};

/**
 * Get environment by ID
 * @param {string} environmentId - Environment identifier
 * @returns {object|null} Environment definition
 */
export function getEnvironment(environmentId) {
  return Environments[environmentId] || null;
}

/**
 * Get search result
 * @param {string} environmentId - Environment identifier
 * @param {number} roll - Search roll result
 * @param {object} context - Context (in corridor, class, etc.)
 * @returns {object} Search result
 */
export function getSearchResult(environmentId, roll, context = {}) {
  const env = getEnvironment(environmentId);
  if (!env) return null;

  let modifiedRoll = roll;

  // Apply corridor modifier
  if (context.inCorridor && env.searchTable.corridorModifier) {
    modifiedRoll += env.searchTable.corridorModifier;
  }

  // Apply class bonuses (mushroom monk / halfling in fungal grottoes)
  if (env.searchTable.mushroomMonkHalflingBonus && context.class) {
    if (
      ["mushroomMonk", "halfling"].includes(context.class) &&
      env.searchTable.mushroomMonkHalflingBonus[modifiedRoll]
    ) {
      modifiedRoll = env.searchTable.mushroomMonkHalflingBonus[modifiedRoll];
    }
  }

  // Find matching result
  for (const resultDef of env.searchTable.results) {
    const [min, max] = resultDef.roll;
    if (modifiedRoll >= min && modifiedRoll <= max) {
      return resultDef;
    }
  }

  return { result: "empty" };
}

/**
 * Get special feature
 * @param {string} environmentId - Environment identifier
 * @param {number} roll - Feature roll result
 * @returns {object|null} Feature definition
 */
export function getSpecialFeature(environmentId, roll) {
  const env = getEnvironment(environmentId);
  if (!env || !env.specialFeatureTable) return null;

  for (const feature of env.specialFeatureTable.results) {
    const [min, max] = feature.roll;
    if (roll >= min && roll <= max) {
      return feature;
    }
  }

  return null;
}

/**
 * Get special event
 * @param {string} environmentId - Environment identifier
 * @param {number} roll - Event roll result
 * @returns {object|null} Event definition
 */
export function getSpecialEvent(environmentId, roll) {
  const env = getEnvironment(environmentId);
  if (!env || !env.specialEventsTable) return null;

  for (const event of env.specialEventsTable.results) {
    const [min, max] = event.roll;
    if (roll >= min && roll <= max) {
      return event;
    }
  }

  return null;
}

/**
 * Check if environment has special feature active
 * @param {string} environmentId - Environment identifier
 * @param {string} featureType - Feature type (stalactites, echo, etc.)
 * @param {object} tileFeatures - Current tile features
 * @returns {boolean}
 */
export function hasFeatureActive(environmentId, featureType, tileFeatures = {}) {
  if (environmentId !== "caverns") return false;

  return tileFeatures[featureType] === true;
}

/**
 * Apply environment combat modifiers
 * @param {string} environmentId - Environment identifier
 * @param {object} combatState - Current combat state
 * @returns {object} Modified combat state
 */
export function applyEnvironmentModifiers(environmentId, combatState) {
  const env = getEnvironment(environmentId);
  if (!env) return combatState;

  const modifiers = { ...combatState };

  // Fungal Grottoes slippery
  if (env.combatModifiers.fleeingPenalty && combatState.fleeing) {
    const exceptions = env.combatModifiers.exceptions || [];
    if (!exceptions.includes(combatState.heroClass)) {
      modifiers.defenseMod = (modifiers.defenseMod || 0) + env.combatModifiers.fleeingPenalty;
    }
  }

  return modifiers;
}
