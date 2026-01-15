# Four Against Darkness - App Audit Plan

## Overview

This document outlines a comprehensive audit of the 4AD digital companion app to ensure all necessary game mechanics from the base rules, exploration, and combat systems are properly implemented.

**Last Updated**: January 15, 2026

## ✅ PHASE 6 IMPLEMENTATION COMPLETE

### Phase 6 Key Updates (Campaign Mode & Analytics)

- ✅ **Campaign Mode**: Multi-adventure persistence for party, gold, levels
- ✅ **Analytics Dashboard**: Stats tracking across adventures
- ✅ **Adventure Management**: Complete/Start new adventures

### Phase 5 Key Updates (Polish & Enhancement)

- ✅ **Rules Reference Panel**: Expandable sections for all game mechanics
- ✅ **Save/Load System**: Multiple save slots with export/import
- ✅ **Enhanced Map Features**: Room markers, tooltips, legends
- ✅ **Theme System**: Modern Dark and RPGUI Classic themes

### Phase 4 Key Updates (Save System & Advanced Combat)

- ✅ **Save Roll System**: d6 saves on lethal damage with re-roll options
- ✅ **Advanced Combat**: Exploding dice, monster abilities, reactions
- ✅ **Magic System**: Full spell casting for Wizards and Elves
- ✅ **Class Abilities**: Cleric Heal/Bless, Barbarian Rage, Halfling Luck
- ✅ **XP & Leveling**: Automatic XP awards and level-up system
- ✅ **Flee Mechanic**: Party can attempt to escape combat
- ✅ **Status Effects**: Blessed, Wounded, Dead states tracked

### Previous Phase Updates

- ✅ **Dice Roller Verified**: All dice functions (d6, 2d6, d66) tested and working correctly
- ✅ **Monster Tracking System**: Full HP tracking for multiple monsters
- ✅ **Room Generation Tables**: d66 room generation with auto-spawn
- ✅ **Treasure System**: Automated treasure rolling
- ✅ **Wandering Monsters**: d6 wandering monster table
- ✅ **Class Ability Tracking**: Heals, Blessings, and Spell slots for Clerics, Wizards, and Elves
- ✅ **Encounters Tab**: New dedicated UI for room generation and monster management

--------------------------------------------------------------------------------

## 🔴 MAJOR MISSING CONTENT SUMMARY

### Missing Character Classes (from characters.txt)

The app currently has **8 classes**, but the full rules include **17+ classes**:

Class               | Status        | Notes
------------------- | ------------- | -----------------------------------
Warrior             | ✅ Implemented | Basic class
Cleric              | ✅ Implemented | Heal×3, Bless×3
Rogue               | ✅ Implemented | +L defense
Wizard              | ✅ Implemented | L+2 spells
Barbarian           | ✅ Implemented | Rage ability
Halfling            | ✅ Implemented | L+1 Luck
Dwarf               | 🔄 Partial    | Missing Gold Sense ability
Elf                 | ✅ Implemented | L spells
**Acrobat**         | ❌ Missing     | Tricks (L+3 pts), +L Defense
**Assassin**        | ❌ Missing     | Hide in Shadows, triple damage
**Bulwark**         | ❌ Missing     | Shield sacrifice, L+7 Life
**Druid**           | ❌ Missing     | 2+L spells, Animal Companion
**Gnome**           | ❌ Missing     | Gadgets (L+6 pts), Illusions
**Illusionist**     | ❌ Missing     | Illusion spells, Distracting Lights
**Kukla**           | ❌ Missing     | Living doll, Secret Compartment
**Light Gladiator** | ❌ Missing     | Two weapon fighting
**Mushroom Monk**   | ❌ Missing     | Flurry of Blows, Spores
**Paladin**         | ❌ Missing     | L+1 prayer points, +L attack
**Ranger**          | ❌ Missing     | Dual weapons, Sworn Enemy
**Swashbuckler**    | ❌ Missing     | Panache points

### Missing Spell Lists (from magic.txt)

**Currently Implemented Spells**: 9 basic spells

**Missing Spell Categories**:

