/**
 * Trait Data - Character trait definitions for all classes
 * Traits provide unique bonuses and abilities to characters
 */

/**
 * Trait Schema
 */
export const TraitSchema = {
  required: ['key', 'name', 'description', 'benefit'],
  optional: ['requiresChoice', 'choices', 'uses']
};

/**
 * All Character Traits organized by class
 */
export const TRAITS = {
  // Warrior Traits
  warrior: [
    { key: 'goodShot', name: 'Good Shot', description: 'Gain +1 to Attack rolls with ranged weapons', benefit: '+1 ranged attack' },
    { key: 'shieldExpert', name: 'Shield Expert', description: 'Once per adventure, reduce damage by 1 with shield', benefit: '1x per adventure: -1 damage (with shield)' },
    { key: 'powerStrike', name: 'Power Strike', description: 'Once per adventure, one attack inflicts +1 damage', benefit: '1x per adventure: +1 damage' },
    { key: 'intuitiveTeamTactics', name: 'Intuitive Team Tactics', description: 'Once per combat, +1 to ally Defense or Attack roll', benefit: '1x per combat: +1 to ally roll' },
    { key: 'tightGuard', name: 'Tight Guard', description: 'Gain +1 to Defense vs. first attack in every combat', benefit: '+1 Defense vs first attack' },
    { key: 'swordMaceTraining', name: 'Sword/Mace Training', description: 'Add +Tier to chosen weapon type', benefit: '+Tier to chosen weapon', requiresChoice: true, choices: ['sword', 'mace'] }
  ],

  // Acrobat Traits
  acrobat: [
    { key: 'gracefulDodge', name: 'Graceful Dodge', description: 'Once per combat, reduce damage by 1', benefit: '1x per combat: -1 damage' },
    { key: 'quickClimber', name: 'Quick Climber', description: 'Add +Tier on Climbing Saves', benefit: '+Tier climbing saves' },
    { key: 'masterOfEvasion', name: 'Master of Evasion', description: 'Use Evade ability without spending Trick points', benefit: 'Free Evade trick' },
    { key: 'distractingFeint', name: 'Distracting Feint', description: 'Once per combat, prevent Foe from performing next attack', benefit: '1x per combat: skip foe attack' },
    { key: 'distract', name: 'Distract', description: 'Once per combat, reduce Foe L by 1 for one turn', benefit: '1x per combat: -1 to Foe L' },
    { key: 'quickDrawTalent', name: 'Quick Draw Talent', description: 'Draw/exchange weapons instantly', benefit: 'Instant weapon swap' }
  ],

  // Wizard Traits
  wizard: [
    { key: 'arcaneMemory', name: 'Arcane Memory', description: 'You have 1 additional spell slot', benefit: '+1 spell slot' },
    { key: 'keenObserver', name: 'Keen Observer', description: 'You have +1 on Search rolls', benefit: '+1 Search' },
    { key: 'spellEfficiency', name: 'Spell Efficiency', description: 'Once per adventure, cast spell without removing from slot', benefit: '1x per adventure: free spell' },
    { key: 'sygilist', name: 'Sygilist', description: 'Add +Tier to scroll/inscription spellcasting rolls', benefit: '+Tier to scroll casting' },
    { key: 'scrapper', name: 'Scrapper', description: 'Gain +1 Defense, ignore light weapon penalty', benefit: '+1 Defense, ignore light weapon penalty', requiresChoice: true, choices: ['stick', 'dagger'] },
    { key: 'specialist', name: 'Specialist', description: 'Add +Tier to chosen spell', benefit: '+Tier to chosen spell', requiresChoice: true, choices: ['lightning', 'sleep', 'fireball'] }
  ],

  // Cleric Traits
  cleric: [
    { key: 'blessedTouch', name: 'Blessed Touch', description: 'Once per adventure, heal Tier Life for free', benefit: '1x per adventure: heal Tier Life (free)' },
    { key: 'divineProtection', name: 'Divine Protection', description: 'Once per adventure, +1 Defense and Saves for one combat', benefit: '1x per adventure: +1 Defense & Saves (1 combat)' },
    { key: 'chantOfValor', name: 'Chant of Valor', description: 'Once per adventure, +1 Attack to all allies for one turn', benefit: '1x per adventure: +1 Attack to all allies (1 turn)' },
    { key: 'strengthOfSpirit', name: 'Strength of Spirit', description: 'Once per adventure, survive at 1 Life when reduced to 0 or below', benefit: '1x per adventure: survive at 1 Life' },
    { key: 'shieldwall', name: 'Shieldwall', description: 'Once per adventure, +1 Defense for you and shield ally for encounter', benefit: '1x per adventure: +1 Defense (you & ally with shields)' },
    { key: 'guardianStance', name: 'Guardian Stance', description: 'Take hits for adjacent allies', benefit: 'Take hits for adjacent allies' }
  ],

  // Barbarian Traits
  barbarian: [
    { key: 'berserkFighting', name: 'Berserk Fighting', description: 'Once per adventure, +1 damage all attacks one combat, then -1 Attack rest of adventure', benefit: '1x per adventure: +1 damage all attacks (1 combat)' },
    { key: 'herbalKnowledge', name: 'Herbal Knowledge', description: 'Once per adventure, find herbs to heal d3 Life', benefit: '1x per adventure: heal d3 Life' },
    { key: 'survivalInstinct', name: 'Survival Instinct', description: '+1 wilderness rolls or avoid 1 encounter/trap per adventure', benefit: '+1 wilderness rolls or avoid 1 encounter/trap' },
    { key: 'toughSkinned', name: 'Tough Skinned', description: 'Once per combat, reduce damage by 1', benefit: '1x per combat: -1 damage' },
    { key: 'literate', name: 'Literate', description: 'You can read texts', benefit: 'Can read texts' },
    { key: 'ironWill', name: 'Iron Will', description: 'Reroll failed Saves vs Madness or mental effects', benefit: 'Reroll mental saves' }
  ],

  // Dwarf Traits
  dwarf: [
    { key: 'armorMastery', name: 'Armor Mastery', description: 'Once per combat, reduce damage by 1 in heavy armor', benefit: '1x per combat: -1 damage (heavy armor)' },
    { key: 'shieldBash', name: 'Shield Bash', description: 'Once per combat, counterattack after successful Defense', benefit: '1x per combat: counterattack after dodge' },
    { key: 'braceForImpact', name: 'Brace for Impact', description: 'Once per combat, reduce damage by 1', benefit: '1x per combat: -1 damage' },
    { key: 'stubbornEndurance', name: 'Stubborn Endurance', description: 'Once per adventure, survive at 2 Life when reduced to 1 or 0', benefit: '1x per adventure: survive at 2 Life' },
    { key: 'goldSense', name: 'Gold Sense', description: 'Add +Tier to treasure Search rolls', benefit: '+Tier to treasure searches' },
    { key: 'stoneborn', name: 'Stoneborn', description: 'Add +1 to Saves vs stone traps', benefit: '+1 vs stone traps' }
  ],

  // Elf Traits
  elf: [
    { key: 'bladesong', name: 'Bladesong', description: 'Once per adventure, +1 Attack with sword/spear/bow', benefit: '1x per adventure: +1 Attack (sword/spear/bow)' },
    { key: 'forestBorn', name: 'Forest Born', description: '+1 forest navigation, prevent 1 surprise per outdoor adventure', benefit: '+1 forest rolls, prevent 1 surprise' },
    { key: 'feyGrace', name: 'Fey Grace', description: 'Once per combat, reduce melee damage by 1 and disengage', benefit: '1x per combat: -1 damage & disengage' },
    { key: 'spellwoven', name: 'Spellwoven', description: 'Once per adventure, cast spell without forgetting it', benefit: '1x per adventure: cast spell without forgetting' },
    { key: 'silverTongue', name: 'Silver Tongue', description: 'Add +Tier to social Saves', benefit: '+Tier to social saves' },
    { key: 'elidrasMelody', name: 'Elidra\'s Melody', description: 'Once per adventure, calm creature or reroll Reaction', benefit: '1x per adventure: calm creature or reroll Reaction' }
  ],

  // Halfling Traits
  halfling: [
    { key: 'luckySidestep', name: 'Lucky Sidestep', description: 'L times per adventure, reroll failed Save', benefit: 'Lx per adventure: reroll failed Save' },
    { key: 'ironStomach', name: 'Iron Stomach', description: 'Immune to ingested poison, +Tier vs poison/gas', benefit: 'Immune to ingested poison, +Tier vs poison/gas' },
    { key: 'fungiForager', name: 'Fungi Forager', description: 'Once per adventure, find rare mushroom or healing fungus', benefit: '1x per adventure: mushroom benefits' },
    { key: 'comfortingCook', name: 'Comforting Cook', description: 'When Resting, you and one ally recover +1 Life', benefit: 'When resting: +1 Life for you & 1 ally' },
    { key: 'nimble', name: 'Nimble', description: 'Add +1 to Defense and trap Saves', benefit: '+1 Defense & trap saves' },
    { key: 'smallTarget', name: 'Small Target', description: 'Add +1 Defense vs large ranged attacks', benefit: '+1 Defense vs large ranged attacks' }
  ],

  // Rogue Traits
  rogue: [
    { key: 'backstab', name: 'Backstab', description: 'Once per combat, deal +Tier damage on surprise attack', benefit: '1x per combat: +Tier damage (surprise)' },
    { key: 'trapExpert', name: 'Trap Expert', description: 'Add +Tier to trap/lock Saves', benefit: '+Tier to trap/lock saves' },
    { key: 'quickFingers', name: 'Quick Fingers', description: 'Once per adventure, auto-pickpocket', benefit: '1x per adventure: auto-pickpocket' },
    { key: 'shadowStep', name: 'Shadow Step', description: 'Once per combat, reposition after dodge', benefit: '1x per combat: reposition after dodge' },
    { key: 'poisoner', name: 'Poisoner', description: 'Once per adventure, poison weapon for +1 damage', benefit: '1x per adventure: poison weapon (+1 damage)' },
    { key: 'streetwise', name: 'Streetwise', description: 'Add +Tier urban social, find underworld contact', benefit: '+Tier urban social, find underworld contact' }
  ],

  // Additional classes...
  paladin: [
    { key: 'armorMastery', name: 'Armor Mastery', description: 'Once per combat, reduce damage by 1 in heavy armor', benefit: '1x per combat: -1 damage (heavy armor)' },
    { key: 'mountedFighter', name: 'Mounted Fighter', description: 'Gain +Tier Attack while mounted', benefit: '+Tier Attack while mounted' },
    { key: 'challenge', name: 'Challenge', description: 'Force Foe to target you', benefit: 'Force Foe to target you' },
    { key: 'oathbound', name: 'Oathbound', description: 'Gain +L vs charm/fear effects', benefit: '+L vs charm/fear effects' },
    { key: 'shieldWall', name: 'Shield Wall', description: 'You and adjacent shield ally gain +1 Defense', benefit: '+1 Defense (you & adjacent ally with shields)' },
    { key: 'encouragingPresence', name: 'Encouraging Presence', description: 'Allies +Tier vs fear/madness if you lead', benefit: 'Allies +Tier vs fear/madness (if leading)' }
  ],

  ranger: [
    { key: 'trackMaster', name: 'Track Master', description: 'Save +Tier to avoid surprise', benefit: 'Save +Tier to avoid surprise' },
    { key: 'forager', name: 'Forager', description: 'Once per adventure, find 4 rations or heal d6 Life', benefit: '1x per adventure: find 4 rations or heal d6 Life' },
    { key: 'beastWhisperer', name: 'Beast Whisperer', description: 'Alter animal Reaction by 2', benefit: 'Alter animal Reaction by 2' },
    { key: 'snareMaster', name: 'Snare Master', description: 'Once per adventure, auto-disarm outdoor trap', benefit: '1x per adventure: auto-disarm outdoor trap' },
    { key: 'stealthMaster', name: 'Stealth Master', description: 'Add +Tier Stealth outdoors', benefit: '+Tier Stealth outdoors' },
    { key: 'swornEnemy', name: 'Sworn Enemy', description: 'Higher Tier die vs chosen enemy', benefit: 'Higher Tier die vs chosen enemy', requiresChoice: true, choices: ['undead', 'dragons', 'goblins', 'orcs', 'trolls', 'giants'] }
  ],

  druid: [
    { key: 'wildform', name: 'Wildform', description: 'Once per adventure, shapeshift for 10 minutes', benefit: '1x per adventure: shapeshift (10 min)' },
    { key: 'beastFriend', name: 'Beast Friend', description: 'Alter animal Reaction by 1', benefit: 'Alter animal Reaction by 1' },
    { key: 'verdantBlessing', name: 'Verdant Blessing', description: 'Once per adventure, heal d3 Life in natural setting', benefit: '1x per adventure: heal d3 Life (natural setting)' },
    { key: 'leafsteelFamiliarity', name: 'Leafsteel Familiarity', description: 'Gain +1 Defense with leafsteel armor', benefit: '+1 Defense (leafsteel armor)' },
    { key: 'naturesBounty', name: 'Nature\'s Bounty', description: 'Once per adventure, find 2 rations or heal 1 Life', benefit: '1x per adventure: find 2 rations or heal 1 Life' },
    { key: 'rootbind', name: 'Rootbind', description: 'Once per adventure, entangle Foe (skip turn)', benefit: '1x per adventure: entangle Foe (skip turn)' }
  ],

  assassin: [
    { key: 'backstab', name: 'Backstab', description: 'Once per combat, deal +Tier damage on surprise attack', benefit: '1x per combat: +Tier damage (surprise)' },
    { key: 'poisoner', name: 'Poisoner', description: 'Once per adventure, poison weapon for +1 damage', benefit: '1x per adventure: poison weapon (+1 damage)' },
    { key: 'shadowStep', name: 'Shadow Step', description: 'Once per combat, reposition after dodge', benefit: '1x per combat: reposition after dodge' },
    { key: 'deadlyPrecision', name: 'Deadly Precision', description: 'Once per adventure, triple damage', benefit: '1x per adventure: triple damage' },
    { key: 'disguiseMaster', name: 'Disguise Master', description: 'Add +Tier disguise, 1x auto-success', benefit: '+Tier disguise, 1x auto-success' },
    { key: 'silentKill', name: 'Silent Kill', description: 'Silent kills', benefit: 'Silent kills' }
  ],

  illusionist: [
    { key: 'phantomReflex', name: 'Phantom Reflex', description: 'Once per combat, auto-dodge with illusion', benefit: '1x per combat: auto-dodge with illusion' },
    { key: 'glamourSpecialist', name: 'Glamour Specialist', description: 'Gain +Tier social saves with illusions', benefit: '+Tier social saves (with illusions)' },
    { key: 'misdirection', name: 'Misdirection', description: 'Once per adventure, redirect attack to phantom', benefit: '1x per adventure: redirect attack to phantom' },
    { key: 'shadowAdept', name: 'Shadow Adept', description: 'Add +Tier Shadow Strike rolls', benefit: '+Tier Shadow Strike rolls' },
    { key: 'hazyVeil', name: 'Hazy Veil', description: 'Once per adventure, +Tier Defense for encounter', benefit: '1x per adventure: +Tier Defense (1 encounter)' },
    { key: 'spectralTrickster', name: 'Spectral Trickster', description: 'Once per adventure, vanish and flee or attack', benefit: '1x per adventure: vanish & flee or attack' }
  ],

  swashbuckler: [
    { key: 'quickFeint', name: 'Quick Feint', description: 'Once per adventure, -2 to Foe L for next attack', benefit: '1x per adventure: -2 to Foe L (next attack)' },
    { key: 'arenaReflexes', name: 'Arena Reflexes', description: 'Once per combat, flee after dodge', benefit: '1x per combat: flee after dodge' },
    { key: 'nimbleStep', name: 'Nimble Step', description: '+Tier vs traps/area dangers', benefit: '+Tier vs traps/area dangers' },
    { key: 'twinStrikePrecision', name: 'Twin Strike Precision', description: '+1 damage if both attacks hit', benefit: '+1 damage if both attacks hit' },
    { key: 'opportunist', name: 'Opportunist', description: 'Once per combat, counterattack after dodge', benefit: '1x per combat: counterattack after dodge' },
    { key: 'dashingPresence', name: 'Dashing Presence', description: 'Add +Tier social saves (charm/seduce)', benefit: '+Tier social saves (charm/seduce)' }
  ],

  bulwark: [
    { key: 'shieldwall', name: 'Shieldwall', description: 'Once per adventure, +1 Defense for you and shield ally for encounter', benefit: '1x per adventure: +1 Defense (you & ally with shields)' },
    { key: 'guardianStance', name: 'Guardian Stance', description: 'Take hits for adjacent allies', benefit: 'Take hits for adjacent allies' },
    { key: 'ironWill', name: 'Iron Will', description: 'Reroll mental saves', benefit: 'Reroll mental saves' },
    { key: 'shieldBash', name: 'Shield Bash', description: 'Once per combat, counterattack after dodge', benefit: '1x per combat: counterattack after dodge' },
    { key: 'braceForImpact', name: 'Brace for Impact', description: 'Once per combat, reduce damage by 1', benefit: '1x per combat: -1 damage' },
    { key: 'stubbornEndurance', name: 'Stubborn Endurance', description: 'Once per adventure, survive at 2 Life', benefit: '1x per adventure: survive at 2 Life' }
  ],

  gnome: [
    { key: 'illusionistsTrick', name: 'Illusionist\'s Trick', description: 'Once per adventure, free illusion spell', benefit: '1x per adventure: free illusion spell' },
    { key: 'clockworkArmorSpecialist', name: 'Clockwork Armor Specialist', description: '+1 Defense vs first attack in clockwork armor', benefit: '+1 Defense vs first attack (clockwork armor)' },
    { key: 'trapExpert', name: 'Trap Expert', description: 'Add +Tier trap/lock saves', benefit: '+Tier trap/lock saves' },
    { key: 'keenNose', name: 'Keen Nose', description: '+2 vs gases, 1x prevent surprise', benefit: '+2 vs gases, 1x prevent surprise' },
    { key: 'clockworkGrenadier', name: 'Clockwork Grenadier', description: 'Once per adventure, throw grenade (2 damage)', benefit: '1x per adventure: throw grenade (2 damage)' },
    { key: 'tinkerer', name: 'Tinkerer', description: 'Repair items, 1x improvise gadget', benefit: 'Repair items, 1x improvise gadget' }
  ],

  lightGladiator: [
    { key: 'quickFeint', name: 'Quick Feint', description: 'Once per adventure, -2 to Foe L for next attack', benefit: '1x per adventure: -2 to Foe L (next attack)' },
    { key: 'arenaReflexes', name: 'Arena Reflexes', description: 'Once per combat, flee after dodge', benefit: '1x per combat: flee after dodge' },
    { key: 'nimbleStep', name: 'Nimble Step', description: '+Tier vs traps/area dangers', benefit: '+Tier vs traps/area dangers' },
    { key: 'twinStrikePrecision', name: 'Twin Strike Precision', description: '+1 damage if both attacks hit', benefit: '+1 damage if both attacks hit' },
    { key: 'opportunist', name: 'Opportunist', description: 'Once per combat, counterattack after dodge', benefit: '1x per combat: counterattack after dodge' },
    { key: 'crowdFavorite', name: 'Crowd Favorite', description: 'Add +Tier social saves (crowds/public)', benefit: '+Tier social saves (crowds/public)' }
  ],

  mushroomMonk: [
    { key: 'highKicks', name: 'High Kicks', description: 'No penalty on kicks (1=lose turn)', benefit: 'No penalty on kicks (1=lose turn)' },
    { key: 'poisonousFlesh', name: 'Poisonous Flesh', description: 'Once per combat, poison biter (1 damage)', benefit: '1x per combat: poison biter (1 damage)' },
    { key: 'slowRegeneration', name: 'Slow Regeneration', description: '+1 Life per adventure (auto-heal)', benefit: '+1 Life per adventure (auto-heal)' },
    { key: 'toughCap', name: 'Tough Cap', description: '+1 Defense (fungal cap)', benefit: '+1 Defense (fungal cap)' },
    { key: 'sporeCloud', name: 'Spore Cloud', description: 'Once per combat, -1 to all Foe L for 1 turn', benefit: '1x per combat: -1 to all Foe L (1 turn)' },
    { key: 'fungalResilience', name: 'Fungal Resilience', description: 'Add +Tier vs poison/disease/rot', benefit: '+Tier vs poison/disease/rot' }
  ],

  kukla: [
    { key: 'hairMastery', name: 'Hair Mastery', description: 'Once per adventure, +L to trap/lock', benefit: '1x per adventure: +L to trap/lock' },
    { key: 'hiddenBlade', name: 'Hidden Blade', description: 'Once per encounter, surprise attack', benefit: '1x per encounter: surprise attack' },
    { key: 'reinforcedBody', name: 'Reinforced Body', description: 'Gain +1 Life', benefit: '+1 Life' },
    { key: 'spiritLimbs', name: 'Spirit Limbs', description: 'Once per adventure, repair limb', benefit: '1x per adventure: repair limb' },
    { key: 'hairTangle', name: 'Hair Tangle', description: 'Once per combat, restrain foe', benefit: '1x per combat: restrain foe' },
    { key: 'clockworkReflexes', name: 'Clockwork Reflexes', description: 'Reroll trap saves & ranged defense', benefit: 'Reroll trap saves & ranged defense' }
  ]
};

/**
 * Helper Functions
 */
export function getTraitsForClass(classKey) {
  return TRAITS[classKey] || [];
}

export function hasTraits(classKey) {
  return classKey in TRAITS && TRAITS[classKey].length > 0;
}

export function getTrait(classKey, traitKey) {
  const traits = getTraitsForClass(classKey);
  return traits.find(t => t.key === traitKey) || null;
}

export default {
  TRAITS,
  TraitSchema,
  getTraitsForClass,
  hasTraits,
  getTrait
};
