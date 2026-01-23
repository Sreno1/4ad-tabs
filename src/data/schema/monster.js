/**
 * Monster Schema - Foe definitions with stats and reactions
 * Based on Four Against Darkness core rules
 */

/**
 * Monster category types
 */
export const MonsterCategories = {
  VERMIN: "vermin",
  MINION: "minion",
  WEIRD_MONSTER: "weirdMonster",
  BOSS: "boss",
};

/**
 * Monster type classifications (for special rules)
 */
export const MonsterTypes = {
  ANIMAL: "animal",
  UNDEAD: "undead",
  DEMON: "demon",
  ELEMENTAL: "elemental",
  DRAGON: "dragon",
  WERE: "were",
  ARTIFICIAL: "artificial", // Golems, constructs
  CHAOS: "chaos",
  HUMANOID: "humanoid",
  SLIME: "slime",
  VERMIN: "vermin",
  MUSHROOM: "mushroom",
  SPIRIT: "spirit",
};

/**
 * Reaction table types
 */
export const ReactionTypes = {
  ALWAYS_FIGHT: "alwaysFight",
  ALWAYS_FIGHT_TO_DEATH: "alwaysFightToDeath",
  FLEE: "flee",
  FLEE_IF_OUTNUMBERED: "fleeIfOutnumbered",
  BRIBE: "bribe",
  BLOOD_OFFERING: "bloodOffering",
  QUEST: "quest",
  TRADE: "trade",
  OFFER_FOOD_AND_REST: "offerFoodAndRest",
  CHALLENGE_OF_CHAMPIONS: "challengeOfChampions",
  IGNORE: "ignore",
  SLEEP: "sleep", // Dragons sleeping in lair
  OFFER_INFORMATION: "offerInformation",
  BUY_WEAPONS: "buyWeapons",
};

/**
 * Standard reaction table (d6 roll)
 * Format: { roll: [min, max], reaction: ReactionType, params: {...} }
 */
