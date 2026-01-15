/**
 * Character Traits System
 * Optional traits for various character classes
 */

// Warrior Traits
export const WARRIOR_TRAITS = [
  {
    key: "goodShot",
    name: "Good Shot",
    description: "Gain +1 to Attack rolls with ranged weapons",
    benefit: "+1 ranged attack",
  },
  {
    key: "shieldExpert",
    name: "Shield Expert",
    description:
      "Once per adventure, if you carry a shield, reduce damage from one attack by 1. This may bring damage to zero.",
    benefit: "1x per adventure: -1 damage (with shield)",
  },
  {
    key: "powerStrike",
    name: "Power Strike",
    description:
      "Once per adventure, one of your attacks inflicts +1 damage. Use this Trait after performing the Attack roll.",
    benefit: "1x per adventure: +1 damage",
  },
  {
    key: "intuitiveTeamTactics",
    name: "Intuitive Team Tactics",
    description:
      "Once per combat, give a +1 to a single Defense or Attack roll performed by an ally. You can't use this Trait if the party was surprised.",
    benefit: "1x per combat: +1 to ally roll",
  },
  {
    key: "tightGuard",
    name: "Tight Guard",
    description:
      "Gain +1 to Defense rolls vs. the first attack targeting you in every combat.",
    benefit: "+1 Defense vs first attack",
  },
  {
    key: "swordMaceTraining",
    name: "Sword/Mace Training",
    description:
      "Choose mace or sword (blunt or slashing hand weapon). Add +Tier to Attack rolls with that weapon.",
    benefit: "+Tier to chosen weapon",
    requiresChoice: true,
    choices: ["sword", "mace"],
  },
];

// Acrobat Traits
export const ACROBAT_TRAITS = [
  {
    key: "gracefulDodge",
    name: "Graceful Dodge",
    description:
      "Once per combat, reduce damage from a physical attack by 1. This may bring damage to zero.",
    benefit: "1x per combat: -1 damage",
  },
  {
    key: "quickClimber",
    name: "Quick Climber",
    description: "You add +Tier on Climbing Saves.",
    benefit: "+Tier climbing saves",
  },
  {
    key: "masterOfEvasion",
    name: "Master of Evasion",
    description:
      "You may use your Evade ability without spending any Trick points.",
    benefit: "Free Evade trick",
  },
  {
    key: "distractingFeint",
    name: "Distracting Feint",
    description:
      "Once per combat, prevent a Foe from performing their next attack. Foes with more than 1 attack will skip a single attack, not their complete turn. You must be in melee contact to use this ability. You cannot use this ability in a corridor if you are in the rearguard.",
    benefit: "1x per combat: skip foe attack",
  },
  {
    key: "distract",
    name: "Distract",
    description:
      "Once per combat and for a single turn, reduce a Foe's L by 1. You must be in melee with the Foe to use this ability. You cannot use this ability in a corridor if you are in the rearguard.",
    benefit: "1x per combat: -1 to Foe L",
  },
  {
    key: "quickDrawTalent",
    name: "Quick Draw Talent",
    description:
      "You may draw a weapon or exchange weapons in no time, for example putting away a sling and drawing a dagger in the same turn, and attacking. You may still perform a single Attack roll per turn.",
    benefit: "Instant weapon swap",
  },
];

// Wizard Traits
export const WIZARD_TRAITS = [
  {
    key: "arcaneMemory",
    name: "Arcane Memory",
    description: "You have 1 additional spell slot.",
    benefit: "+1 spell slot",
  },
  {
    key: "keenObserver",
    name: "Keen Observer",
    description: "You have +1 on Search rolls.",
    benefit: "+1 Search",
  },
  {
    key: "spellEfficiency",
    name: "Spell Efficiency",
    description:
      "Once per adventure, you may cast a spell without removing it from your spell slot.",
    benefit: "1x per adventure: free spell",
  },
  {
    key: "sygilist",
    name: "Sygilist",
    description:
      "Add +Tier to your spellcasting rolls when casting spells from a scroll or from an inscription.",
    benefit: "+Tier to scroll casting",
  },
  {
    key: "scrapper",
    name: "Scrapper",
    description:
      "Gain +1 to Defense rolls. Ignore the -1 on Attack rolls when using a light weapon of your choice (stick or dagger).",
    benefit: "+1 Defense, ignore light weapon penalty",
    requiresChoice: true,
    choices: ["stick", "dagger"],
  },
  {
    key: "specialist",
    name: "Specialist",
    description:
      "Choose Lightning, Sleep or Fireball. Add +Tier to your spellcasting roll when casting that spell.",
    benefit: "+Tier to chosen spell",
    requiresChoice: true,
    choices: ["lightning", "sleep", "fireball"],
  },
];

