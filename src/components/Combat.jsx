import React, { useState } from 'react';
import { d6 } from '../utils/dice.js';
import {
  rollWanderingMonster,
  rollTreasure,
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
  determineInitiative,
  rollSurprise,
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
} from '../utils/gameActions.js';
import { isLifeThreatening, getRerollOptions } from '../data/saves.js';
import { getAvailableSpells, SPELLS, getSpellSlots } from '../data/spells.js';
import { MONSTER_ABILITIES, getAllMonsters, createMonsterFromTable, MONSTER_CATEGORIES, rollMonsterReaction, REACTION_TYPES } from '../data/monsters.js';
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';
import { getPrayerPoints, getTrickPoints, getMaxPanache, getFlurryAttacks } from '../data/classes.js';

export default function Combat({ state, dispatch, selectedHero, setSelectedHero }) {
  const [foeLevel, setFoeLevel] = useState(4);
  const [combatLog, setCombatLog] = useState([]);
  const [pendingSave, setPendingSave] = useState(null); // { heroIdx, damageSource }
  const [showSpells, setShowSpells] = useState(null); // heroIdx or null
  const [showAbilities, setShowAbilities] = useState(null); // heroIdx or null
  const [selectedMonster, setSelectedMonster] = useState(''); // key for monster table dropdown
  const [combatInitiative, setCombatInitiative] = useState(null); // Initiative info for current combat
  const [targetMonsterIdx, setTargetMonsterIdx] = useState(null); // Selected target monster
  
  const activeHero = state.party[selectedHero] || null;
  const monsterList = getAllMonsters(); // Get all monsters for dropdown
  
  const addToCombatLog = (message) => {
    setCombatLog(prev => [message, ...prev].slice(0, 20));
    dispatch({ type: 'LOG', t: message });
  };
  
  const clearCombatLog = () => {
    setCombatLog([]);
  };
  
  const handleClearMonsters = () => {
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
  };
  
  // Get the current target monster (first alive if none selected)
  const getTargetMonster = () => {
    if (targetMonsterIdx !== null && state.monsters[targetMonsterIdx]) {
      const target = state.monsters[targetMonsterIdx];
      if (target.hp > 0 && (target.count === undefined || target.count > 0)) {
        return { monster: target, index: targetMonsterIdx };
      }
    }
    // Default to first alive monster
    const idx = state.monsters.findIndex(m => m.hp > 0 && (m.count === undefined || m.count > 0));
    return idx >= 0 ? { monster: state.monsters[idx], index: idx } : null;
  };
  
  // Check if a monster is a Minor Foe (has count property)
  const isMinorFoe = (monster) => {
    return monster && (monster.count !== undefined || monster.isMinorFoe);
  };
  
  const handleAttack = (heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero || hero.hp <= 0) return;
    
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
  };
  
  const handleDefense = (heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero) return;
    
    const heroAbilities = state.abilities?.[heroIndex] || {};
    let mod = 0;
    
    // Rage penalty to defense
    if (heroAbilities.rageActive && hero.key === 'barbarian') {
      mod -= 1;
    }
    
    const result = calculateDefense(hero, foeLevel);
    
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
  };
  
  // Handle save roll
  const handleSaveRoll = () => {
    if (!pendingSave) return;
    const hero = state.party[pendingSave.heroIdx];
    performSaveRoll(dispatch, hero, pendingSave.heroIdx, pendingSave.damageSource);
    setPendingSave(null);
  };
  
  // Handle blessing re-roll for save
  const handleBlessingReroll = (clericIdx) => {
    if (!pendingSave) return;
    const targetHero = state.party[pendingSave.heroIdx];
    useBlessingForSave(dispatch, clericIdx, targetHero, pendingSave.heroIdx, pendingSave.damageSource);
    setPendingSave(null);
  };
  
  // Handle luck re-roll for save  
  const handleLuckReroll = () => {
    if (!pendingSave) return;
    const hero = state.party[pendingSave.heroIdx];
    if (hero.key === 'halfling') {
      useLuckForSave(dispatch, pendingSave.heroIdx, hero, pendingSave.damageSource);
    }
    setPendingSave(null);
  };
  
  // Process monster round start (regeneration, etc.)
  const handleNewRound = () => {
    processMonsterRoundStart(dispatch, state.monsters);
    addToCombatLog('--- New Round ---');
  };
  
  // Flee attempt
  const handleFlee = () => {
    const highestLevel = Math.max(...state.monsters.map(m => m.level), 1);
    attemptPartyFlee(dispatch, state.party, highestLevel);
  };
  
  const handleWanderingMonster = () => {
    rollWanderingMonster(dispatch);
  };
  
  const handleCustomMonster = () => {
    const name = prompt('Monster Name?', 'Custom Monster') || 'Custom Monster';
    const level = parseInt(prompt('Monster Level (1-5)?', '2')) || 2;
    const isMajor = confirm('Is this a Major Foe (single creature with HP)? Cancel for Minor Foe (group with count).');
    
    let monster;
    if (isMajor) {
      const hp = parseInt(prompt('HP?', '6')) || 6;
      monster = { 
        id: Date.now(), 
        name, 
        level, 
        hp, 
        maxHp: hp, 
        type: 'custom',
        isMinorFoe: false
      };
      dispatch({ type: 'ADD_MONSTER', m: monster });
      dispatch({ type: 'LOG', t: `⚔️ ${name} L${level} (${hp}HP) Major Foe added` });
    } else {
      const count = parseInt(prompt('How many?', '6')) || 6;
      monster = { 
        id: Date.now(), 
        name, 
        level, 
        hp: 1, // Minor foes have 1 HP each
        maxHp: 1,
        count: count,
        initialCount: count,
        type: 'custom',
        isMinorFoe: true
      };
      dispatch({ type: 'ADD_MONSTER', m: monster });
      dispatch({ type: 'LOG', t: `👥 ${count}x ${name} L${level} Minor Foes added` });
    }
  };
  
  const handleSpawnFromTable = () => {
    if (!selectedMonster) return;
    
    // Calculate HCL (Highest Character Level) from party
    const hcl = Math.max(...state.party.filter(h => h.hp > 0).map(h => h.lvl || 1), 1);
    
    const monster = createMonsterFromTable(selectedMonster, hcl);
    if (!monster) return;
    
    dispatch({ type: 'ADD_MONSTER', m: monster });
    
    // Show abilities if monster has any
    const abilitiesText = monster.abilities && monster.abilities.length > 0 
      ? ` [${monster.abilities.join(', ')}]` 
      : '';
    dispatch({ type: 'LOG', t: `${monster.name} L${monster.level} (${monster.hp}HP)${abilitiesText} appears!` });
    setSelectedMonster(''); // Reset selection
  };
  
  const handleTreasure = () => {
    rollTreasure(dispatch);
  };
  
  const handleRollReaction = (index) => {
    const monster = state.monsters[index];
    const result = rollMonsterReaction(monster);
    
    // Update monster with reaction
    dispatch({ type: 'UPD_MONSTER', i: index, u: { reaction: result } });
    
    // Log the result
    const logMsg = `🎲 ${monster.name} Reaction (${result.roll}): ${result.name} - ${result.description}`;
    dispatch({ type: 'LOG', t: logMsg });
    addToCombatLog(logMsg);
  };
  
  const adjustMonsterHP = (index, delta) => {
    const monster = state.monsters[index];
    const newHP = Math.max(0, Math.min(monster.maxHp, monster.hp + delta));
    dispatch({ type: 'UPD_MONSTER', i: index, u: { hp: newHP } });
    
    // Check if monster defeated
    if (newHP === 0 && monster.hp > 0) {
      addToCombatLog(`💀 ${monster.name} defeated!`);
    }
  };
  
  // Class ability handlers
  const handleClericHeal = (clericIdx, targetIdx) => {
    const targetHero = state.party[targetIdx];
    useClericHeal(dispatch, clericIdx, targetIdx, targetHero);
    setShowAbilities(null);
  };
  
  const handleClericBless = (clericIdx, targetIdx) => {
    const targetHero = state.party[targetIdx];
    useClericBless(dispatch, clericIdx, targetIdx, targetHero);
    setShowAbilities(null);
  };
  
  const handleToggleRage = (barbarianIdx) => {
    const heroAbilities = state.abilities?.[barbarianIdx] || {};
    useBarbarianRage(dispatch, barbarianIdx, !heroAbilities.rageActive);
    setShowAbilities(null);
  };
  
  const handleUseLuck = (halflingIdx) => {
    useHalflingLuck(dispatch, halflingIdx);
    setShowAbilities(null);
  };
  
  const handleCastSpell = (casterIdx, spellKey) => {
    const caster = state.party[casterIdx];
    const context = {};
    
    // For damage spells, target first alive monster
    const spell = SPELLS[spellKey];
    if (spell.type === 'attack' && state.monsters.length > 0) {
      const targetIdx = state.monsters.findIndex(m => m.hp > 0);
      if (targetIdx >= 0) {
        context.targetMonsterIdx = targetIdx;
        context.targetMonster = state.monsters[targetIdx];
      }
    }
    
    // For healing spells, show target selection (simplified: heal lowest HP ally)
    if (spell.type === 'healing') {
      const lowestHP = state.party.reduce((min, h, idx) => 
        h.hp > 0 && h.hp < h.maxHp && (min === null || h.hp < state.party[min].hp) ? idx : min, null);
      if (lowestHP !== null) {
        context.targetHeroIdx = lowestHP;
        context.targetHero = state.party[lowestHP];
      }
    }
    
    performCastSpell(dispatch, caster, casterIdx, spellKey, context);
    setShowSpells(null);
  };
  
  // Get ability usage for a hero
  const getAbilityUsage = (heroIdx) => {
    return state.abilities?.[heroIdx] || {};
  };
  
  // Check if hero can use abilities
  const canUseAbility = (hero, heroIdx, ability) => {
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
  };
  
  return (
    <div className="space-y-2">
      {/* Save Roll Modal */}
      {pendingSave && (
        <div className="bg-red-900 border-2 border-red-500 rounded p-3 animate-pulse">
          <div className="text-red-300 font-bold text-center mb-2">
            💀 SAVE ROLL REQUIRED!
          </div>
          <div className="text-white text-center text-sm mb-3">
            {state.party[pendingSave.heroIdx]?.name} must make a save roll to survive!
          </div>
          <div className="flex flex-col gap-2">
            <button
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
      <div className="bg-slate-800 rounded p-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber-400 font-bold text-sm">
            🐉 Active Monsters ({state.monsters.length})
          </span>
          <div className="flex gap-1">
            {state.monsters.length > 0 && (
              <>
                <button 
                  onClick={handleNewRound}
                  className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
                >
                  New Round
                </button>
                <button 
                  onClick={handleFlee}
                  className="bg-yellow-600 hover:bg-yellow-500 px-2 py-0.5 rounded text-xs"
                >
                  Flee
                </button>
                <button 
                  onClick={handleClearMonsters} 
                  className="bg-red-600 hover:bg-red-500 px-2 py-0.5 rounded text-xs"
                >
                  End
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
          {state.monsters.map((monster, index) => {
            const isMinor = isMinorFoe(monster);
            const isDefeated = isMinor ? (monster.count === 0) : (monster.hp === 0);
            const isTargeted = targetMonsterIdx === index;
            
            return (
            <div 
              key={monster.id} 
              className={`bg-slate-700 rounded p-1.5 text-sm cursor-pointer border-2 ${
                isTargeted ? 'border-amber-400' : 'border-transparent'
              } ${isDefeated ? 'opacity-50' : ''}`}
              onClick={() => !isDefeated && setTargetMonsterIdx(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  {isMinor && <span className="text-blue-400 text-xs">👥</span>}
                  {!isMinor && <span className="text-red-400 text-xs">👹</span>}
                  <span className="text-amber-400 font-bold text-xs">{monster.name}</span>
                  {monster.special && MONSTER_ABILITIES[monster.special] && (
                    <span className="text-purple-400 text-xs" title={MONSTER_ABILITIES[monster.special].description}>
                      ⚡{MONSTER_ABILITIES[monster.special].name}
                    </span>
                  )}
                  {monster.levelReduced && (
                    <span className="text-yellow-400 text-xs" title="Level reduced due to wounds">📉</span>
                  )}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DEL_MONSTER', i: index }); }} 
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center mt-0.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">L{monster.level}</span>
                  {monster.xp && <span className="text-yellow-400">({monster.xp}XP)</span>}
                  {isMinor && <span className="text-blue-300">(Minor Foe)</span>}
                </div>
                {/* Show count for Minor Foes, HP for Major Foes */}
                {isMinor ? (
                  <div className="flex items-center gap-1 text-blue-400">
                    <button 
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPD_MONSTER', i: index, u: { count: Math.max(0, (monster.count || 1) - 1) } }); }} 
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >-</button>
                    <span className={monster.count === 0 ? 'text-green-400' : ''}>{monster.count || 0}/{monster.initialCount || monster.count}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'UPD_MONSTER', i: index, u: { count: (monster.count || 0) + 1 } }); }} 
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-400">
                    <button 
                      onClick={(e) => { e.stopPropagation(); adjustMonsterHP(index, -1); }} 
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >-</button>
                    <span className={monster.hp === 0 ? 'text-green-400' : ''}>{monster.hp}/{monster.maxHp}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); adjustMonsterHP(index, 1); }} 
                      className="bg-slate-600 px-1 rounded hover:bg-slate-500"
                    >+</button>
                  </div>
                )}
              </div>
              {/* Reaction section */}
              <div className="flex justify-between items-center mt-1 text-xs">
                {monster.reaction ? (
                  <div className={`flex-1 px-1 py-0.5 rounded ${
                    monster.reaction.hostile === true ? 'bg-red-900/50 text-red-300' :
                    monster.reaction.hostile === false ? 'bg-green-900/50 text-green-300' :
                    'bg-yellow-900/50 text-yellow-300'
                  }`}>
                    <span className="font-bold">{monster.reaction.name}</span>
                    <span className="ml-1 text-slate-400">(rolled {monster.reaction.roll})</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRollReaction(index); }}
                    className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-white"
                  >
                    🎲 Roll Reaction
                  </button>
                )}
              </div>
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
        
        <div className="grid grid-cols-2 gap-1 mb-2">
          <button 
            onClick={handleWanderingMonster} 
            className="bg-red-700 hover:bg-red-600 px-2 py-1 rounded text-xs"
          >
            Wandering (d6)
          </button>
          <button 
            onClick={handleCustomMonster} 
            className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs"
          >
            Custom Monster
          </button>
        </div>
        
        {/* Quick Minor Foe Spawner */}
        <div className="bg-slate-700 rounded p-1.5 mb-2">
          <div className="text-xs text-blue-400 mb-1">👥 Quick Minor Foe Group</div>
          <div className="flex gap-1">
            {[
              { name: 'Goblins', level: 1, count: 6 },
              { name: 'Orcs', level: 2, count: 4 },
              { name: 'Skeletons', level: 1, count: 8 },
              { name: 'Rats', level: 1, count: 10 }
            ].map(foe => (
              <button
                key={foe.name}
                onClick={() => {
                  const monster = {
                    id: Date.now(),
                    name: foe.name,
                    level: foe.level,
                    hp: 1,
                    maxHp: 1,
                    count: foe.count,
                    initialCount: foe.count,
                    isMinorFoe: true,
                    xp: foe.level * 5
                  };
                  dispatch({ type: 'ADD_MONSTER', m: monster });
                  dispatch({ type: 'LOG', t: `👥 ${foe.count}x ${foe.name} L${foe.level} appear!` });
                }}
                className="bg-blue-600 hover:bg-blue-500 px-1.5 py-0.5 rounded text-xs"
              >
                {foe.count}x L{foe.level}
              </button>
            ))}
          </div>
        </div>
        
        {/* Monster Table Dropdown */}
        <div className="flex gap-1">
          <select
            value={selectedMonster}
            onChange={(e) => setSelectedMonster(e.target.value)}
            className="flex-1 bg-slate-700 text-white text-xs rounded px-2 py-1 border border-slate-600"
          >
            <option value="">-- Select Monster --</option>
            {Object.entries(MONSTER_CATEGORIES).map(([categoryKey, categoryName]) => {
              const monstersInCategory = monsterList.filter(m => m.category === categoryKey);
              if (monstersInCategory.length === 0) return null;
              return (
                <optgroup key={categoryKey} label={categoryName}>
                  {monstersInCategory.map(m => (
                    <option key={m.key} value={m.key}>
                      {m.name} (T{m.tier}, {m.xp}XP{m.special ? `, ${Array.isArray(m.special) ? m.special[0] : m.special}` : ''})
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <button
            onClick={handleSpawnFromTable}
            disabled={!selectedMonster}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 px-2 py-1 rounded text-xs"
          >
            Spawn
          </button>
        </div>
      </div>
      
      {/* Initiative & Combat Order */}
      {state.monsters.length > 0 && (
        <div className="bg-slate-800 rounded p-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-cyan-400 font-bold text-sm">⚡ Initiative</span>
            {!combatInitiative && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const init = determineInitiative({ partyAttacksFirst: true });
                    setCombatInitiative(init);
                    addToCombatLog(`⚡ ${init.reason}`);
                  }}
                  className="bg-green-600 hover:bg-green-500 px-2 py-0.5 rounded text-xs"
                >
                  Party Attacks
                </button>
                <button
                  onClick={() => {
                    // Roll surprise for first monster
                    const surpriseResult = rollSurprise(state.monsters[0]);
                    if (surpriseResult.surprised) {
                      addToCombatLog(surpriseResult.message);
                      const init = determineInitiative({ isSurprise: true });
                      setCombatInitiative(init);
                    } else {
                      addToCombatLog(surpriseResult.message || 'No surprise - roll reaction for initiative.');
                    }
                  }}
                  className="bg-yellow-600 hover:bg-yellow-500 px-2 py-0.5 rounded text-xs"
                >
                  Check Surprise
                </button>
                <button
                  onClick={() => {
                    // Determine initiative based on monster reactions
                    const hostileMonster = state.monsters.find(m => m.reaction?.hostile);
                    const init = determineInitiative({ 
                      reaction: hostileMonster?.reaction,
                      hasRanged: state.party.some(h => h.equipment?.ranged)
                    });
                    setCombatInitiative(init);
                    addToCombatLog(`⚡ ${init.reason}`);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded text-xs"
                >
                  By Reaction
                </button>
              </div>
            )}
          </div>
          
          {combatInitiative && (
            <div className={`p-2 rounded text-xs ${
              combatInitiative.monsterFirst ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
            }`}>
              <div className="font-bold mb-1">{combatInitiative.reason}</div>
              <div className="text-slate-300">
                Order: {combatInitiative.order.map(phase => {
                  const labels = {
                    'party_ranged': '🏹Party Ranged',
                    'party_spells': '🔮Party Spells', 
                    'party_melee': '⚔️Party Melee',
                    'monster_ranged': '🎯Monster Ranged',
                    'monster_melee': '👹Monster Melee'
                  };
                  return labels[phase] || phase;
                }).join(' → ')}
              </div>
              <button
                onClick={() => setCombatInitiative(null)}
                className="mt-1 bg-slate-600 hover:bg-slate-500 px-2 py-0.5 rounded"
              >
                Reset Initiative
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Foe Level */}
      <div className="bg-slate-800 rounded p-2">
        <div className="flex justify-between items-center">
          <span className="text-amber-400 font-bold text-sm">Foe Level</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFoeLevel(l => Math.max(1, l - 1))} 
              className="bg-slate-700 px-2 py-1 rounded"
            >-</button>
            <span className="text-xl font-bold text-amber-400 w-6 text-center">{foeLevel}</span>
            <button 
              onClick={() => setFoeLevel(l => l + 1)} 
              className="bg-slate-700 px-2 py-1 rounded"
            >+</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">
          <div>Attack: {foeLevel}+ to hit | Defense: {foeLevel + 1}+ to block</div>
          <div className="text-blue-300 mt-0.5">
            👥 Minor Foe Multi-Kill: Roll ÷ L{foeLevel} = kills (e.g., roll 8 vs L2 = 4 kills)
          </div>
        </div>
      </div>
      
      {/* Attack/Defense Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded p-2">
          <div className="text-orange-400 font-bold text-sm mb-2">⚔️ Attack</div>
          {state.party.map((hero, index) => {
            const abilities = getAbilityUsage(index);
            return (
              <button 
                key={hero.id || index} 
                onClick={() => handleAttack(index)} 
                disabled={hero.hp <= 0} 
                className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate relative"
              >
                {hero.name}
                {abilities.rageActive && <span className="ml-1 text-red-300">😤</span>}
                {hero.status?.blessed && <span className="ml-1 text-yellow-300">✨</span>}
              </button>
            );
          })}
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-red-400 font-bold text-sm mb-2">🛡️ Defend</div>
          {state.party.map((hero, index) => (
            <button 
              key={hero.id || index} 
              onClick={() => handleDefense(index)} 
              disabled={hero.hp <= 0} 
              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate"
            >
              {hero.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Class Abilities */}
      <div className="bg-slate-800 rounded p-2">
        <div className="text-purple-400 font-bold text-sm mb-2">✨ Class Abilities</div>
        <div className="space-y-1">
          {state.party.map((hero, index) => {
            const abilities = getAbilityUsage(index);
            const hasAbilities = ['cleric', 'wizard', 'elf', 'druid', 'illusionist', 'barbarian', 'halfling',
              'paladin', 'ranger', 'assassin', 'swashbuckler', 'acrobat', 'mushroomMonk', 'lightGladiator'].includes(hero.key);

            if (!hasAbilities || hero.hp <= 0) return null;
            
            return (
              <div key={hero.id || index} className="bg-slate-700 rounded p-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xs font-bold">{hero.name}</span>
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
                        ⚡Prayer ({getPrayerPoints(hero.lvl) - (abilities.prayersUsed || 0)})
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
      
      {/* Treasure */}
      <div className="bg-slate-800 rounded p-2">
        <div className="text-amber-400 font-bold text-sm mb-2">💎 Treasure</div>
        <button 
          onClick={handleTreasure} 
          className="w-full bg-yellow-700 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
        >
          Roll Treasure (d6)
        </button>
      </div>
        {/* Combat Log */}
      <div className="bg-slate-800 rounded p-2 max-h-36 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">Combat Log ({combatLog.length})</span>
          {combatLog.length > 0 && (
            <button
              onClick={clearCombatLog}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>        {combatLog.map((message, index) => (
          <div 
            key={index} 
            className={`text-xs py-0.5 ${message.includes('Miss') || message.includes('HIT') ? 'text-red-400' : 'text-green-400'}`}
          >
            {message}
          </div>
        ))}
        {combatLog.length === 0 && (
          <div className="text-slate-500 text-xs">No combat yet</div>
        )}
      </div>
    </div>
  );
}
