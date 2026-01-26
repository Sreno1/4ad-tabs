import React, { useState, useCallback, useEffect } from "react";
import { selectParty, selectMonsters } from '../state/selectors.js';
import { setAbility, addMonster, logMessage, clearMonsters, incrementMinorEncounter, incrementMajorFoe } from '../state/actionCreators.js';
import { Dices } from "lucide-react";
import { d6 } from "../utils/dice.js";
import { formatRollPrefix } from '../utils/rollLog.js';
import { rollTreasure, performCastSpell, rollWanderingMonster, attemptPartyFlee, attemptWithdraw, rollRareMushroomTable } from "../utils/gameActions/index.js";
import { SPELLS, getAvailableSpells } from "../data/spells.js";
import { createMonsterFromTable, MONSTER_CATEGORIES, getAllMonsters } from '../data/monsters.js';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE } from '../data/rooms.js';
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
import sfx from '../utils/sfx.js';
import { ASSIGN_TREASURE } from '../state/actions.js';
import { attemptDisarmTrap, triggerTrap } from '../utils/gameActions/dungeonActions.js';

export default function ActionPane({
  state,
  dispatch,
  actionMode,
  selectedHero,
  onSelectHero,
  mapActions = {},
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
  const [tileSearched, setTileSearched] = useState(false);
  const [hiddenTreasureResult, setHiddenTreasureResult] = useState(null);
  const [secretDoorResult, setSecretDoorResult] = useState(null);
  const [secretPassageResult, setSecretPassageResult] = useState(null);
  const [showHeroSelection, setShowHeroSelection] = useState(null); // For selecting hero who found clue

  const party = selectParty(state);
  const monsters = selectMonsters(state);
  const activeMonsters = getActiveMonsters();
  const hasActiveMonsters = activeMonsters.length > 0;
  const combatWon = isCombatWon();
  // Build a human-readable summary of defeated monsters for the victory banner
  const defeatedMonsters = (state.monsters || []).filter(m => {
    return (m.hp !== undefined && m.hp <= 0) || (m.count !== undefined && m.count === 0);
  });

  const victoryMessage = (() => {
    if (!defeatedMonsters || defeatedMonsters.length === 0) return 'You defeated the foes! You may exit the room safely.';
    const parts = defeatedMonsters.map((m) => {
      // Minor foe group (uses initialCount when available)
      if (m.count !== undefined) {
        const total = m.initialCount || m._initialCount || m.count || 0;
        const plural = total > 1 ? 'minions' : 'minion';
        return `${total} level ${m.level} ${m.name} ${plural}`;
      }
      // Major/unique foe
      return `level ${m.level} ${m.name}`;
    });
    const joined = parts.join(' and ');
    return `You defeated ${joined}! You may exit the room safely.`;
  })();

  // Minion XP threshold: 10 kills per XP roll (project header/documentation)
  const MINION_XP_THRESHOLD = 10;

  // Only consider minion progress if this victory involved minions
  const victoryIncludedMinions = defeatedMonsters.some(m => (typeof m.count !== 'undefined') || m.isMinorFoe);

  // Count defeated minion GROUPS (not individual minions). A group counts as defeated if
  // its `count` reached 0 or it fled. Use this to track progress toward the GROUP threshold.
  const totalMinionGroupsDefeated = (state.monsters || []).reduce((sum, m) => {
    if (typeof m.count === 'undefined') return sum;
    if (m.count === 0 || m.fled) return sum + 1;
    return sum;
  }, 0);

  const groupsRemainder = totalMinionGroupsDefeated % MINION_XP_THRESHOLD;
  const remainingMinionGroups = totalMinionGroupsDefeated === 0 ? MINION_XP_THRESHOLD : (groupsRemainder === 0 ? 0 : MINION_XP_THRESHOLD - groupsRemainder);
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
  // Reset local per-tile searched flag when a new tile appears
  setTileSearched(false);
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
      {/* Marching order + controls are shown regardless of room state */}
      <div className="mb-2" data-testid="marching-order-container">
        <MarchingOrder state={state} selectedHero={selectedHero} onSelectHero={onSelectHero} dispatch={dispatch} />
      </div>
      <div className="border-t border-slate-700 my-2" />
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => { if (mapActions.onWandering) mapActions.onWandering(); }}
          className="flex-1 bg-red-700 hover:bg-red-600 px-3 py-2 rounded text-sm"
          title="Roll Wandering Monster"
        >
          Wandering
        </button>
        <button
          onClick={() => { if (mapActions.onCustomMonster) mapActions.onCustomMonster(); }}
          className="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
          title="Spawn Custom Monster"
        >
          Custom Monster
        </button>
      </div>

      {showIdle ? (
        <div className="space-y-3">
          <div className="mb-2">
            {/* idle view content (marching order is shown above) */}
          </div>
        </div>
      ) : (
        <div>

          {/* "Clear saved room" button removed; use the Exit Room button below which also clears monsters and persisted tile data. */}

          <div className="space-y-1">
            {/* Show any die rolls (d66 and/or 2d6) in a compact row, then render remaining events */}
            <div className="flex gap-2 items-start">
              {d66Event && (
                <div className="flex-1 bg-blue-900/30 rounded p-2 text-xs border-l-2 border-blue-400 text-left">
                  <div className="flex items-center justify-between">
                    <div className="text-blue-400 font-bold">d66 {d66Event.data.roll}</div>
                    <div className="ml-2" />
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
                  {roomDetails.special.effect === 'secret_passage' ? (
                    <button
                      onClick={() => {
                        const result = findSecretPassage(dispatch, state.currentEnvironment || 'dungeon');
                        setSecretPassageResult(result);
                      }}
                      className="mt-2 w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm"
                    >
                      ️ Choose Destination
                    </button>
                  ) : roomDetails.special.effect ? (
                    <button
                      onClick={() => setShowDungeonFeatures(true)}
                      className="mt-2 w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm"
                    >
                       Interact with Feature
                    </button>
                  ) : null}
                </div>
              )}

              {actionMode === ACTION_MODES.EMPTY && (
                <div className="bg-slate-700/50 rounded p-3">
                  <div className="text-slate-400 font-bold">{corridor ? " Empty Corridor" : " Empty Room"}</div>
                  <div className="text-slate-300 text-sm mt-1">{corridor ? "Corridors can be searched but have fewer features." : "You may search the room for hidden treasure or secrets."}</div>
                </div>
              )}

              {actionMode === ACTION_MODES.TREASURE && (
                <div className="bg-amber-900/30 rounded p-3"><div className="text-amber-400 font-bold"> Treasure!</div></div>
              )}

              {actionMode === ACTION_MODES.QUEST && (
                <div className="bg-amber-900/30 rounded p-3"><div className="text-amber-500 font-bold"> Quest Room!</div><div className="text-slate-300 text-sm mt-1">This is the dungeon's final objective! Complete your quest here.</div></div>
              )}

              {/* Dual-content rolls are auto-resolved based on the d66 roll (no player choice required) */}

      {(actionMode === ACTION_MODES.EMPTY || actionMode === ACTION_MODES.TREASURE) && !tileSearched && !(tileResult?.contentType === 'treasure' && [2,3].includes(tileResult?.contentsRoll)) && (
                <button
                  onClick={() => {
                    // Perform search roll - corridor status from tileResult if available
                    const isInCorridor = tileResult?.isCorridor || corridor;
                    const result = performSearchRoll({
                      isInCorridor,
                      environment: state.currentEnvironment || 'dungeon',
                      party: state.party
                    });
                    try { sfx.play('miss', { volume: 0.7 }); } catch (e) {}
                    setSearchResult(result);
                    // Mark this tile as searched locally so the Search button is hidden
                    setTileSearched(true);
                    // If this tile has explicit coordinates, mark it in global dungeon state so other components know
                    try {
                      if (tileResult && typeof tileResult.x === 'number' && typeof tileResult.y === 'number') {
                        dispatch({ type: 'MARK_TILE_SEARCHED', x: tileResult.x, y: tileResult.y });
                      }
                    } catch (e) {}
                    dispatch({ type: 'LOG', t: result.message });
                  }}
                  className="w-full px-3 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500"
                >
                   Search {tileResult?.isCorridor || corridor ? "Corridor" : "Room"}
                </button>
              )}

              {/* Done / Continue removed - use "Exit room" which also clears monsters and saved tile data */}
            </div>
          )}
          {/* Bottom action buttons: Withdraw, Flee (only during combat), and Exit room (always) */}
          {combatWon && (
            <div className="mb-2">
              <div className="bg-emerald-900/30 rounded p-3 text-center border-2 border-emerald-500/30">
                <div className="text-emerald-300 font-bold text-lg">VICTORY</div>
                <div className="text-slate-300 text-sm">{victoryMessage}</div>
                {victoryIncludedMinions && totalMinionGroupsDefeated >= 0 && (
                  <div className="text-slate-400 text-xs mt-1">
                    {remainingMinionGroups === 0
                      ? `Minion XP ready to roll (every ${MINION_XP_THRESHOLD} groups).`
                      : `${totalMinionGroupsDefeated}/${MINION_XP_THRESHOLD} minion groups — ${remainingMinionGroups} more until XP roll.`}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            {hasActiveMonsters && (
              <>
                <button
                  onClick={() => {
                    const result = attemptWithdraw(dispatch, state.party, selectMonsters(state), state.doors);
                    try {
                      if (result?.success === false) {
                        sfx.play('select3', { volume: 0.8 });
                      } else {
                        sfx.play('jump4', { volume: 0.8 });
                      }
                    } catch (e) {}
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                  disabled={!state.doors || state.doors.length === 0}
                >
                  Withdraw
                </button>
                <button
                  onClick={() => {
                    const monsters = selectMonsters(state);
                    const highest = Math.max(...monsters.map(m => m.level), 1);
                    const result = attemptPartyFlee(dispatch, state.party, monsters, highest, {
                      environment: state.currentEnvironment || 'dungeon'
                    });
                    try {
                      const failedCount = result?.failedCount || 0;
                      if (failedCount > 0) {
                        sfx.play('select3', { volume: 0.8 });
                      } else {
                        sfx.play('jump5', { volume: 0.8 });
                      }
                    } catch (e) {}
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 px-3 py-2 rounded text-sm"
                >
                  Flee
                </button>
              </>
            )}
            <button
              onClick={() => {
                try { localStorage.removeItem('lastTileData'); } catch (e) {}
                // If there are defeated monsters, increment counters before clearing
                try {
                  // Defensive defeated detection: different code paths may mark monsters as defeated
                  const monstersList = (state.monsters || []);
                  const defeated = monstersList.filter(m => {
                    // Standard: hp <= 0 or count === 0
                    if ((m.hp !== undefined && m.hp <= 0) || (m.count !== undefined && m.count === 0)) return true;
                    // Alternate flags some routines may use
                    if (m.dead === true || m.defeated === true) return true;
                    // Fallback: hp explicitly zero-like
                    if (m.hp === 0) return true;
                    return false;
                  });
                  try { console.log('[ActionPane] exit -> defeated list length', defeated.length, 'monstersList length', monstersList.length); } catch (e) {}
                  if (defeated.length === 0) {
                    // show details to help debugging
                    try { console.log('[ActionPane] exit -> no defeated monsters found; sample monsters:', monstersList.slice(0,5)); } catch (e) {}
                  }
                  defeated.forEach(monster => {
                    try { console.log('[ActionPane] exit -> processing defeated monster', monster && monster.id, monster && monster.encounterSource); } catch (e) {}
                    if (monster.encounterSource === 'minor_boss') {
                      try { console.log('[ActionPane] exit -> incrementMinorEncounter (minor_boss)', monster); } catch (e) {}
                      dispatch(logMessage(` Increment counter: minor encounter (source=${monster.encounterSource})`,'system'));
                      dispatch(incrementMinorEncounter());
                    } else if (monster.encounterSource === 'major_foe') {
                      try { console.log('[ActionPane] exit -> incrementMajorFoe (major_foe)', monster); } catch (e) {}
                      dispatch(logMessage(` Increment counter: major foe (source=${monster.encounterSource})`,'system'));
                      dispatch(incrementMajorFoe());
                    } else if (monster.encounterSource === 'minion_room' || monster.encounterSource === 'wandering' || monster.isMinorFoe) {
                      try { console.log('[ActionPane] exit -> incrementMinorEncounter (minor group)', monster); } catch (e) {}
                      dispatch(logMessage(` Increment counter: minor encounter (source=${monster.encounterSource})`,'system'));
                      dispatch(incrementMinorEncounter());
                    }
                  });
                } catch (e) {
                  // ignore
                }

                // Prefer the centralized combat cleanup handler if provided by the parent
                // (this ensures local combat flow state is reset in addition to clearing monsters)
                try {
                  if (typeof handleEndCombat === 'function') {
                    handleEndCombat();
                  } else {
                    dispatch(clearMonsters());
                  }
                } catch (e) {
                  try { dispatch(clearMonsters()); } catch (e) { dispatch({ type: 'CLEAR_MONSTERS' }); }
                }
                // Clear tile and persisted tile state
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
          dispatch={dispatch}
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
            } else if (choice === 'listen') {
              const roll = d6() + d6();
              const contents = TILE_CONTENTS_TABLE[roll];
              const description = contents?.roomDescription || contents?.corridorDescription || contents?.description || 'Unknown';
              dispatch(logMessage(` Listen: 2d6=${roll} → ${description}`, 'exploration'));
            } else if (choice === 'rare_mushroom') {
              rollRareMushroomTable(dispatch);
            }
            setSearchResult(null);
          }}
          onClose={() => {
            if (searchResult.type === 'wandering_monsters') {
              // Trigger wandering monster roll as an ambush (retracing tiles)
              rollWanderingMonster(dispatch, { ambush: true, state });
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
          dispatch={dispatch}
          onResolve={(action) => {
            if (action === 'alarm') {
              // Alarm from hidden treasure triggers an ambush
              rollWanderingMonster(dispatch, { ambush: true, state });
            } else if (action === 'disarm_trap') {
              // Find a rogue in the party
              const rogueIdx = state.party.findIndex(h => h.class === 'Rogue' && h.hp > 0);
              if (rogueIdx >= 0) {
                const rogue = state.party[rogueIdx];
                // Use a generic trap type for hidden treasure traps (dart trap)
                const result = attemptDisarmTrap(dispatch, rogue, 'dart', {
                  environment: state.currentEnvironment || 'dungeon'
                });

                if (!result.success) {
                  // Trap triggered - deal damage to the rogue
                  const trapResult = triggerTrap(dispatch, rogue, 'dart', { state, environment: state.currentEnvironment });
                  if (trapResult.damage > 0) {
                    dispatch({ type: 'DAMAGE', idx: rogueIdx, n: trapResult.damage });
                  }
                }
              } else {
                dispatch({ type: 'LOG', t: `️ No conscious Rogue available to disarm the trap!` });
                // If no rogue, trigger trap on random party member
                const aliveParty = state.party.filter(h => h.hp > 0);
                if (aliveParty.length > 0) {
                  const targetIdx = state.party.findIndex(h => h.id === aliveParty[Math.floor(Math.random() * aliveParty.length)].id);
                  const trapResult = triggerTrap(dispatch, state.party[targetIdx], 'dart', { state, environment: state.currentEnvironment });
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
                const trapResult = triggerTrap(dispatch, state.party[targetIdx], 'dart', { state, environment: state.currentEnvironment });
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
          t: `${formatRollPrefix(roll)} ${cleric.name} banishes the ghost! (${roll}+${bonus}=${total} vs DC${dc})`
                  });
                } else {
                  dispatch({
          type: 'LOG',
          t: `${formatRollPrefix(roll)} ${cleric.name} fails to banish the ghost! (${roll}+${bonus}=${total} vs DC${dc}) All PCs lose 1 Life!`
                  });
                  // Apply 1 damage to all party members
                  state.party.forEach((hero, idx) => {
                    if (hero.hp > 0) {
                      dispatch({ type: 'DAMAGE', idx, n: 1 });
                    }
                  });
                }
              } else {
                dispatch({ type: 'LOG', t: `️ No conscious Cleric available! All PCs lose 1 Life from the ghost!` });
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

            // Award the gold, respecting per-hero carry limits
            dispatch({ type: ASSIGN_TREASURE, amount: hiddenTreasureResult.treasure.gold });
            setHiddenTreasureResult(null);
          }}
          onClose={() => {
            // Award the gold if complication was resolved
            if (hiddenTreasureResult.treasure) {
              dispatch({ type: ASSIGN_TREASURE, amount: hiddenTreasureResult.treasure.gold });
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
          onChooseEnvironment={(choice) => {
            findSecretPassage(dispatch, state.currentEnvironment || 'dungeon', choice);
            setSecretPassageResult(null);
          }}
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
          <h2 className="text-xl font-bold text-amber-400"> Who Found the Clue?</h2>
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