// Kukla Traits
export const KUKLA_TRAITS = [
  {
    key: "hairMastery",
    name: "Hair Mastery",
    description:
      "Once per adventure, you may use your hair to disarm a Trap or open a lock without using your hands with a +L bonus instead of your usual +1/2 L.",
    benefit: "1x per adventure: +L to trap/lock",
  },
  {
    key: "hiddenBlade",
    name: "Hidden Blade",
    description:
      "Once per encounter, you may draw a knife from your secret compartment as a free action and immediately make a surprise Attack.",
    benefit: "1x per encounter: surprise attack",
  },
  {
    key: "reinforcedBody",
    name: "Reinforced Body",
    description: "Gain +1 Life.",
    benefit: "+1 Life",
  },
  {
    key: "spiritLimbs",
    name: "Spirit Limbs",
    description:
      "Once per adventure, reattach a severed limb or repair your body.",
    benefit: "1x per adventure: repair limb",
  },
  {
    key: "hairTangle",
    name: "Hair Tangle",
    description:
      "Once per combat, entangle a Foe to restrain them. Damage inflicted on a restrained Foe is Subdual. If you flee the combat, you automatically release any bound Foe.",
    benefit: "1x per combat: restrain foe",
  },
  {
    key: "clockworkReflexes",
    name: "Clockwork Reflexes",
    description:
      "Your uncanny agility allows you to reroll all failed Saves vs. Traps (to avoid their effect, not to disarm them) and all Defense rolls vs. ranged attacks.",
    benefit: "Reroll trap saves & ranged defense",
  },
];

// Barbarian Traits
export const BARBARIAN_TRAITS = [
  {
    key: "berserkFighting",
    name: "Berserk Fighting",
    description:
      "Once per adventure, deal +1 extra damage with all of your attacks, for the duration of an entire combat. This is tiring: after using this Trait you are at -1 on all Attack rolls for the rest of the adventure.",
    benefit: "1x per adventure: +1 damage all attacks (1 combat)",
  },
  {
    key: "herbalKnowledge",
    name: "Herbal Knowledge",
    description:
      "Once per adventure, you can automatically find and prepare herbs, moss or mushrooms to heal d3 Life. You may not use this Trait in settings without vegetation.",
    benefit: "1x per adventure: heal d3 Life",
  },
  {
    key: "survivalInstinct",
    name: "Survival Instinct",
    description:
      "Gain +1 bonus on rolls to find food or avoid getting lost in the wilderness, or use this Trait to avoid 1 Wandering Monster encounter or 1 Trap, once per adventure.",
    benefit: "+1 wilderness rolls or avoid 1 encounter/trap",
  },
  {
    key: "toughSkinned",
    name: "Tough Skinned",
    description:
      "Once per combat, you may reduce damage from a single attack by 1. Damage can be lowered to zero.",
    benefit: "1x per combat: -1 damage",
  },
  {
    key: "literate",
    name: "Literate",
    description:
      "You can read - unusual for barbarians. You still are not allowed to cast spells from scrolls, but you may gain Clues, learn skills and other information from written texts.",
    benefit: "Can read texts",
  },
  {
    key: "ironWill",
    name: "Iron Will",
    description:
      "Reroll all failed Saves vs. Madness or mental effects (fear, charm, illusion, mermaid song, etc.).",
    benefit: "Reroll mental saves",
  },
];

