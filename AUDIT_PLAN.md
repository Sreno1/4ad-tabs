# Four Against Darkness - App Audit Plan

## Overview

This document outlines a comprehensive audit of the 4AD digital companion app to ensure all necessary game mechanics from the base rules, exploration, and combat systems are properly implemented.

**Last Updated**: January 14, 2026

## ✅ PHASE 2 IMPLEMENTATION COMPLETE

### Key Updates

- ✅ **Dice Roller Verified**: All dice functions (d6, 2d6, d66) tested and working correctly
- ✅ **Monster Tracking System**: Full HP tracking for multiple monsters
- ✅ **Room Generation Tables**: d66 room generation with auto-spawn
- ✅ **Treasure System**: Automated treasure rolling
- ✅ **Wandering Monsters**: d6 wandering monster table
- ✅ **Class Ability Tracking**: Heals, Blessings, and Spell slots for Clerics, Wizards, and Elves
- ✅ **Encounters Tab**: New dedicated UI for room generation and monster management

--------------------------------------------------------------------------------

## 1\. PARTY MANAGEMENT ✅

### Current Implementation

- [x] Add/remove heroes (max 4)
- [x] Class selection (8 classes: Warrior, Cleric, Rogue, Wizard, Barbarian, Halfling, Dwarf, Elf)
- [x] Level management (1-5)
- [x] HP tracking (current/max)
- [x] Name editing
- [x] HCL (Hero Combat Level) calculation
- [x] **NEW**: Class ability tracking (Cleric: Heals×3, Bless×3; Wizard/Elf: Spell slots)

### Missing Features

- [ ] Character equipment tracking
- [ ] Character special items/treasures
- [ ] Character XP tracking
- [ ] Luck tracking (Halfling)
- [ ] Rage tracking (Barbarian)
- [ ] Character notes/status effects

### Class-Specific Mechanics to Track

- **Warrior**: All weapons/armor access
- **Cleric**: ✅ Heal×3, Bless×3 uses per adventure
- **Rogue**: Trap disarm bonus, outnumbered attack bonus
- **Wizard**: ✅ Spell slot usage (L+2 slots)
- **Barbarian**: Rage state, no magic restriction
- **Halfling**: Luck points (L+1)
- **Dwarf**: Gold sense ability
- **Elf**: ✅ Spell usage (L spells)

--------------------------------------------------------------------------------

## 2\. DUNGEON EXPLORATION ✅

### Current Implementation

- [x] Grid-based dungeon mapping (20×28)
- [x] Room/corridor placement (click to cycle)
- [x] Door placement on edges
- [x] Door counter
- [x] Search mechanic (basic d6 roll)
- [x] Clear grid function
- [x] **NEW**: Room generation with d66 tables
- [x] **NEW**: Automated monster spawning based on room type
- [x] **NEW**: Treasure generation system
- [x] **NEW**: Wandering monster encounters (d6)

### Recently Implemented ✅

- [x] **Room Generation Tables**

  - [x] Room type determination (d66)
  - [x] Empty room outcomes
  - [x] Vermin encounters (auto-spawn)
  - [x] Boss encounters (auto-spawn at HCL+1)
  - [x] Major Foe encounters (auto-spawn at HCL)
  - [x] Minion encounters (auto-spawn L2)

- [x] **Wandering Monsters**

  - [x] Wandering monster table (d6)
  - [x] Monster level determination (1-5)
  - [x] Auto-spawn from table

- [x] **Treasure System**

  - [x] Treasure roll tables (d6)
  - [x] Gold calculation (d6 or 2d6)
  - [x] Clue discovery
  - [x] Magic items placeholder

### Still Missing

- [ ] **Passage/Corridor System**

  - [ ] Direction determination
  - [ ] Length calculation
  - [ ] Dead end checks
  - [ ] Secret door discovery

- [ ] **Door Mechanics**

  - [ ] Door type (normal, stuck, locked, trapped)
  - [ ] Opening checks
  - [ ] Trap detection (Rogue bonus)
  - [ ] Lock picking

- [ ] **Special Encounters**

  - [ ] Shrine/altar effects
  - [ ] Trap rooms (detailed mechanics)
  - [ ] Puzzle rooms
  - [ ] NPC encounters

- [ ] **Clue System**

  - [x] Counter
  - [ ] Clue usage for boss room
  - [ ] Final battle unlock requirements

--------------------------------------------------------------------------------

## 3\. COMBAT SYSTEM 🔄

### Current Implementation

- [x] Foe level setting
- [x] Attack rolls (d6 + mods)
- [x] Defense rolls (d6 + mods)
- [x] Hit calculation (level threshold)
- [x] HP reduction on failed defense
- [x] Combat log (15 entries)
- [x] Class-specific attack bonuses
- [x] Class-specific defense bonuses (Rogue)

### Missing Features

