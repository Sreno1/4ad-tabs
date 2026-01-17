# Missing Mechanics

This file tracks mechanics that are still missing or partially implemented, with concrete next steps.

## Overview
The codebase has made recent progress on spellcasting, MR checks, and status flags (entangle/asleep/bound). Remaining work focuses on UI wiring, edge-case behavior, and a few gameplay systems.

---

## Spells & Magic (recent work done)
- ✅ `castSpell` now performs MR checks and separate spellcasting rolls; details are returned in `result.details`.
- ✅ `performCastSpell` and `performCastScrollSpell` now log MR and cast-roll results for visibility.
- ✅ Scroll casting bonus (+L for spellcasters, +1 for non-spellcasters) is applied to casting rolls.
- ✅ Trait-based casting bonuses (Specialist, Shadow Adept) wired to casting rolls (via `targets[0].castingBonus`).
- ✅ AoE and single-damage plumbing applied in `performCastSpell`.
- ✅ Fireball special-case: Fireball slays minor foes using the d6+L - foe L rule; Fireball does 1 damage to a Major Foe.
- ✅ Entangle/Bind/Fog/Subdual effects set monster/hero status flags.

### Next steps (Spells)
- Add UI target selection: single-target selector, minor-foe group selector, and AoE confirmation modal.
- Replace the ad-hoc `targets[0].castingBonus` hack with an explicit `context` parameter for `castSpell` (cleaner API).
- Implement per-spell immunity/vulnerability rules (undead, elementals, fire-immune monsters, etc.).
- Ensure status durations (entangleTurns, boundTurns, asleep durations) decrement each round and expire gracefully with log messages.
- Add automated tests for MR pass/fail, Fireball minor-foe slays, entangle/asleep effects, and scroll casting bonuses.

---

## Combat Status Effects
- ✅ Monsters marked `status.asleep` skip attacks during escape and wandering strike resolution.
- ✅ `entangled` reduces effective monster level by 1 for attack calculations.
- ✅ `bound` marks monster so heroes get +2 when attacking them (applied via `options.boundTarget`).

### Next steps (Status)
- Ensure per-turn decrement and expiry of `entangleTurns`/`boundTurns`/`asleep` and log expiry.
- Integrate these flags into all monster action loops (monster turn, ambush strikes, wandering strikes). Some loops already updated; audit others.
- Add UI badges for monster status (asleep/entangled/bound) in combat view.

---

## Targeting & UI
- ❌ Spell targeting UI (selecting target monster or group) is not implemented.
- ❌ Target-selection confirmation for AoE/minor-group effects.

### Next steps (UI)
- Implement `SpellTargetModal` component to select targets prior to casting.
- Wire Combat `handleCastSpell` to present the modal and pass a `context` object to `performCastSpell` that includes `targets`, `allMonsters`, and `casterIdx`.

---

## Traits & Scrolls
- ✅ Scroll bonus applied to casting rolls via `getScrollCastingBonus`.
- ✅ Specialist and Shadow Adept trait quick wiring applied.

### Next steps (Traits)
- Expose `spellCastingBonus` flags from `getTraitRollModifiers` where appropriate.
- Add trait activation UI where traits require 1x/once-per-adventure usage.

---

## Remaining Major Systems
- ❌ Reaction-based initiative (per-monster reactions not fully wired)
  - Next: assign reaction tables to monsters and implement reaction-specific initiative handling.
- ❌ Retracing steps wandering-monster chance (1-in-6) on re-entering visited tiles
  - Next: implement `onEnterTile` hook to roll for wandering monster when re-entering.
- ❌ Final Boss trigger (d6 + major foes defeated threshold)
  - Next: implement the 4AD rule, enhance boss on trigger (+1 Life, +1 Attack, 3x treasure), and test flow.
- ❌ Environment-based treasure tables
  - Next: implement `TREASURE_BY_ENVIRONMENT` and use environment when generating treasure.

---

## Party / Resources
- ❌ XP roll mechanic needs formalization and testing (XP d6 roll per hero)
- ❌ Clues system (tracking clue acquisition and triggering events)
- ❌ Food rations and survival checks
- ❌ Bandages and limited consumables
- ❌ Inventory limits (weapon/shield counts, weight limits)

### Next steps (Party)
- Implement XP roll on Victory and tie to level-up flow.
- Implement Clue tracking in state and UI.
- Add ration consumption and starvation checks (daily or per-adventure behavior).
- Add bandage item and healing rules; add UI to spend bandages.
- Enforce inventory limits in store and UI.

---

If you'd like, I can (pick one):
- Implement the `SpellTargetModal` and wire the combat UI to pass a clean `context` object to `castSpell`/`performCastSpell`.
- Replace `targets[0].castingBonus` with a proper `context` parameter for `castSpell` and migrate callers.
- Add per-turn status expiry logic and UI badges for monster status.

Pick a next task and I'll implement it and run quick validation/build tests.