export const StandardReactionTables = {
  vermin_fleeing: [
    { roll: [1, 3], reaction: ReactionTypes.FLEE },
    { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],

  vermin_aggressive: [
    { roll: [1, 2], reaction: ReactionTypes.FLEE },
    { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],

  minion_standard: [
    { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
    { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "10gp each" } },
    { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],

  minion_greedy: [
    { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "5-10gp each" } },
    { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
    { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
  ],

  boss_standard: [
    { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "30-60gp" } },
    { roll: [2, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
    { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
  ],

  boss_quest: [
    { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "50gp" } },
    { roll: [2, 3], reaction: ReactionTypes.QUEST },
    { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],

  dragon_standard: [
    { roll: [1, 1], reaction: ReactionTypes.SLEEP },
    { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "100gp or magic item" } },
    { roll: [4, 4], reaction: ReactionTypes.QUEST },
    { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],

  undead_mindless: [
    { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
  ],

  peaceful_traders: [
    { roll: [1, 1], reaction: ReactionTypes.FLEE },
    { roll: [2, 3], reaction: ReactionTypes.OFFER_FOOD_AND_REST },
    { roll: [4, 5], reaction: ReactionTypes.TRADE },
    { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
  ],
};

/**
 * Monster schema definition
 */
export const MonsterSchema = {
  required: [
    "id",
    "name",
    "category", // vermin, minion, weirdMonster, boss
    "levelFormula", // e.g., "HCL+2", "HCL+3 max 6"
    "lifeFormula", // "1" for minions, "Tier+3" for bosses
    "attacks", // Number of attacks per turn
    "type", // undead, animal, demon, etc.
    "reactionTable", // Array of reaction options
    "treasure", // Treasure modifier (-1, 0, +1, +2, etc.)
  ],

  optionals: [
    "maxLevel", // Maximum level cap
    "minLevel", // Minimum level
    "morale", // Morale modifier (-1, 0, +1)
    "immunities", // ["sleep", "poison", "disease"]
    "resistances", // Special resistances
    "weaknesses", // Special weaknesses
    "special", // Special abilities/rules
    "surprise", // Surprise chance (e.g., "1-in-6", "2-in-6")
    "loot", // Specific loot (e.g., "d6 gems worth 10gp each")
    "attacks_damage", // Custom damage (default 1)
    "regeneration", // Regeneration rules
    "breath", // Dragon breath rules
    "gaze", // Gaze attack rules
    "environment", // Preferred environment
    "race", // goblin, orc, skeleton, etc.
    "never_wandering", // true if never encountered as wandering monster
    "never_final_boss", // true if cannot be final boss
  ],
};

/**
 * Example monster definitions (can be used as templates for expansion)
 */
export const MonsterTemplates = {
  // Vermin
  rats: {
    id: "rats",
    name: "Rats",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "3d6",
    treasure: 0,
    reactionTable: StandardReactionTables.vermin_fleeing,
    special: {
      infection: { chance: "1-in-6", effect: "lose 1 life" },
      foodFor: ["goblin", "troll", "orc", "lizardman", "ogre"],
    },
  },

  // Minions
  goblins: {
    id: "goblins",
    name: "Goblins",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "goblin",
    levelFormula: "HCL+2",
    maxLevel: 6,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+3",
    treasure: -1,
    morale: 0,
    surprise: "1-in-6",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "5gp each" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      vsClass: { class: "dwarf", enemyAttackPenalty: -1 },
    },
  },

  skeletons: {
    id: "skeletons",
    name: "Skeletons",
    category: MonsterCategories.MINION,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+2",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+2",
    treasure: 0,
    morale: "never", // Never test morale
    immunities: ["sleep", "poison", "disease"],
    reactionTable: StandardReactionTables.undead_mindless,
    special: {
      vsWeaponType: { type: "crushing", bonusAgainst: 1 },
      vsWeaponType: { type: "ranged", penaltyAgainst: -1 },
      holyWater: { count: 1, autokill: true },
    },
  },

  orcs: {
    id: "orcs",
    name: "Orcs",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "orc",
    levelFormula: "HCL+3",
    maxLevel: 10,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    morale: 0,
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "10gp each" } },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      fearMagic: {
        check: "every turn a spell kills orcs",
        moraleRoll: true,
        penalty: -1, // If spell reduces to half or less
      },
      noMagicItems: true, // If roll magic item, get d6xd6gp instead
      vsClass: { class: "elf", enemyAttackPenalty: -1 },
    },
  },

  trolls: {
    id: "trolls",
    name: "Trolls",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    maxLevel: 7,
    lifeFormula: "1",
    attacks: 1,
    count: "d3",
    treasure: 0,
    morale: 0,
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      regeneration: {
        condition: "unless killed by fire/acid/magic or hacked to pieces",
        chance: "2-in-6",
        timing: "on next turn after being slain",
      },
      vsClass: { class: "dwarf", alwaysFightToDeath: true },
      vsClass_defense: { class: "halfling", defenseBonus: "L" },
    },
  },

  // Weird Monsters
  minotaur: {
    id: "minotaur",
    name: "Minotaur",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+3",
    attacks: 2,
    treasure: 0,
    morale: 0,
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "60gp" } },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      charge: { firstDefense: -1 },
      vsClass: { class: "halfling", noLuck: true },
    },
  },

  giantSpider: {
    id: "giantSpider",
    name: "Giant Spider",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+2",
    attacks: 2,
    treasure: 2, // 2 rolls
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: { save: "L3", effect: "lose 1 life" },
      web: {
        preventsFleeing: true,
        removedBy: ["fireball", "torch"],
      },
    },
  },

  // Bosses
  mummy: {
    id: "mummy",
    name: "Mummy",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+3",
    attacks: 2,
    treasure: 2,
    morale: "never",
    immunities: ["sleep", "poison"],
    reactionTable: StandardReactionTables.undead_mindless,
    special: {
      onKill: { effect: "victim becomes mummy in 1 turn" },
      flammable: {
        vsFireAttacks: { bonus: 2 },
        vsTorch: { bonus: 2 },
        vsOil: { bonus: 2 },
      },
    },
  },

  ogre: {
    id: "ogre",
    name: "Ogre",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+4",
    attacks: 1,
    attacks_damage: "Tier+1",
    treasure: 0,
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "30gp" } },
      { roll: [2, 3], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      vsClass_defense: { class: "halfling", defenseBonus: "L" },
    },
  },

  medusa: {
    id: "medusa",
    name: "Medusa",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+3",
    attacks: 1,
    treasure: 1,
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "6d6gp" } },
      { roll: [2, 2], reaction: ReactionTypes.QUEST },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      gaze: {
        timing: "beginning of encounter, before ranged",
        save: "L4",
        effect: "petrification",
        saveBonus: { class: "rogue", bonus: "halfL" },
      },
    },
  },

  youngDragon: {
    id: "youngDragon",
    name: "Young Dragon",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.DRAGON,
    levelFormula: "HCL+5",
    lifeFormula: "Tier+4",
    attacks: 2,
    treasure: 3, // 3 rolls at +1
    treasureMod: 1,
    immunities: ["sleep"],
    never_wandering: true,
    reactionTable: StandardReactionTables.dragon_standard,
    special: {
      breath: {
        chance: "1-2 on d6 each turn",
        save: "L6",
        damage: 2,
        saveBonus: { all: "halfL" },
      },
      normalAttack: {
        roll: "3-6 on d6",
        targets: 2,
        damage: 1,
      },
    },
  },

  chaosLord: {
    id: "chaosLord",
    name: "Chaos Lord",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.CHAOS,
    levelFormula: "HCL+5",
    lifeFormula: "Tier+3",
    attacks: 3,
    treasure: 2, // 2 rolls at +1
    treasureMod: 1,
    clueLoot: "2-in-6",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [2, 2], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      power: {
        roll: "d6",
        options: [
          { roll: [1, 3], power: "none" },
          {
            roll: [4, 4],
            power: "evilEye",
            save: "L4 magic",
            effect: "-1 defense until slain",
          },
          {
            roll: [5, 5],
            power: "energyDrain",
            onHit: "save L4 magic or lose 1 level",
            cure: "blessing restores levels",
          },
          {
            roll: [6, 6],
            power: "hellfireBlast",
            timing: "beginning of encounter",
            save: "L6 magic",
            damage: 2,
            saveBonus: { class: "cleric", bonus: "halfL" },
          },
        ],
      },
    },
  },
};