// Cleric Traits
export const CLERIC_TRAITS = [
  {
    key: "blessedTouch",
    name: "Blessed Touch",
    description:
      "Once per adventure, you may use 1 turn to heal Tier Life without using a Healing prayer.",
    benefit: "1x per adventure: heal Tier Life (free)",
  },
  {
    key: "divineProtection",
    name: "Divine Protection",
    description:
      "Once per adventure, gain +1 to Defense rolls and Saves for the duration of a single combat.",
    benefit: "1x per adventure: +1 Defense & Saves (1 combat)",
  },
  {
    key: "chantOfValor",
    name: "Chant of Valor",
    description:
      "Once per adventure, you may give +1 to the Attack rolls of all allies, including hirelings and animal companions. The bonus lasts a single turn. This is a free action.",
    benefit: "1x per adventure: +1 Attack to all allies (1 turn)",
  },
  {
    key: "strengthOfSpirit",
    name: "Strength of Spirit",
    description:
      "When a blow reduces you to zero Life or below, you may remain at 1 Life instead. You may use this Trait only once per adventure.",
    benefit: "1x per adventure: survive at 1 Life",
  },
  {
    key: "shieldwall",
    name: "Shieldwall",
    description:
      "Once per adventure, if you and an adjacent ally both carry shields, both of you gain +1 Defense against melee attacks for the rest of the encounter.",
    benefit: "1x per adventure: +1 Defense (you & ally with shields)",
  },
  {
    key: "guardianStance",
    name: "Guardian Stance",
    description:
      "If an adjacent ally is attacked, you may take the hit instead. You must declare this before the Defense roll is made.",
    benefit: "Take hits for adjacent allies",
  },
];

// Dwarf Traits
export const DWARF_TRAITS = [
  {
    key: "armorMastery",
    name: "Armor Mastery",
    description:
      "Reduce damage from a physical attack by 1 while wearing heavy armor. This may bring damage to zero. Once per combat.",
    benefit: "1x per combat: -1 damage (heavy armor)",
  },
  {
    key: "shieldBash",
    name: "Shield Bash",
    description:
      "Once per combat, after a successful Defense roll, you may immediately perform an Attack roll against the Foe who missed you.",
    benefit: "1x per combat: counterattack after dodge",
  },
  {
    key: "braceForImpact",
    name: "Brace for Impact",
    description:
      "Once per combat, reduce damage from a single attack by 1. Damage can be lowered to zero.",
    benefit: "1x per combat: -1 damage",
  },
  {
    key: "stubbornEndurance",
    name: "Stubborn Endurance",
    description:
      "When a blow reduces you to 1 or 0 Life, you may remain at 2 Life instead. You can use this Trait once per adventure.",
    benefit: "1x per adventure: survive at 2 Life",
  },
  {
    key: "goldSense",
    name: "Gold Sense",
    description:
      "Add +Tier to Search rolls to find treasure or hidden valuables.",
    benefit: "+Tier to treasure searches",
  },
  {
    key: "stoneborn",
    name: "Stoneborn",
    description: "Add +1 to Saves vs. Traps involving stone mechanisms.",
    benefit: "+1 vs stone traps",
  },
];

// Elf Traits
export const ELF_TRAITS = [
  {
    key: "bladesong",
    name: "Bladesong",
    description:
      "Gain a +1 on Attack rolls with swords, spears or bows. You may use this Trait once per adventure.",
    benefit: "1x per adventure: +1 Attack (sword/spear/bow)",
  },
  {
    key: "forestBorn",
    name: "Forest Born",
    description:
      "Gain +1 on rolls to navigate forests or detect hidden things in nature. Once per outdoor adventure, you may prevent the party from being surprised by Wandering Monsters.",
    benefit: "+1 forest rolls, prevent 1 surprise",
  },
  {
    key: "feyGrace",
    name: "Fey Grace",
    description:
      "Once per combat encounter, you may dodge and reduce damage from a physical melee attack by 1. This can bring damage to zero. When you use this Trait, you may disengage from the melee and may run away, if desired, without suffering attacks.",
    benefit: "1x per combat: -1 damage & disengage",
  },
  {
    key: "spellwoven",
    name: "Spellwoven",
    description:
      "Once per adventure, you may cast a spell without forgetting it. In other words, you cast the spell but it remains memorized.",
    benefit: "1x per adventure: cast spell without forgetting",
  },
  {
    key: "silverTongue",
    name: "Silver Tongue",
    description:
      "You are highly charismatic and add +Tier on Saves to persuade, woo or negotiate with NPCs.",
    benefit: "+Tier to social saves",
  },
  {
    key: "elidrasMelody",
    name: "Elidra's Melody",
    description:
      "Once per adventure, you can play an instrument or sing to calm a hostile creature. You may use this Trait in combat to prevent a creature from attacking for a turn, or to reroll a Reaction roll.",
    benefit: "1x per adventure: calm creature or reroll Reaction",
  },
];

