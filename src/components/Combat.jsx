import React, { useState, useCallback, useEffect } from 'react';
import { d6 } from '../utils/dice.js';
import {
  calculateAttack,
  calculateDefense,
  calculateEnhancedAttack,
  performSaveRoll,
  useBlessingForSave,
  useLuckForSave,
  useClericHeal,
  useClericBless,
  useBarbarianRage,
  useHalflingLuck,
  attemptPartyFlee,
  attemptWithdraw,
  awardXP,
  checkLevelUp,
  processMonsterRoundStart,
  performCastSpell,
  getRemainingSpells,
  // Phase 7a: Core Combat Functions
  processMinorFoeAttack,
  processMajorFoeAttack,
  checkMinorFoeMorale,
  checkMajorFoeLevelReduction,
  // Phase 7c: Advanced Class Abilities
  useAssassinHide,
  setRangerSwornEnemy,
  useSwashbucklerPanache,
  useMonkFlurry,
  useAcrobatTrick,
  usePaladinPrayer,
  useLightGladiatorParry,
  useBulwarkSacrifice,
  toggleDualWield
} from "../utils/gameActions/index.js";
import { isLifeThreatening, getRerollOptions } from '../data/saves.js';
import { getAvailableSpells, SPELLS, getSpellSlots } from '../data/spells.js';
import { MONSTER_ABILITIES, rollMonsterReaction, REACTION_TYPES } from '../data/monsters.js';
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';
import { getPrayerPoints, getTrickPoints, getMaxPanache, getFlurryAttacks, hasDarkvision } from '../data/classes.js';
import { hasEquipment, getEquipment } from '../data/equipment.js';
import { InitiativePhase, VictoryPhase, MonsterReaction } from './combat/index.js';
import { selectParty, selectHero } from '../state/selectors.js';
import {
  logMessage,
  clearMonsters,
  updateHero,
  addMonster,
  updateMonster,
  deleteMonster
} from '../state/actionCreators.js';
import { canHeroMeleeAttack } from '../utils/combatLocationHelpers.js';
import SpellTargetModal from './SpellTargetModal.jsx';

