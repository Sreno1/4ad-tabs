/**
 * Monster definitions and tables for Four Against Darkness
 * Organized by location and encounter type from official tables
 */

// Monster Special Abilities
export const MONSTER_ABILITIES = {
  regenerate: {
    name: 'Regenerate',
    description: 'Recovers 1 HP at the start of each round',
    trigger: 'round_start',
    effect: 'heal',
    value: 1
  },
  breath: {
    name: 'Breath Weapon',
    description: 'Attacks all heroes at once',
    trigger: 'attack',
    effect: 'aoe_attack',
    damage: 1
  },
  boss: {
    name: 'Boss Monster',
    description: 'Attacks twice per round',
    trigger: 'attack',
    effect: 'multi_attack',
    attacks: 2
  },
  poison: {
    name: 'Poison',
    description: 'On hit, target must save or take 1 additional damage',
    trigger: 'on_hit',
    effect: 'apply_poison',
    saveThreshold: 4
  },
  undead: {
    name: 'Undead',
    description: 'Immune to sleep, clerics deal +L damage',
    trigger: 'passive',
    effect: 'immunity',
    immuneTo: ['sleep']
  },
  swarm: {
    name: 'Swarm',
    description: 'Takes half damage from single-target attacks',
    trigger: 'on_damage',
    effect: 'damage_resist',
    resist: 0.5
  },
  flying: {
    name: 'Flying',
    description: 'Can only be hit by ranged attacks or spells until grounded',
    trigger: 'passive',
    effect: 'evasion',
    requiresRanged: true
  },
  magic_resist: {
    name: 'Magic Resistance',
    description: 'Takes half damage from spells',
    trigger: 'on_spell_damage',
    effect: 'spell_resist',
    resist: 0.5
  },
  fear: {
    name: 'Fearsome',
    description: 'Heroes must pass morale check or suffer -1 to attacks',
    trigger: 'encounter_start',
    effect: 'morale_check',
    penalty: -1
  },
  petrify: {
    name: 'Petrifying Gaze',
    description: 'At encounter start, all must save vs L4 or be turned to stone',
    trigger: 'encounter_start',
    effect: 'petrify',
    saveThreshold: 4
  },
  infection: {
    name: 'Infection',
    description: 'Wounded PCs have 1-in-6 chance of losing 1 Life to infection',
    trigger: 'on_hit',
    effect: 'infection'
  },
  spellDisrupt: {
    name: 'Spell Disruption',
    description: 'Spellcasting rolls are at -1',
    trigger: 'passive',
    effect: 'spell_penalty',
    penalty: -1
  },
  paralysis: {
    name: 'Paralysis',
    description: 'On hit, target may be paralyzed',
    trigger: 'on_hit',
    effect: 'paralysis'
  },
  surprise: {
    name: 'Surprise',
    description: 'Has chance to surprise the party',
    trigger: 'encounter_start',
    effect: 'surprise'
  },
  sleepAura: {
    name: 'Sleep Aura',
    description: 'Can put PCs to sleep at start of combat',
    trigger: 'encounter_start',
    effect: 'sleep_aura'
  },
  fireBreath: {
    name: 'Fire Breath',
    description: 'Breathes fire dealing damage to all PCs',
    trigger: 'attack',
    effect: 'fire_breath'
  },
  metalEater: {
    name: 'Metal Eater',
    description: 'Attacks destroy metal items instead of dealing damage',
    trigger: 'on_hit',
    effect: 'destroy_metal'
  },
  gaze: {
    name: 'Gaze Attack',
    description: 'At encounter start, all must save or take damage',
    trigger: 'encounter_start',
    effect: 'gaze_damage'
  },
  webbing: {
    name: 'Web',
    description: 'PCs cannot flee until web is destroyed',
    trigger: 'passive',
    effect: 'prevent_flee'
  },
  disease: {
    name: 'Disease',
    description: 'On hit, target must save vs disease',
    trigger: 'on_hit',
    effect: 'disease'
  },
  sporeCloud: {
    name: 'Spore Cloud',
    description: 'Releases damaging spores',
    trigger: 'attack',
    effect: 'spore_damage'
  }
};