// Halfling Traits
export const HALFLING_TRAITS = [
  {
    key: "luckySidestep",
    name: "Lucky Sidestep",
    description: "Once per adventure per level, you may reroll a failed Save.",
    benefit: "Lx per adventure: reroll failed Save",
  },
  {
    key: "ironStomach",
    name: "Iron Stomach",
    description:
      "You are immune to ingested poison and add +Tier to all Saves vs. poison or gases.",
    benefit: "Immune to ingested poison, +Tier vs poison/gas",
  },
  {
    key: "fungiForager",
    name: "Fungi Forager",
    description:
      "Once per adventure, if you encounter any mushroom/fungi you may: 1) Find rare specimen worth 3d6gp; 2) Find mushrooms for a Nutritious Meal; 3) Find healing fungus to heal d6 Life; 4) Double Food rations from mushrooms.",
    benefit: "1x per adventure: mushroom benefits",
  },
  {
    key: "comfortingCook",
    name: "Comforting Cook",
    description:
      "When you Rest, you and one ally recover 1 extra Life. You must use 1 Food ration to use this trait.",
    benefit: "When resting: +1 Life for you & 1 ally",
  },
  {
    key: "nimble",
    name: "Nimble",
    description: "Add +1 to Defense rolls and Saves vs. Traps.",
    benefit: "+1 Defense & trap saves",
  },
  {
    key: "smallTarget",
    name: "Small Target",
    description:
      "Add +1 to Defense rolls vs. ranged attacks from creatures larger than you.",
    benefit: "+1 Defense vs large ranged attacks",
  },
];

// Rogue Traits
export const ROGUE_TRAITS = [
  {
    key: "backstab",
    name: "Backstab",
    description:
      "Once per combat, if you attack a Foe from behind or by surprise, deal +Tier extra damage.",
    benefit: "1x per combat: +Tier damage (surprise)",
  },
  {
    key: "trapExpert",
    name: "Trap Expert",
    description: "Add +Tier to Saves to disarm Traps or pick locks.",
    benefit: "+Tier to trap/lock saves",
  },
  {
    key: "quickFingers",
    name: "Quick Fingers",
    description:
      "Once per adventure, you may automatically pickpocket an NPC or steal a small item without being noticed.",
    benefit: "1x per adventure: auto-pickpocket",
  },
  {
    key: "shadowStep",
    name: "Shadow Step",
    description:
      "Once per combat, after a successful Defense roll, you may immediately move to any position in the Marching Order.",
    benefit: "1x per combat: reposition after dodge",
  },
  {
    key: "poisoner",
    name: "Poisoner",
    description:
      "Once per adventure, you may coat a weapon with poison. The next successful attack deals +1 damage.",
    benefit: "1x per adventure: poison weapon (+1 damage)",
  },
  {
    key: "streetwise",
    name: "Streetwise",
    description:
      "Add +Tier to social Saves in urban environments. Once per adventure in a town, you may automatically find a fence, black market contact, or criminal guild.",
    benefit: "+Tier urban social, find underworld contact",
  },
];

// Paladin Traits
export const PALADIN_TRAITS = [
  {
    key: "armorMastery",
    name: "Armor Mastery",
    description:
      "Reduce damage from a physical attack by 1 while wearing heavy armor. This may bring damage to zero. Once per combat.",
    benefit: "1x per combat: -1 damage (heavy armor)",
  },
  {
    key: "mountedFighter",
    name: "Mounted Fighter",
    description:
      "Gain +Tier bonus to Attack rolls while mounted. This is in addition to the standard mounted bonus.",
    benefit: "+Tier Attack while mounted",
  },
  {
    key: "challenge",
    name: "Challenge",
    description:
      "You may force a Foe to target you instead of allies for the duration of the whole combat or until you die. This will work even if this Foe Hates an ally or attacks random targets.",
    benefit: "Force Foe to target you",
  },
  {
    key: "oathbound",
    name: "Oathbound",
    description:
      "Gain +L bonus on Saves vs. effects that would force you to attack an ally or flee. If the description of the Save already says that paladins are unaffected, you may pass this bonus onto an ally.",
    benefit: "+L vs charm/fear effects",
  },
  {
    key: "shieldWall",
    name: "Shield Wall",
    description:
      "If you have a shield and are adjacent to an ally with a shield, you both gain +1 to Defense rolls.",
    benefit: "+1 Defense (you & adjacent ally with shields)",
  },
  {
    key: "encouragingPresence",
    name: "Encouraging Presence",
    description:
      "All allies gain +Tier bonus on Saves vs. Fear, Terror and Madness as long as you lead the Marching Order.",
    benefit: "Allies +Tier vs fear/madness (if leading)",
  },
];