- ❌ **Druid Spells** (12 spells): Disperse Vermin, Summon Beast, Water Jet, Bear Form, Warp Wood, Barkskin, Lightning Strike, Spiderweb, Entangle, Subdual, Forest Pathway, Alter Weather
- ❌ **Illusionist Spells** (12+ spells): Illusionary Armor, Mirror Image, Illusionary Servant, Disbelief, Phantasmal Binding, Illusionary Fog, Glamour Mask, Shadow Strike, etc.
- ❌ **Blessing spell** (for Elves - divine law forbids, but clerics have it)
- ❌ **Protection spell** (basic wizard spell, creates +1 Defense barrier)

### Missing Equipment System (from equipment.txt)

**Currently**: No equipment tracking UI

**Missing Items**:

- ❌ Weapon types: Bow, Hand Weapon, Light Weapon, Sling, Crossbow, Two-Handed Weapon
- ❌ Armor types: Light Armor (+1 Def), Heavy Armor (+2 Def), Shield (+1 Def)
- ❌ Consumables: Bandage (heals 1), Healing Potion (heals all), Holy Water
- ❌ Utility: Lantern, Torch, Rope, 10' Pole, Flask of Flammable Oil
- ❌ Magic items: Amulet (1 Luck), Talisman (+1 Save), Scroll of Blessing

### Missing Reaction Types (from combat.txt)

**Currently Implemented**: Basic reactions (Hostile, Wary, Neutral, Friendly)

**Missing Reactions**:

- ❌ **Offer Food and Rest** - heals all PCs 1 Life
- ❌ **Peaceful** - won't fight, can't take treasure
- ❌ **Ignore** - can steal single item with Stealth save
- ❌ **Flee** - PCs get +1 attack as they run
- ❌ **Flee if Outnumbered** - conditional flee
- ❌ **Bribe** - pay gp/items to pass
- ❌ **Puzzle** - wizard +L to solve
- ❌ **Quest** - triggers Quest Table
- ❌ **Magic Challenge** - spellcasting duel
- ❌ **Trade Information** - buy/sell Clues
- ❌ **Capture** - non-lethal, kidnap mechanic
- ❌ **Blood Offering** - lose 2 Life to pass
- ❌ **Trial of Champions** - 1v1 duel

### Missing Combat Mechanics (from combat.txt)

**Initiative & Surprise**:

- ❌ Surprise system (X-in-6 chance for monsters)
- ❌ Ranged attacks always strike first
- ❌ Reaction-based initiative (waiting vs attacking first)

**Minor Foe Multi-Kill**:

- ❌ Attack roll ÷ Foe Level = number killed (core rule!)
- Example: Roll 9 vs L3 goblins = 3 goblins killed

**Major Foe Mechanics**:

- ❌ Level reduced by 1 when below half HP
- ❌ Multiple attacks per turn tracking

**Marching Order Combat**:

- ❌ Corridor restrictions (only positions 1-2 fight melee)
- ❌ Ranged/spell from positions 3-4
- ❌ Narrow corridor rules (-1 two-handed, no penalty light)

**Fleeing Mechanics**:

- ❌ Withdraw vs Flee distinction
- ❌ Withdraw: slam door, +1 Defense
- ❌ Flee: no shield bonus, lose gear if killed

**Morale System**:

- ❌ Minor Foes test morale at 50% (d6: 1-3 flee, 4+ fight)
- ❌ Morale modifiers per monster type

--------------------------------------------------------------------------------

## COMPREHENSIVE GAP ANALYSIS

### Legend

- ✅ = Implemented and working
- 🔄 = Partially implemented or needs verification
- ❌ = Not implemented (confirmed missing)

--------------------------------------------------------------------------------

## 1\. PARTY MANAGEMENT 🔄

### Current Implementation (8 classes)

- [x] Add/remove heroes (max 4)
- [x] Class selection (8 basic classes only)
- [x] Level management (1-5)
- [x] HP tracking (current/max)
- [x] Name editing
- [x] HCL (Hero Combat Level) calculation
- [x] Class ability tracking (Cleric, Wizard, Elf, Barbarian, Halfling)
- [x] XP tracking (Phase 4)
- [x] Luck tracking (Halfling)
- [x] Rage tracking (Barbarian)