// Monster Reactions - Full list from 4AD rules
// Each monster type can have different possible reactions based on d6 roll
export const REACTION_TYPES = {
  offerFoodAndRest: {
    name: 'Offer Food and Rest',
    description: 'The Foe is a friend! They offer food, rest, and tending of wounds. Each PC may eat 1 Food and heal 1 Life. If you return here later, they will be gone.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true
  },
  peaceful: {
    name: 'Peaceful',
    description: 'The Foe will not fight. You may move through the tile as desired. The Foe will not help you. You may not take its Treasure. If you return here later, they remain peaceful.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true
  },
  ignore: {
    name: 'Ignore',
    description: 'The Foe is preoccupied with other things. It will just ignore you. You may move through the tile. The Foe will not help you. You may not take its Treasure. A PC may attempt a Stealth Save to steal a single item from the Foe\'s Treasure.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true,
    allowStealth: true
  },
  flee: {
    name: 'Flee',
    description: 'The Foe turns tail and flees, disappearing. You do not get its Treasure and may not collect its body parts. PCs may perform a single attack at +1 at the fleeing Foes.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true,
    allowFreeAttack: true
  },
  fleeIfOutnumbered: {
    name: 'Flee if Outnumbered',
    description: 'If Foes are fewer than party members (including allies, hirelings, animal companions), they flee. Otherwise, they fight.',
    hostile: 'conditional',
    canTakeTreasure: false,
    canPass: 'conditional'
  },
  bribe: {
    name: 'Bribe',
    description: 'The Foes ask for a bribe (gp, gems, magic items, etc.). If you pay the bribe, treat as Peaceful. If you don\'t want or can\'t pay, the Foes fight.',
    hostile: 'conditional',
    canTakeTreasure: false,
    canPass: 'conditional',
    requiresBribe: true
  },
  fight: {
    name: 'Fight',
    description: 'The Foes attack, going first. Foes test Morale when reduced under 50% of their initial number/Life, unless their profile says they never check Morale.',
    hostile: true,
    canTakeTreasure: true,
    canPass: false,
    monsterInitiative: true,
    checksMorale: true
  },
  fightToTheDeath: {
    name: 'Fight to the Death',
    description: 'The Foes fight to the bitter end, asking for no quarter and giving none. These Foes will not test Morale.',
    hostile: true,
    canTakeTreasure: true,
    canPass: false,
    monsterInitiative: true,
    checksMorale: false
  },
  puzzle: {
    name: 'Puzzle',
    description: 'The Foes ask the party to solve a puzzle or riddle. Requires a successful Save vs. the puzzle\'s L (Wizards add +L). If solved, the Foes let you go. If not solved, the Foes attack, going first. One chance only.',
    hostile: 'conditional',
    canTakeTreasure: false,
    canPass: 'conditional',
    requiresPuzzle: true
  },
  quest: {
    name: 'Quest',
    description: 'The Foe asks you to perform a Quest. If you refuse, the Foe leaves. If you accept, roll on the Quest Table. If you complete the Quest, roll on the Epic Rewards Table.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true,
    offersQuest: true
  },
  magicChallenge: {
    name: 'Magic Challenge',
    description: 'The Foe challenges you to a magic duel. A spellcaster must perform a spellcasting roll vs. the Foe\'s L. Success: Foe walks away, take Treasure. Failure: caster loses 1 Level. If you cannot/do not accept, or lose, the Foe will fight.',
    hostile: 'conditional',
    canTakeTreasure: 'conditional',
    canPass: 'conditional',
    requiresMagicDuel: true
  },
  tradeInformation: {
    name: 'Trade Information',
    description: 'You can gain 25gp for each Clue possessed (Clues not lost) and/or buy 1 Clue for 100gp.',
    hostile: false,
    canTakeTreasure: false,
    canPass: true,
    allowsTrade: true
  },
  capture: {
    name: 'Capture',
    description: 'Foes use non-lethal attacks to capture instead of killing. Any PC brought to zero Life will be knocked out and brought to a secret hideout. To find the hideout, spend 3 Clues.',
    hostile: true,
    canTakeTreasure: false,
    canPass: false,
    nonLethal: true
  },
  bloodOffering: {
    name: 'Blood Offering',
    description: 'A living PC must give blood (losing 2 Life), or the Foe will fight. This is a Bribe variant.',
    hostile: 'conditional',
    canTakeTreasure: false,
    canPass: 'conditional',
    requiresBlood: true
  },
  trialOfChampions: {
    name: 'Trial of Champions',
    description: 'Foes propose a trial by combat between their champion and a PC. Lasts d6 turns. No allies, magic, or ranged attacks. Winner determined by kills or most damage dealt. If Foes win, you must leave or they fight at +1 L.',
    hostile: 'conditional',
    canTakeTreasure: false,
    canPass: 'conditional',
    requiresTrial: true
  }
};

