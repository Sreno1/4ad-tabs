/**
 * Monster Data - Complete monster definitions from Four Against Darkness
 * Based on tables.txt and game rules
 */

import {
  MonsterCategories,
  MonsterTypes,
  ReactionTypes,
} from "./monster.js";

/**
 * Complete monster database
 */
export const MONSTERS = {
  // =======================
  // DUNGEON VERMIN
  // =======================
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
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.FLEE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      infection: {
        description: "At end of encounter, wounded PCs roll 1-in-6 chance to lose 1 Life to infection",
      },
      foodFor: ["goblin", "troll", "orc", "lizardman", "ogre"],
    },
  },

  vampireBats: {
    id: "vampireBats",
    name: "Vampire Bats",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 3,
    lifeFormula: "1",
    attacks: 1,
    count: "3d6",
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.FLEE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      shrieking: {
        description: "Spellcasting rolls at -1 due to distracting shrieking",
      },
    },
  },

  goblinSwarmlings: {
    id: "goblinSwarmlings",
    name: "Goblin Swarmlings",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.HUMANOID,
    race: "goblin",
    levelFormula: "HCL+1",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: -1,
    morale: -1,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [4, 4], reaction: ReactionTypes.BRIBE, params: { amount: "5gp each" } },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      vsClass: { class: "dwarf", enemyAttackBonus: 1 },
    },
  },

  giantCentipedes: {
    id: "giantCentipedes",
    name: "Giant Centipedes",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+1",
    maxLevel: 3,
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: {
        description: "Living PCs hit must Save vs. L2 poison or lose 1 additional Life",
      },
    },
  },

  vampireFrogs: {
    id: "vampireFrogs",
    name: "Vampire Frogs",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+3",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: -1,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [4, 4], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
  },

  skeletalRats: {
    id: "skeletalRats",
    name: "Skeletal Rats",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+2",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 0,
    environment: "dungeon",
    immunities: ["sleep", "disease", "poison"],
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      unaffectedByRanged: {
        description: "Unaffected by ranged weapons except firearms",
      },
      crushingWeaponBonus: {
        description: "Crushing weapons attack at +1",
      },
      holyWater: {
        description: "Vial of holy water automatically destroys 2 skeletal rats",
      },
    },
  },

  // =======================
  // DUNGEON MINIONS
  // =======================
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
    morale: "never",
    environment: "dungeon",
    immunities: ["sleep", "poison", "disease"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      crushingBonus: {
        description: "Crushing weapons attack at +1",
      },
      rangedPenalty: {
        description: "Arrows/crossbow bolts at -1",
      },
      holyWater: {
        description: "Vial automatically destroys 1 skeleton",
      },
    },
    vulnerableTo: 'crushing',
  },

  zombies: {
    id: "zombies",
    name: "Zombies",
    category: MonsterCategories.MINION,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+2",
    maxLevel: 6,
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    morale: "never",
    environment: "dungeon",
    immunities: ["sleep", "poison", "disease"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      rangedPenalty: {
        description: "Arrows/crossbow bolts at -1",
      },
      holyWater: {
        description: "Vial automatically destroys 1 zombie",
      },
    },
  },

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
    environment: "dungeon",
    surprise: "1-in-6",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "5gp each" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      vsClass: { class: "dwarf", enemyAttackBonus: 1 },
      surpriseReaction: {
        description: "Roll on Reactions even if surprising party or met as Wandering Monsters",
      },
    },
  },

  hobgoblins: {
    id: "hobgoblins",
    name: "Hobgoblins",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "goblin",
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 1,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "10gp each" } },
      { roll: [4, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
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
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "10gp each" } },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      fearMagic: {
        description: "Must roll Morale every turn 1+ orcs defeated by spell. -1 if spell reduces to half or less",
      },
      noMagicItems: {
        description: "Never have magic items. If rolled, get d6xd6gp instead",
      },
      vsClass: { class: "elf", enemyAttackBonus: 1 },
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
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      regeneration: {
        description: "2-in-6 chance to return to life next turn unless killed by magic/fire/acid or hacked to pieces with slashing weapon",
      },
      vsDwarf: {
        description: "Always fight to death if dwarves in party",
      },
      vsHalfling: {
        description: "Halflings add +L to Defense rolls",
      },
    },
  },

  mushroomMen: {
    id: "mushroomMen",
    name: "Mushroom Men",
    category: MonsterCategories.MINION,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+2",
    maxLevel: 10,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "6gp each" } },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: {
        description: "Living PCs hit must Save vs. L3 poison or lose 1 additional Life. Halflings Save at +L. Mushroom PCs immune",
      },
    },
  },

  // =======================
  // DUNGEON WEIRD MONSTERS
  // =======================
  minotaur: {
    id: "minotaur",
    name: "Minotaur",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+3",
    attacks: 2,
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "60gp" } },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      charge: {
        description: "First Defense roll vs. minotaur attack is at -1",
      },
      vsHalfling: {
        description: "Halflings cannot use Luck in minotaur encounters",
      },
    },
  },

  ironEater: {
    id: "ironEater",
    name: "Iron Eater",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.ARTIFICIAL,
    levelFormula: "HCL+2",
    lifeFormula: "Tier+3",
    attacks: 3,
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "d6gp (cannot use Fools' Gold)" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      destroysMetal: {
        description: "Attacks inflict no damage but destroy metal items: armor, shields, main weapon, then 3d6gp. Light armor/shield give normal Defense. Heavy armor doesn't unless non-metallic",
      },
    },
  },

  chimera: {
    id: "chimera",
    name: "Chimera",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.CHAOS,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+5",
    attacks: 3,
    treasure: 0,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "50gp" } },
      { roll: [2, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      breath: {
        description: "2-in-6 chance each turn to breathe fire instead of 3 attacks. All PCs Save vs. L4 fire or lose 1 Life",
      },
    },
  },

  catoblepas: {
    id: "catoblepas",
    name: "Catoblepas",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+3",
    attacks: 1,
    treasure: 1,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      gaze: {
        description: "At beginning of encounter, all PCs must Save vs. L4 gaze or lose 1 Life",
      },
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
    treasure: 2,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: {
        description: "Living PCs hit must Save vs. L3 poison or lose 1 Life",
      },
      web: {
        description: "PCs may not flee until Fireball cast or torch spent to destroy web",
      },
    },
  },

  invisibleGremlins: {
    id: "invisibleGremlins",
    name: "Invisible Gremlins",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL",
    lifeFormula: "1",
    attacks: 0,
    treasure: 0,
    environment: "dungeon",
    never_final_boss: true,
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.IGNORE },
    ],
    special: {
      event: {
        description: "Not a Foe - an event. Steal d6+3 items in order: magic items, scrolls, potions, weapons, gems, gold (10gp at a time). If steal ALL equipment, leave thank you message (counts as 1 Clue)",
      },
    },
  },

  // =======================
  // DUNGEON BOSSES
  // =======================
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
    environment: "dungeon",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      curse: {
        description: "PC slain becomes mummy one turn later and attacks party",
      },
      flammable: {
        description: "Fire-based attacks and torches at +2, flask of oil adds another +2",
      },
    },
  },

  orcBrute: {
    id: "orcBrute",
    name: "Orc Brute",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    race: "orc",
    levelFormula: "HCL+4",
    lifeFormula: "Tier+4",
    attacks: 2,
    treasure: 1,
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "50gp" } },
      { roll: [2, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      vsElf: {
        description: "Elves attack at +1",
      },
      noMagicItems: {
        description: "Never has magic items. Count as d6xd6gp instead",
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
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "30gp" } },
      { roll: [2, 3], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      vsHalfling: {
        description: "Halflings add +L to Defense rolls",
      },
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
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BRIBE, params: { amount: "6d6gp" } },
      { roll: [2, 2], reaction: ReactionTypes.QUEST },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      gaze: {
        description: "At beginning of encounter before ranged, all PCs Save vs. L4 gaze or turn to stone. Rogues add +halfL. Blessing restores 1 PC",
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
    treasure: 2,
    treasureMod: 1,
    clueLoot: "2-in-6",
    environment: "dungeon",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE_IF_OUTNUMBERED },
      { roll: [2, 2], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      power: {
        description: "Roll d6: 1-3 no power, 4 evil eye (all PCs Save vs. L4 magic or -1 Defense until slain), 5 energy drain (PCs hit Save vs. L4 magic or lose 1 L, Blessing restores), 6 hellfire blast (beginning of encounter, all PCs Save vs. L6 magic or lose 2 Life, clerics Save at +halfL)",
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
    treasure: 3,
    treasureMod: 1,
    environment: "dungeon",
    never_wandering: true,
    immunities: ["sleep"],
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.SLEEP },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "all party gp (min 100gp) or 1 magic item" } },
      { roll: [4, 4], reaction: ReactionTypes.QUEST },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      breath: {
        description: "Each turn roll d6. On 1-2 breathes fire (all PCs Save vs. L6 breath or lose 2 Life, all add +halfL). On 3-6 attacks 2 random targets (1 damage)",
      },
      sleepReaction: {
        description: "If Sleep rolled, all PCs have +2 to their first Attack roll",
      },
    },
  },

  // =======================
  // CAVERNS VERMIN
  // =======================
  echoBats: {
    id: "echoBats",
    name: "Echo Bats",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+1",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 0,
    morale: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 2], reaction: ReactionTypes.IGNORE },
      { roll: [3, 5], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      echo: {
        description: "In tiles with Echo rule, increase L by 1",
      },
    },
  },

  mudCentipede: {
    id: "mudCentipede",
    name: "Mud Centipede",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6+1",
    treasure: 0,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.IGNORE },
    ],
    special: {
      poolDefense: {
        description: "Always ignore PCs unless in tile with water pool and PCs inspect pool - then always Fight to protect eggs",
      },
    },
  },

  vengeanceCockroaches: {
    id: "vengeanceCockroaches",
    name: "Vengeance Cockroaches",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+1",
    maxLevel: 3,
    lifeFormula: "1",
    attacks: 1,
    count: "3d6",
    treasure: 0,
    environment: "caverns",
    immunities: ["sleep"],
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 3], reaction: ReactionTypes.BRIBE, params: { amount: "4 Food rations" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      vengeance: {
        description: "If some flee, note how many escape. Next encounter during same adventure, add escaped count to new encounter",
      },
    },
  },

  stalactomimics: {
    id: "stalactomimics",
    name: "Stalactomimics",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ELEMENTAL,
    levelFormula: "HCL+2",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    environment: "caverns",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.IGNORE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      surprise: {
        description: "Always surprise PCs. Each attacks only once",
      },
    },
  },

  screamingToads: {
    id: "screamingToads",
    name: "Screaming Toads",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+2",
    treasure: 0,
    morale: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 3], reaction: ReactionTypes.BRIBE, params: { amount: "4 Food" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      croaking: {
        description: "-1 to all spellcasting rolls. If not slain within single turn, 2-in-6 chance Wandering Monsters arrive at end of encounter",
      },
    },
  },

  redCaveSpiders: {
    id: "redCaveSpiders",
    name: "Red Cave Spiders",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+2",
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    morale: -1,
    environment: "caverns",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 4], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      paralysis: {
        description: "Living PCs taking 2+ damage have paralyzed limb (d6: 1-3 arm, 4-6 leg). Paralyzed arm cannot use shield/ranged/two-handed weapon. Paralyzed leg cannot flee. Healing or Blessing removes",
      },
      foodFor: ["ogre", "troll", "goblin"],
    },
  },

  // =======================
  // CAVERNS MINIONS
  // =======================
  morlocks: {
    id: "morlocks",
    name: "Morlocks",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    morale: -1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "15gp or 5 Food rations for whole group" } },
      { roll: [3, 3], reaction: ReactionTypes.OFFER_INFORMATION },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      dislikeLight: {
        description: "PC with lantern/torch or other light source has +2 to Defense rolls",
      },
    },
  },

  caveGoblins: {
    id: "caveGoblins",
    name: "Cave Goblins",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "goblin",
    levelFormula: "HCL+2",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: -1,
    morale: -1,
    environment: "caverns",
    surprise: "2-in-6",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "5gp per goblin" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poorWeapons: {
        description: "Armed with poor quality clubs. PCs in Heavy Armor have additional +1 to Defense",
      },
    },
  },

  caveSkeletons: {
    id: "caveSkeletons",
    name: "Cave Skeletons",
    category: MonsterCategories.MINION,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+2",
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 0,
    morale: "never",
    environment: "caverns",
    surprise: "1-in-6",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      camouflage: {
        description: "Mud-covered. 1-in-6 chance of surprise",
      },
      pickaxes: {
        description: "Armed with pickaxes",
      },
      crushingBonus: {
        description: "Crushing weapons attack at +1",
      },
      holyWater: {
        description: "Vial automatically destroys 2 skeletons",
      },
    },
    vulnerableTo: 'crushing',
  },

  ratMenOfTheDeep: {
    id: "ratMenOfTheDeep",
    name: "Rat Men of the Deep",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+2",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.BRIBE, params: { amount: "1 Ration or 5gp or 1 Mushroom per rat man" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      crossbows: {
        description: "Before melee, each performs HCL+3 ranged attack with crossbow",
      },
      flails: {
        description: "In melee use flails. PCs ignore shield Defense bonuses",
      },
    },
  },

  caveOrcs: {
    id: "caveOrcs",
    name: "Cave Orcs",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "orc",
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.BUY_WEAPONS },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      charge: {
        description: "First turn of melee, PCs have -1 to Defense rolls",
      },
      poorClubs: {
        description: "Starting turn 2, all PCs with Heavy Armor have additional +1 to Defense",
      },
      buyWeapons: {
        description: "Pay full price for any weapon above Cheap quality, but will not buy if dwarves or elves in party",
      },
    },
  },

  cavemen: {
    id: "cavemen",
    name: "Cavemen",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+2",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+3",
    treasure: 0,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "1 Food Ration per caveman or 1 single gem of any value" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      twoHandedClubs: {
        description: "Armed with two-handed clubs",
      },
      fearFire: {
        description: "Must roll Morale if one killed by fire-based attack. Roll once per encounter, not per attack",
      },
    },
  },

  // =======================
  // CAVERNS WEIRD MONSTERS
  // =======================
  drillworm: {
    id: "drillworm",
    name: "Drillworm",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+4",
    lifeFormula: "HCL+3",
    attacks: 1,
    attacks_damage: "Tier",
    treasure: 2,
    environment: "caverns",
    immunities: ["sleep"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      entrance: {
        description: "Roll d6: 1-3 enters from opening in tile, 4-6 appears from underground with 3-in-6 surprise",
      },
      destroyItems: {
        description: "PC rolling 1 on Defense loses one: shield, weapon, lantern, scroll, potion, all Food. Non-magical destroyed. Magic retrieved at end",
      },
    },
  },

  cavernWraith: {
    id: "cavernWraith",
    name: "Cavern Wraith",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+3",
    lifeFormula: "HCL+2",
    minLevel: 4,
    attacks: 1,
    treasure: 2,
    morale: "never",
    environment: "caverns",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.IGNORE },
      { roll: [2, 3], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      lifeLeech: {
        description: "If at end of PCs' turn it was not hit, all PCs automatically lose 1 Life",
      },
      holyWater: {
        description: "Takes 2 damage from holy water",
      },
    },
  },

  cavernSludge: {
    id: "cavernSludge",
    name: "Cavern Sludge",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.SLIME,
    levelFormula: "HCL+2",
    lifeFormula: "Tier+3",
    attacks: "1 per PC",
    treasure: 1,
    morale: "never",
    environment: "caverns",
    immunities: ["sleep", "poison"],
    surprise: "4-in-6",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      multiAttack: {
        description: "All characters including animals and hirelings receive 1 attack per turn",
      },
      lightning: {
        description: "If struck by Lightning, loses 2L in addition to damage. If brought to L0, destroyed",
      },
    },
  },

  minosaur: {
    id: "minosaur",
    name: "Minosaur",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "HCL+4",
    attacks: 3,
    treasure: 0,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      twoHandedWeapon: {
        description: "Armed with two-handed weapon",
      },
      levelIncrease: {
        description: "L increases by 1 on first turn. Does NOT apply if hit by ranged attacks prior to melee",
      },
      knockdown: {
        description: "PC rolling 1 on Defense is knocked down, must use 1 turn to get back up",
      },
    },
  },

  cornucopiaOfChaos: {
    id: "cornucopiaOfChaos",
    name: "Cornucopia of Chaos",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.CHAOS,
    levelFormula: "HCL+6",
    lifeFormula: "Tier+2",
    attacks: 0,
    treasure: 2,
    morale: "never",
    environment: "caverns",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      generatesGremlins: {
        description: "Does not attack. Generates d6 Azure Gremlins (L2 Vermin, never test Morale, no Treasure) per turn. Starts with d6+1 gremlins",
      },
      cannotAttackIfGremlins: {
        description: "Cannot attack Cornucopia if gremlins in play, but can hit with spells",
      },
      gremmlinLoot: {
        description: "If Cornucopia destroyed, all surviving gremlins turn into lumps of coal worth 1gp each",
      },
    },
  },

  caveDragon: {
    id: "caveDragon",
    name: "Cave Dragon",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.DRAGON,
    levelFormula: "HCL+5",
    lifeFormula: "HCL+4",
    attacks: 2,
    treasure: 3,
    morale: -1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.QUEST },
      { roll: [4, 4], reaction: ReactionTypes.BRIBE, params: { amount: "50gp gem" } },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      tarSpit: {
        description: "Begins combat by spitting tar. All PCs roll Defense vs. HCL+3 or be covered in tar. PCs rolling 1 get tar in eyes, -1 to all Attack/Defense/Saves until spend 1 turn to wipe face",
      },
      breathFire: {
        description: "On other turns, performs 2 claw attacks (1 damage each) and breathes fire. All Save vs. HCL+3 Fire or lose 1 Life. All Save at +L. PCs covered in tar add no bonus. Halflings reroll failed Save",
      },
      waterJet: {
        description: "Water Jet spell removes tar from PC",
      },
    },
  },

  // =======================
  // CAVERNS BOSSES
  // =======================
  manataur: {
    id: "manataur",
    name: "Manataur",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.CHAOS,
    levelFormula: "HCL+4",
    lifeFormula: "HCL+3",
    attacks: 3,
    treasure: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 4], reaction: ReactionTypes.BRIBE, params: { amount: "2 scrolls or potions" } },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      twoHandedAxe: {
        description: "Armed with two-handed axe",
      },
      feedsOnMagic: {
        description: "Every spell/prayer cast in its presence, including from scrolls or items, adds +1 to its Life",
      },
    },
  },

  cavemanChampion: {
    id: "cavemanChampion",
    name: "Caveman Champion",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "HCL+3",
    attacks: 4,
    treasure: 0,
    morale: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.CHALLENGE_OF_CHAMPIONS },
      { roll: [3, 3], reaction: ReactionTypes.BRIBE, params: { amount: "50gp gem or 2-handed weapon" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      twoHandedClub: {
        description: "Armed with two-handed club",
      },
    },
  },

  hoaryOgre: {
    id: "hoaryOgre",
    name: "Hoary Ogre of the Caverns",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "HCL+3",
    attacks: 4,
    treasure: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      battleCry: {
        description: "At beginning, utters battle cry. All PCs Save vs. L4 Fear or lose ability to explode Attack rolls until end of encounter. Paladins immune",
      },
      vsHalfling: {
        description: "Halflings add +L to Defense rolls",
      },
    },
  },

  cavernWerebear: {
    id: "cavernWerebear",
    name: "Cavern Werebear",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.WERE,
    levelFormula: "HCL+3",
    lifeFormula: "HCL+4",
    attacks: 1,
    treasure: 0,
    morale: 1,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 5], reaction: ReactionTypes.ALWAYS_FIGHT },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      regeneration: {
        description: "Regenerates 1 Life every 3 turns (on 3rd, 6th, 9th, etc.)",
      },
      silverWeapons: {
        description: "Silver weapons hit with +Tier bonus",
      },
      notContagious: {
        description: "Bite is not contagious",
      },
    },
  },

  landSiren: {
    id: "landSiren",
    name: "Land Siren",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+5",
    lifeFormula: "HCL",
    minLevel: 3,
    attacks: "1 per sleeping PC",
    treasure: 2,
    environment: "caverns",
    reactionTable: [
      { roll: [1, 4], reaction: ReactionTypes.QUEST },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      song: {
        description: "At start, all living PCs Save vs. HCL+2 magic or fall asleep. All add +halfL. Halflings reroll failed Save. Siren gains 1 Attack per sleeping PC",
      },
      wakeAllies: {
        description: "Awake PCs can use 1 turn to wake sleeping companion. Revived PCs fight at -1 to Attack until end of encounter",
      },
      sleepingDefense: {
        description: "Sleeping PCs automatically hit if attacked (no Defense roll)",
      },
      loot: {
        description: "Glands can be sold to alchemists for d6x5gp",
      },
    },
  },

  fireBear: {
    id: "fireBear",
    name: "Fire Bear",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+2",
    lifeFormula: "HCL+4",
    attacks: 2,
    treasure: 2,
    morale: "never",
    environment: "caverns",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      sixLegged: {
        description: "Six-legged bear",
      },
      fireBreath: {
        description: "Begins combat breathing fire on first turn. All PCs Defense roll vs. HCL+3 or lose 2 Life. Breathes again after any turn a PC uses fire-based attack",
      },
      clawAttacks: {
        description: "In other turns, performs 2 Attacks with claws (1 damage each)",
      },
    },
  },

  // =======================
  // FUNGAL GROTTOES VERMIN
  // =======================
  sporeMites: {
    id: "sporeMites",
    name: "Spore Mites",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 3,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 0,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.FLEE },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      coughingFits: {
        description: "PCs hit must Save vs. L2 poison or suffer coughing fits: -1 to Attack rolls (non-cumulative) until end of encounter",
      },
    },
  },

  glowmaggots: {
    id: "glowmaggots",
    name: "Glowmaggots",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 2,
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.IGNORE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      glow: {
        description: "Illuminate grotto. No lantern/torch needed in tile they occupy",
      },
      edible: {
        description: "Each eaten counts as 1 Food but requires Save vs. L1 poison (lose 1 Life on failure)",
      },
      lightSource: {
        description: "Slain maggots can be used as light source for 30 minutes/3 rooms, then glow fades",
      },
    },
  },

  fungusLeeches: {
    id: "fungusLeeches",
    name: "Fungus Leeches",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+1",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 0,
    environment: "fungalGrottoes",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.FLEE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: {
        description: "PCs hit must Save vs. L4 poison or lose 1 additional Life. Halflings and barbarians Save at +L",
      },
      salt: {
        description: "Bag of salt (2gp in town) thrown at them automatically kills 2 leeches",
      },
    },
  },

  mycoGnats: {
    id: "mycoGnats",
    name: "Myco-Gnats",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "3d6",
    treasure: 0,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 4], reaction: ReactionTypes.FLEE },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      distraction: {
        description: "-1 to all spellcasting rolls and ranged attacks",
      },
      fireball: {
        description: "Fireball spell kills all myco-gnats",
      },
    },
  },

  sporeToads: {
    id: "sporeToads",
    name: "Spore Toads",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+2",
    maxLevel: 4,
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: -1,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.FLEE },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      spores: {
        description: "Each turn, 1-in-6 chance one belches hallucinogenic spores. All PCs Save vs. L2 magic or be at -1 Defense until end of encounter",
      },
    },
  },

  boneworms: {
    id: "boneworms",
    name: "Boneworms",
    category: MonsterCategories.VERMIN,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL+2",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6",
    treasure: 1,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      noResurrection: {
        description: "PC slain by boneworms cannot be resurrected",
      },
      holyWater: {
        description: "Not undead but connected with necromantic energies. If vial of holy water thrown, take no damage but must roll Morale",
      },
    },
  },

  // =======================
  // FUNGAL GROTTOES MINIONS
  // =======================
  sporeMen: {
    id: "sporeMen",
    name: "Spore Men",
    category: MonsterCategories.MINION,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+2",
    maxLevel: 8,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+2",
    treasure: -1,
    environment: "fungalGrottoes",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.BRIBE, params: { amount: "5gp each" } },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      poison: {
        description: "Living PCs hit must Save vs. L3 poison or lose 1 Life. Mushroom PCs immune. Halflings reroll failed Saves",
      },
    },
  },

  halflingMushroomPickers: {
    id: "halflingMushroomPickers",
    name: "Halfling Mushroom Pickers",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    race: "halfling",
    levelFormula: "HCL+1",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: "their goods",
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.OFFER_FOOD_AND_REST },
      { roll: [4, 5], reaction: ReactionTypes.TRADE },
      { roll: [6, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      weapons: {
        description: "Armed with knives and slings",
      },
      trade: {
        description: "Offer d6 random rare mushrooms and 2d6 Food rations at standard prices, -10% if party includes halflings",
      },
    },
  },

  moldspawn: {
    id: "moldspawn",
    name: "Moldspawn",
    category: MonsterCategories.MINION,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    environment: "fungalGrottoes",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.BRIBE, params: { amount: "1 Food ration each" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      disease: {
        description: "Dripping, half-decayed humanoids coated in green mold. PCs hit Save vs. L2 disease or lose 1 additional Life at end of encounter (1 Life per encounter, not per hit)",
      },
    },
  },

  myceliarchs: {
    id: "myceliarchs",
    name: "Myceliarchs",
    category: MonsterCategories.MINION,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+3",
    lifeFormula: "1",
    attacks: 1,
    count: "d6+1",
    treasure: 1,
    morale: 1,
    environment: "fungalGrottoes",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 4], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [5, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      sleepSpores: {
        description: "At start of combat, one casts sleep-spore cloud. All PCs Save vs. L3 magic or miss next turn",
      },
    },
  },

  caveLocusts: {
    id: "caveLocusts",
    name: "Cave Locusts",
    category: MonsterCategories.MINION,
    type: MonsterTypes.ANIMAL,
    levelFormula: "HCL",
    maxLevel: 5,
    lifeFormula: "1",
    attacks: 1,
    count: "2d6+2",
    treasure: 0,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 2], reaction: ReactionTypes.IGNORE },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      armor: {
        description: "PCs wearing any Armor double its Defense bonus (light armor +2, heavy armor +4)",
      },
      consumeFood: {
        description: "At end of combat, party loses d6 Food rations. Distribute loss among PCs",
      },
    },
  },

  toadstoolKnights: {
    id: "toadstoolKnights",
    name: "Toadstool Knights",
    category: MonsterCategories.MINION,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+4",
    lifeFormula: "1",
    attacks: 1,
    count: "d6",
    treasure: 0,
    morale: 1,
    environment: "fungalGrottoes",
    immunities: ["poison"],
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.IGNORE },
      { roll: [2, 2], reaction: ReactionTypes.BRIBE, params: { amount: "20gp each" } },
      { roll: [3, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      shields: {
        description: "Wield shield-like caps made of dried fungi. First hit against each breaks shield but knight survives",
      },
      warpWood: {
        description: "Warp Wood spell destroys all wooden caps",
      },
    },
  },

  // =======================
  // FUNGAL GROTTOES WEIRD MONSTERS
  // =======================
  shroomColossus: {
    id: "shroomColossus",
    name: "Shroom Colossus",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+5",
    lifeFormula: "Tier+5",
    attacks: 3,
    attacks_damage: "Tier",
    treasure: 0,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      noCorridor: {
        description: "May not be encountered in corridors (reroll if happens)",
      },
      digestion: {
        description: "PCs reduced to 0 Life are digested into spores and may not be resurrected",
      },
    },
  },

  sporeSwarm: {
    id: "sporeSwarm",
    name: "Spore Swarm",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+3",
    attacks: 1,
    treasure: 0,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      fireWeakness: {
        description: "Fire-based attacks add +Tier bonus",
      },
    },
  },

  mycoMimic: {
    id: "mycoMimic",
    name: "Myco-Mimic",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+2",
    attacks: "d3+1",
    treasure: 2,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      disguise: {
        description: "Appears as innocuous mushroom or mushroom-covered treasure chest",
      },
      surprise: {
        description: "Gains automatic surprise",
      },
      paralysis: {
        description: "PCs hit Save vs. L3 poison or be paralyzed for 1 turn. Halflings reroll failed Saves",
      },
    },
  },

  hallucinogenicHorror: {
    id: "hallucinogenicHorror",
    name: "Hallucinogenic Horror",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+4",
    attacks: 1,
    treasure: 1,
    morale: "never",
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      confusion: {
        description: "Each turn, 1 random PC must Save vs. L3 magic or attack an ally instead of the Foe",
      },
    },
  },

  fungusInfectedHydra: {
    id: "fungusInfectedHydra",
    name: "Fungus-infected Hydra",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.DRAGON,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+4",
    attacks: "Tier+4",
    treasure: 2,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      regeneration: {
        description: "Loses 1 attack (1 head) per Life point lost. Each head regrows in 2 turns. If fire-based attack used, heads will not regrow. Always performs minimum 1 Attack per turn",
      },
    },
  },

  sporePhantom: {
    id: "sporePhantom",
    name: "Spore Phantom",
    category: MonsterCategories.WEIRD_MONSTER,
    type: MonsterTypes.UNDEAD,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+3",
    attacks: 2,
    treasure: 1,
    morale: "never",
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      holyWater: {
        description: "Takes 2 damage from vial of holy water",
      },
      lungRot: {
        description: "PCs hit Save vs. L3 magic or lose 1 Life at end of turn as spores rot lungs",
      },
      vsDruid: {
        description: "Druids attack at +L",
      },
    },
  },

  // =======================
  // FUNGAL GROTTOES BOSSES
  // =======================
  mycoTyrant: {
    id: "mycoTyrant",
    name: "Myco-Tyrant",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+3",
    attacks: 3,
    treasure: 1,
    morale: 1,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      spores: {
        description: "At beginning of combat, all PCs Save vs. L4 poison or lose 1 Life. Mushroom PCs and halflings immune",
      },
    },
  },

  fungusHag: {
    id: "fungusHag",
    name: "Fungus Hag",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+3",
    lifeFormula: "Tier+2",
    attacks: 2,
    attacks_damage: "Tier",
    treasure: 1,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.BLOOD_OFFERING },
      { roll: [2, 3], reaction: ReactionTypes.QUEST },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      curse: {
        description: "PCs hit by claws take Tier damage and Save vs. L3 magic or suffer non-cumulative -1 to Attack rolls until end of combat",
      },
    },
  },

  sporeLord: {
    id: "sporeLord",
    name: "Spore Lord",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+5",
    lifeFormula: "Tier+3",
    attacks: 3,
    treasure: 2,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 1], reaction: ReactionTypes.FLEE },
      { roll: [2, 3], reaction: ReactionTypes.BRIBE, params: { amount: "100gp" } },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      sporeStorm: {
        description: "On first turn, instead of attacking releases spore storm. All PCs Save vs. L5 poison (all add +halfL, halflings reroll failed Save) or be blinded (-1 Attack/Defense) until end of encounter",
      },
    },
  },

  rotOgre: {
    id: "rotOgre",
    name: "Rot Ogre",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.HUMANOID,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+4",
    attacks: 2,
    treasure: 2,
    environment: "fungalGrottoes",
    reactionTable: [
      { roll: [1, 6], reaction: ReactionTypes.ALWAYS_FIGHT_TO_DEATH },
    ],
    special: {
      decay: {
        description: "Fists spread decay. Each hit requires Save vs. L3 disease. Halflings and barbarians add +L. PCs failing Save lose 1 Life at end of combat",
      },
      vsHalfling: {
        description: "Halflings gain +L Defense",
      },
    },
  },

  caplordKnight: {
    id: "caplordKnight",
    name: "Caplord Knight",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.MUSHROOM,
    levelFormula: "HCL+4",
    lifeFormula: "Tier+4",
    attacks: 4,
    treasure: "armor and weapon",
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.CHALLENGE_OF_CHAMPIONS },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      armor: {
        description: "Wears armor of hardened fungi. Any non-magical attack has 2-in-6 chance of bouncing off armor",
      },
      sporeblade: {
        description: "Wields sporeblade (non-metallic slashing weapon from hardened mushroom cap). PCs hit Save vs. L3 poison or lose 1 Life. Halflings reroll failed Saves",
      },
      warpWood: {
        description: "Warp Wood spell destroys armor AND sporeblade (reduce Foe's L by 2)",
      },
    },
  },

  fungalDragon: {
    id: "fungalDragon",
    name: "Fungal Dragon",
    category: MonsterCategories.BOSS,
    type: MonsterTypes.DRAGON,
    levelFormula: "HCL+5",
    lifeFormula: "Tier+3",
    attacks: 4,
    treasure: 2,
    environment: "fungalGrottoes",
    immunities: ["sleep", "poison"],
    reactionTable: [
      { roll: [1, 3], reaction: ReactionTypes.QUEST },
      { roll: [4, 6], reaction: ReactionTypes.ALWAYS_FIGHT },
    ],
    special: {
      sporeBreath: {
        description: "Each turn roll d6: on 1-2, instead of attacking exhales spore breath. All PCs Save vs. L5 poison or lose 1 Life. All add +halfL, halflings reroll failed Saves",
      },
    },
  },
};

