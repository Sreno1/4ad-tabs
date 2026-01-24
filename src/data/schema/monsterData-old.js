/**
 * Monster Data - Complete monster definitions using the Monster Schema
 * All monsters from Four Against Darkness organized by environment and type
 */

import { MonsterSchema } from './monster.js';

/**
 * Monster Special Abilities Database
 */
export const MONSTER_ABILITIES = {
  regenerate: { name: 'Regenerate', description: 'Recovers 1 HP at start of each round', trigger: 'round_start', effect: 'heal', value: 1 },
  breath: { name: 'Breath Weapon', description: 'Attacks all heroes at once', trigger: 'attack', effect: 'aoe_attack', damage: 1 },
  boss: { name: 'Boss Monster', description: 'Attacks twice per round', trigger: 'attack', effect: 'multi_attack', attacks: 2 },
  poison: { name: 'Poison', description: 'On hit, target saves or takes 1 additional damage', trigger: 'on_hit', effect: 'apply_poison', saveThreshold: 4 },
  undead: { name: 'Undead', description: 'Immune to sleep, clerics deal +L damage', trigger: 'passive', effect: 'immunity', immuneTo: ['sleep'] },
  swarm: { name: 'Swarm', description: 'Takes half damage from single-target attacks', trigger: 'on_damage', effect: 'damage_resist', resist: 0.5 },
  flying: { name: 'Flying', description: 'Can only be hit by ranged attacks or spells until grounded', trigger: 'passive', effect: 'evasion', requiresRanged: true },
  magic_resist: { name: 'Magic Resistance', description: 'Resist spells (MR 5)', trigger: 'on_spell_damage', effect: 'spell_resist', mr: 5 },
  fear: { name: 'Fearsome', description: 'Heroes must pass morale check or suffer -1 to attacks', trigger: 'encounter_start', effect: 'morale_check', penalty: -1 },
  petrify: { name: 'Petrifying Gaze', description: 'All must save vs L4 or be turned to stone', trigger: 'encounter_start', effect: 'petrify', saveThreshold: 4 },
  infection: { name: 'Infection', description: 'Wounded PCs have 1-in-6 chance of losing 1 Life to infection', trigger: 'on_hit', effect: 'infection' },
  spellDisrupt: { name: 'Spell Disruption', description: 'Spellcasting rolls at -1', trigger: 'passive', effect: 'spell_penalty', penalty: -1 },
  paralysis: { name: 'Paralysis', description: 'On hit, target may be paralyzed', trigger: 'on_hit', effect: 'paralysis' },
  surprise: { name: 'Surprise', description: 'Has chance to surprise the party', trigger: 'encounter_start', effect: 'surprise' },
  sleepAura: { name: 'Sleep Aura', description: 'Can put PCs to sleep at start of combat', trigger: 'encounter_start', effect: 'sleep_aura' },
  fireBreath: { name: 'Fire Breath', description: 'Breathes fire dealing damage to all PCs', trigger: 'attack', effect: 'fire_breath' },
  metalEater: { name: 'Metal Eater', description: 'Attacks destroy metal items instead of dealing damage', trigger: 'on_hit', effect: 'destroy_metal' },
  gaze: { name: 'Gaze Attack', description: 'At encounter start, all must save or take damage', trigger: 'encounter_start', effect: 'gaze_damage' },
  webbing: { name: 'Web', description: 'PCs cannot flee until web is destroyed', trigger: 'passive', effect: 'prevent_flee' },
  disease: { name: 'Disease', description: 'On hit, target must save vs disease', trigger: 'on_hit', effect: 'disease' },
  sporeCloud: { name: 'Spore Cloud', description: 'Releases damaging spores', trigger: 'attack', effect: 'spore_damage' }
};

/**
 * Reaction Types Database
 */