/**
 * Calculate monster level
 * @param {string} formula - Level formula (e.g., "HCL+2")
 * @param {number} hcl - Highest character level
 * @param {number} maxLevel - Maximum level cap (optional)
 * @param {number} minLevel - Minimum level (optional)
 * @returns {number} Calculated level
 */
export function calculateMonsterLevel(formula, hcl, maxLevel = null, minLevel = null) {
  let level = hcl;

  // Parse formula
  const match = formula.match(/HCL([+-]\d+)?/);
  if (match) {
    const modifier = match[1] ? parseInt(match[1]) : 0;
    level = hcl + modifier;
  }

  // Apply caps
  if (maxLevel !== null) {
    level = Math.min(level, maxLevel);
  }
  if (minLevel !== null) {
    level = Math.max(level, minLevel);
  }

  return level;
}

/**
 * Calculate monster life
 * @param {string} formula - Life formula (e.g., "Tier+3")
 * @param {number} tier - Party tier (1-5)
 * @returns {number} Calculated life
 */
export function calculateMonsterLife(formula, tier) {
  if (formula === "1") return 1;

  const match = formula.match(/Tier([+-]\d+)?/);
  if (match) {
    const modifier = match[1] ? parseInt(match[1]) : 0;
    return tier + modifier;
  }

  // Fallback: try to parse as number
  const num = parseInt(formula);
  return isNaN(num) ? 1 : num;
}

/**
 * Roll on reaction table
 * @param {array} reactionTable - Reaction table array
 * @param {number} roll - d6 roll result
 * @returns {object} Reaction result { reaction, params }
 */
export function rollReaction(reactionTable, roll) {
  for (const entry of reactionTable) {
    const [min, max] = entry.roll;
    if (roll >= min && roll <= max) {
      return {
        reaction: entry.reaction,
        params: entry.params || {},
      };
    }
  }

  // Default to fight if no match
  return {
    reaction: ReactionTypes.ALWAYS_FIGHT,
    params: {},
  };
}