- [ ] **Initiative System**

  - [ ] Who attacks first
  - [ ] Surprise rounds

- [ ] **Monster Stats**

  - [ ] Monster HP tracking
  - [ ] Multiple monsters per encounter
  - [ ] Monster special abilities
  - [ ] Boss monster mechanics

- [ ] **Advanced Combat Mechanics**

  - [ ] Exploding 6s (roll again, add result)
  - [ ] Critical failures on 1
  - [ ] Flanking/positioning
  - [ ] Ranged vs melee

- [ ] **Magic in Combat**

  - [ ] Spell casting interface
  - [ ] Spell effects resolution
  - [ ] Spell slot consumption

- [ ] **Special Combat Actions**

  - [ ] Fleeing (roll to escape)
  - [ ] Healing (Cleric ability)
  - [ ] Blessing (Cleric ability)
  - [ ] Rage (Barbarian ability)
  - [ ] Luck usage (Halfling)

- [ ] **Combat Outcomes**

  - [ ] Death/unconsciousness
  - [ ] Victory rewards (XP, gold, treasure)
  - [ ] Retreat consequences

- [ ] **Monster Groups**

  - [ ] Multiple foes attacking
  - [ ] Group tactics
  - [ ] Target selection

### Combat Tables Needed

- [ ] Monster stat blocks by level
- [ ] Monster special abilities
- [ ] Boss monster characteristics
- [ ] Loot tables by monster type

--------------------------------------------------------------------------------

## 4\. DICE MECHANICS ✅

### Current Implementation

- [x] d6 roller
- [x] 2d6 roller
- [x] d66 roller (d6×10 + d6)
- [x] Result display

### Missing Features

- [ ] **Advanced Rolling**

  - [ ] Exploding dice (6 = roll again and add)
  - [ ] Roll with advantage/disadvantage
  - [ ] Modifiable roll results

- [ ] **Roll History**

  - [ ] Last N rolls stored
  - [ ] Roll type tracking
  - [ ] Undo last roll?

--------------------------------------------------------------------------------

## 5\. RESOURCE TRACKING 🔄

### Current Implementation

- [x] Gold tracking (+/- buttons)
- [x] Gold d6 increment
- [x] Minor encounters counter
- [x] Major foes counter
- [x] Clues counter
- [x] Door counter

### Missing Features

- [ ] **Adventure Progress**

  - [ ] Rooms explored counter
  - [ ] Rooms remaining estimate
  - [ ] Boss defeated flag
  - [ ] Adventure completion state

- [ ] **Party Resources**

  - [ ] Torches/light sources
  - [ ] Rations/food
  - [ ] Healing potions
  - [ ] Magic items in use

- [ ] **Consumable Tracking**

  - [ ] Cleric heal uses (3/adventure)
  - [ ] Cleric bless uses (3/adventure)
  - [ ] Wizard spell slots
  - [ ] Halfling luck points
  - [ ] Barbarian rage uses

- [ ] **Victory Conditions**

  - [ ] Kill boss monster
  - [ ] Find minimum clues
  - [ ] Collect treasure goal
  - [ ] Survive X rooms

--------------------------------------------------------------------------------

## 6\. LOG SYSTEM ✅

### Current Implementation

- [x] Combat log entries
- [x] Search results
- [x] Scrollable history
- [x] Clear on reset

### Missing Features

- [ ] **Enhanced Logging**

  - [ ] Timestamp entries
  - [ ] Color coding by event type
  - [ ] Filter by category (combat/exploration/loot)
  - [ ] Export log to file

- [ ] **Important Events**

  - [ ] Level ups
  - [ ] Death/resurrection
  - [ ] Boss encounters
  - [ ] Major treasure finds
  - [ ] Trap triggers

--------------------------------------------------------------------------------

## 7\. SAVE/LOAD SYSTEM ✅

### Current Implementation

- [x] Auto-save to localStorage
- [x] Load on startup
- [x] Reset functionality

### Missing Features

- [ ] **Multiple Save Slots**

  - [ ] Name your adventure
  - [ ] Multiple parties
  - [ ] Save timestamps

- [ ] **Export/Import**

  - [ ] Export to JSON file
  - [ ] Import saved games
  - [ ] Share adventures

- [ ] **Auto-Save Configuration**

  - [ ] Configurable auto-save
  - [ ] Manual save button
  - [ ] Save before dangerous actions

--------------------------------------------------------------------------------

## 8\. RULES REFERENCE 📚

### Missing Features (Critical)

- [ ] **Quick Reference**

  - [ ] Class abilities summary
  - [ ] Combat rules reminder
  - [ ] Common DCs/thresholds
  - [ ] Search result interpretation

- [ ] **Table Access**

  - [ ] Quick lookup for d66 results
  - [ ] Monster tables by level
  - [ ] Treasure tables
  - [ ] Trap tables