// Ranger Traits
export const RANGER_TRAITS = [
  {
    key: "trackMaster",
    name: "Track Master",
    description:
      "You may ignore the surprise from Wandering Monsters if you roll a successful Save at +Tier.",
    benefit: "Save +Tier to avoid surprise",
  },
  {
    key: "forager",
    name: "Forager",
    description:
      "Once per adventure, if the setting allows, you can automatically find 4 Rations or enough healing herbs or mushrooms to heal d6 Life (distribute among allies and yourself).",
    benefit: "1x per adventure: find 4 rations or heal d6 Life",
  },
  {
    key: "beastWhisperer",
    name: "Beast Whisperer",
    description:
      "You may alter by 2 the Reaction rolls of wild animals. This affects only Foes with animal intelligence.",
    benefit: "Alter animal Reaction by 2",
  },
  {
    key: "snareMaster",
    name: "Snare Master",
    description:
      "Once per adventure, you may automatically disarm an outdoor snare/Trap. You may use this ability after failing a Save to disarm it.",
    benefit: "1x per adventure: auto-disarm outdoor trap",
  },
  {
    key: "stealthMaster",
    name: "Stealth Master",
    description: "Add +Tier to your Stealth Saves outdoors.",
    benefit: "+Tier Stealth outdoors",
  },
  {
    key: "swornEnemy",
    name: "Sworn Enemy",
    description:
      "Choose a type of Foe (undead, dragons, goblins, etc.). When fighting that Foe, use a higher Tier die for Stealth, Attack and Defense rolls.",
    benefit: "Higher Tier die vs chosen enemy",
    requiresChoice: true,
    choices: ["undead", "dragons", "goblins", "orcs", "trolls", "giants"],
  },
];

// Druid Traits
export const DRUID_TRAITS = [
  {
    key: "wildform",
    name: "Wildform",
    description:
      "Once per adventure, you may shapeshift into a small animal (fox, bird, etc.) for the duration of 1 encounter/10 minutes. In this form, you add +1/2L to your Defense rolls, you cannot attack.",
    benefit: "1x per adventure: shapeshift (10 min)",
  },
  {
    key: "beastFriend",
    name: "Beast Friend",
    description:
      "You may alter by 1 all Reaction rolls of natural animals (not magical beasts).",
    benefit: "Alter animal Reaction by 1",
  },
  {
    key: "verdantBlessing",
    name: "Verdant Blessing",
    description:
      "Once per adventure, you may restore d3 Life to yourself or an ally while in a natural environment, including towns, swamps, mountains, fungal grottoes, forests, jungles, gardens, etc.",
    benefit: "1x per adventure: heal d3 Life (natural setting)",
  },
  {
    key: "leafsteelFamiliarity",
    name: "Leafsteel Familiarity",
    description:
      "Gain a further +1 to Defense rolls when wearing leafsteel armor.",
    benefit: "+1 Defense (leafsteel armor)",
  },
  {
    key: "naturesBounty",
    name: "Nature's Bounty",
    description:
      "Once per adventure, while in the wilderness or in the fungal grottoes, you automatically find edible plants or herbs. They count as 2 Food rations or a potion that heals 1 Life point.",
    benefit: "1x per adventure: find 2 rations or heal 1 Life",
  },
  {
    key: "rootbind",
    name: "Rootbind",
    description:
      "Once per adventure, you can call upon the earth to entangle a Foe. The Foe loses its next turn as roots bind its legs. This Trait does not work against flying or incorporeal Foes.",
    benefit: "1x per adventure: entangle Foe (skip turn)",
  },
];