// Default reaction table (can be overridden per monster)
export const DEFAULT_REACTION_TABLE = {
  1: 'peaceful',
  2: 'ignore', 
  3: 'bribe',
  4: 'fight',
  5: 'fight',
  6: 'fightToTheDeath'
};

// Legacy format for backwards compatibility
export const MONSTER_REACTIONS = {
  1: { reaction: 'peaceful', description: 'Will not fight, may pass through', initiative: 'party' },
  2: { reaction: 'ignore', description: 'Preoccupied, may attempt stealth', initiative: 'party' },
  3: { reaction: 'bribe', description: 'Demands payment or fights', initiative: 'roll' },
  4: { reaction: 'fight', description: 'Attacks, going first', initiative: 'monster' },
  5: { reaction: 'fight', description: 'Attacks, going first', initiative: 'monster' },
  6: { reaction: 'fightToTheDeath', description: 'Attacks ferociously, no morale checks', initiative: 'monster' }
};

/**
 * Roll for monster reaction
 * @param {object} monster - Monster with optional custom reaction table
 * @returns {object} Reaction result with details
 */
export const rollMonsterReaction = (monster = null) => {
  const roll = Math.floor(Math.random() * 6) + 1;
  
  // Use monster's custom reaction table if available, otherwise use default
  const reactionTable = monster?.reactionTable || DEFAULT_REACTION_TABLE;
  const reactionKey = reactionTable[roll];
  const reactionDetails = REACTION_TYPES[reactionKey];
  
  return {
    roll,
    reactionKey,
    ...reactionDetails,
    initiative: reactionDetails.hostile === true ? 'monster' : 
                reactionDetails.hostile === false ? 'party' : 'roll'
  };
};

// Monster Categories for encounter types
export const MONSTER_CATEGORIES = {
  dungeonVermin: 'Dungeon Vermin',
  dungeonMinions: 'Dungeon Minions',
  dungeonBoss: 'Dungeon Boss Monsters',
  dungeonWeird: 'Dungeon Weird Monsters',
  cavernsVermin: 'Caverns Vermin',
  cavernsMinions: 'Caverns Minions',
  cavernsBoss: 'Caverns Boss Monsters',
  cavernsWeird: 'Caverns Weird Monsters',
  fungalVermin: 'Fungal Grottoes Vermin',
  fungalMinions: 'Fungal Grottoes Minions',
  fungalBoss: 'Fungal Grottoes Boss Monsters',
  fungalWeird: 'Fungal Grottoes Weird Monsters'
};