### Gaps Remaining

- ❌ **9 additional character classes** (see table above)
- ❌ Character equipment UI (structure exists, no UI)
- ❌ Equipment bonuses applied to rolls
- ❌ Character traits (each class has d6 trait table)
- ❌ Dwarf Gold Sense ability
- ❌ Stealth modifiers per class
- ❌ Advanced Skills system (L5+ unlocks)

### Class-Specific Missing Abilities

Class | Missing Ability
----- | ----------------------------------------------------
Dwarf | Gold Sense (save vs L6 to see treasure before fight)
Rogue | Outnumbered bonus only vs Minor Foes
All   | Class trait tables (d6 per class)
All   | Stealth modifiers

--------------------------------------------------------------------------------

## 2\. DUNGEON EXPLORATION ✅

### Current Implementation

- [x] Grid-based dungeon mapping (20×28)
- [x] Room/corridor placement
- [x] Door placement on edges
- [x] Search mechanic
- [x] Room generation with d66 tables
- [x] Wandering monster encounters

### Gaps Remaining

- ❌ **Corridor vs Room distinction** affecting combat
- ❌ **Narrow corridor rules**
- ❌ Secret door discovery (1-in-6 shortcut out)
- ❌ Secret passage to different environment
- ❌ Hidden treasure complications (alarm, trap, ghost)
- ❌ Retracing steps wandering monster chance (1-in-6)
- ❌ Final Boss trigger (roll 6+ on d6 + major foes)

--------------------------------------------------------------------------------

## 3\. COMBAT SYSTEM 🔄

### Current Implementation

- [x] Attack/Defense rolls with modifiers
- [x] Exploding 6s
- [x] Monster HP tracking
- [x] Monster special abilities (regenerate, breath, etc.)
- [x] Flee mechanic
- [x] Basic reactions (4 types)

### Critical Missing Combat Rules

1. ❌ **Minor Foe Multi-Kill** (attack ÷ level = kills)
2. ❌ **Initiative System** (surprise, ranged first)
3. ❌ **Marching Order in combat** (corridor restrictions)
4. ❌ **Withdraw vs Flee** mechanics
5. ❌ **Morale checks** (50% triggers d6 roll)
6. ❌ **Major Foe level reduction** at half HP
7. ❌ **13 additional Reaction types**

### Combat Tables Status

- [x] Monster stat blocks (basic)
- ❌ Monster treasure tables by type
- ❌ Quest table
- ❌ Epic rewards table

--------------------------------------------------------------------------------

## 4\. MAGIC SYSTEM 🔄

### Current Implementation

- [x] 9 basic spells (Fireball, Lightning, Sleep, Shield, etc.)
- [x] Spell slot tracking
- [x] Wizard (L+2) and Elf (L) spell counts

### Missing Spell Systems

- ❌ **Druid spells** (12 nature spells)
- ❌ **Illusionist spells** (12+ illusion spells)
- ❌ **Protection spell** (basic wizard, +1 Defense)
- ❌ **Scroll usage** (find/use scrolls as loot)
- ❌ **Magic Resistance** mechanic (MR rating)
- ❌ **Spell targeting** (single vs AoE vs Minor Foe groups)

--------------------------------------------------------------------------------

## 5\. EQUIPMENT SYSTEM ❌

### Current Status: Not Implemented

**Missing Equipment Categories**:

Category      | Items
------------- | ---------------------------------------------------------------------
Weapons       | Bow, Crossbow (+1), Sling (-1), Light (-1), Hand (0), Two-Handed (+1)
Armor         | Light (+1 Def), Heavy (+2 Def, -1 Stealth)
Shield        | +1 Defense, +1 to Saves
Light Sources | Lantern, Torch (6 rooms)
Consumables   | Bandage (1 heal), Healing Potion (full heal), Holy Water
Utility       | Rope (+1 climb), 10' Pole (+1 trap saves), Food Rations
Magic Items   | Amulet (1 Luck), Talisman (+1 Save)

