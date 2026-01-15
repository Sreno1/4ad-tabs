import React, { useState } from 'react';
import { Dices } from 'lucide-react';
import { d6 } from '../utils/dice.js';
import { rollTreasure, performCastSpell } from '../utils/gameActions.js';
import { SPELLS, getAvailableSpells } from '../data/spells.js';
import { COMBAT_PHASES, ACTION_MODES } from '../constants/gameConstants.js';
import EventCard from './actionPane/EventCard.jsx';
import ActiveMonsters from './actionPane/ActiveMonsters.jsx';
import CombatInitiative from './actionPane/CombatInitiative.jsx';

export default function ActionPane({
  state,
  dispatch,
  actionMode,
  roomEvents,
  tileResult,
  roomDetails,
  generateTile,
  clearTile,
  isCorridor,
  // Combat props
  combatPhase,
  getActiveMonsters,
  isCombatWon,
  handleRollReaction,
  handlePartyAttacks,
  handleEndPartyTurn,
  handleEndMonsterTurn,
  handleEndCombat,
  setCombatPhase,
  setRoomEvents,
  // Modal handlers
  setShowDungeonFeatures
}) {
  const [showSpells, setShowSpells] = useState(null);
  const [showHealTarget, setShowHealTarget] = useState(null);
  const [showBlessTarget, setShowBlessTarget] = useState(null);
  const [showProtectionTarget, setShowProtectionTarget] = useState(null);

  const activeMonsters = getActiveMonsters();
  const hasActiveMonsters = activeMonsters.length > 0;
  const combatWon = isCombatWon();
  const corridor = isCorridor();

  // Handle spell casting
  const handleCastSpell = (casterIdx, spellKey) => {
    const caster = state.party[casterIdx];
    const spell = SPELLS[spellKey];
    const context = {};

    // Protection spell: open target selection popup
    if (spellKey === 'protection') {
      setShowProtectionTarget(casterIdx);
      return;
    }

    // For attack spells, target first alive monster
    if (spell.type === 'attack') {
      const activeMonsters = getActiveMonsters();
      if (activeMonsters.length > 0) {
        const targetMonster = activeMonsters[0];
        const targetIdx = state.monsters.findIndex(m => m.id === targetMonster.id);
        context.targetMonsterIdx = targetIdx;
        context.targetMonster = targetMonster;
        context.targets = [targetMonster];
      }
    }

    // For healing spells, find lowest HP ally
    if (spell.type === 'healing') {
      const lowestHP = state.party.reduce((min, h, idx) =>
        h.hp > 0 && h.hp < h.maxHp && (min === null || h.hp < state.party[min].hp) ? idx : min, null);
      if (lowestHP !== null) {
        context.targetHeroIdx = lowestHP;
        context.targetHero = state.party[lowestHP];
        context.targets = [state.party[lowestHP]];
      }
    }

    // Cast the spell
    performCastSpell(dispatch, caster, casterIdx, spellKey, context);

    // Track spell usage
    const abilities = state.abilities?.[casterIdx] || {};
    dispatch({ type: 'SET_ABILITY', heroIdx: casterIdx, ability: 'spellsUsed', value: (abilities.spellsUsed || 0) + 1 });

    // Close spell selection
    setShowSpells(null);
  };

  // If no tile generated yet, show idle state with Generate Tile button
  if (!tileResult && roomEvents.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-slate-800 rounded p-4 text-center">
          <div className="text-slate-400 text-sm mb-3">Ready to explore</div>
          <button
            onClick={generateTile}
            className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-4 py-3 rounded font-bold text-sm flex items-center justify-center gap-2"
          >
            <Dices size={18} /> Generate Tile
          </button>
          <div className="text-slate-500 text-xs mt-2">Rolls d66 for shape + 2d6 for contents</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Room Events Stack - shows all events that happened in this room */}
      <div className="space-y-1">
        {roomEvents.map((event, index) => (
          <EventCard key={index} event={event} index={index} />
        ))}
      </div>

      {/* COMBAT MODE - Show when monsters are active */}
      {hasActiveMonsters && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
          {/* Active Monsters Section */}
          <ActiveMonsters
            activeMonsters={activeMonsters}
            state={state}
            dispatch={dispatch}
            corridor={corridor}
          />

          {/* Initiative Section */}
          <CombatInitiative
            combatPhase={combatPhase}
            monsterReaction={state.monsters?.[0]?.reaction}
            handleRollReaction={handleRollReaction}
            handlePartyAttacks={handlePartyAttacks}
            setShowDungeonFeatures={setShowDungeonFeatures}
            dispatch={dispatch}
          />

          {/* Attack/Defense Buttons based on phase */}
          {(combatPhase === COMBAT_PHASES.PARTY_TURN || combatPhase === COMBAT_PHASES.MONSTER_TURN) && (
            <div className="bg-slate-800 rounded p-2">
              {combatPhase === COMBAT_PHASES.PARTY_TURN ? (
                <>
                  <div className="text-orange-400 font-bold text-sm mb-2">
                    ⚔️ Attack Rolls
                    <span className="text-slate-500 text-xs ml-2 font-normal">
                      (Roll {activeMonsters[0]?.level}+ to hit)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {state.party.map((hero, index) => {
                      const abilities = state.abilities?.[index] || {};
                      const rageBonus = (hero.key === 'barbarian' && abilities.rageActive) ? 1 : 0;
                      const classBonus = hero.key === 'warrior' ? hero.lvl : 0;
                      const totalBonus = hero.lvl + classBonus + rageBonus;

                      return (
                        <button
                          key={hero.id || index}
                          onClick={() => {
                            const roll = d6();
                            const blessed = hero.status?.blessed ? 1 : 0;
                            const total = roll + totalBonus + blessed;
                            const monster = activeMonsters[0];
                            const hit = total >= monster.level;

                            // Clear blessed status if used
                            if (blessed) {
                              dispatch({ type: 'SET_HERO_STATUS', heroIdx: index, statusKey: 'blessed', value: false });
                            }

                            // Build detailed result message
                            let bonusBreakdown = `d6=${roll}`;
                            if (totalBonus > 0) bonusBreakdown += `+${totalBonus}`;
                            if (blessed) bonusBreakdown += `+1(blessed)`;
                            bonusBreakdown += `=${total}`;

                            dispatch({ type: 'LOG', t: `⚔️ ${hero.name} attacks: ${bonusBreakdown} vs L${monster.level} - ${hit ? '💥 HIT!' : '❌ Miss'}` });

                            if (hit && monster.count !== undefined) {
                              // Minor foe - multi-kill
                              const kills = Math.floor(total / monster.level);
                              const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
                              const remaining = Math.max(0, monster.count - kills);
                              dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: remaining } });
                              dispatch({ type: 'LOG', t: `💀 ${kills} ${monster.name} slain! (${remaining} remain)` });
                            } else if (hit) {
                              // Major foe - 1 damage
                              const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
                              const newHp = monster.hp - 1;
                              dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: newHp } });
                              if (newHp <= 0) {
                                dispatch({ type: 'LOG', t: `💥 ${monster.name} takes 1 damage and is DEFEATED!` });
                              } else {
                                dispatch({ type: 'LOG', t: `💥 ${monster.name} takes 1 damage! (${newHp}/${monster.maxHp} HP)` });
                              }
                            }
                          }}
                          disabled={hero.hp <= 0}
                          className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 px-2 py-1.5 rounded text-xs truncate relative"
                        >
                          {hero.name} {hero.hp <= 0 ? '💀' : `(+${totalBonus})`}
                          {hero.status?.blessed && <span className="absolute -top-1 -right-1 text-yellow-300">✨</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleEndPartyTurn}
                    className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm"
                  >
                    End Turn → Monster's Turn
                  </button>
                </>
              ) : (
                <>
                  <div className="text-red-400 font-bold text-sm mb-2">
                    🛡️ Defense Rolls
                    <span className="text-slate-500 text-xs ml-2 font-normal">
                      (Roll {(activeMonsters[0]?.level || 0) + 1}+ to block)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {state.party.map((hero, index) => {
                      const abilities = state.abilities?.[index] || {};
                      const defBonus = hero.key === 'rogue' ? hero.lvl : 0;
                      const ragePenalty = (hero.key === 'barbarian' && abilities.rageActive) ? -1 : 0;
                      const protectedBonus = hero.status?.protected ? 1 : 0;
                      const totalBonus = defBonus + ragePenalty + protectedBonus;

                      return (
                        <button
                          key={hero.id || index}
                          onClick={() => {
                            const roll = d6();
                            const blessed = hero.status?.blessed ? 1 : 0;
                            const total = roll + totalBonus + blessed + protectedBonus;
                            const monster = activeMonsters[0];
                            const targetNum = monster.level + 1;
                            const blocked = total >= targetNum;

                            // Clear blessed status if used
                            if (blessed) {
                              dispatch({ type: 'SET_HERO_STATUS', heroIdx: index, statusKey: 'blessed', value: false });
                            }

                            // Build detailed result message
                            let bonusBreakdown = `d6=${roll}`;
                            if (totalBonus !== 0) {
                              bonusBreakdown += totalBonus > 0 ? `+${totalBonus}` : `${totalBonus}`;
                            }
                            if (blessed) bonusBreakdown += `+1(blessed)`;
                            if (protectedBonus) bonusBreakdown += `+1(protected)`;
                            bonusBreakdown += `=${total}`;

                            dispatch({ type: 'LOG', t: `🛡️ ${hero.name} defends: ${bonusBreakdown} vs ${targetNum}+ - ${blocked ? '✅ Blocked!' : '💔 HIT!'}` });

                            if (!blocked) {
                              const newHp = Math.max(0, hero.hp - 1);
                              dispatch({ type: 'UPD_HERO', i: index, u: { hp: newHp } });
                              if (newHp <= 0) {
                                dispatch({ type: 'LOG', t: `💀 ${hero.name} takes 1 damage and falls unconscious! (0/${hero.maxHp})` });
                              } else {
                                dispatch({ type: 'LOG', t: `💔 ${hero.name} takes 1 damage! (${newHp}/${hero.maxHp} HP)` });
                              }
                            }
                          }}
                          disabled={hero.hp <= 0}
                          className="bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 px-2 py-1.5 rounded text-xs truncate relative"
                        >
                          {hero.name} {hero.hp <= 0 ? '💀' : `(${hero.hp}HP${totalBonus !== 0 ? `, ${totalBonus > 0 ? '+' : ''}${totalBonus}` : ''})`}
                          {hero.status?.blessed && <span className="absolute -top-1 -right-1 text-yellow-300">✨</span>}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleEndMonsterTurn}
                    className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-sm"
                  >
                    End Turn → Party's Turn
                  </button>
                </>
              )}
            </div>
          )}

          {/* Class Abilities - Always visible during combat */}
          <div className="bg-slate-800 rounded p-2">
            <div className="text-purple-400 font-bold text-sm mb-1">
              ✨ Class Abilities
              <span className="text-slate-500 text-xs ml-2 font-normal">(Use any time during combat)</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {state.party.map((hero, index) => {
                const abilities = state.abilities?.[index] || {};
                if (hero.hp <= 0) return null;

                return (
                  <React.Fragment key={hero.id || index}>
                    {/* Cleric Heal */}
                    {hero.key === 'cleric' && (abilities.healsUsed || 0) < 3 && (
                      <button
                        onClick={() => setShowHealTarget(index)}
                        className="bg-green-700 hover:bg-green-600 px-2 py-0.5 rounded text-xs"
                        title="Heal 1 HP to any hero (3 per adventure)"
                      >
                        💚 {hero.name.slice(0,3)} Heal ({3 - (abilities.healsUsed || 0)}/3)
                      </button>
                    )}

                    {/* Cleric Bless */}
                    {hero.key === 'cleric' && (abilities.blessingsUsed || 0) < 3 && (
                      <button
                        onClick={() => setShowBlessTarget(index)}
                        className="bg-amber-700 hover:bg-amber-600 px-2 py-0.5 rounded text-xs"
                        title="Grant +1 to next attack/defense roll (3 per adventure)"
                      >
                        ✨ {hero.name.slice(0,3)} Bless ({3 - (abilities.blessingsUsed || 0)}/3)
                      </button>
                    )}

                    {/* Barbarian Rage */}
                    {hero.key === 'barbarian' && (
                      <button
                        onClick={() => dispatch({ type: 'SET_ABILITY', heroIdx: index, ability: 'rageActive', value: !abilities.rageActive })}
                        className={`px-2 py-0.5 rounded text-xs ${abilities.rageActive ? 'bg-red-500' : 'bg-red-700 hover:bg-red-600'}`}
                        title={abilities.rageActive ? 'End Rage (remove +1 Attack, -1 Defense)' : 'Enter Rage (+1 Attack, -1 Defense)'}
                      >
                        😤 {hero.name.slice(0,3)} {abilities.rageActive ? 'End Rage' : 'Rage'}
                      </button>
                    )}

                    {/* Halfling Luck */}
                    {hero.key === 'halfling' && (abilities.luckUsed || 0) < hero.lvl + 1 && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'SET_ABILITY', heroIdx: index, ability: 'luckUsed', value: (abilities.luckUsed || 0) + 1 });
                          dispatch({ type: 'LOG', t: `🍀 ${hero.name} uses Luck! (Re-roll any die)` });
                        }}
                        className="bg-green-700 hover:bg-green-600 px-2 py-0.5 rounded text-xs"
                        title="Re-roll any single die (Lvl+1 per adventure)"
                      >
                        🍀 {hero.name.slice(0,3)} Luck ({hero.lvl + 1 - (abilities.luckUsed || 0)}/{hero.lvl + 1})
                      </button>
                    )}

                    {/* Wizard Spells */}
                    {hero.key === 'wizard' && (abilities.spellsUsed || 0) < hero.lvl + 2 && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'LOG', t: `🔮 ${hero.name} prepares to cast a spell...` });
                          setShowSpells(index);
                        }}
                        className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs"
                        title="Cast any wizard spell (Lvl+2 per adventure)"
                      >
                        🔮 {hero.name.slice(0,3)} Spell ({hero.lvl + 2 - (abilities.spellsUsed || 0)}/{hero.lvl + 2})
                      </button>
                    )}

                    {/* Elf Spells */}
                    {hero.key === 'elf' && (abilities.spellsUsed || 0) < hero.lvl && (
                      <button
                        onClick={() => {
                          dispatch({ type: 'LOG', t: `🔮 ${hero.name} prepares to cast a spell...` });
                          setShowSpells(index);
                        }}
                        className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs"
                        title="Cast any wizard spell (Lvl per adventure)"
                      >
                        🔮 {hero.name.slice(0,3)} Spell ({hero.lvl - (abilities.spellsUsed || 0)}/{hero.lvl})
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Spell Selection Popup */}
            {showSpells !== null && (
              <div className="mt-2 p-2 bg-slate-700 rounded border border-blue-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-blue-400">
                    🔮 {state.party[showSpells]?.name} - Select Spell
                  </span>
                  <button
                    onClick={() => setShowSpells(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {getAvailableSpells(state.party[showSpells]?.key).map(spellKey => (
                    <button
                      key={spellKey}
                      onClick={() => handleCastSpell(showSpells, spellKey)}
                      className="bg-blue-600 hover:bg-blue-500 px-2 py-1.5 rounded text-xs text-left"
                      title={SPELLS[spellKey].description}
                    >
                      <div className="font-bold">{SPELLS[spellKey].name}</div>
                      <div className="text-blue-200 text-[10px]">{SPELLS[spellKey].description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Heal Target Selection Popup */}
            {showHealTarget !== null && (
              <div className="mt-2 p-2 bg-slate-700 rounded border border-green-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-green-400">
                    💚 {state.party[showHealTarget]?.name} - Select Heal Target
                  </span>
                  <button
                    onClick={() => setShowHealTarget(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {state.party.map((target, targetIdx) => {
                    const canHeal = target.hp > 0 && target.hp < target.maxHp;
                    return (
                      <button
                        key={target.id || targetIdx}
                        onClick={() => {
                          if (canHeal) {
                            const clericAbilities = state.abilities?.[showHealTarget] || {};
                            dispatch({ type: 'UPD_HERO', i: targetIdx, u: { hp: Math.min(target.maxHp, target.hp + 1) } });
                            dispatch({ type: 'SET_ABILITY', heroIdx: showHealTarget, ability: 'healsUsed', value: (clericAbilities.healsUsed || 0) + 1 });
                            dispatch({ type: 'LOG', t: `💚 ${state.party[showHealTarget].name} heals ${target.name} for 1 HP! (${target.hp + 1}/${target.maxHp})` });
                            setShowHealTarget(null);
                          }
                        }}
                        disabled={!canHeal}
                        className={`px-2 py-1.5 rounded text-xs text-left ${
                          canHeal
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold">{target.name}</div>
                        <div className={canHeal ? 'text-green-200' : 'text-slate-500'}>
                          ❤️ {target.hp}/{target.maxHp} {target.hp <= 0 ? '💀' : target.hp >= target.maxHp ? '(Full)' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bless Target Selection Popup */}
            {showBlessTarget !== null && (
              <div className="mt-2 p-2 bg-slate-700 rounded border border-amber-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-amber-400">
                    ✨ {state.party[showBlessTarget]?.name} - Select Bless Target
                  </span>
                  <button
                    onClick={() => setShowBlessTarget(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {state.party.map((target, targetIdx) => {
                    const canBless = target.hp > 0 && !target.status?.blessed;
                    return (
                      <button
                        key={target.id || targetIdx}
                        onClick={() => {
                          if (canBless) {
                            const clericAbilities = state.abilities?.[showBlessTarget] || {};
                            dispatch({ type: 'SET_HERO_STATUS', heroIdx: targetIdx, statusKey: 'blessed', value: true });
                            dispatch({ type: 'SET_ABILITY', heroIdx: showBlessTarget, ability: 'blessingsUsed', value: (clericAbilities.blessingsUsed || 0) + 1 });
                            dispatch({ type: 'LOG', t: `✨ ${state.party[showBlessTarget].name} blesses ${target.name}! (+1 to next attack/defense)` });
                            setShowBlessTarget(null);
                          }
                        }}
                        disabled={!canBless}
                        className={`px-2 py-1.5 rounded text-xs text-left ${
                          canBless
                            ? 'bg-amber-600 hover:bg-amber-500'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold">{target.name}</div>
                        <div className={canBless ? 'text-amber-200' : 'text-slate-500'}>
                          {target.hp <= 0 ? '💀 KO' : target.status?.blessed ? '✨ Already Blessed' : '⚔️ Ready'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Protection Target Selection Popup */}
            {showProtectionTarget !== null && (
              <div className="mt-2 p-2 bg-slate-700 rounded border border-blue-400">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-blue-300">
                    🛡️ {state.party[showProtectionTarget]?.name} - Select Protection Target
                  </span>
                  <button
                    onClick={() => setShowProtectionTarget(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕ Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {state.party.map((target, targetIdx) => {
                    const canProtect = target.hp > 0 && !target.status?.protected;
                    return (
                      <button
                        key={target.id || targetIdx}
                        onClick={() => {
                          if (canProtect) {
                            dispatch({ type: 'SET_HERO_STATUS', heroIdx: targetIdx, statusKey: 'protected', value: true });
                            const caster = state.party[showProtectionTarget];
                            dispatch({ type: 'LOG', t: `🛡️ ${caster.name} casts Protection on ${target.name}! (+1 Defense until end of encounter)` });
                            // Track spell usage
                            const abilities = state.abilities?.[showProtectionTarget] || {};
                            dispatch({ type: 'SET_ABILITY', heroIdx: showProtectionTarget, ability: 'spellsUsed', value: (abilities.spellsUsed || 0) + 1 });
                            setShowProtectionTarget(null);
                            setShowSpells(null);
                          }
                        }}
                        disabled={!canProtect}
                        className={`px-2 py-1.5 rounded text-xs text-left ${
                          canProtect
                            ? 'bg-blue-600 hover:bg-blue-500'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold">{target.name}</div>
                        <div className={canProtect ? 'text-blue-200' : 'text-slate-500'}>
                          {target.hp <= 0 ? '💀 KO' : target.status?.protected ? '🛡️ Already Protected' : '🛡️ Ready'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Flee/End Combat */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                dispatch({ type: 'LOG', t: `Party attempts to flee!` });
                setCombatPhase(COMBAT_PHASES.FLED);
              }}
              className="flex-1 bg-yellow-700 hover:bg-yellow-600 px-3 py-1.5 rounded text-sm"
            >
              🏃 Flee
            </button>
            <button
              onClick={handleEndCombat}
              className="flex-1 bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded text-sm"
            >
              ❌ End Combat
            </button>
          </div>

          {/* VICTORY - Show below combat, not replacing */}
          {combatWon && (
            <div className="mt-2 pt-2 border-t-2 border-green-500/50 space-y-2">
              <div className="bg-green-900/50 rounded p-3 text-center border-2 border-green-500/50">
                <div className="text-green-400 font-bold text-xl">🎉 VICTORY!</div>
                <div className="text-slate-300 text-sm">All foes have been defeated!</div>
              </div>

              <button
                onClick={() => {
                  rollTreasure(dispatch);
                  setRoomEvents(prev => [...prev, { type: 'TREASURE', data: {}, timestamp: Date.now() }]);
                }}
                className="w-full bg-amber-600 hover:bg-amber-500 px-3 py-2 rounded text-sm font-bold"
              >
                💰 Roll Treasure
              </button>

              <button
                onClick={() => {
                  handleEndCombat();
                  if (!corridor) {
                    // setActionMode(ACTION_MODES.EMPTY); // Can search room after combat
                  }
                }}
                className="w-full bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm font-bold"
              >
                ✓ Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* DEFEAT - Show below combat if party wiped */}
      {!hasActiveMonsters && state.party.every(h => h.hp <= 0) && combatPhase !== COMBAT_PHASES.NONE && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
          <div className="bg-red-900/50 rounded p-3 text-center border-2 border-red-500/50">
            <div className="text-red-400 font-bold text-xl">💀 DEFEAT</div>
            <div className="text-slate-300 text-sm">The party has fallen...</div>
          </div>

          <button
            onClick={() => {
              handleEndCombat();
              clearTile();
            }}
            className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
          >
            End Adventure
          </button>
        </div>
      )}

      {/* NON-COMBAT MODES - Only show when not in combat at all */}
      {!hasActiveMonsters && combatPhase === COMBAT_PHASES.NONE && tileResult && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
          {/* Special Feature */}
          {actionMode === ACTION_MODES.SPECIAL && roomDetails?.special && (
            <div className="bg-purple-900/30 rounded p-3">
              <div className="text-purple-400 font-bold">{roomDetails.special.name}</div>
              <div className="text-slate-300 text-sm mt-1">{roomDetails.special.description}</div>
              {roomDetails.special.effect && (
                <button
                  onClick={() => setShowDungeonFeatures(true)}
                  className="mt-2 w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm"
                >
                  ✨ Interact with Feature
                </button>
              )}
            </div>
          )}

          {/* Empty Room/Corridor */}
          {actionMode === ACTION_MODES.EMPTY && (
            <div className="bg-slate-700/50 rounded p-3">
              <div className="text-slate-400 font-bold">
                {corridor ? '📦 Empty Corridor' : '📦 Empty Room'}
              </div>
              <div className="text-slate-300 text-sm mt-1">
                {corridor
                  ? 'Corridors can be searched but have fewer features.'
                  : 'You may search the room for hidden treasure or secrets.'}
              </div>
            </div>
          )}

          {/* Treasure Room (non-combat) */}
          {actionMode === ACTION_MODES.TREASURE && (
            <div className="bg-amber-900/30 rounded p-3">
              <div className="text-amber-400 font-bold">💰 Treasure!</div>
              <div className="text-slate-300 text-sm mt-1">Check the log for details of what you found.</div>
            </div>
          )}

          {/* Quest Room */}
          {actionMode === ACTION_MODES.QUEST && (
            <div className="bg-amber-900/30 rounded p-3">
              <div className="text-amber-500 font-bold">🏆 Quest Room!</div>
              <div className="text-slate-300 text-sm mt-1">
                This is the dungeon's final objective! Complete your quest here.
              </div>
            </div>
          )}

          {/* Search Button - for rooms, not corridors in some cases */}
          {(actionMode === ACTION_MODES.EMPTY || actionMode === ACTION_MODES.TREASURE) && (
            <button
              onClick={() => setShowDungeonFeatures(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
            >
              🔍 Search {corridor ? 'Corridor' : 'Room'}
            </button>
          )}

          {/* Done Button */}
          <button
            onClick={clearTile}
            className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
          >
            ✓ Done / Continue
          </button>
        </div>
      )}
    </div>
  );
}