// Assassin Traits
export const ASSASSIN_TRAITS = [
  {
    key: "backstab",
    name: "Backstab",
    description:
      "Once per combat, if you attack a Foe from behind or by surprise, deal +Tier extra damage.",
    benefit: "1x per combat: +Tier damage (surprise)",
  },
  {
    key: "poisoner",
    name: "Poisoner",
    description:
      "Once per adventure, you may coat a weapon with poison. The next successful attack deals +1 damage.",
    benefit: "1x per adventure: poison weapon (+1 damage)",
  },
  {
    key: "shadowStep",
    name: "Shadow Step",
    description:
      "Once per combat, after a successful Defense roll, you may immediately move to any position in the Marching Order.",
    benefit: "1x per combat: reposition after dodge",
  },
  {
    key: "deadlyPrecision",
    name: "Deadly Precision",
    description:
      "Once per adventure, you may triple the damage of a single successful attack (after rolling damage).",
    benefit: "1x per adventure: triple damage",
  },
  {
    key: "disguiseMaster",
    name: "Disguise Master",
    description:
      "Add +Tier to Saves involving disguise or impersonation. Once per adventure, you may automatically fool an NPC with a disguise.",
    benefit: "+Tier disguise, 1x auto-success",
  },
  {
    key: "silentKill",
    name: "Silent Kill",
    description:
      "When you reduce a Foe to 0 Life, you may prevent it from making any noise, alerting others, or triggering alarms.",
    benefit: "Silent kills",
  },
];

// Illusionist Traits
export const ILLUSIONIST_TRAITS = [
  {
    key: "phantomReflex",
    name: "Phantom Reflex",
    description:
      "Once per combat, when a Foe attacks you, you create an Illusionary Double that takes the hit instead. This counts as an automatic miss. You may not use this Trait against artificial creatures that see through illusions.",
    benefit: "1x per combat: auto-dodge with illusion",
  },
  {
    key: "glamourSpecialist",
    name: "Glamour Specialist",
    description:
      "Gain +Tier on social/persuasion Saves when using disguise-based illusions.",
    benefit: "+Tier social saves (with illusions)",
  },
  {
    key: "misdirection",
    name: "Misdirection",
    description:
      "Once per adventure, you may force a Foe to attack a phantom target instead of an ally. The phantom target defends adding your L as its Defense roll bonus.",
    benefit: "1x per adventure: redirect attack to phantom",
  },
  {
    key: "shadowAdept",
    name: "Shadow Adept",
    description:
      "When casting Shadow Strike, add +Tier to your Spellcasting roll and treat it as magical damage.",
    benefit: "+Tier Shadow Strike rolls",
  },
  {
    key: "hazyVeil",
    name: "Hazy Veil",
    description:
      "Once per adventure, you may create an illusionary fog around yourself, adding +Tier to your Defense rolls until the end of the encounter.",
    benefit: "1x per adventure: +Tier Defense (1 encounter)",
  },
  {
    key: "spectralTrickster",
    name: "Spectral Trickster",
    description:
      "Once per adventure, after casting an illusion-type spell, you may vanish from sight for a few seconds. You may flee the melee without receiving an attack or perform a single out-of-turn melee attack at +Tier.",
    benefit: "1x per adventure: vanish & flee or attack",
  },
];

// Swashbuckler Traits
export const SWASHBUCKLER_TRAITS = [
  {
    key: "quickFeint",
    name: "Quick Feint",
    description:
      "Once per adventure, you may forgo one Attack to reduce a Foe's L by -2 against your next attack.",
    benefit: "1x per adventure: -2 to Foe L (next attack)",
  },
  {
    key: "arenaReflexes",
    name: "Arena Reflexes",
    description:
      "Once per combat encounter, after a successful Defense roll, you may immediately flee the melee without suffering any attacks.",
    benefit: "1x per combat: flee after dodge",
  },
  {
    key: "nimbleStep",
    name: "Nimble Step",
    description:
      "You have a +Tier bonus on Saves to avoid Traps or area dangers (such as collapsing floors, falling rocks, etc.).",
    benefit: "+Tier vs traps/area dangers",
  },
  {
    key: "twinStrikePrecision",
    name: "Twin Strike Precision",
    description:
      "If both your Attack rolls hit the same Foe in your turn, you deal +1 extra damage.",
    benefit: "+1 damage if both attacks hit",
  },
  {
    key: "opportunist",
    name: "Opportunist",
    description:
      "Once per combat, when you perform a successful Defense roll, you may immediately make a free off-hand Attack against the Foe that missed you. This attack happens in the Foe's turn.",
    benefit: "1x per combat: counterattack after dodge",
  },
  {
    key: "dashingPresence",
    name: "Dashing Presence",
    description: "Add +Tier to social Saves to impress, charm or seduce NPCs.",
    benefit: "+Tier social saves (charm/seduce)",
  },
];