- [ ] **Tutorial/Help**

  - [ ] First-time user guide
  - [ ] Tooltips for game mechanics
  - [ ] Link to full rules PDF

--------------------------------------------------------------------------------

## 9\. UI/UX IMPROVEMENTS 🎨

### Current State

- [x] Mobile-first tabbed interface
- [x] Desktop multi-column layout
- [x] Dice roller in header
- [x] Dark theme

### Suggested Enhancements

- [ ] **Accessibility**

  - [ ] High contrast mode
  - [ ] Font size options
  - [ ] Screen reader support
  - [ ] Keyboard shortcuts

- [ ] **Visual Feedback**

  - [ ] Animations for rolls
  - [ ] Victory/defeat screens
  - [ ] Level up celebrations
  - [ ] Sound effects (optional)

- [ ] **Dungeon Map**

  - [ ] Room labels/numbers
  - [ ] Monster markers
  - [ ] Treasure markers
  - [ ] Current position indicator
  - [ ] Fog of war (hide unexplored)
  - [ ] Zoom controls
  - [ ] Export map as image

--------------------------------------------------------------------------------

## 10\. ADVANCED FEATURES (Future)

### Campaign Mode

- [ ] Multiple adventures linked
- [ ] Character persistence between adventures
- [ ] Campaign victory conditions
- [ ] Story beats/narrative

### Multiplayer

- [ ] Share party with others
- [ ] Co-op dungeon crawling
- [ ] Async play support

### Custom Content

- [ ] Custom classes
- [ ] Custom monsters
- [ ] Custom treasures
- [ ] House rules toggles

### Analytics

- [ ] Success rate tracking
- [ ] Death statistics
- [ ] Treasure found totals
- [ ] Most used classes

--------------------------------------------------------------------------------

## PRIORITY IMPLEMENTATION ORDER

### Phase 1: Core Mechanics (MVP Complete)

1. ✅ Basic party management
2. ✅ Basic dungeon mapping
3. ✅ Basic combat system
4. ✅ Dice rolling
5. ✅ Basic resource tracking

### Phase 2: Essential Game Rules

1. ✅ Monster tracking with HP
2. ✅ Room generation tables (d66)
3. ✅ Wandering monster encounters
4. ✅ Treasure generation
5. ✅ Class ability tracking (heals, blessings, spells)

### Phase 3: Complete Exploration

1. Door mechanics (types, traps)
2. Corridor/passage system
3. Trap detection & resolution
4. Special rooms (shrines, puzzles)
5. Boss room mechanics

### Phase 4: Advanced Combat

1. Multiple monsters per encounter
2. Monster special abilities
3. Magic system (spell casting)
4. Special actions (flee, rage, luck)
5. Combat XP and leveling

### Phase 5: Polish & Enhancement

1. Rules reference panel
2. Save/load multiple games
3. Export/import functionality
4. Enhanced map features
5. Tutorial system

### Phase 6: Advanced Features

1. Campaign mode (make sure gold equipment, levels, minion count, and clues etc carry over)
2. Custom content support
3. Statistics tracking
4. Achievement system

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

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Performance

- [ ] Large combat log handling
- [ ] Extensive dungeon maps
- [ ] Multiple localStorage operations
- [ ] Rapid button clicking

--------------------------------------------------------------------------------

## NOTES

### Current Code Issues

1. **BUG**: Dice roll function returns early (line 2 in `roll()`)

  ```javascript
  // CURRENT (BROKEN):
  const roll = (n, sides = 6, mod = 0) => { let t = 0; for (let i = 0; i < n; i++) return t + mod; };

  // SHOULD BE:
  const roll = (n, sides = 6, mod = 0) => { 
   let t = 0; 
   for (let i = 0; i < n; i++) t += Math.floor(Math.random() * sides) + 1; 
   return t + mod; 
  };
  ```

2. **Missing**: Actual dice randomization in roll function

3. **Missing**: Reducer implementation for combat actions

4. **Incomplete**: Search results don't trigger monster encounters or treasure

### Design Decisions Needed

1. How to handle character death? (permadeath, unconscious, revival)
2. Should the app enforce rules or allow flexibility?
3. How detailed should monster tracking be?
4. Should the app auto-roll or let players roll physical dice?

--------------------------------------------------------------------------------

## CONCLUSION

The current app has a solid foundation with:

- ✅ Party management basics
- ✅ Dungeon mapping system
- ✅ Basic combat mechanics
- ✅ Dice roller interface
- ✅ Save/load functionality

Critical missing features for full gameplay:

1. 🔴 **Working dice roller** (current bug)
2. 🔴 Monster HP tracking
3. 🔴 Room generation tables
4. 🔴 Treasure system
5. 🔴 Class ability tracking (heals, spells, etc.)
6. 🔴 Complete combat rules (exploding 6s, multiple foes)

With these additions, the app would support complete Four Against Darkness gameplay from the base rules, exploration, and combat systems.
