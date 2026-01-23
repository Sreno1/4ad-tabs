# Four Against Darkness - Combat Rules Analysis

## Core Combat Mechanics

### Attack Resolution
- **Basic Roll**: d6 (explodes on 6)
- **Higher Tiers**: d8 (explodes on 7+), d10 (explodes on 8+), d12 (explodes on 9+), d20 (explodes on 10+)
- **Hit Calculation**: Roll + Modifiers ≥ Foe Level
- **Multi-Kill (Minor Foes)**: Total ÷ Foe Level = number killed
- **Damage (Major Foes)**: Total ÷ Foe Level = damage dealt (minimum 1 if hit)
- **Natural 1**: Always misses

### Defense Resolution
- **Basic Roll**: d6 (explodes on 6)
- **Block Calculation**: Roll + Modifiers > Foe Level
- **Failure**: Take 1 damage (or more based on foe)

## Class-Specific Combat Bonuses

### Full Martial Training (+L to Attack)
- **warrior**: +L melee & ranged
- **barbarian**: +L melee & ranged
- **elf**: +L all weapons EXCEPT two-handed melee
- **dwarf**: +L melee only (no ranged bonus)
- **paladin**: +L melee & ranged
- **assassin**: +L all weapons
- **ranger**: +L base attack
- **halfling**: +L with sling only

### Partial Martial Training (+½L to Attack)
- **cleric**: +½L base, +L vs undead
- **acrobat**: +½L attack
- **bulwark**: +½L melee, +Tier ranged
- **druid**: +½L attack
- **swashbuckler**: +½L attack
- **gnome**: No base attack bonus
- **kukla**: +1 with light blades
- **lightGladiator**: +½L with light weapons only
- **mushroomMonk**: +L with martial weapons (nunchaku/bo/sai/stars), +½L other

### Defense Bonuses
- **rogue**: +L to defense
- **acrobat**: +½L to defense
- **bulwark**: +½L to defense
- **gnome**: +½L to defense
- **kukla**: +½L to defense
- **lightGladiator**: +½L to defense
- **mushroomMonk**: +½L to defense
- **swashbuckler**: +½L to defense
- **halfling**: +L vs large enemies (giants/trolls/ogres)
- **dwarf**: +1 vs large enemies (giants/trolls/ogres)

### Special Class Bonuses
- **elf**: +1 vs orcs
- **dwarf**: +1 vs goblins
- **rogue**: +L when attacking outnumbered Minor Foes
- **ranger**: +½L dual wielding, +2 vs sworn enemy

## Equipment Modifiers

### Weapons - Attack Bonuses
- **Light weapon** (dagger, knife, club): -1
- **Hand weapon** (sword, mace, axe): 0
- **Two-handed weapon**: +1
- **Crossbow**: +1
- **Bow**: 0
- **Sling**: -1
- **Handgun**: +2
- **Black powder rifle**: +3
- **Throwing stars**: -1 (max 1 damage)
- **Torch** (vs flammable): +2

### Weapons - Special Properties
- **Crushing vs skeleton**: +1
- **Silver vs were-creature**: +1
- **Gilded vs elemental**: +2
- **Envenomed**: +1 (one use)
- **Magic weapon**: +1 (permanent)

### Armor - Defense Bonuses
- **Light armor**: +1
- **Heavy armor**: +2
- **Shield**: +1
- **Leafsteel armor**: +2 (non-magical)

### Special Equipment
- **Lantern/Torch**: Required for light
- **Rope**: +1 climbing saves
- **10' pole**: +1 vs traps (except party-wide/random)

## Situational Modifiers

### Environmental
- **Darkness** (no light source): -2 attack, -2 defense, -2 saves (unless darkvision)
- **Narrow corridor**: Two-handed weapons -1 (total becomes -1 instead of +1), light weapons 0 (penalty negated)

### Combat State
- **Unarmed**: -2 attack
- **Subdual attack**: -1 attack
- **Bound target**: +2 attack
- **Mounted**: +1 attack vs foot
- **Surprise**: Shields don't apply on first defense roll
- **Withdrawing**: +1 defense
- **Fleeing**: No shield bonus

### Spell Enhancements
- **Protection spell**: +1 defense
- **Barkskin**: +2 defense (but -2 vs fire)
- **Illusionary Armor**: +Tier defense
- **Blessed**: +1 attack