// Bulwark Traits
export const BULWARK_TRAITS = [
  {
    key: "shieldwall",
    name: "Shieldwall",
    description:
      "Once per adventure, if you and an adjacent ally both carry shields, both of you gain +1 Defense against melee attacks for the rest of the encounter.",
    benefit: "1x per adventure: +1 Defense (you & ally with shields)",
  },
  {
    key: "guardianStance",
    name: "Guardian Stance",
    description:
      "If an adjacent ally is attacked, you may take the hit instead. You must declare this before the Defense roll is made. You are entitled to a Defense roll.",
    benefit: "Take hits for adjacent allies",
  },
  {
    key: "ironWill",
    name: "Iron Will",
    description:
      "Reroll all failed Saves vs. Madness or mental effects (fear, charm, illusion, etc.).",
    benefit: "Reroll mental saves",
  },
  {
    key: "shieldBash",
    name: "Shield Bash",
    description:
      "Once per combat, after a successful Defense roll, you may immediately perform an Attack roll against the Foe who missed you.",
    benefit: "1x per combat: counterattack after dodge",
  },
  {
    key: "braceForImpact",
    name: "Brace for Impact",
    description:
      "Once per combat, reduce damage from a single attack by 1. Damage can be lowered to zero.",
    benefit: "1x per combat: -1 damage",
  },
  {
    key: "stubbornEndurance",
    name: "Stubborn Endurance",
    description:
      "When a blow reduces you to 1 or 0 Life, you may remain at 2 Life instead. You can use this Trait once per adventure.",
    benefit: "1x per adventure: survive at 2 Life",
  },
];

// Gnome Traits
export const GNOME_TRAITS = [
  {
    key: "illusionistsTrick",
    name: "Illusionist's Trick",
    description:
      "Once per adventure, you may cast an additional Illusionist spell of your choice without using a spell slot.",
    benefit: "1x per adventure: free illusion spell",
  },
  {
    key: "clockworkArmorSpecialist",
    name: "Clockwork Armor Specialist",
    description:
      "When wearing clockwork armor, you gain an additional +1 Defense bonus vs. the first attack you receive in every combat. This bonus applies even if you do not spend any gadget points.",
    benefit: "+1 Defense vs first attack (clockwork armor)",
  },
  {
    key: "trapExpert",
    name: "Trap Expert",
    description:
      "Add +Tier on Saves to disarm Traps or lockpicking Saves. This bonus applies even when using gadgets.",
    benefit: "+Tier trap/lock saves",
  },
  {
    key: "keenNose",
    name: "Keen Nose",
    description:
      "Gain +2 on Saves vs. gases. Once per adventure, you may automatically prevent an encounter from surprising the party - you smell the Foes coming!",
    benefit: "+2 vs gases, 1x prevent surprise",
  },
  {
    key: "clockworkGrenadier",
    name: "Clockwork Grenadier",
    description:
      "Once per adventure, you may throw a grenade dealing 2 damage as a ranged attack before the melee begins. You may do this only if not surprised. You automatically inflict 2 damage on Major Foes and slay 2 Minor Foes.",
    benefit: "1x per adventure: throw grenade (2 damage)",
  },
  {
    key: "tinkerer",
    name: "Tinkerer",
    description:
      "You may repair broken mundane items (not magical) with a successful Save. Once per adventure, you may improvise a tool or gadget from scrap materials.",
    benefit: "Repair items, 1x improvise gadget",
  },
];

// Light Gladiator Traits
export const LIGHT_GLADIATOR_TRAITS = [
  {
    key: "quickFeint",
    name: "Quick Feint",
    description:
      "Once per adventure, you may forgo one Attack to reduce a Foe's L by -2 against your next attack.",
    benefit: "1x per adventure: -2 to Foe L (next attack)",
  },
  {
    key: "arenaReflexes",
    name: "Arena Reflexes",
    description:
      "Once per combat encounter, after a successful Defense roll, you may immediately flee the melee without suffering any attacks.",
    benefit: "1x per combat: flee after dodge",
  },
  {
    key: "nimbleStep",
    name: "Nimble Step",
    description:
      "You have a +Tier bonus on Saves to avoid Traps or area dangers (such as collapsing floors, falling rocks, etc.).",
    benefit: "+Tier vs traps/area dangers",
  },
  {
    key: "twinStrikePrecision",
    name: "Twin Strike Precision",
    description:
      "If both your Attack rolls hit the same Foe in your turn, you deal +1 extra damage.",
    benefit: "+1 damage if both attacks hit",
  },
  {
    key: "opportunist",
    name: "Opportunist",
    description:
      "Once per combat, when you perform a successful Defense roll, you may immediately make a free off-hand Attack against the Foe that missed you. This attack happens in the Foe's turn.",
    benefit: "1x per combat: counterattack after dodge",
  },
  {
    key: "crowdFavorite",
    name: "Crowd Favorite",
    description:
      "Add +Tier to social Saves when dealing with crowds or performing in public.",
    benefit: "+Tier social saves (crowds/public)",
  },
];

