import React, { useState, useCallback, useEffect } from "react";
import { selectParty, selectMonsters } from '../state/selectors.js';
import { setAbility, addMonster, logMessage, clearMonsters } from '../state/actionCreators.js';
import { Dices } from "lucide-react";
import { d6 } from "../utils/dice.js";
import { rollTreasure, performCastSpell, rollWanderingMonster, attemptPartyFlee, attemptWithdraw } from "../utils/gameActions/index.js";
import { SPELLS, getAvailableSpells } from "../data/spells.js";
import { createMonsterFromTable, MONSTER_CATEGORIES, getAllMonsters } from '../data/monsters.js';
import { TILE_SHAPE_TABLE } from '../data/rooms.js';
import { COMBAT_PHASES, ACTION_MODES } from "../constants/gameConstants.js";
import { EVENT_TYPES } from "../constants/gameConstants.js";
import EventCard from "./actionPane/EventCard.jsx";
import Combat from "./Combat.jsx";
import MarchingOrder from './MarchingOrder.jsx';
import {
  SearchModal,
  HiddenTreasureModal,
  SecretDoorModal,
  SecretPassageModal
} from './SearchModal.jsx';
import {
  performSearchRoll,
  findClue,
  findHiddenTreasure,
  findSecretDoor,
  findSecretPassage
} from '../utils/gameActions/explorationActions.js';
import { attemptDisarmTrap, triggerTrap } from '../utils/gameActions/dungeonActions.js';