export default function Combat({ state, dispatch, selectedHero, setSelectedHero, handleRollReaction }) {
  // Per-monster levels are used. Global foeLevel removed in favor of each monster.level.
  const [combatLog, setCombatLog] = useState([]);
  const [pendingSave, setPendingSave] = useState(null); // { heroIdx, damageSource }
  const [showSpells, setShowSpells] = useState(null); // heroIdx or null
  const [showAbilities, setShowAbilities] = useState(null); // heroIdx or null
  const [spellTargeting, setSpellTargeting] = useState(null); // { casterIdx, spellKey, spell }
  const [combatInitiative, setCombatInitiative] = useState(null); // Initiative info for current combat
  const [showRangedVolley, setShowRangedVolley] = useState(false);
  const [roundStartsWith, setRoundStartsWith] = useState('attack'); // 'attack' | 'defend'
  const [showCombatModule, setShowCombatModule] = useState(false); // hide both until player/initiative decides
  const [targetMonsterIdx, setTargetMonsterIdx] = useState(null); // Selected target monster
  const [shieldsDisabledFirst, setShieldsDisabledFirst] = useState(false);
  
  const party = selectParty(state);
  const activeHero = selectHero(state, selectedHero) || null;
  

  // Compute if any party member is carrying an equipped light source (lantern/torch)
  const partyHasEquippedLight = party.some((h) => {
    if (!h) return false;
    // Quick check for lantern key
    if (hasEquipment(h, 'lantern')) return true;
    const eq = h.equipment || [];
    if (!Array.isArray(eq)) return false;
    return eq.some((k) => {
      const item = getEquipment(k);
      return item && item.lightSource === true;
    });
  });

  const effectiveHasLight = state.hasLightSource || partyHasEquippedLight;
  // Gather names of equipped light items (unique)
  const partyLightNames = [];
  party.forEach((h) => {
    const eq = h?.equipment || [];
    if (!Array.isArray(eq)) return;
    eq.forEach((k) => {
      const it = getEquipment(k);
      if (it && it.lightSource && !partyLightNames.includes(it.name)) {
        partyLightNames.push(it.name);
      }
    });
  });

  const addToCombatLog = useCallback((message) => {
    setCombatLog(prev => [message, ...prev].slice(0, 20));
    dispatch({ type: 'LOG', t: message });
  }, [dispatch]);

  const clearCombatLog = useCallback(() => {
    setCombatLog([]);
  }, []);

  const handleClearMonsters = useCallback(() => {
    // Award XP for all defeated monsters before clearing
    state.monsters.forEach(monster => {
      if (monster.hp <= 0 || monster.count === 0) {
        awardXP(dispatch, monster, state.party);
      }
    });
    
    // Check for level ups
    state.party.forEach((hero, idx) => {
      if (hero.hp > 0) {
        checkLevelUp(dispatch, hero, idx);
      }
    });
    
    dispatch({ type: 'CLEAR_MONSTERS' });
    clearCombatLog();
    setCombatInitiative(null);
    setTargetMonsterIdx(null);
    dispatch({ type: 'LOG', t: '--- Encounter ended ---' });
  }, [state.monsters, state.party, dispatch, clearCombatLog]);

  // Get the current target monster (first alive if none selected)
  const getTargetMonster = useCallback(() => {
    if (targetMonsterIdx !== null && state.monsters[targetMonsterIdx]) {
      const target = state.monsters[targetMonsterIdx];
      if (target.hp > 0 && (target.count === undefined || target.count > 0)) {
        return { monster: target, index: targetMonsterIdx };
      }
    }
    // Default to first alive monster
    const idx = state.monsters.findIndex(m => m.hp > 0 && (m.count === undefined || m.count > 0));
    return idx >= 0 ? { monster: state.monsters[idx], index: idx } : null;
  }, [targetMonsterIdx, state.monsters]);

  // Check if a monster is a Minor Foe (has count property)
  const isMinorFoe = useCallback((monster) => {
    return monster && (monster.count !== undefined || monster.isMinorFoe);
  }, []);

  const handleAttack = useCallback((heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero || hero.hp <= 0) return;

    // Check if hero can melee attack based on location and marching order
    const meleeCheck = canHeroMeleeAttack(state, heroIndex);
    if (!meleeCheck.canMelee) {
      addToCombatLog(`❌ ${hero.name} cannot melee attack: ${meleeCheck.reason}`);
      return;
    }

    // If player manually attacks, reveal the attack module and ensure it starts with attack
    if (!showCombatModule) {
      setShowCombatModule(true);
      setRoundStartsWith('attack');
    }

    // Get target monster
    const target = getTargetMonster();
    if (!target) {
      addToCombatLog('No valid target!');
      return;
    }

    const { monster, index: monsterIdx } = target;

    // Get ability states
    const heroAbilities = state.abilities?.[heroIndex] || {};
    const options = {
      rageActive: heroAbilities.rageActive,
      blessed: hero.status?.blessed,
      hasLightSource: effectiveHasLight,
      location: state.currentCombatLocation,
      // Rogue bonus: outnumbers Minor Foes if party size > foe count
      rogueOutnumbers: hero.key === 'rogue' && isMinorFoe(monster) &&
        state.party.filter(h => h.hp > 0).length > (monster.count || 1)
    };
    
    // Use appropriate attack function based on foe type
    if (isMinorFoe(monster)) {
      // Minor Foe: Use multi-kill attack
      const foe = {
        ...monster,
        count: monster.count || 1,
        initialCount: monster.initialCount || monster.count || 1
      };
      processMinorFoeAttack(dispatch, hero, heroIndex, foe, monsterIdx, options);
    } else {
      // Major Foe: Use standard attack with level reduction check
      processMajorFoeAttack(dispatch, hero, heroIndex, monster, monsterIdx, options);
    }
    
    // Clear blessed status after use
    if (hero.status?.blessed) {
      dispatch({ type: 'SET_HERO_STATUS', heroIdx: heroIndex, statusKey: 'blessed', value: false });
    }
  }, [state.party, state.abilities, state.monsters, getTargetMonster, isMinorFoe, dispatch, showCombatModule]);

  const handleDefense = useCallback((heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero) return;

    const heroAbilities = state.abilities?.[heroIndex] || {};
    let mod = 0;

    // Rage penalty to defense
    if (heroAbilities.rageActive && hero.key === 'barbarian') {
      mod -= 1;
    }

    const options = {
      hasLightSource: effectiveHasLight,
      ignoreShield: shieldsDisabledFirst
    };

  const target = getTargetMonster();
  const targetMonster = target ? target.monster : null;
  const computedFoeLevel = targetMonster ? (targetMonster.level || 1) : (Math.max(...state.monsters.map(m => m.level || 1), 1));

  const result = calculateDefense(hero, computedFoeLevel, options);
  // Clear the global one-time shield restriction after it's consumed by the first defense roll
  if (shieldsDisabledFirst) setShieldsDisabledFirst(false);
    
    if (!result.blocked) {
      const newHP = Math.max(0, hero.hp - 1);
      
      // Check if this is lethal damage
      if (newHP <= 0 && hero.hp > 0) {
        // Trigger save roll
        setPendingSave({ heroIdx: heroIndex, damageSource: 'monster' });
        addToCombatLog(`💀 ${hero.name} takes lethal damage! SAVE ROLL needed!`);
      } else {
        dispatch({ type: 'UPD_HERO', i: heroIndex, u: { hp: newHP } });
      }
    }

    addToCombatLog(result.message);
  }, [state.party, state.abilities, state.monsters, dispatch, addToCombatLog, getTargetMonster]);

  // Handle save roll
  const handleSaveRoll = useCallback(() => {
    if (!pendingSave) return;
    const hero = state.party[pendingSave.heroIdx];
  const options = { hasLightSource: effectiveHasLight };
    performSaveRoll(dispatch, hero, pendingSave.heroIdx, pendingSave.damageSource, options);
    setPendingSave(null);
  }, [pendingSave, state.party, state.hasLightSource, dispatch]);

  // Handle blessing re-roll for save
  const handleBlessingReroll = useCallback((clericIdx) => {
    if (!pendingSave) return;
    const targetHero = state.party[pendingSave.heroIdx];
  const options = { hasLightSource: effectiveHasLight };
    useBlessingForSave(dispatch, clericIdx, targetHero, pendingSave.heroIdx, pendingSave.damageSource, options);
    setPendingSave(null);
  }, [pendingSave, state.party, state.hasLightSource, dispatch]);

  // Handle luck re-roll for save
  const handleLuckReroll = useCallback(() => {
    if (!pendingSave) return;
    const hero = state.party[pendingSave.heroIdx];
    const options = { hasLightSource: state.hasLightSource };
    if (hero.key === 'halfling') {
      useLuckForSave(dispatch, pendingSave.heroIdx, hero, pendingSave.damageSource, options);
    }
    setPendingSave(null);
  }, [pendingSave, state.party, state.hasLightSource, dispatch]);

  // Process monster round start (regeneration, etc.)
  const handleNewRound = useCallback(() => {
    processMonsterRoundStart(dispatch, state.monsters);
    // If modules are not yet visible, initialize based on combatInitiative (surprise/attack)
    if (!showCombatModule) {
      const start = combatInitiative && typeof combatInitiative.monsterFirst !== 'undefined' ?
        (combatInitiative.monsterFirst ? 'defend' : 'attack') : 'attack';
      setRoundStartsWith(start);
      setShowCombatModule(true);
    } else {
      // Alternate attack/defend each new round
      setRoundStartsWith(prev => (prev === 'attack' ? 'defend' : 'attack'));
    }
    addToCombatLog('--- New Round ---');
  }, [state.monsters, dispatch, addToCombatLog, combatInitiative, showCombatModule]);

  // If initiative is set externally (InitiativePhase), reveal the appropriate module automatically
  useEffect(() => {
    if (combatInitiative && typeof combatInitiative.monsterFirst !== 'undefined') {
      const start = combatInitiative.monsterFirst ? 'defend' : 'attack';
      setRoundStartsWith(start);
      setShowCombatModule(true);
    }
  }, [combatInitiative]);

  // Respond to wandering encounter metadata (set by rollWanderingMonster)
  useEffect(() => {
    try {
      const meta = state?.combatMeta?.wanderingEncounter;
      if (meta) {
        // Wandering monsters always attack first
        const init = { monsterFirst: true, order: ['monster_melee', 'party_melee'], reason: 'Wandering Monsters ambush!' };
        setCombatInitiative(init);
        // Disable shields for the first defense rolls if indicated
        if (meta.shieldsDisabledFirst) setShieldsDisabledFirst(true);

        // Perform immediate ambush strikes using current state
        try {
          const combatActions = require('../utils/gameActions/combatActions.js');
          combatActions.initialWanderingStrikes(dispatch, state);
        } catch (e) {}

        // Clear the shieldsDisabledFirst flag in global meta so it's not re-used
        try { dispatch({ type: 'SET_WANDERING_ENCOUNTER', ambush: !!meta.ambush, location: meta.location, shieldsDisabledFirst: false }); } catch (e) {}
      }
    } catch (e) {
      // ignore errors
    }
  }, [state?.combatMeta, dispatch]);

  // When initiative is set to Party attacks first, if any alive hero has a ranged weapon
  // show the ranged-volley modal so they can fire before regular combat starts.
  useEffect(() => {
    if (!combatInitiative) return;
    // Only trigger when party attacks first
    if (combatInitiative.monsterFirst === false) {
      const rangedHeroes = state.party
        .map((h, idx) => ({ h, idx }))
        .filter(({ h }) => h && h.hp > 0 && Array.isArray(h.equipment) && h.equipment.some(k => {
          const it = getEquipment(k);
          return it && it.type === 'ranged';
        }));

      if (rangedHeroes.length > 0) {
        setShowRangedVolley(true);
        // Defer showing regular combat module until after volley resolved
        setShowCombatModule(false);
      }
    }
  }, [combatInitiative, state.party]);

  // Flee attempt
  const handleFlee = useCallback(() => {
    const highestLevel = Math.max(...state.monsters.map(m => m.level), 1);
    attemptPartyFlee(dispatch, state.party, state.monsters, highestLevel);
  }, [state.monsters, state.party, dispatch]);

  // Withdraw attempt
  const handleWithdraw = useCallback(() => {
    attemptWithdraw(dispatch, state.party, state.monsters, state.doors);
  }, [state.monsters, state.party, state.doors, dispatch]);

  

  const handleSpawnFromTable = useCallback(() => {
    // This function has been removed as selectedMonster state is no longer used.
  }, [state.party, dispatch]);

  // Reaction rolls are handled centrally via `handleRollReaction` in the Initiative box.

  // Perform a pre-initiative ranged attack for a single hero (used in ranged volley)
  const handleRangedVolleyAttack = useCallback((heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero || hero.hp <= 0) return;

    const target = getTargetMonster();
    if (!target) {
      addToCombatLog('No valid target for ranged volley!');
      return;
    }

    const { monster, index: monsterIdx } = target;

    const options = {
      preInitiativeRanged: true,
      hasLightSource: effectiveHasLight,
      location: state.currentCombatLocation,
      rogueOutnumbers: hero.key === 'rogue' && isMinorFoe(monster) &&
        state.party.filter(h => h.hp > 0).length > (monster.count || 1)
    };

    if (isMinorFoe(monster)) {
      const foe = { ...monster, count: monster.count || 1, initialCount: monster.initialCount || monster.count || 1 };
      processMinorFoeAttack(dispatch, hero, heroIndex, foe, monsterIdx, options);
    } else {
      processMajorFoeAttack(dispatch, hero, heroIndex, monster, monsterIdx, options);
    }
  }, [state.party, state.monsters, dispatch, getTargetMonster, isMinorFoe, effectiveHasLight]);

  const adjustMonsterHP = useCallback((index, delta) => {
    const monster = state.monsters[index];
    const newHP = Math.max(0, Math.min(monster.maxHp, monster.hp + delta));
    dispatch({ type: 'UPD_MONSTER', i: index, u: { hp: newHP } });
    
    // Check if monster defeated
    if (newHP === 0 && monster.hp > 0) {
      addToCombatLog(`💀 ${monster.name} defeated!`);
    }
  }, [state.monsters, dispatch, addToCombatLog]);

  // Class ability handlers
  const handleClericHeal = useCallback((clericIdx, targetIdx) => {
    const targetHero = state.party[targetIdx];
    useClericHeal(dispatch, clericIdx, targetIdx, targetHero);
    setShowAbilities(null);
  }, [state.party, dispatch]);

  const handleClericBless = useCallback((clericIdx, targetIdx) => {
    const targetHero = state.party[targetIdx];
    useClericBless(dispatch, clericIdx, targetIdx, targetHero);
    setShowAbilities(null);
  }, [state.party, dispatch]);

  const handleToggleRage = useCallback((barbarianIdx) => {
    const heroAbilities = state.abilities?.[barbarianIdx] || {};
    useBarbarianRage(dispatch, barbarianIdx, !heroAbilities.rageActive);
    setShowAbilities(null);
  }, [state.abilities, dispatch]);

  const handleUseLuck = useCallback((halflingIdx) => {
    useHalflingLuck(dispatch, halflingIdx);
    setShowAbilities(null);
  }, [dispatch]);

  const handleCastSpell = useCallback((casterIdx, spellKey) => {
    const caster = state.party[casterIdx];
    const spell = SPELLS[spellKey];

    // If spell needs explicit target selection from player, show SpellTargetModal
    const needTarget = spell && (spell.target === 'single' || spell.target === 'single_ally' || spell.target === 'enemies' || spell.target === 'all_enemies' || spell.type === 'healing' || spell.type === 'attack');
    if (needTarget && state.monsters && state.monsters.length > 0) {
      // Use modal for selection (modal will call onConfirm)
      setSpellTargeting({ casterIdx, spellKey, spell });
      return;
    }

    // Fallback: no modal, build simple context (first alive target)
    const context = {};
    if (state.monsters && state.monsters.length > 0) {
      const targetIdx = state.monsters.findIndex(m => (m.hp > 0 || (m.count !== undefined && m.count > 0)));
      if (targetIdx >= 0) {
        const target = state.monsters[targetIdx];
        context.targetMonsterIdx = targetIdx;
        context.targetMonster = target;
        context.targets = [target];
        context.allMonsters = state.monsters;
        context.casterIdx = casterIdx;
      }
    }

    performCastSpell(dispatch, caster, casterIdx, spellKey, context);
    setShowSpells(null);
  }, [state.party, state.monsters, dispatch]);

  const handleSpellTargetConfirm = useCallback(({ targets, targetHeroIdx, all }) => {
    if (!spellTargeting) return;
    const { casterIdx, spellKey } = spellTargeting;
    const caster = state.party[casterIdx];
    const context = { casterIdx };

    if (all) {
      context.allMonsters = state.monsters;
      context.targets = state.monsters.slice();
    } else if (targets && targets.length > 0) {
      // targets passed as array of { index, monster }
      context.targets = targets.map(t => t.monster || state.monsters[t.index]);
      context.targetMonsterIdx = targets[0].index;
      context.targetMonster = state.monsters[targets[0].index];
      context.allMonsters = state.monsters;
    } else if (typeof targetHeroIdx === 'number') {
      context.targetHeroIdx = targetHeroIdx;
      context.targetHero = state.party[targetHeroIdx];
    }

    // Special-case Fireball minor group handled in castSpell/performCastSpell now; keep simple here
    performCastSpell(dispatch, caster, casterIdx, spellKey, context);
    setSpellTargeting(null);
    setShowSpells(null);
  }, [spellTargeting, state.monsters, state.party, dispatch]);

  const handleSpellTargetCancel = useCallback(() => {
    setSpellTargeting(null);
  }, []);

  // Get ability usage for a hero
  const getAbilityUsage = useCallback((heroIdx) => {
    return state.abilities?.[heroIdx] || {};
  }, [state.abilities]);

  // Check if hero can use abilities
  const canUseAbility = useCallback((hero, heroIdx, ability) => {
    const usage = getAbilityUsage(heroIdx);
    switch (ability) {
      case 'heal':
        return hero.key === 'cleric' && (usage.healsUsed || 0) < 3;
      case 'bless':
        return hero.key === 'cleric' && (usage.blessingsUsed || 0) < 3;
      case 'rage':
        return hero.key === 'barbarian';
      case 'luck':
        return hero.key === 'halfling' && (usage.luckUsed || 0) < (hero.lvl + 1);
      case 'spell':
        return ['wizard', 'elf', 'druid', 'illusionist'].includes(hero.key) &&
          (usage.spellsUsed || 0) < getSpellSlots(hero.key, hero.lvl);
      default:
        return false;
    }
  }, [getAbilityUsage]);
  
  // Check if any party members lack darkvision
  const partyHasDarkvision = state.party.some(h => h.hp > 0 && hasDarkvision(h.key));
  const partyLacksDarkvision = state.party.some(h => h.hp > 0 && !hasDarkvision(h.key));

  return (
    <section id="combat_section" className="space-y-2">
      {/* Combat Location Display */}
      {state.currentCombatLocation && (
        <div id="combat_location" className={`rounded p-2 ${
          state.currentCombatLocation.type === 'corridor'
            ? 'bg-blue-900'
            : 'bg-slate-800'
        }`}>
          <div id="combat_location_controls" className="flex justify-between items-center">
            <div id="combat_location_display">
              <span className="text-sm font-bold text-blue-300">
                📍 {state.currentCombatLocation.type === 'corridor' ? 'Corridor Combat' : 'Room Combat'}
              </span>
              {state.currentCombatLocation.type === 'corridor' && (
                <div className="text-xs text-blue-200 mt-1">
                  ⚠️ Only positions 1-2 can melee attack
                  {state.currentCombatLocation.width === 'narrow' && (
                    <span className="text-amber-300"> (Narrow: 2H weapons -1)</span>
                  )}
                </div>
              )}
            </div>
            <button
              id="combat_location_clear_button"
              onClick={() => dispatch({ type: 'CLEAR_COMBAT_LOCATION' })}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Save Roll Modal */}
      {pendingSave && (
        <div id="combat_save_modal" className="bg-red-900 border-2 border-red-500 rounded p-3 animate-pulse">
          <div id="combat_save_title" className="text-red-300 font-bold text-center mb-2">
            💀 SAVE ROLL REQUIRED!
          </div>
          <div className="text-white text-center text-sm mb-3">
            {state.party[pendingSave.heroIdx]?.name} must make a save roll to survive!
          </div>
          <div id="combat_save_buttons" className="flex flex-col gap-2">
            <button
              id="combat_save_roll_button"
              onClick={handleSaveRoll}
              className="w-full bg-red-600 hover:bg-red-500 py-2 rounded font-bold"
            >
              Roll Save (d6)
            </button>
            
            {/* Blessing re-roll option */}
            {state.party.some((h, idx) => 
              h.key === 'cleric' && h.hp > 0 && (state.abilities?.[idx]?.blessingsUsed || 0) < 3
            ) && (
              <div className="text-xs text-amber-300 text-center">
                Cleric can use Blessing for re-roll:
                {state.party.map((h, idx) => 
                  h.key === 'cleric' && h.hp > 0 && (state.abilities?.[idx]?.blessingsUsed || 0) < 3 ? (
                    <button
                      key={idx}
                      onClick={() => handleBlessingReroll(idx)}
                      className="ml-2 bg-amber-600 px-2 py-0.5 rounded text-white"
                    >
                      {h.name} ({3 - (state.abilities?.[idx]?.blessingsUsed || 0)} left)
                    </button>
                  ) : null
                )}
              </div>
            )}
              {/* Luck re-roll option */}
            {state.party[pendingSave.heroIdx]?.key === 'halfling' && 
             canUseAbility(state.party[pendingSave.heroIdx], pendingSave.heroIdx, 'luck') && (
              <button
                onClick={handleLuckReroll}
                className="w-full bg-green-600 hover:bg-green-500 py-1 rounded text-sm"
              >
                🍀 Use Luck for Re-roll
              </button>
            )}
          </div>
        </div>      )}

      {/* Active Monsters */}
      <div id="monster_group" className="bg-slate-800 rounded p-2">
        <div id="monster_group_header" className="mb-2">
          <div id="monster_group_title" className="text-amber-400 font-bold text-sm mb-1">Active Monsters ({state.monsters.length})</div>
          <div className="flex flex-wrap gap-1">
            {/* Control buttons moved to ActionPane (bottom); kept empty here to avoid duplication */}
          </div>
        </div>

        <div id="monster_cards" className="space-y-1 max-h-32 overflow-y-auto mb-2">
          {state.monsters.map((monster, index) => {
            const isMinor = isMinorFoe(monster);
            const isDefeated = isMinor ? (monster.count === 0) : (monster.hp === 0);
            const isTargeted = targetMonsterIdx === index;
            
            return (
            <div
              key={monster.id}
              id={`monster_${index}`}
              className={`monster_card bg-slate-700 rounded p-1.5 text-sm cursor-pointer border-2 ${
                isTargeted ? 'border-amber-400' : 'border-transparent'
              } ${isDefeated ? 'opacity-50' : ''}`}
              onClick={() => !isDefeated && setTargetMonsterIdx(index)}
            >
              <div id={`monster_${index}_header`} className="flex justify-between items-center">
                <div id={`monster_${index}_info`} className="flex items-center gap-1">
                  {isMinor && <span className="text-blue-400 text-xs">👥</span>}
                  {!isMinor && <span className="text-red-400 text-xs"></span>}
                  <div className="flex items-center gap-2">
                    <span id={`monster_${index}_name`} className="text-amber-400 font-bold text-xs">{monster.name}</span>
                    {/* Per-monster level controls: edit monster.level directly */}
                    <div id={`monster_${index}_level_controls`} className="flex items-center gap-1">
                      <button
                        id={`monster_${index}_level_decrease_button`}
                        onClick={(e) => { e.stopPropagation(); dispatch(updateMonster(index, { level: Math.max(1, (monster.level || 1) - 1) })); }}
                        className="bg-slate-700 px-1 py-0.5 rounded text-xs"
                        title="Decrease monster level"
                      >
                        −
                      </button>
                      <span id={`monster_${index}_level`} className="text-slate-400 text-xs px-1">L{monster.level || 1}</span>
                      <button
                        id={`monster_${index}_level_increase_button`}
                        onClick={(e) => { e.stopPropagation(); dispatch(updateMonster(index, { level: (monster.level || 1) + 1 })); }}
                        className="bg-slate-700 px-1 py-0.5 rounded text-xs"
                        title="Increase monster level"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {monster.special && MONSTER_ABILITIES[monster.special] && (
                    <span id={`monster_${index}_ability`} className="text-purple-400 text-xs" title={MONSTER_ABILITIES[monster.special].description}>
                      {MONSTER_ABILITIES[monster.special].name}
                    </span>
                  )}
                  {monster.levelReduced && (
                    <span id={`monster_${index}_level_reduced`} className="text-yellow-400 text-xs" title="Level reduced due to wounds">📉</span>
                  )}
                </div>
                <button
                  id={`monster_${index}_delete_button`}
                  onClick={(e) => { e.stopPropagation(); dispatch(deleteMonster(index)); }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
              <div id={`monster_${index}_hp_section`} className="flex justify-between items-center mt-0.5 text-xs">
                <div id={`monster_${index}_stats`} className="flex items-center gap-2">
                  {monster.xp && <span className="text-yellow-400">({monster.xp}XP)</span>}
                  {isMinor && <span className="text-blue-300">(Minor Foe)</span>}
                </div>
                {/* Show count for Minor Foes, HP for Major Foes */}
                {isMinor ? (
                  <div id={`monster_${index}_count_controls`} className="flex items-center gap-1 text-blue-400">
                    <button
                      id={`monster_${index}_count_decrease_button`}
                      onClick={(e) => { e.stopPropagation(); dispatch(updateMonster(index, { count: Math.max(0, (monster.count || 1) - 1) })); }}
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >-</button>
                    <span id={`monster_${index}_count`} className={monster.count === 0 ? 'text-green-400' : ''}>{monster.count || 0}/{monster.initialCount || monster.count}</span>
                    <button
                      id={`monster_${index}_count_increase_button`}
                      onClick={(e) => { e.stopPropagation(); dispatch(updateMonster(index, { count: (monster.count || 0) + 1 })); }}
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                ) : (
                  <div id={`monster_${index}_hp_controls`} className="flex items-center gap-1 text-red-400">
                    <button
                      id={`monster_${index}_hp_decrease_button`}
                      onClick={(e) => { e.stopPropagation(); adjustMonsterHP(index, -1); }}
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >-</button>
                    <span id={`monster_${index}_hp_display`} className={monster.hp === 0 ? 'text-green-400' : ''}>{monster.hp}/{monster.maxHp}</span>
                    <button
                      id={`monster_${index}_hp_increase_button`}
                      onClick={(e) => { e.stopPropagation(); adjustMonsterHP(index, 1); }}
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                )}
              </div>
              {/* Reaction section */}
              <MonsterReaction
                monster={monster}
              />
              {isDefeated && (
                <div className="text-green-400 text-xs mt-0.5">
                  💀 {monster.fled ? 'Fled!' : 'Defeated!'}
                </div>
              )}
            </div>
          );})}
          {state.monsters.length === 0 && (
            <div className="text-slate-500 text-xs text-center py-2">No active monsters</div>
          )}
        </div>
        
        
      </div>
      
      {/* Initiative & Combat Order */}
      {!showCombatModule && (
        <InitiativePhase
          monsters={state.monsters}
          party={state.party}
          combatInitiative={combatInitiative}
          setCombatInitiative={setCombatInitiative}
          addToCombatLog={addToCombatLog}
          dispatch={dispatch}
        />
      )}

      {/* Spell Target Modal */}
      {spellTargeting && (
        <SpellTargetModal
          spell={spellTargeting.spell}
          caster={state.party[spellTargeting.casterIdx]}
          party={state.party}
          monsters={state.monsters}
          onConfirm={handleSpellTargetConfirm}
          onCancel={handleSpellTargetCancel}
        />
      )}

      {/* Ranged Volley Modal - appears before combat module when party attacks first and ranged heroes exist */}
      {showRangedVolley && (
        <div className="bg-slate-900 border-2 border-slate-700 rounded p-3">
          <div className="text-amber-300 font-bold text-center mb-2">🏹 Pre-Initiative Ranged Volley</div>
          <div className="text-white text-sm mb-2">Select each hero with a ranged weapon to fire one free attack before normal combat begins. Close when finished.</div>
          <div className="flex flex-col gap-2">
            {state.party.map((h, idx) => {
              const hasRanged = h && h.hp > 0 && Array.isArray(h.equipment) && h.equipment.some(k => {
                const it = getEquipment(k);
                return it && it.type === 'ranged';
              });

              if (!hasRanged) return null;

              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="text-sm text-slate-200">{h.name} {h.lvl ? `L${h.lvl}` : ''}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRangedVolleyAttack(idx)}
                      className="bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-xs"
                    >
                      Fire
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowRangedVolley(false); setShowCombatModule(true); }}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      
  {/* Foe Level controls moved inline next to each monster's name */}
      
      {/* Attack or Defend module: show only one at a time once revealed */}
      {showCombatModule ? (
        <div className="flex flex-col gap-2">
          {roundStartsWith === 'attack' ? (
            <div className="bg-slate-800 rounded p-2">
              {(() => {
                const target = getTargetMonster();
                const targetMonster = target ? target.monster : null;
                const computedFoeLevel = targetMonster ? (targetMonster.level || 1) : (Math.max(...state.monsters.map(m => m.level || 1), 1));
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-orange-400 font-bold text-sm">⚔️ Attack (L{computedFoeLevel}+)</div>
                      <button
                        onClick={handleNewRound}
                        className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
                        title="Start a new round of combat"
                      >
                        New Round
                      </button>
                    </div>
                    {state.party.map((hero, index) => {
                      const abilities = getAbilityUsage(index);
                      const options = {
                        rageActive: abilities.rageActive,
                        blessed: hero.status?.blessed,
                        hasLightSource: effectiveHasLight,
                        location: state.currentCombatLocation,
                        rogueOutnumbers: hero.key === 'rogue' && isMinorFoe(targetMonster) && state.party.filter(h => h.hp > 0).length > (targetMonster?.count || 1)
                      };
                      // Determine equipped weapon name (first weapon in equipment list) or 'Unarmed'
                      let weaponName = 'Unarmed';
                      if (Array.isArray(hero.equipment) && hero.equipment.length > 0) {
                        const w = hero.equipment.find(k => {
                          const it = getEquipment(k);
                          return it && it.category === 'weapon';
                        });
                        if (w) {
                          const it = getEquipment(w);
                          if (it && it.name) weaponName = it.name;
                        }
                      }
                      const atk = calculateEnhancedAttack(hero, computedFoeLevel, options);
                      const modLabel = atk.mod >= 0 ? `+${atk.mod}` : `${atk.mod}`;

                      // Check if hero can melee attack
                      const meleeCheck = canHeroMeleeAttack(state, index);
                      const canMelee = meleeCheck.canMelee;

                      return (
                        <button
                          key={hero.id || index}
                          onClick={() => handleAttack(index)}
                          disabled={hero.hp <= 0 || !canMelee}
                          className={`w-full ${
                            !canMelee
                              ? 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                              : 'bg-orange-600 hover:bg-orange-500'
                          } disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate relative`}
                          title={!canMelee ? meleeCheck.reason : ''}
                        >
                          <span className="font-bold">{hero.name}</span>
                          {!canMelee && <span className="text-xs ml-2 text-amber-400">🏹 Ranged Only</span>}
                          {canMelee && <span className="text-xs ml-2 text-slate-300">{weaponName}</span>}
                          <span className="text-xs ml-2">({modLabel})</span>
                          {abilities.rageActive && <span className="ml-1 text-red-300">😤</span>}
                          {hero.status?.blessed && <span className="ml-1 text-yellow-300">✨</span>}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-slate-800 rounded p-2">
              {(() => {
                const target = getTargetMonster();
                const targetMonster = target ? target.monster : null;
                const computedFoeLevel = targetMonster ? (targetMonster.level || 1) : (Math.max(...state.monsters.map(m => m.level || 1), 1));
                return (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-red-400 font-bold text-sm">🛡️ Defend (L{computedFoeLevel + 1}+)</div>
                      <button
                        onClick={handleNewRound}
                        className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
                        title="Start a new round of combat"
                      >
                        New Round
                      </button>
                    </div>
                    {state.party.map((hero, index) => {
                      const abilities = getAbilityUsage(index);
                      const defRes = calculateDefense(hero, computedFoeLevel, { hasLightSource: effectiveHasLight });
                      const modLabel = defRes.mod >= 0 ? `+${defRes.mod}` : `${defRes.mod}`;
                      // Determine equipped shield and armor names
                      let shieldName = 'No Shield';
                      let armorName = 'No Armor';
                      if (Array.isArray(hero.equipment) && hero.equipment.length > 0) {
                        const s = hero.equipment.find(k => {
                          const it = getEquipment(k);
                          return it && it.category === 'shield';
                        });
                        if (s) {
                          const it = getEquipment(s);
                          if (it && it.name) shieldName = it.name;
                        }
                        const a = hero.equipment.find(k => {
                          const it = getEquipment(k);
                          return it && it.category === 'armor';
                        });
                        if (a) {
                          const it = getEquipment(a);
                          if (it && it.name) armorName = it.name;
                        }
                      }
                      return (
                        <button 
                          key={hero.id || index} 
                          onClick={() => handleDefense(index)} 
                          disabled={hero.hp <= 0} 
                          className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate"
                        >
                          <span className="font-bold">{hero.name}</span>
                          {shieldName !== 'No Shield' && (
                            <span className="text-xs ml-2 text-slate-300">{shieldName}</span>
                          )}
                          {armorName !== 'No Armor' && (
                            <span className="text-xs ml-2 text-slate-300">{armorName}</span>
                          )}
                          <span className="text-xs ml-2">({modLabel})</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
  ) : null}
      
      {/* Class Abilities */}
      <div id="combat_abilities" className="bg-slate-800 rounded p-2">
        <div id="combat_abilities_title" className="text-purple-400 font-bold text-sm mb-2">✨ Class Abilities</div>
        <div id="combat_ability_list" className="space-y-1">
          {state.party.map((hero, index) => {
            const abilities = getAbilityUsage(index);
            const hasAbilities = ['cleric', 'wizard', 'elf', 'druid', 'illusionist', 'barbarian', 'halfling',
              'paladin', 'ranger', 'assassin', 'swashbuckler', 'acrobat', 'mushroomMonk', 'lightGladiator'].includes(hero.key);

            if (!hasAbilities || hero.hp <= 0) return null;

            return (
              <div key={hero.id || index} id={`combat_ability_${index}`} className="bg-slate-700 rounded p-1.5">
                <div className="flex justify-between items-center">
                  <span id={`combat_ability_${index}_name`} className="text-white text-xs font-bold">{hero.name}</span>
                  <div className="flex gap-1">
                    {/* Cleric Abilities */}
                    {hero.key === 'cleric' && (
                      <>
                        <button
                          onClick={() => setShowAbilities(showAbilities === `heal-${index}` ? null : `heal-${index}`)}
                          disabled={(abilities.healsUsed || 0) >= 3}
                          className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                        >
                          💚Heal ({3 - (abilities.healsUsed || 0)})
                        </button>
                        <button
                          onClick={() => setShowAbilities(showAbilities === `bless-${index}` ? null : `bless-${index}`)}
                          disabled={(abilities.blessingsUsed || 0) >= 3}
                          className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                        >
                          ✨Bless ({3 - (abilities.blessingsUsed || 0)})
                        </button>
                      </>
                    )}
                    
                    {/* Wizard/Elf/Druid/Illusionist Spells */}
                    {['wizard', 'elf', 'druid', 'illusionist'].includes(hero.key) && (
                      <button
                        onClick={() => setShowSpells(showSpells === index ? null : index)}
                        disabled={(abilities.spellsUsed || 0) >= getSpellSlots(hero.key, hero.lvl)}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        🔮Spells ({getSpellSlots(hero.key, hero.lvl) - (abilities.spellsUsed || 0)})
                      </button>
                    )}
                    
                    {/* Barbarian Rage */}
                    {hero.key === 'barbarian' && (
                      <button
                        onClick={() => handleToggleRage(index)}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          abilities.rageActive 
                            ? 'bg-red-500 hover:bg-red-400' 
                            : 'bg-red-700 hover:bg-red-600'
                        }`}
                      >
                        😤{abilities.rageActive ? 'End Rage' : 'Rage!'}
                      </button>
                    )}
                    
                    {/* Halfling Luck */}
                    {hero.key === 'halfling' && (
                      <button
                        onClick={() => handleUseLuck(index)}
                        disabled={(abilities.luckUsed || 0) >= (hero.lvl + 1)}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        🍀Luck ({hero.lvl + 1 - (abilities.luckUsed || 0)})
                      </button>
                    )}

                    {/* Paladin Prayer */}
                    {hero.key === 'paladin' && (
                      <button
                        onClick={() => usePaladinPrayer(dispatch, index, 'smite')}
                        disabled={(abilities.prayersUsed || 0) >= getPrayerPoints(hero.lvl)}
                        className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        Prayer ({getPrayerPoints(hero.lvl) - (abilities.prayersUsed || 0)})
                      </button>
                    )}

                    {/* Ranger Dual Wield */}
                    {['ranger', 'lightGladiator', 'swashbuckler'].includes(hero.key) && (
                      <button
                        onClick={() => toggleDualWield(dispatch, index, !abilities.dualWielding)}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          abilities.dualWielding
                            ? 'bg-orange-500 hover:bg-orange-400'
                            : 'bg-orange-700 hover:bg-orange-600'
                        }`}
                      >
                        ⚔️⚔️{abilities.dualWielding ? 'Single' : 'Dual Wield'}
                      </button>
                    )}

                    {/* Assassin Hide */}
                    {hero.key === 'assassin' && (
                      <button
                        onClick={() => useAssassinHide(dispatch, index, !abilities.hidden)}
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          abilities.hidden
                            ? 'bg-purple-500 hover:bg-purple-400'
                            : 'bg-purple-700 hover:bg-purple-600'
                        }`}
                      >
                        🥷{abilities.hidden ? 'Reveal' : 'Hide'}
                      </button>
                    )}

                    {/* Swashbuckler Panache */}
                    {hero.key === 'swashbuckler' && (
                      <button
                        onClick={() => useSwashbucklerPanache(dispatch, index, 'dodge')}
                        disabled={(abilities.panacheUsed || 0) >= getMaxPanache(hero.lvl)}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        🤺Panache ({getMaxPanache(hero.lvl) - (abilities.panacheUsed || 0)})
                      </button>
                    )}

                    {/* Acrobat Trick */}
                    {hero.key === 'acrobat' && (
                      <button
                        onClick={() => useAcrobatTrick(dispatch, index, 'dodge')}
                        disabled={(abilities.tricksUsed || 0) >= getTrickPoints(hero.lvl)}
                        className="bg-pink-600 hover:bg-pink-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        🤸Trick ({getTrickPoints(hero.lvl) - (abilities.tricksUsed || 0)})
                      </button>
                    )}

                    {/* Mushroom Monk Flurry */}
                    {hero.key === 'mushroomMonk' && (
                      <button
                        onClick={() => useMonkFlurry(dispatch, index, hero.lvl)}
                        disabled={abilities.flurryActive}
                        className="bg-green-700 hover:bg-green-600 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        🥋Flurry ({getFlurryAttacks(hero.lvl)}x)
                      </button>
                    )}

                    {/* Light Gladiator Parry */}
                    {hero.key === 'lightGladiator' && (
                      <button
                        onClick={() => useLightGladiatorParry(dispatch, index)}
                        disabled={abilities.parryActive}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 px-1.5 py-0.5 rounded text-xs"
                      >
                        ⚔️Parry
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Target selection for Heal */}
                {showAbilities === `heal-${index}` && (
                  <div className="mt-1 p-1 bg-slate-600 rounded">
                    <div className="text-xs text-slate-300 mb-1">Heal who?</div>
                    <div className="flex flex-wrap gap-1">
                      {state.party.map((target, targetIdx) => (
                        <button
                          key={targetIdx}
                          onClick={() => handleClericHeal(index, targetIdx)}
                          disabled={target.hp <= 0 || target.hp >= target.maxHp}
                          className="bg-green-700 hover:bg-green-600 disabled:bg-slate-500 px-2 py-0.5 rounded text-xs"
                        >
                          {target.name} ({target.hp}/{target.maxHp})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Target selection for Bless */}
                {showAbilities === `bless-${index}` && (
                  <div className="mt-1 p-1 bg-slate-600 rounded">
                    <div className="text-xs text-slate-300 mb-1">Bless who?</div>
                    <div className="flex flex-wrap gap-1">
                      {state.party.map((target, targetIdx) => (
                        <button
                          key={targetIdx}
                          onClick={() => handleClericBless(index, targetIdx)}
                          disabled={target.hp <= 0 || target.status?.blessed}
                          className="bg-amber-700 hover:bg-amber-600 disabled:bg-slate-500 px-2 py-0.5 rounded text-xs"
                        >
                          {target.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Spell selection */}
                {showSpells === index && (
                  <div className="mt-1 p-1 bg-slate-600 rounded">
                    <div className="text-xs text-slate-300 mb-1">Cast spell:</div>
                    <div className="grid grid-cols-2 gap-1">
                      {getAvailableSpells(hero.key).map(spellKey => (
                        <button
                          key={spellKey}
                          onClick={() => handleCastSpell(index, spellKey)}
                          className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs text-left"
                          title={SPELLS[spellKey].description}
                        >
                          {SPELLS[spellKey].name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Treasure & Victory: only show after the encounter is actually won */}
      {state.monsters.length > 0 && state.monsters.every(m => (m.count !== undefined ? m.count === 0 : m.hp === 0)) && (
        <div id="combat_victory">
          <VictoryPhase
            monsters={state.monsters}
            party={state.party}
            dispatch={dispatch}
            clearCombatLog={clearCombatLog}
            setCombatInitiative={setCombatInitiative}
            setTargetMonsterIdx={setTargetMonsterIdx}
          />
        </div>
      )}
    </section>
  );
}