// Mushroom Monk Traits
export const MUSHROOM_MONK_TRAITS = [
  {
    key: "highKicks",
    name: "High Kicks",
    description:
      "Your kick attacks do not suffer the -1 modifier to Attack rolls like your other unarmed strikes. However, if you roll a 1 on a kick attack, you lose your balance and must spend your next turn recovering.",
    benefit: "No penalty on kicks (1=lose turn)",
  },
  {
    key: "poisonousFlesh",
    name: "Poisonous Flesh",
    description:
      "Once per combat, if you are bitten by a living Foe, that Foe suffers 1 damage 2 turns after biting. Your body may not be eaten when you die.",
    benefit: "1x per combat: poison biter (1 damage)",
  },
  {
    key: "slowRegeneration",
    name: "Slow Regeneration",
    description:
      "You may recover 1 Life per adventure, in addition to any Life recovered by healing.",
    benefit: "+1 Life per adventure (auto-heal)",
  },
  {
    key: "toughCap",
    name: "Tough Cap",
    description:
      "Your fungal cap is very sturdy and can be used as a shield. You gain a +1 to Defense rolls. If you die, your allies may use your cap to craft a nonmetallic shield.",
    benefit: "+1 Defense (fungal cap)",
  },
  {
    key: "sporeCloud",
    name: "Spore Cloud",
    description:
      "Once per combat, you may release a cloud of spores that reduces all Foes' L by 1 for one turn.",
    benefit: "1x per combat: -1 to all Foe L (1 turn)",
  },
  {
    key: "fungalResilience",
    name: "Fungal Resilience",
    description: "Add +Tier to Saves vs. poison, disease, and rotting effects.",
    benefit: "+Tier vs poison/disease/rot",
  },
];

// Trait mapping by class
export const CLASS_TRAITS = {
  warrior: WARRIOR_TRAITS,
  acrobat: ACROBAT_TRAITS,
  wizard: WIZARD_TRAITS,
  kukla: KUKLA_TRAITS,
  barbarian: BARBARIAN_TRAITS,
  cleric: CLERIC_TRAITS,
  dwarf: DWARF_TRAITS,
  elf: ELF_TRAITS,
  halfling: HALFLING_TRAITS,
  rogue: ROGUE_TRAITS,
  paladin: PALADIN_TRAITS,
  ranger: RANGER_TRAITS,
  druid: DRUID_TRAITS,
  assassin: ASSASSIN_TRAITS,
  illusionist: ILLUSIONIST_TRAITS,
  swashbuckler: SWASHBUCKLER_TRAITS,
  bulwark: BULWARK_TRAITS,
  gnome: GNOME_TRAITS,
  lightGladiator: LIGHT_GLADIATOR_TRAITS,
  mushroomMonk: MUSHROOM_MONK_TRAITS,
};

/**
 * Get traits available for a character class
 * @param {string} classKey - Character class key
 * @returns {Array} Array of trait objects
 */
export function getTraitsForClass(classKey) {
  return CLASS_TRAITS[classKey] || [];
}

/**
 * Check if a class has traits available
 * @param {string} classKey - Character class key
 * @returns {boolean}
 */
export function hasTraits(classKey) {
  return classKey in CLASS_TRAITS && CLASS_TRAITS[classKey].length > 0;
}

/**
 * Get trait by key for a specific class
 * @param {string} classKey - Character class key
 * @param {string} traitKey - Trait key
 * @returns {Object|null}
 */
export function getTrait(classKey, traitKey) {
  const traits = getTraitsForClass(classKey);
  return traits.find((t) => t.key === traitKey) || null;
}

/**
 * Random roll for trait (d6)
 * @param {string} classKey - Character class key
 * @returns {Object|null}
 */
export function rollRandomTrait(classKey) {
  const traits = getTraitsForClass(classKey);
  if (traits.length === 0) return null;

  const roll = Math.floor(Math.random() * 6); // 0-5, maps to traits[0-5]
  return traits[roll] || traits[0];
}