**Missing Weapon Mechanics**:

- ❌ Crushing vs Slashing damage types
- ❌ Silver weapons (+1 vs were-creatures)
- ❌ Torch (+2 vs flammable)
- ❌ Two-handed penalty in corridors

--------------------------------------------------------------------------------

## 6\. RESOURCE TRACKING 🔄

### Current Implementation

- [x] Gold, Clues, Minor/Major encounters
- [x] Class ability usage (heals, spells, luck)

### Missing Resources

- ❌ Food Rations (survival in wilderness)
- ❌ Torches/Lanterns (darkness penalties)
- ❌ Bandages (1 per PC per adventure)
- ❌ Carried treasure weight (200gp max per PC)
- ❌ Weapon/shield counts (3 weapons, 2 shields max)

--------------------------------------------------------------------------------

## 7\. LOG & SAVE SYSTEM ✅

Mostly complete, minor gaps:

- ❌ Log timestamps
- ❌ Log filtering by type

--------------------------------------------------------------------------------

## 8\. RULES REFERENCE ✅

Complete as of Phase 5.

--------------------------------------------------------------------------------

## 9\. UI/UX 🔄

### Implemented

- [x] Themes, maps, tabs, tooltips

### Missing

- ❌ Equipment management UI
- ❌ Marching order combat display
- ❌ Corridor vs Room indicator
- ❌ Victory/defeat screens

--------------------------------------------------------------------------------

## 10\. SAVE ROLLS (Survival) ✅

Fully implemented in Phase 4.

--------------------------------------------------------------------------------

## 11\. CAMPAIGN MODE ✅

Mostly complete:

- ❌ Story beats/narrative log

--------------------------------------------------------------------------------

## PRIORITY IMPLEMENTATION ROADMAP

### Phase 7a: Core Combat Fixes (HIGH PRIORITY)

1. **Minor Foe Multi-Kill** - Attack roll ÷ level = kills
2. **Initiative System** - Surprise, ranged first
3. **Morale Checks** - 50% triggers flee roll
4. **Major Foe HP reduction** - -1 Level at half HP

### Phase 7b: Equipment System

1. Equipment data structures
2. Equipment UI (equip/unequip)
3. Weapon/armor bonuses to rolls
4. Consumable usage (bandages, potions)

### Phase 7c: Missing Classes (9 classes)

Priority order based on unique mechanics:

1. Paladin (prayer points, mount)
2. Ranger (dual weapons, sworn enemy)
3. Druid (animal companion, druid spells)
4. Acrobat (tricks system)
5. Assassin (hide in shadows)
6. Illusionist (illusion spells)
7. Others...

### Phase 7d: Complete Reaction System

Add all 13+ reaction types with proper resolution.

### Phase 7e: Spell Expansion

1. Protection spell (basic, missing)
2. Druid spell list (12 spells)
3. Illusionist spell list (12+ spells)
4. Scroll system (find/use)

--------------------------------------------------------------------------------

## TESTING CHECKLIST

### Functionality Tests

- [ ] Create party of 4 different classes
- [ ] Test all combat scenarios (hit/miss/kill)
- [ ] Map full 20×28 grid
- [ ] Test all door placements
- [ ] Verify HP tracking accuracy
- [ ] Test gold calculations
- [ ] Verify localStorage persistence
- [ ] Test reset functionality

### Edge Cases

- [ ] Empty party behavior
- [ ] Max level characters
- [ ] 0 HP characters
- [ ] Full grid mapping
- [ ] Negative gold
- [ ] Invalid dice rolls

--------------------------------------------------------------------------------

## CONCLUSION

The app has a solid foundation covering basic gameplay, but is missing approximately:

- **9 character classes** (50%+ of classes from rules)
- **24+ spells** (Druid + Illusionist lists)
- **Complete equipment system**
- **Core combat mechanics** (minor foe multi-kill, initiative, morale)
- **13+ reaction types**

For casual play with basic classes, the app works well. For complete 4AD rules coverage, significant additions are needed.