export const REACTION_TYPES = {
  offerFoodAndRest: { name: 'Offer Food and Rest', hostile: false, canTakeTreasure: false, canPass: true },
  peaceful: { name: 'Peaceful', hostile: false, canTakeTreasure: false, canPass: true },
  ignore: { name: 'Ignore', hostile: false, canTakeTreasure: false, canPass: true, allowStealth: true },
  flee: { name: 'Flee', hostile: false, canTakeTreasure: false, canPass: true, allowFreeAttack: true },
  fleeIfOutnumbered: { name: 'Flee if Outnumbered', hostile: 'conditional', canTakeTreasure: false, canPass: 'conditional' },
  bribe: { name: 'Bribe', hostile: 'conditional', canTakeTreasure: false, canPass: 'conditional', requiresBribe: true },
  fight: { name: 'Fight', hostile: true, canTakeTreasure: true, canPass: false, monsterInitiative: true, checksMorale: true },
  fightToTheDeath: { name: 'Fight to the Death', hostile: true, canTakeTreasure: true, canPass: false, monsterInitiative: true, checksMorale: false },
  puzzle: { name: 'Puzzle', hostile: 'conditional', canTakeTreasure: false, canPass: 'conditional', requiresPuzzle: true },
  quest: { name: 'Quest', hostile: false, canTakeTreasure: false, canPass: true, offersQuest: true },
  magicChallenge: { name: 'Magic Challenge', hostile: 'conditional', canTakeTreasure: 'conditional', canPass: 'conditional', requiresMagicDuel: true },
  tradeInformation: { name: 'Trade Information', hostile: false, canTakeTreasure: false, canPass: true, allowsTrade: true },
  capture: { name: 'Capture', hostile: true, canTakeTreasure: false, canPass: false, nonLethal: true },
  bloodOffering: { name: 'Blood Offering', hostile: 'conditional', canTakeTreasure: false, canPass: 'conditional', requiresBlood: true },
  trialOfChampions: { name: 'Trial of Champions', hostile: 'conditional', canTakeTreasure: false, canPass: 'conditional', requiresTrial: true }
};

/**
 * Complete Monster Database
 * Following MonsterSchema structure
 */