### Class Abilities
- **Barbarian rage**: +2 attack, triple die roll (choose best), double damage
- **Assassin hidden strike**: +2L attack (3x damage)
- **Light Gladiator parry**: +2 defense
- **Swashbuckler panache dodge**: +2 defense
- **Acrobat trick**: +2 defense

## Foe Types & Combat

### Minor Foes (Vermin/Minions)
- **Life**: 1 each
- **Multi-kill**: Attack total ÷ Foe Level = kills
- **Morale**: Check when reduced below half initial count (d6: 1-3 flee, 4+ fight)
- **XP**: 1 per 10 encounters

### Major Foes (Weird Monsters/Bosses)
- **Life**: Multiple (Tier+X)
- **Damage**: Each successful attack deals 1+ damage
- **Level Reduction**: At half Life, reduce Level by 1
- **XP**: 1 per Major Foe defeated

### Boss Foes
- **Enhanced**: +1 Life, +1 attack, fight to death
- **Treasure**: Triple gold or 100gp minimum, double magic items

## Initiative System

### Party NOT Surprised
1. Choose: Attack immediately OR wait for reactions
2. If attacking: Ranged/spells first (party), then ranged (foes), then melee alternating
3. If waiting: Roll reactions, foes may go first

### Party Surprised
1. Foe ranged attacks
2. Party ranged attacks & spells
3. Foe melee attacks
4. Party melee attacks

### Marching Order Effects
- **Corridors**: Only positions 1 & 2 can melee, positions 3 & 4 use ranged/spells
- **Wandering Monsters in corridors**: Attack positions 3 & 4 (rear)
- **Rooms**: All can fight, marching order less relevant

## Special Combat Rules

### Fleeing & Withdrawing
- **Flee**: Each foe attacks once, no shield bonus for PCs
- **Withdraw**: Requires door, foes attack once, PCs get +1 defense and can use shields, 1-in-6 wandering monsters

### Morale System
- **Minor Foes**: Check when reduced below 50% (d6: 1-3 flee, 4+ continue)
- **Modifiers**: Cowardly (-1), Courageous (+1)
- **Never Check**: Fight to Death reaction, "Morale: Never" in description

### Save Rolls
- **Threshold**: Based on source (trap level, spell level, etc.)
- **Modifiers**: Class bonuses, equipment bonuses
- **Special**: Lethal damage allows save to survive at 1 HP (wounded status)

## Combat Formulas

### Attack Total Calculation
```
attackTotal = diceRoll + classBonus + equipmentBonus + situationalMods
```

### Defense Total Calculation
```
defenseTotal = diceRoll + classDefenseBonus + armorBonus + shieldBonus + situationalMods
```

### Damage Calculation (Major Foes)
```
damage = floor(attackTotal / foeLevel)
// Natural 1 always = 0 damage
```

### Multi-Kill Calculation (Minor Foes)
```
kills = floor(attackTotal / foeLevel)
kills = min(kills, foeCount)
// Natural 1 always = 0 kills
```

## Special Mechanics

### Explosion (Critical Success)
- **d6**: Roll another d6 on 6
- **Cumulative**: Keep rolling if you keep getting 6s
- **Not Automatic Success**: Still need to meet target

### Traits & Special Abilities
- **Halfling Luck**: Reroll any save/attack/defense (limited uses)
- **Cleric Blessing**: Reroll a failed save
- **Wizard Spellcasting**: +L to spell rolls
- **Druid Nature Magic**: +L to druid spell rolls

### Environment-Specific
- **Fungal Grottoes**: Slippery (-1 defense when fleeing, except ranger/rogue/acrobat/halfling/mushroom monk)
- **Caverns**: Stalactites, stalagmites, echo effects
- **Dungeon**: Standard rules

## Critical Combat Values

### Save Thresholds
- **Trap**: Usually HCL+1 to HCL+4
- **Poison**: L2 to L4
- **Disease**: L2 to L3
- **Magic**: L4 to L6
- **Fear**: L4
- **Gaze**: L4

### Damage Types
- **Standard**: 1 damage per hit
- **Tier damage**: Some foes (ogres, dragons)
- **Multi-damage**: Attacks that specify (e.g., "2 damage")
- **Poison/Disease**: Additional damage on failed save