// COMPREHENSIVE MONSTER TABLE - All monsters from Four Against Darkness
// Organized by category/encounter type from official tables
// Tier: 1=Vermin/Minion (1 Life), 2=Normal (2 Life), 3=Tough (3 Life), 4+=Boss (4+ Life)
// Level: HCL-based for most, fixed for some
// reactionTable: Custom d6 reaction table (uses DEFAULT_REACTION_TABLE if not specified)
export const MONSTER_TABLE = {
  // ===== DUNGEON VERMIN =====
  rats: { name: 'Rats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['infection'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'fleeIfOutnumbered', 4: 'fight', 5: 'fight', 6: 'fight' } },
  skeletonHorde: { name: 'Skeleton Horde', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['undead'], xp: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  swarmOfBats: { name: 'Swarm of Bats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  zombies: { name: 'Zombies', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['undead'], xp: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  vampireBats: { name: 'Vampire Bats', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying', 'infection'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  goblins: { name: 'Goblins', category: 'dungeonVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null, xp: 1,
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== DUNGEON MINIONS =====
  orcs: { name: 'Orcs', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'bribe', 2: 'fleeIfOutnumbered', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  hobgoblins: { name: 'Hobgoblins', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'bribe', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  ghouls: { name: 'Ghouls', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: ['undead', 'paralysis'], xp: 2,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  trolls: { name: 'Trolls', category: 'dungeonMinions', tier: 2, levelMod: 1, count: 'd6-2', special: ['regenerate'], xp: 3,
    reactionTable: { 1: 'bribe', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungiFolk: { name: 'Fungi Folk', category: 'dungeonMinions', tier: 2, levelMod: 0, count: 'd6', special: ['sporeCloud'], xp: 2,
    reactionTable: { 1: 'peaceful', 2: 'ignore', 3: 'tradeInformation', 4: 'fight', 5: 'fight', 6: 'fight' } },
  ogreGuard: { name: 'Ogre Guard', category: 'dungeonMinions', tier: 3, levelMod: 1, count: 'd3', special: null, xp: 4,
    reactionTable: { 1: 'bribe', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== DUNGEON BOSS MONSTERS =====
  medusa: { name: 'Medusa', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['petrify', 'boss'], xp: 8,
    reactionTable: { 1: 'puzzle', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  ettin: { name: 'Ettin', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'], xp: 8,
    reactionTable: { 1: 'bribe', 2: 'trialOfChampions', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  smallDragon: { name: 'Small Dragon', category: 'dungeonBoss', tier: 4, levelMod: 2, count: '1', special: ['fireBreath', 'boss'], xp: 10,
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  vampireLord: { name: 'Vampire Lord', category: 'dungeonBoss', tier: 5, levelMod: 2, count: '1', special: ['undead', 'boss'], xp: 12,
    reactionTable: { 1: 'bloodOffering', 2: 'capture', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  catacombLich: { name: 'Catacomb Lich', category: 'dungeonBoss', tier: 5, levelMod: 3, count: '1', special: ['undead', 'boss'], xp: 15,
    reactionTable: { 1: 'magicChallenge', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  greaterDemon: { name: 'Greater Demon', category: 'dungeonBoss', tier: 6, levelMod: 3, count: '1', special: ['magic_resist', 'boss'], xp: 20,
    reactionTable: { 1: 'bloodOffering', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },

  // ===== DUNGEON WEIRD MONSTERS =====
  wanderingSwordsman: { name: 'Wandering Swordsman', category: 'dungeonWeird', tier: 2, levelMod: 0, count: '1', special: null, xp: 3,
    reactionTable: { 1: 'offerFoodAndRest', 2: 'tradeInformation', 3: 'trialOfChampions', 4: 'fight', 5: 'fight', 6: 'fight' } },
  gargoyle: { name: 'Gargoyle', category: 'dungeonWeird', tier: 3, levelMod: 1, count: 'd3', special: ['flying'], xp: 4,
    reactionTable: { 1: 'ignore', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  carrionCrawler: { name: 'Carrion Crawler', category: 'dungeonWeird', tier: 2, levelMod: 1, count: '1', special: ['paralysis'], xp: 3,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  wraithKing: { name: 'Wraith King', category: 'dungeonWeird', tier: 4, levelMod: 2, count: '1', special: ['undead', 'fear'], xp: 8,
    reactionTable: { 1: 'quest', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  manticor: { name: 'Manticor', category: 'dungeonWeird', tier: 3, levelMod: 1, count: '1', special: ['flying', 'poison'], xp: 5,
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  mimicChest: { name: 'Mimic Chest', category: 'dungeonWeird', tier: 3, levelMod: 1, count: '1', special: null, xp: 4,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS VERMIN =====
  caveRats: { name: 'Cave Rats', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['disease'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'fleeIfOutnumbered', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantCentipedes: { name: 'Giant Centipedes', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['poison'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantSpiders: { name: 'Giant Spiders', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['poison', 'webbing'], xp: 1,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  caveLocusts: { name: 'Cave Locusts', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['swarm'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  piercers: { name: 'Piercers', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null, xp: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  stirges: { name: 'Stirges', category: 'cavernsVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== CAVERNS MINIONS =====
  giantLizards: { name: 'Giant Lizards', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  troglodytes: { name: 'Troglodytes', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveOrcs: { name: 'Cave Orcs', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'bribe', 2: 'fleeIfOutnumbered', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  darkElves: { name: 'Dark Elves', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: ['spellDisrupt'], xp: 2,
    reactionTable: { 1: 'tradeInformation', 2: 'magicChallenge', 3: 'capture', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveGoblins: { name: 'Cave Goblins', category: 'cavernsMinions', tier: 1, levelMod: 0, count: 'd6+2', special: null, xp: 1, surpriseChance: 2,
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },
  caveSkeletons: { name: 'Cave Skeletons', category: 'cavernsMinions', tier: 1, levelMod: 2, count: '2d6', special: ['undead'], xp: 2, surpriseChance: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  deepDwarves: { name: 'Deep Dwarves', category: 'cavernsMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'tradeInformation', 2: 'bribe', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS BOSS MONSTERS =====
  caveOgre: { name: 'Cave Ogre', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'], xp: 8,
    reactionTable: { 1: 'bribe', 2: 'trialOfChampions', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  basilisk: { name: 'Basilisk', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['gaze', 'boss'], xp: 10,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  giantSlug: { name: 'Giant Slug', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'], xp: 8,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  umberhulk: { name: 'Umber Hulk', category: 'cavernsBoss', tier: 4, levelMod: 2, count: '1', special: ['boss'], xp: 8,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  caveDragon: { name: 'Cave Dragon', category: 'cavernsBoss', tier: 5, levelMod: 3, count: '1', special: ['fireBreath', 'boss'], xp: 15,
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  purpleWorm: { name: 'Purple Worm', category: 'cavernsBoss', tier: 6, levelMod: 3, count: '1', special: ['boss'], xp: 20,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== CAVERNS WEIRD MONSTERS =====
  carrionCrawlerCave: { name: 'Carrion Crawler', category: 'cavernsWeird', tier: 2, levelMod: 1, count: '1', special: ['paralysis'], xp: 3,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  rustMonster: { name: 'Rust Monster', category: 'cavernsWeird', tier: 2, levelMod: 0, count: '1', special: ['metalEater'], xp: 2,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  drillworm: { name: 'Drillworm', category: 'cavernsWeird', tier: 4, levelMod: 2, count: '1', special: null, xp: 6, surpriseChance: 3,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  cavernSludge: { name: 'Cavern Sludge', category: 'cavernsWeird', tier: 3, levelMod: 2, count: '1', special: null, xp: 5, surpriseChance: 4,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  gelatinousCube: { name: 'Gelatinous Cube', category: 'cavernsWeird', tier: 4, levelMod: 2, count: '1', special: ['paralysis'], xp: 6,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  roper: { name: 'Roper', category: 'cavernsWeird', tier: 3, levelMod: 1, count: '1', special: ['paralysis'], xp: 4,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  cloaker: { name: 'Cloaker', category: 'cavernsWeird', tier: 3, levelMod: 1, count: '1', special: null, xp: 4,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  hookHorror: { name: 'Hook Horror', category: 'cavernsWeird', tier: 3, levelMod: 1, count: 'd3', special: null, xp: 4,
    reactionTable: { 1: 'fleeIfOutnumbered', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },

  // ===== FUNGAL GROTTOES VERMIN =====
  giantFireBeetles: { name: 'Giant Fire Beetles', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null, xp: 1,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  fungusBats: { name: 'Fungus Bats', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['flying', 'sporeCloud'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'flee', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  shrieker: { name: 'Shrieker', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: null, xp: 1,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  yellowMold: { name: 'Yellow Mold', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'], xp: 1,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  sporeFolk: { name: 'Spore Folk', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'], xp: 1,
    reactionTable: { 1: 'peaceful', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  fungusGnats: { name: 'Fungus Gnats', category: 'fungalVermin', tier: 1, levelMod: 0, count: 'd6+2', special: ['swarm', 'disease'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== FUNGAL GROTTOES MINIONS =====
  myconids: { name: 'Myconids', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['sporeCloud'], xp: 2,
    reactionTable: { 1: 'peaceful', 2: 'tradeInformation', 3: 'ignore', 4: 'fight', 5: 'fight', 6: 'fight' } },
  moldMen: { name: 'Mold Men', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['disease'], xp: 2,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungusTrolls: { name: 'Fungus Trolls', category: 'fungalMinions', tier: 2, levelMod: 1, count: 'd6-2', special: ['regenerate', 'sporeCloud'], xp: 3,
    reactionTable: { 1: 'bribe', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  sporeZombies: { name: 'Spore Zombies', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: ['undead', 'sporeCloud'], xp: 2,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungalGoblins: { name: 'Fungal Goblins', category: 'fungalMinions', tier: 1, levelMod: 0, count: 'd6+2', special: ['sporeCloud'], xp: 1,
    reactionTable: { 1: 'flee', 2: 'fleeIfOutnumbered', 3: 'bribe', 4: 'fight', 5: 'fight', 6: 'fight' } },
  giantSlugs: { name: 'Giant Slugs', category: 'fungalMinions', tier: 2, levelMod: 0, count: 'd6', special: null, xp: 2,
    reactionTable: { 1: 'ignore', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },

  // ===== FUNGAL GROTTOES BOSS MONSTERS =====
  giantMushroom: { name: 'Giant Mushroom', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'], xp: 8,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  fungalTyrant: { name: 'Fungal Tyrant', category: 'fungalBoss', tier: 5, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'], xp: 12,
    reactionTable: { 1: 'quest', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  myconidSovereign: { name: 'Myconid Sovereign', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'sleepAura', 'boss'], xp: 10,
    reactionTable: { 1: 'peaceful', 2: 'tradeInformation', 3: 'quest', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  moldDragon: { name: 'Mold Dragon', category: 'fungalBoss', tier: 5, levelMod: 3, count: '1', special: ['sporeCloud', 'fireBreath', 'boss'], xp: 15,
    reactionTable: { 1: 'bribe', 2: 'puzzle', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },
  sporeMother: { name: 'Spore Mother', category: 'fungalBoss', tier: 4, levelMod: 2, count: '1', special: ['sporeCloud', 'boss'], xp: 10,
    reactionTable: { 1: 'peaceful', 2: 'quest', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  cordycepsHorror: { name: 'Cordyceps Horror', category: 'fungalBoss', tier: 6, levelMod: 3, count: '1', special: ['disease', 'boss'], xp: 20,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fightToTheDeath', 6: 'fightToTheDeath' } },

  // ===== FUNGAL GROTTOES WEIRD MONSTERS =====
  gasBag: { name: 'Gas Bag', category: 'fungalWeird', tier: 2, levelMod: 0, count: '1', special: ['flying', 'sporeCloud'], xp: 2,
    reactionTable: { 1: 'flee', 2: 'ignore', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  violetFungus: { name: 'Violet Fungus', category: 'fungalWeird', tier: 2, levelMod: 0, count: 'd3', special: ['poison'], xp: 2,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  phantomFungus: { name: 'Phantom Fungus', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: null, xp: 4,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fight' } },
  sporeWight: { name: 'Spore Wight', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: ['undead', 'sporeCloud'], xp: 4,
    reactionTable: { 1: 'fight', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  moldElemental: { name: 'Mold Elemental', category: 'fungalWeird', tier: 3, levelMod: 1, count: '1', special: ['magic_resist', 'disease'], xp: 5,
    reactionTable: { 1: 'ignore', 2: 'magicChallenge', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } },
  myceliumColony: { name: 'Mycelium Colony', category: 'fungalWeird', tier: 4, levelMod: 2, count: '1', special: ['swarm', 'sporeCloud'], xp: 6,
    reactionTable: { 1: 'ignore', 2: 'fight', 3: 'fight', 4: 'fight', 5: 'fight', 6: 'fightToTheDeath' } }
};

// Get monsters grouped by category for UI
export const getMonstersByCategory = () => {
  const grouped = {};
  Object.entries(MONSTER_TABLE).forEach(([key, monster]) => {
    const category = monster.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, ...monster });
  });
  return grouped;
};

// Get all monsters as flat array for dropdown, organized by category
export const getAllMonsters = () => {
  const monsters = Object.entries(MONSTER_TABLE).map(([key, monster]) => ({
    key,
    ...monster,
    displayName: `${monster.name} (T${monster.tier}, ${monster.xp}XP)`
  }));
  
  // Sort by category order, then by name within category
  const categoryOrder = Object.keys(MONSTER_CATEGORIES);
  return monsters.sort((a, b) => {
    const catOrderA = categoryOrder.indexOf(a.category);
    const catOrderB = categoryOrder.indexOf(b.category);
    if (catOrderA !== catOrderB) return catOrderA - catOrderB;
    return a.name.localeCompare(b.name);
  });
};

// Calculate monster level based on HCL (Highest Character Level) and tier
export const calculateMonsterLevel = (template, hcl = 1) => {
  // Base level is HCL + levelMod
  return Math.max(1, hcl + (template.levelMod || 0));
};

// Calculate monster HP based on tier
export const calculateMonsterHP = (template) => {
  // Tier directly corresponds to HP
  return template.tier || 1;
};

// Create monster from table entry
export const createMonsterFromTable = (key, hcl = 1) => {
  const template = MONSTER_TABLE[key];
  if (!template) return null;
  
  const level = calculateMonsterLevel(template, hcl);
  const hp = calculateMonsterHP(template);
  
  // Handle special abilities (can be array or null)
  const specialAbilities = template.special ? 
    (Array.isArray(template.special) ? template.special : [template.special]) : 
    [];
  
  return {
    id: Date.now() + Math.random(),
    name: template.name,
    level: level,
    hp: hp,
    maxHp: hp,
    type: key,
    category: template.category,
    tier: template.tier,
    special: specialAbilities.length > 0 ? specialAbilities[0] : null, // Primary ability for display
    abilities: specialAbilities, // All abilities
    xp: template.xp,
    surpriseChance: template.surpriseChance || 0,
    // Evaluate count expressions (like 'd6', 'd6+2', 'd6-2', 'd3', or numeric strings)
    count: (function() {
      const c = template.count;
      if (c === undefined || c === null) return undefined;
      if (typeof c === 'number') return c;
      if (typeof c === 'string') {
        // Plain number string
        if (/^\d+$/.test(c)) return parseInt(c, 10);
        // Dice expressions like d6, d3, d6+2, d6-2
        const m = c.match(/^(\d*)d(\d+)([+-]\d+)?$/);
        if (m) {
          const dice = m[1] ? parseInt(m[1], 10) : 1;
          const sides = parseInt(m[2], 10);
          const adj = m[3] ? parseInt(m[3], 10) : 0;
          let roll = 0;
          for (let i = 0; i < dice; i++) {
            roll += Math.floor(Math.random() * sides) + 1;
          }
          const val = roll + adj;
          return Math.max(1, val);
        }
      }
      // Fallback: undefined
      return undefined;
    })(),
    // initialCount: if we produced a numeric count, set initialCount for minor groups
    initialCount: (function() {
      const c = template.count;
      // Determine numeric count using same logic
      if (c === undefined || c === null) return undefined;
      if (typeof c === 'number') return c;
      if (typeof c === 'string') {
        if (/^\d+$/.test(c)) return parseInt(c, 10);
        const m = c.match(/^(\d*)d(\d+)([+-]\d+)?$/);
        if (m) {
          const dice = m[1] ? parseInt(m[1], 10) : 1;
          const sides = parseInt(m[2], 10);
          const adj = m[3] ? parseInt(m[3], 10) : 0;
          let roll = 0;
          for (let i = 0; i < dice; i++) {
            roll += Math.floor(Math.random() * sides) + 1;
          }
          const val = roll + adj;
          return Math.max(1, val);
        }
      }
      return undefined;
    })(),
    reactionTable: template.reactionTable || DEFAULT_REACTION_TABLE, // Monster-specific reactions
    reaction: null, // Set when rolled
    statuses: []
  };
};

// Monster Templates with base stats
export const MONSTER_TEMPLATES = {
  // Vermin - weakest enemies
  vermin: { name: 'Vermin', level: 1, baseHP: 1, special: null, xp: 1 },
  
  // Minions - standard enemies
  minion: { name: 'Minion', level: 2, baseHP: 2, special: null, xp: 2 },
  minions: { name: 'Minions', level: 2, baseHP: 2, special: null, xp: 2 }, // Alias for plural
  
  // Major Foes - level set by HCL
  major: { name: 'Major Foe', level: 0, baseHP: 6, special: null, xp: 5 },
  
  // Boss - level set by HCL+1
  boss: { name: 'Boss', level: 0, baseHP: 10, special: 'boss', xp: 10 },
  
  // Wandering monsters by level
  goblin: { name: 'Goblin', level: 1, baseHP: 2, special: null, xp: 1, moraleMod: -1 }, // Cowardly
  orc: { name: 'Orc', level: 2, baseHP: 4, special: null, xp: 2, moraleMod: +1 }, // Courageous
  troll: { name: 'Troll', level: 3, baseHP: 6, special: 'regenerate', xp: 4 },
  ogre: { name: 'Ogre', level: 4, baseHP: 8, special: null, xp: 5 },
  dragon: { name: 'Dragon', level: 5, baseHP: 12, special: 'breath', xp: 10 },
  
  // Additional monster types with special abilities
  skeleton: { name: 'Skeleton', level: 2, baseHP: 3, special: 'undead', xp: 2 },
  zombie: { name: 'Zombie', level: 2, baseHP: 4, special: 'undead', xp: 2 },
  ghost: { name: 'Ghost', level: 3, baseHP: 4, special: 'undead', xp: 4 },
  giant_spider: { name: 'Giant Spider', level: 3, baseHP: 5, special: 'poison', xp: 4 },
  rat_swarm: { name: 'Rat Swarm', level: 1, baseHP: 6, special: 'swarm', xp: 2 },
  harpy: { name: 'Harpy', level: 3, baseHP: 4, special: 'flying', xp: 4 },
  demon: { name: 'Demon', level: 4, baseHP: 8, special: 'magic_resist', xp: 6 },
  vampire: { name: 'Vampire', level: 5, baseHP: 8, special: 'undead', xp: 8 }
};

// Wandering Monster Table (d6)
export const WANDERING_TABLE = [
  '', // 0 - unused
  'goblin',
  'orc', 
  'troll',
  'ogre',
  'dragon',
  'special' // 6 - roll on special table
];

// Map wandering roll to monster type
export const WANDERING_TABLE_DISPLAY = [
  '',
  'Goblin (L1)',
  'Orc (L2)',
  'Troll (L3)',
  'Ogre (L4)',
  'Dragon (L5)',
  'Special'
];

/**
 * Create a monster instance
 * @param {string} type - Monster template key
 * @param {number} level - Override level (optional)
 * @returns {object} Monster object
 */
export const createMonster = (type, level = null) => {
  const template = MONSTER_TEMPLATES[type];
  if (!template) return null;
    const effectiveLevel = level || template.level;
    // Check if this is a Minor Foe (Vermin or Minion)
  const isMinorFoe = (type === 'vermin' || type === 'minion' || type === 'minions');
  
  if (isMinorFoe) {
    // Minor Foes spawn as groups with count
    let count;
    if (type === 'vermin') {
      // Vermin: Roll 2d6
      count = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
    } else if (type === 'minion' || type === 'minions') {
      // Minions: Roll d6+2
      count = Math.floor(Math.random() * 6) + 1 + 2;
    }
    
    return {
      id: Date.now() + Math.random(),
      name: template.name,
      level: effectiveLevel,
      hp: 1, // Minor Foes always have 1 HP each
      maxHp: 1,
      count, // Current count
      initialCount: count, // Starting count for morale checks
      type,
      special: template.special,
      xp: template.xp || effectiveLevel,
      moraleMod: template.moraleMod || 0, // Morale modifier (e.g., -1 for cowardly, +1 for courageous)
      reaction: null, // Set when first encountered
      statuses: [], // Active status effects (sleeping, etc.)
      isMinorFoe: true
    };
  }
  
  // Major Foes and other monsters
  const hp = calculateMonsterHP(type, effectiveLevel);
  
  return {
    id: Date.now() + Math.random(),
    name: template.name,
    level: effectiveLevel,
    hp,
    maxHp: hp,
    type,
    special: template.special,
    xp: template.xp || effectiveLevel,
    moraleMod: template.moraleMod || 0, // Morale modifier (e.g., -1 for cowardly, +1 for courageous)
    reaction: null, // Set when first encountered
    statuses: [] // Active status effects (sleeping, etc.)
  };
};

/**
 * Roll monster reaction (legacy wrapper)
 * @param {object} monster - Optional monster for custom reaction table
 * @returns {object} Reaction result
 */
export const rollReaction = (monster = null) => {
  return rollMonsterReaction(monster);
};

/**
 * Get monster ability details
 * @param {string} abilityKey - Ability key
 * @returns {object|null} Ability details
 */
export const getMonsterAbility = (abilityKey) => {
  return MONSTER_ABILITIES[abilityKey] || null;
};

/**
 * Apply monster ability effect
 * @param {object} monster - Monster with ability
 * @param {string} trigger - Current trigger event
 * @param {object} context - Additional context (targets, etc.)
 * @returns {object} Effect result
 */
export const applyMonsterAbility = (monster, trigger, context = {}) => {
  if (!monster.special) return null;
  
  const ability = MONSTER_ABILITIES[monster.special];
  if (!ability || ability.trigger !== trigger) return null;
  
  const result = {
    ability: monster.special,
    abilityName: ability.name,
    monster: monster.name,
    effect: ability.effect
  };
  
  switch (ability.effect) {
    case 'heal':
      result.value = ability.value;
      result.message = `${monster.name} regenerates ${ability.value} HP!`;
      break;
    case 'aoe_attack':
      result.damage = ability.damage;
      result.message = `${monster.name} uses ${ability.name}! All heroes take ${ability.damage} damage!`;
      break;
    case 'multi_attack':
      result.attacks = ability.attacks;
      result.message = `${monster.name} attacks ${ability.attacks} times!`;
      break;
    case 'apply_poison':
      result.saveThreshold = ability.saveThreshold;
      result.message = `${monster.name}'s attack is poisonous! Save DC${ability.saveThreshold} or be poisoned!`;
      break;
    default:
      result.message = `${monster.name}'s ${ability.name} activates!`;
  }
  
  return result;
};

/**
 * Calculate XP needed for next level
 * @param {number} currentLevel - Current character level
 * @returns {number} XP needed
 */
export const getXPForNextLevel = (currentLevel) => {
  // XP thresholds: L1→L2: 10, L2→L3: 25, L3→L4: 50, L4→L5: 100
  const thresholds = [0, 10, 25, 50, 100, Infinity];
  return thresholds[currentLevel] || Infinity;
};

/**
 * Check if hero can level up
 * @param {object} hero - Hero object
 * @returns {boolean} True if can level up
 */
export const canLevelUp = (hero) => {
  if (hero.lvl >= 5) return false;
  return (hero.xp || 0) >= getXPForNextLevel(hero.lvl);
};