export default function ActionPane({
  state,
  dispatch,
  actionMode,
  selectedHero,
  onSelectHero,
  roomEvents,
  tileResult,
  roomDetails,
  generateTile,
  clearTile,
  isCorridor,
  applyContentChoice,
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
  setShowDungeonFeatures,
}) {
  const [showSpells, setShowSpells] = useState(null);
  const [showHealTarget, setShowHealTarget] = useState(null);
  const [showBlessTarget, setShowBlessTarget] = useState(null);
  const [showProtectionTarget, setShowProtectionTarget] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [hiddenTreasureResult, setHiddenTreasureResult] = useState(null);
  const [secretDoorResult, setSecretDoorResult] = useState(null);
  const [secretPassageResult, setSecretPassageResult] = useState(null);
  const [showHeroSelection, setShowHeroSelection] = useState(null); // For selecting hero who found clue

  const party = selectParty(state);
  const monsters = selectMonsters(state);
  const activeMonsters = getActiveMonsters();
  const hasActiveMonsters = activeMonsters.length > 0;
  const combatWon = isCombatWon();
  const corridor = isCorridor();
  const [hasSavedTile, setHasSavedTile] = useState(false);

  // Helper: find recent tile roll events so we can render them side-by-side
  const d66Idx = roomEvents.findIndex(e => e.type === 'D66_ROLL');
  const contentsIdx = roomEvents.findIndex(e => e.type === 'CONTENTS_ROLL');
  const d66Event = d66Idx >= 0 ? roomEvents[d66Idx] : null;
  const contentsEvent = contentsIdx >= 0 ? roomEvents[contentsIdx] : null;

  // If a contents roll spawned a monster event directly after it, exclude that first monster event
  let duplicateMonsterTimestamp = null;
  if (contentsEvent) {
    const nextMonster = roomEvents.slice(contentsIdx + 1).find(e => e.type === EVENT_TYPES.MONSTER);
    if (nextMonster) duplicateMonsterTimestamp = nextMonster.timestamp;
  }

  useEffect(() => {
    try {
  const saved = !!localStorage.getItem('lastTileData');
      setHasSavedTile(saved);
    } catch (e) {
      setHasSavedTile(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (tileResult) {
  // saving detailed tile state is handled in useRoomEvents; keep this flag for compatibility
  localStorage.setItem('lastTileData', JSON.stringify({ tileResult }));
        setHasSavedTile(true);
      } else {
  localStorage.removeItem('lastTileData');
        setHasSavedTile(false);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [tileResult]);

  // Handle spell casting
  const handleCastSpell = useCallback((casterIdx, spellKey) => {
    const caster = party[casterIdx];
    const spell = SPELLS[spellKey];
    const context = {};

    // Protection spell: open target selection popup
    if (spellKey === "protection") {
      setShowProtectionTarget(casterIdx);
      return;
    }

    // For attack spells, target first alive monster
    if (spell.type === "attack") {
      const activeMonsters = getActiveMonsters();
      if (activeMonsters.length > 0) {
        const targetMonster = activeMonsters[0];
        const targetIdx = monsters.findIndex(
          (m) => m.id === targetMonster.id,
        );
        context.targetMonsterIdx = targetIdx;
        context.targetMonster = targetMonster;
        context.targets = [targetMonster];
      }
    }

    // For healing spells, find lowest HP ally
    if (spell.type === "healing") {
      const lowestHP = party.reduce(
        (min, h, idx) =>
          h.hp > 0 &&
          h.hp < h.maxHp &&
          (min === null || h.hp < party[min].hp)
            ? idx
            : min,
        null,
      );
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
  dispatch(setAbility(casterIdx, "spellsUsed", (abilities.spellsUsed || 0) + 1));

    // Close spell selection
    setShowSpells(null);
  }, [party, monsters, getActiveMonsters, state.party, state.abilities, dispatch]);

  // Determine whether we should show the idle (Generate Tile) view.
  const showIdle = (!tileResult && roomEvents.length === 0 && !hasActiveMonsters && !hasSavedTile);

  return (
    <div className="space-y-2">
      {showIdle ? (
        <div className="space-y-3">
          <div className="mb-2">
            <MarchingOrder state={state} selectedHero={selectedHero} onSelectHero={onSelectHero} dispatch={dispatch} />
          </div>
          <div className="bg-slate-800 rounded p-4 text-center">
            <div className="text-slate-400 text-sm mb-3">Ready to explore</div>
            <button
              onClick={generateTile}
              className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-4 py-3 rounded font-bold text-sm flex items-center justify-center gap-2"
            >
              <Dices size={18} /> Generate Tile
            </button>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => rollWanderingMonster(dispatch)}
                className="flex-1 bg-red-700 hover:bg-red-600 px-3 py-2 rounded text-sm"
              >
                Wandering (d6)
              </button>

              <button
                onClick={() => {
                  // Prompt for manual d66 and 2d6 values for debugging
                  const rawD66 = prompt('Enter d66 (e.g. 11, 12, 21, 66):', '11');
                  if (!rawD66) return;
                  const shapeRoll = parseInt(rawD66, 10);
                  if (Number.isNaN(shapeRoll) || !Object.keys(TILE_SHAPE_TABLE).includes(String(shapeRoll))) {
                    alert('Invalid d66 value');
                    return;
                  }
                  const raw2d6 = prompt('Enter 2d6 result (2-12):', '8');
                  if (!raw2d6) return;
                  const contentsRoll = parseInt(raw2d6, 10);
                  if (Number.isNaN(contentsRoll) || contentsRoll < 2 || contentsRoll > 12) {
                    alert('Invalid 2d6 value');
                    return;
                  }
                  // Call generateTile with overrides
                  try {
                    generateTile({ shapeRoll, contentsRoll });
                  } catch (e) {
                    console.error('Custom tile generation failed', e);
                  }
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 px-3 py-2 rounded text-sm"
              >
                Custom Tile
              </button>
            </div>
            {/* Monster spawn controls moved from Combat: Custom Monster, Quick Minor Foe, and Monster Table */}
            <div className="grid grid-cols-2 gap-1 mt-3">
              <button
                onClick={() => {
                  // Custom Monster prompt flow (simple inline prompts)
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
                    dispatch(addMonster(monster));
                    dispatch(logMessage(`⚔️ ${name} L${level} (${hp}HP) Major Foe added`));
                  } else {
                    const count = parseInt(prompt('How many?', '6')) || 6;
                    monster = {
                      id: Date.now(),
                      name,
                      level,
                      hp: 1,
                      maxHp: 1,
                      count: count,
                      initialCount: count,
                      type: 'custom',
                      isMinorFoe: true
                    };
                    dispatch(addMonster(monster));
                    dispatch(logMessage(`👥 ${count}x ${name} L${level} Minor Foes added`));
                  }
                }}
                className="bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
              >
                Custom Monster
              </button>

              <div className="bg-slate-700 rounded p-2">
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
                        dispatch(addMonster(monster));
                        dispatch(logMessage(`👥 ${foe.count}x ${foe.name} L${foe.level} appear!`));
                      }}
                      className="bg-blue-600 hover:bg-blue-500 px-1.5 py-0.5 rounded text-xs"
                    >
                      {foe.count}x L{foe.level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Monster Table Dropdown */}
            <div className="flex gap-1 mt-2">
              <MonsterTableSpawn dispatch={dispatch} />
            </div>
            <div className="text-slate-500 text-xs mt-2">
              Rolls d66 for shape + 2d6 for contents
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2" data-testid="marching-order-container">
            <MarchingOrder state={state} selectedHero={selectedHero} onSelectHero={onSelectHero} dispatch={dispatch} />
          </div>

          {/* "Clear saved room" button removed; use the Exit Room button below which also clears monsters and persisted tile data. */}

          <div className="space-y-1">
            {/* Show any die rolls (d66 and/or 2d6) in a compact row, then render remaining events */}
            <div className="flex gap-2 items-start">
              {d66Event && (
                <div className="flex-1 bg-blue-900/30 rounded p-2 text-xs border-l-2 border-blue-400 text-left">
                  <div className="flex items-center justify-between">
                    <div className="text-blue-400 font-bold">d66 {d66Event.data.roll}</div>
                    <div className="ml-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${ (tileResult?.isCorridor || corridor) ? 'bg-amber-700 text-black' : 'bg-emerald-700 text-white' }`}>
                        {(tileResult?.isCorridor || corridor) ? 'Corridor' : 'Room'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {contentsEvent && (
                <div className="flex-1 bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-400 text-right">
                  <div className="text-amber-400 font-bold">2d6 {contentsEvent.data.roll}</div>
                </div>
              )}
            </div>

            {/* Contents description spans full width under both rolls */}
            {contentsEvent && (
              <div className="text-slate-300 text-sm mt-1">{contentsEvent.data.description}</div>
            )}

            {/* Render remaining events, excluding any roll events we already displayed */}
            {roomEvents
              .filter(e => {
                if ((e.type === 'D66_ROLL' && d66Event) || (e.type === 'CONTENTS_ROLL' && contentsEvent)) return false;
                if (duplicateMonsterTimestamp && e.type === EVENT_TYPES.MONSTER && e.timestamp === duplicateMonsterTimestamp) return false;
                return true;
              })
              .map((event, index) => (
                <EventCard key={`event-${event.type}-${event.timestamp || index}`} event={event} index={index} />
            ))}
          </div>

          {hasActiveMonsters && (
            <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
              <Combat
                state={state}
                dispatch={dispatch}
                selectedHero={selectedHero}
                setSelectedHero={onSelectHero}
                handleRollReaction={handleRollReaction}
              />
            </div>
          )}

          {!hasActiveMonsters && state.party.every((h) => h.hp <= 0) && combatPhase !== COMBAT_PHASES.NONE && (
            <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
              <div className="bg-red-900/50 rounded p-3 text-center border-2 border-red-500/50">
                <div className="text-red-400 font-bold text-xl">DEFEAT</div>
                <div className="text-slate-300 text-sm">The party has fallen...</div>
              </div>
              <button onClick={() => { handleEndCombat(); clearTile(); }} className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm">End Adventure</button>
            </div>
          )}

          {!hasActiveMonsters && combatPhase === COMBAT_PHASES.NONE && tileResult && (
            <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
              {/* "Back to Explore" button removed; use the Exit room button at the bottom to clear tile and return to exploration */}

              {actionMode === ACTION_MODES.SPECIAL && roomDetails?.special && (
                <div className="bg-purple-900/30 rounded p-3">
                  <div className="text-purple-400 font-bold">{roomDetails.special.name}</div>
                  <div className="text-slate-300 text-sm mt-1">{roomDetails.special.description}</div>
                  {roomDetails.special.effect && (
                    <button onClick={() => setShowDungeonFeatures(true)} className="mt-2 w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm">✨ Interact with Feature</button>
                  )}
                </div>
              )}

              {actionMode === ACTION_MODES.EMPTY && (
                <div className="bg-slate-700/50 rounded p-3">
                  <div className="text-slate-400 font-bold">{corridor ? "📦 Empty Corridor" : "📦 Empty Room"}</div>
                  <div className="text-slate-300 text-sm mt-1">{corridor ? "Corridors can be searched but have fewer features." : "You may search the room for hidden treasure or secrets."}</div>
                </div>
              )}

              {actionMode === ACTION_MODES.TREASURE && (
                <div className="bg-amber-900/30 rounded p-3"><div className="text-amber-400 font-bold">💰 Treasure!</div><div className="text-slate-300 text-sm mt-1">Check the log for details of what you found.</div></div>
              )}

              {actionMode === ACTION_MODES.QUEST && (
                <div className="bg-amber-900/30 rounded p-3"><div className="text-amber-500 font-bold">🏆 Quest Room!</div><div className="text-slate-300 text-sm mt-1">This is the dungeon's final objective! Complete your quest here.</div></div>
              )}

              {/* Dual-content rolls are auto-resolved based on the d66 roll (no player choice required) */}

              {(actionMode === ACTION_MODES.EMPTY || actionMode === ACTION_MODES.TREASURE) && !(tileResult?.contentType === 'treasure' && [2,3].includes(tileResult?.contentsRoll)) && (
                <button
                  onClick={() => {
                    // Perform search roll - corridor status from tileResult if available
                    const isInCorridor = tileResult?.isCorridor || corridor;
                    const result = performSearchRoll({ isInCorridor });
                    setSearchResult(result);
                    dispatch({ type: 'LOG', t: result.message });
                  }}
                  className="w-full px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500"
                >
                  🔍 Search {tileResult?.isCorridor || corridor ? "Corridor" : "Room"}
                </button>
              )}

              {/* Done / Continue removed - use "Exit room" which also clears monsters and saved tile data */}
            </div>
          )}
          {/* Bottom action buttons: Withdraw, Flee (only during combat), and Exit room (always) */}
          <div className="flex gap-2 mt-2">
            {hasActiveMonsters && (
              <>
                <button
                  onClick={() => attemptWithdraw(dispatch, state.party, selectMonsters(state), state.doors)}
                  className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                  disabled={!state.doors || state.doors.length === 0}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => attemptPartyFlee(dispatch, state.party, selectMonsters(state), Math.max(...selectMonsters(state).map(m => m.level), 1))}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded text-sm"
                >
                  Flee
                </button>
              </>
            )}
            <button
              onClick={() => {
                try { localStorage.removeItem('lastTileData'); } catch (e) {}
                try { dispatch(clearMonsters()); } catch (e) { dispatch({ type: 'CLEAR_MONSTERS' }); }
                clearTile();
              }}
              className="flex-1 bg-red-800 hover:bg-red-700 px-3 py-2 rounded text-sm"
            >
              Exit room
            </button>
          </div>
        </div>
      )}

      {/* Search Modals */}
      {searchResult && (
        <SearchModal
          searchResult={searchResult}
          state={state}
          onChoice={(choice) => {
            // Handle user's search choice
            if (choice === 'clue') {
              // Show hero selection modal
              setShowHeroSelection(true);
              setSearchResult(null);
            } else if (choice === 'hidden_treasure') {
              const result = findHiddenTreasure(dispatch, state.hcl);
              setHiddenTreasureResult(result);
            } else if (choice === 'secret_door') {
              const result = findSecretDoor(dispatch);
              setSecretDoorResult(result);
            } else if (choice === 'secret_passage') {
              const result = findSecretPassage(dispatch, state.currentEnvironment || 'dungeon');
              setSecretPassageResult(result);
            }
            setSearchResult(null);
          }}
          onClose={() => {
            if (searchResult.type === 'wandering_monsters') {
              // Trigger wandering monster roll
              rollWanderingMonster(dispatch, state.hcl);
            }
            setSearchResult(null);
          }}
        />
      )}

      {hiddenTreasureResult && (
        <HiddenTreasureModal
          treasure={hiddenTreasureResult.treasure}
          complication={hiddenTreasureResult.complication}
          state={state}
          onResolve={(action) => {
            if (action === 'alarm') {
              rollWanderingMonster(dispatch, state.hcl);
            } else if (action === 'disarm_trap') {
              // Find a rogue in the party
              const rogueIdx = state.party.findIndex(h => h.class === 'Rogue' && h.hp > 0);
              if (rogueIdx >= 0) {
                const rogue = state.party[rogueIdx];
                // Use a generic trap type for hidden treasure traps (dart trap)
                const result = attemptDisarmTrap(dispatch, rogue, 'dart');

                if (!result.success) {
                  // Trap triggered - deal damage to the rogue
                  const trapResult = triggerTrap(dispatch, rogue, 'dart');
                  if (trapResult.damage > 0) {
                    dispatch({ type: 'DAMAGE', idx: rogueIdx, n: trapResult.damage });
                  }
                }
              } else {
                dispatch({ type: 'LOG', t: `⚠️ No conscious Rogue available to disarm the trap!` });
                // If no rogue, trigger trap on random party member
                const aliveParty = state.party.filter(h => h.hp > 0);
                if (aliveParty.length > 0) {
                  const targetIdx = state.party.findIndex(h => h.id === aliveParty[Math.floor(Math.random() * aliveParty.length)].id);
                  const trapResult = triggerTrap(dispatch, state.party[targetIdx], 'dart');
                  if (trapResult.damage > 0) {
                    dispatch({ type: 'DAMAGE', idx: targetIdx, n: trapResult.damage });
                  }
                }
              }
            } else if (action === 'trigger_trap') {
              // Trigger trap on random party member
              const aliveParty = state.party.filter(h => h.hp > 0);
              if (aliveParty.length > 0) {
                const targetIdx = state.party.findIndex(h => h.id === aliveParty[Math.floor(Math.random() * aliveParty.length)].id);
                const trapResult = triggerTrap(dispatch, state.party[targetIdx], 'dart');
                if (trapResult.damage > 0) {
                  dispatch({ type: 'DAMAGE', idx: targetIdx, n: trapResult.damage });
                }
              }
            } else if (action === 'banish_ghost') {
              // Find a cleric in the party
              const clericIdx = state.party.findIndex(h => h.class === 'Cleric' && h.hp > 0);
              if (clericIdx >= 0) {
                const cleric = state.party[clericIdx];
                const roll = d6();
                const bonus = Math.floor(cleric.lvl / 2); // Clerics get +½L vs undead
                const total = roll + bonus;
                const dc = 3 + state.hcl; // DC increases with dungeon level

                if (total >= dc) {
                  dispatch({
                    type: 'LOG',
                    t: `✨ ${cleric.name} banishes the ghost! (${roll}+${bonus}=${total} vs DC${dc})`
                  });
                } else {
                  dispatch({
                    type: 'LOG',
                    t: `💀 ${cleric.name} fails to banish the ghost! (${roll}+${bonus}=${total} vs DC${dc}) All PCs lose 1 Life!`
                  });
                  // Apply 1 damage to all party members
                  state.party.forEach((hero, idx) => {
                    if (hero.hp > 0) {
                      dispatch({ type: 'DAMAGE', idx, n: 1 });
                    }
                  });
                }
              } else {
                dispatch({ type: 'LOG', t: `⚠️ No conscious Cleric available! All PCs lose 1 Life from the ghost!` });
                // Apply 1 damage to all party members
                state.party.forEach((hero, idx) => {
                  if (hero.hp > 0) {
                    dispatch({ type: 'DAMAGE', idx, n: 1 });
                  }
                });
              }
            } else if (action === 'fight_ghost') {
              dispatch({ type: 'LOG', t: `All PCs lose 1 Life from the ghost!` });
              // Apply 1 damage to all party members
              state.party.forEach((hero, idx) => {
                if (hero.hp > 0) {
                  dispatch({ type: 'DAMAGE', idx, n: 1 });
                }
              });
            }

            // Award the gold
            dispatch({ type: 'GOLD', n: hiddenTreasureResult.treasure.gold });
            setHiddenTreasureResult(null);
          }}
          onClose={() => {
            // Award the gold if complication was resolved
            if (hiddenTreasureResult.treasure) {
              dispatch({ type: 'GOLD', n: hiddenTreasureResult.treasure.gold });
            }
            setHiddenTreasureResult(null);
          }}
        />
      )}

      {secretDoorResult && (
        <SecretDoorModal
          secretDoor={secretDoorResult}
          onClose={() => setSecretDoorResult(null)}
        />
      )}

      {secretPassageResult && (
        <SecretPassageModal
          passage={secretPassageResult}
          onClose={() => setSecretPassageResult(null)}
        />
      )}

      {showHeroSelection && (
        <HeroSelectionModal
          party={party}
          onSelect={(heroIdx) => {
            findClue(dispatch, heroIdx, state.party[heroIdx]?.name || 'Hero');
            setShowHeroSelection(null);
          }}
          onClose={() => setShowHeroSelection(null)}
        />
      )}
    </div>
  );
}

function MonsterTableSpawn({ dispatch }) {
  const [selectedMonster, setSelectedMonster] = useState('');
  const monsterList = getAllMonsters();

  const handleSpawn = () => {
    if (!selectedMonster) return;
    // Determine hcl = highest character level
    const hcl = Math.max(...(JSON.parse(localStorage.getItem('party') || '[]').map(h => h.lvl || 1) || [1]), 1);
    // Fallback: attempt to create without hcl if not available
    let monster = createMonsterFromTable(selectedMonster, hcl);
    if (!monster) return;
    dispatch(addMonster(monster));
    const abilitiesText = monster.abilities && monster.abilities.length > 0 ? ` [${monster.abilities.join(', ')}]` : '';
    dispatch(logMessage(`${monster.name} L${monster.level} (${monster.hp}HP)${abilitiesText} appears!`));
    setSelectedMonster('');
  };

  return (
    <>
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
      <button onClick={handleSpawn} disabled={!selectedMonster} className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 px-2 py-1 rounded text-xs">Spawn</button>
    </>
  );
}

function HeroSelectionModal({ party, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-amber-400">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-amber-400">🔍 Who Found the Clue?</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="text-slate-300 text-sm mb-4">
          Select which hero discovered the clue while searching:
        </div>

        <div className="space-y-2">
          {party.map((hero, idx) => (
            <button
              key={hero.id || idx}
              onClick={() => onSelect(idx)}
              className={`w-full p-3 rounded border-2 text-left transition-colors ${
                hero.hp <= 0
                  ? 'bg-slate-700 border-slate-600 opacity-50 cursor-not-allowed'
                  : 'bg-slate-700 border-slate-500 hover:border-amber-400 hover:bg-slate-600'
              }`}
              disabled={hero.hp <= 0}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{hero.name}</div>
                  <div className="text-xs text-slate-400">{hero.class}</div>
                </div>
                <div className="text-sm">
                  <span className={hero.hp <= 0 ? 'text-red-400' : 'text-green-400'}>
                    {hero.hp}/{hero.maxHp} HP
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