export const MONSTERS = {
  // ===== DUNGEON VERMIN =====
  rats: { id: 'rats', name: 'Rats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['infection'],
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'fleeIfOutnumbered', 4: 'fight', 5: 'fight', 6: 'fight' } },
  skeletonHorde: { id: 'skeletonHorde', name: 'Skeleton Horde', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['undead'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  swarmOfBats: { id: 'swarmOfBats', name: 'Swarm of Bats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying'],
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  zombies: { id: 'zombies', name: 'Zombies', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['undead'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  vampireBats: { id: 'vampireBats', name: 'Vampire Bats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying', 'infection'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  goblins: { id: 'goblins', name: 'Goblins', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null,
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== DUNGEON MINIONS =====
  orcs: { id: 'orcs', name: 'Orcs', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'bribe', 2: 'fleeIfOutnumbered', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  hobgoblins: { id: 'hobgoblins', name: 'Hobgoblins', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'bribe', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  ghouls: { id: 'ghouls', name: 'Ghouls', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: ['undead', 'paralysis'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  trolls: { id: 'trolls', name: 'Trolls', category: 'dungeonMinions', tier: 2, levelMod: 1, count: 'd6-2', special: ['regenerate'],
    reactionTable: { 1: 'bribe', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungiFolk: { id: 'fungiFolk', name: 'Fungi Folk', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: ['sporeCloud'],
    reactionTable: { 1: 'peaceful', 2: 'ignore', 3: 'tradeInformation', 4: 'fight', 5: 'fight', 6: 'fight' } },
  ogreGuard: { id: 'ogreGuard', name: 'Ogre Guard', category: 'dungeonMinions', tier: 3, levelMod: 1, count: 'd3', special: null,
    reactionTable: { 1: 'bribe', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== DUNGEON BOSS MONSTERS =====
  medusa: { id: 'medusa', name: 'Medusa', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['petrify', 'boss'],
    reactionTable: { 1: 'puzzle', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  ettin: { id: 'ettin', name: 'Ettin', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'],
    reactionTable: { 1: 'bribe', 2: 'trialOfChampions', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  smallDragon: { id: 'smallDragon', name: 'Small Dragon', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['fireBreath', 'boss'],
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  vampireLord: { id: 'vampireLord', name: 'Vampire Lord', category: 'dungeonBoss', tier: 5, levelMod: 2, count: '1', special: ['undead', 'boss'],
    reactionTable: { 1: 'bloodOffering', 2: 'capture', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  catacombLich: { id: 'catacombLich', name: 'Catacomb Lich', category: 'dungeonBoss', tier: 5, levelMod: 3, count: '1', special: ['undead', 'boss'],
    reactionTable: { 1: 'magicChallenge', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  greaterDemon: { id: 'greaterDemon', name: 'Greater Demon', category: 'dungeonBoss', tier: 6, levelMod: 3, count: '1', special: ['magic_resist', 'boss'],
    reactionTable: { 1: 'bloodOffering', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },

  // ===== DUNGEON WEIRD MONSTERS =====
  wanderingSwordsman: { id: 'wanderingSwordsman', name: 'Wandering Swordsman', category: 'dungeonWeird', tier: 2, levelMod: 0, count: '1', special: null,
    reactionTable: { 1: 'offerFoodAndRest', 2: 'tradeInformation', 3: 'trialOfChampions', 4: 'fight', 5: 'fight', 6: 'fight' } },
  gargoyle: { id: 'gargoyle', name: 'Gargoyle', category: 'dungeonWeird', tier: 3, levelMod: 1, count: 'd3', special: ['flying'],
    reactionTable: { 1: 'ignore', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  carrionCrawler: { id: 'carrionCrawler', name: 'Carrion Crawler', category: 'dungeonWeird', tier: 2, levelMod: 1, count: '1', special: ['paralysis'],
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  wraithKing: { id: 'wraithKing', name: 'Wraith King', category: 'dungeonWeird', tier: 4, levelMod: 2, count: '1', special: ['undead', 'fear'],
    reactionTable: { 1: 'quest', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  manticor: { id: 'manticor', name: 'Manticor', category: 'dungeonWeird', tier: 3, levelMod: 1, count: '1', special: ['flying', 'poison'],
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  mimicChest: { id: 'mimicChest', name: 'Mimic Chest', category: 'dungeonWeird', tier: 3, levelMod: 1, count: '1', special: null,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS VERMIN =====
  caveRats: { id: 'caveRats', name: 'Cave Rats', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['disease'],
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'fleeIfOutnumbered', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantCentipedes: { id: 'giantCentipedes', name: 'Giant Centipedes', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['poison'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantSpiders: { id: 'giantSpiders', name: 'Giant Spiders', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['poison', 'webbing'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  caveLocusts: { id: 'caveLocusts', name: 'Cave Locusts', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['swarm'],
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  piercers: { id: 'piercers', name: 'Piercers', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  stirges: { id: 'stirges', name: 'Stirges', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== CAVERNS MINIONS =====
  giantLizards: { id: 'giantLizards', name: 'Giant Lizards', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  troglodytes: { id: 'troglodytes', name: 'Troglodytes', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveOrcs: { id: 'caveOrcs', name: 'Cave Orcs', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'bribe', 2: 'fleeIfOutnumbered', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  darkElves: { id: 'darkElves', name: 'Dark Elves', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: ['spellDisrupt'],
    reactionTable: { 1: 'tradeInformation', 2: 'magicChallenge', 3: 'capture', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveGoblins: { id: 'caveGoblins', name: 'Cave Goblins', category: 'cavernsMinions', tier: 1, levelMod: 0, count: 'd6+2', special: null, surpriseChance: 2,
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },
  caveSkeletons: { id: 'caveSkeletons', name: 'Cave Skeletons', category: 'cavernsMinions', tier: 1, levelMod: 2, count: '2d6', special: ['undead'], surpriseChance: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  deepDwarves: { id: 'deepDwarves', name: 'Deep Dwarves', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'tradeInformation', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS BOSS MONSTERS =====
  caveOgre: { id: 'caveOgre', name: 'Cave Ogre', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'],
    reactionTable: { 1: 'bribe', 2: 'trialOfChampions', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  basilisk: { id: 'basilisk', name: 'Basilisk', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['gaze', 'boss'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  giantSlug: { id: 'giantSlug', name: 'Giant Slug', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'],
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  umberhulk: { id: 'umberhulk', name: 'Umber Hulk', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveDragon: { id: 'caveDragon', name: 'Cave Dragon', category: 'cavernsBoss', tier: 5, levelMod: 3, count: '1', special: ['fireBreath', 'boss'],
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  purpleWorm: { id: 'purpleWorm', name: 'Purple Worm', category: 'cavernsBoss', tier: 6, levelMod: 3, count: '1', special: ['boss'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS WEIRD MONSTERS =====
  carrionCrawlerCave: { id: 'carrionCrawlerCave', name: 'Carrion Crawler', category: 'cavernsWeird', tier: 2, levelMod: 1, count: '1', special: ['paralysis'],
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  rustMonster: { id: 'rustMonster', name: 'Rust Monster', category: 'cavernsWeird', tier: 2, levelMod: 0, count: '1', special: ['metalEater'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  drillworm: { id: 'drillworm', name: 'Drillworm', category: 'cavernsWeird', tier: 4, levelMod: 2, count: '1', special: null, surpriseChance: 3,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  cavernSludge: { id: 'cavernSludge', name: 'Cavern Sludge', category: 'cavernsWeird', tier: 3, levelMod: 2, count: '1', special: null, surpriseChance: 4,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  gelatinousCube: { id: 'gelatinousCube', name: 'Gelatinous Cube', category: 'cavernsWeird', tier: 4, levelMod: 2, count: '1', special: ['paralysis'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  roper: { id: 'roper', name: 'Roper', category: 'cavernsWeird', tier: 3, levelMod: 1, count: '1', special: ['paralysis'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  cloaker: { id: 'cloaker', name: 'Cloaker', category: 'cavernsWeird', tier: 3, levelMod: 1, count: '1', special: null,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  hookHorror: { id: 'hookHorror', name: 'Hook Horror', category: 'cavernsWeird', tier: 3, levelMod: 1, count: 'd3', special: null,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== FUNGAL GROTTOES VERMIN =====
  giantFireBeetles: { id: 'giantFireBeetles', name: 'Giant Fire Beetles', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  fungusBats: { id: 'fungusBats', name: 'Fungus Bats', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying', 'sporeCloud'],
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  shrieker: { id: 'shrieker', name: 'Shrieker', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  yellowMold: { id: 'yellowMold', name: 'Yellow Mold', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  sporeFolk: { id: 'sporeFolk', name: 'Spore Folk', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'],
    reactionTable: { 1: 'peaceful', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  fungusGnats: { id: 'fungusGnats', name: 'Fungus Gnats', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['swarm', 'disease'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== FUNGAL GROTTOES MINIONS =====
  myconids: { id: 'myconids', name: 'Myconids', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['sporeCloud'],
    reactionTable: { 1: 'peaceful', 2: 'tradeInformation', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  moldMen: { id: 'moldMen', name: 'Mold Men', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['disease'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungusTrolls: { id: 'fungusTrolls', name: 'Fungus Trolls', category: 'fungalMinions', tier: 2, levelMod: 1, count: 'd6-2', special: ['regenerate', 'sporeCloud'],
    reactionTable: { 1: 'bribe', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  sporeZombies: { id: 'sporeZombies', name: 'Spore Zombies', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['undead', 'sporeCloud'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungalGoblins: { id: 'fungalGoblins', name: 'Fungal Goblins', category: 'fungalMinions', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'],
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantSlugs: { id: 'giantSlugs', name: 'Giant Slugs', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: null,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== FUNGAL GROTTOES BOSS MONSTERS =====
  giantMushroom: { id: 'giantMushroom', name: 'Giant Mushroom', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
    fungalTyrant: { id: 'fungalTyrant', name: 'Fungal Tyrant', category: 'fungalBoss', tier: 5, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'],
    reactionTable: { 1: 'quest', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
    myconidSovereign: { id: 'myconidSovereign', name: 'Myconid Sovereign', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'sleepAura', 'boss'],
    reactionTable: { 1: 'peaceful', 2: 'tradeInformation', 3: 'quest', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
    moldDragon: { id: 'moldDragon', name: 'Mold Dragon', category: 'fungalBoss', tier: 5, levelMod: 3, count: '1', special: ['sporeCloud', 'fireBreath', 'boss'],
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
    sporeMother: { id: 'sporeMother', name: 'Spore Mother', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'],
    reactionTable: { 1: 'peaceful', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
    cordycepsHorror: { id: 'cordycepsHorror', name: 'Cordyceps Horror', category: 'fungalBoss', tier: 6, levelMod: 3, count: '1', special: ['disease', 'boss'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },

  // ===== FUNGAL GROTTOES WEIRD MONSTERS =====
  gasBag: { id: 'gasBag', name: 'Gas Bag', category: 'fungalWeird', tier: 2, levelMod: 0, count: '1', special: ['flying', 'sporeCloud'],
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
    violetFungus: { id: 'violetFungus', name: 'Violet Fungus', category: 'fungalWeird', tier: 2, levelMod: 0, count: 'd3', special: ['poison'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
    phantomFungus: { id: 'phantomFungus', name: 'Phantom Fungus', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: null,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
    sporeWight: { id: 'sporeWight', name: 'Spore Wight', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: ['undead', 'sporeCloud'],
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
    moldElemental: { id: 'moldElemental', name: 'Mold Elemental', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: ['magic_resist', 'disease'],
    reactionTable: { 1: 'ignore', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
    myceliumColony: { id: 'myceliumColony', name: 'Mycelium Colony', category: 'fungalWeird', tier: 4, levelMod: 2, count: '1', special: ['swarm', 'sporeCloud'],
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } }
};

/**
 * Helper functions
 */
export function getMonster(id) {
  return MONSTERS[id] || null;
}

export function getAllMonsters() {
  return Object.values(MONSTERS);
}

export function getMonstersByCategory(category) {
  return Object.values(MONSTERS).filter(m => m.category === category);
}

export function calculateMonsterLevel(monster, hcl = 1) {
  return Math.max(1, hcl + (monster.levelMod || 0));
}

export function calculateMonsterHP(monster) {
  return monster.tier || 1;
}

export default {
  MONSTERS,
  MONSTER_ABILITIES,
  REACTION_TYPES,
  getMonster,
  getAllMonsters,
  getMonstersByCategory,
  calculateMonsterLevel,
  calculateMonsterHP
};
