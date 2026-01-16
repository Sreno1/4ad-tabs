  campaign save system broken
  
  Missing Combat Mechanics
   
    - ❌ ADD CORRECT REACTIONS FOR EACH MONSTER
    - ❌ Spell targeting (single vs AoE vs Minor Foe groups)
      Status: Not implemented. Next: Add targeting logic to combat reducer and UI.
    - ❌ Marching Order in combat (corridor restrictions)
      Status: Not implemented. Next: Add marching order state and restrict actions in corridor.
    - Withdraw vs Flee distinction
      Status: Implemented
    - Morale checks (50% triggers d6 roll)
      Status: Implemented.
    - Major Foe level reduction at half HP
      Status: Implemented
    - Surprise system (X-in-6 chance)
      Status: Implemented.
    - Ranged attacks striking first
      Status: Implemented
    - ❌ Reaction-based initiative
      Status: Not implemented. Next: Add reaction stat and initiative order to combat reducer.
    - ❌ environment based treasure tables by type
      Status: Not implemented. Next: Add environment type lookup and treasure assignment.
    - ❌ Quest table
      Status: Not implemented. Next: Add quest data and random assignment on dungeon entry.
    - ❌ Epic rewards table
      Status: Not implemented. Next: Add epic reward data and trigger logic.
    - ❌ Corridor vs Room combat restrictions
      Status: Not implemented. Next: Add location context to combat reducer and restrict actions.
    - ❌ Narrow corridor rules (-1 two-handed, no penalty light)
      Status: Not implemented. Next: Add weapon penalty logic based on location.

  Party Management Gaps

    - Rogue Outnumbered bonus mechanics
      Status: implemented.
    - ❌ Implement Clues system
    - ❌ XP Rolls
      Status: Not implemented.
    - ❌ Equipment bonuses applied to rolls
      Status: Not implemented. Next: Add equipment stat modifiers to roll logic.
    - ❌ Character traits application after selected
      Status: partially implemented. Next: Add more effects and test
  -   Dwarf Gold Sense ability
      Status: implemented. test that gold matches if won.
    - ❌ Stealth modifiers per class
      Status: Not implemented. Next: Add class-based stealth modifiers to encounter rolls.

  Dungeon Exploration Gaps

    - ❌ Corridor vs Room distinction affecting combat
      Status: Not implemented. Next: Track location type and apply combat rules.
    - ❌ Narrow corridor rules
      Status: Not implemented. Next: Add corridor width state and restrict actions.
    - ❌ Secret door discovery (1-in-6 shortcut out)
      Status: Not implemented. Next: Add secret door roll and shortcut logic.
    - ❌ Secret passage to different environment
      Status: Not implemented. Next: Add passage event and environment change logic.
    - ❌ Hidden treasure complications (alarm, trap, ghost)
      Status: Not implemented. Next: Add complication roll and event triggers.
    - ❌ Retracing steps wandering monster chance (1-in-6)
      Status: Not implemented. Next: Add retrace event and monster roll.
    - ❌ Final Boss trigger needs testing (roll 6+ on d6 + major foes)
      Status: Not implemented. Next: Add boss trigger logic and test flow.

  Resource Tracking Gaps

    - ❌ Food Rations (survival in wilderness)
      Status: Not implemented. Next: Add ration tracking and survival checks.
    - Torches/Lanterns
      Status: Implemented.
    - ❌ Bandages (1 per PC per adventure)
      Status: Not implemented. Next: Add bandage item and healing logic.
    - ❌ Carried treasure weight (200gp max per PC)
      Status: Not implemented. Next: Add weight tracking and enforce limits.
    - ❌ Weapon/shield counts (3 weapons, 2 shields max)
      Status: Not implemented. Next: Add inventory limits and validation.