/**
 * Get a monster by ID
 * @param {string} id - Monster ID
 * @returns {object|null} Monster data or null if not found
 */
export function getMonster(id) {
  return MONSTERS[id] || null;
}

/**
 * Get all monsters by category
 * @param {string} category - Monster category (vermin, minion, weirdMonster, boss)
 * @param {string} environment - Optional environment filter (dungeon, caverns, fungalGrottoes)
 * @returns {array} Array of monster objects
 */
export function getMonstersByCategory(category, environment = null) {
  const results = [];
  for (const [id, monster] of Object.entries(MONSTERS)) {
    if (monster.category === category) {
      if (!environment || monster.environment === environment) {
        results.push(monster);
      }
    }
  }
  return results;
}

/**
 * Get all monsters by environment
 * @param {string} environment - Environment (dungeon, caverns, fungalGrottoes)
 * @returns {array} Array of monster objects
 */
export function getMonstersByEnvironment(environment) {
  const results = [];
  for (const [id, monster] of Object.entries(MONSTERS)) {
    if (monster.environment === environment) {
      results.push(monster);
    }
  }
  return results;
}

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
 * Calculate monster HP/Life
 * @param {string} formula - Life formula (e.g., "1", "Tier+3", "HCL+2")
 * @param {number} tier - Party tier (1-5)
 * @param {number} hcl - Highest character level (for HCL-based formulas)
 * @returns {number} Calculated life
 */
export function calculateMonsterHP(formula, tier, hcl = null) {
  // Simple numeric value
  if (formula === "1") return 1;
  const num = parseInt(formula);
  if (!isNaN(num)) return num;

  // Tier-based formula
  const tierMatch = formula.match(/Tier([+-]\d+)?/);
  if (tierMatch) {
    const modifier = tierMatch[1] ? parseInt(tierMatch[1]) : 0;
    return tier + modifier;
  }

  // HCL-based formula
  const hclMatch = formula.match(/HCL([+-]\d+)?/);
  if (hclMatch && hcl !== null) {
    const modifier = hclMatch[1] ? parseInt(hclMatch[1]) : 0;
    return hcl + modifier;
  }

  // Fallback
  return 1;
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

/**
 * Get all monster IDs
 * @returns {array} Array of monster IDs
 */
export function getAllMonsterIds() {
  return Object.keys(MONSTERS);
}

/**
 * Get monster count
 * @returns {number} Total number of monsters in database
 */
export function getMonsterCount() {
  return Object.keys(MONSTERS).length;
}
