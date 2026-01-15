import React, { useState, useEffect } from 'react';
import { Sword, Map, Users, Scroll, Settings, Book, Save, DoorOpen, TrendingUp, Trophy, ChevronLeft, ChevronRight, Dices, Sparkles, AlertTriangle, HelpCircle, Package, Zap } from 'lucide-react';

// Components
import Dice from './components/Dice.jsx';
import Party from './components/Party.jsx';
import Dungeon from './components/Dungeon.jsx';
import Combat from './components/Combat.jsx';
import Log from './components/Log.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import RulesReference from './components/RulesReference.jsx';
import RulesPdfViewer from './components/RulesPdfViewer.jsx';
import SaveLoadModal from './components/SaveLoadModal.jsx';
import DungeonFeaturesModal from './components/DungeonFeaturesModal.jsx';
import MarchingOrder from './components/MarchingOrder.jsx';
import Analytics from './components/Analytics.jsx';
import CampaignManagerModal from './components/CampaignManagerModal.jsx';
import Equipment from './components/Equipment.jsx';
import Abilities from './components/Abilities.jsx';

// Hooks
import { useGameState } from './hooks/useGameState.js';

// Data and Utils
import { d66, d6, r2d6 } from './utils/dice.js';
import { 
  TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE, 
  SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS,
  checkForBoss
} from './data/rooms.js';
import { spawnMonster, rollTreasure, spawnMajorFoe, awardXP, checkLevelUp, performCastSpell } from './utils/gameActions.js';
import { rollMonsterReaction, REACTION_TYPES } from './data/monsters.js';
import { SPELLS, getAvailableSpells } from './data/spells.js';

// Combat flow phases
const COMBAT_PHASES = {
  NONE: 'none',
  REACTION: 'reaction',       // Roll reaction for monsters
  INITIATIVE: 'initiative',   // Determine who goes first
  PARTY_TURN: 'party_turn',   // Party attacks
  MONSTER_TURN: 'monster_turn', // Monsters attack (defend)
  VICTORY: 'victory',         // Combat won - treasure/XP
  FLED: 'fled'                // Party fled
};

// Action pane modes based on tile contents
const ACTION_MODES = {
  IDLE: 'idle',
  COMBAT: 'combat',
  SPECIAL: 'special',
  TREASURE: 'treasure',
  QUEST: 'quest',
  WEIRD: 'weird',
  EMPTY: 'empty',
  TRAP: 'trap'
};

// Room event types for the progressive action pane
const EVENT_TYPES = {
  TILE_GENERATED: 'tile_generated',
  TREASURE: 'treasure',
  TRAP: 'trap',
  SPECIAL: 'special',
  MONSTER: 'monster',
  BOSS_CHECK: 'boss_check',
  WEIRD: 'weird',
  QUEST: 'quest',
  EMPTY: 'empty',
  SEARCH: 'search'
};

export default function App() {
  const [state, dispatch] = useGameState();
  const [tab, setTab] = useState('party'); // For mobile
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showDungeonFeatures, setShowDungeonFeatures] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);
  const [selectedHero, setSelectedHero] = useState(0);
  const [logCollapsed, setLogCollapsed] = useState(true);
  
  // New layout state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState('party'); // 'party', 'stats', 'log', or 'rules'
  const [actionMode, setActionMode] = useState(ACTION_MODES.IDLE);
  
  // Room state - progressive events that build up
  const [roomEvents, setRoomEvents] = useState([]); // Array of events in current room
  const [tileResult, setTileResult] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [bossCheckResult, setBossCheckResult] = useState(null);
  
  // Combat flow state
  const [combatPhase, setCombatPhase] = useState(COMBAT_PHASES.NONE);
  const [monsterReaction, setMonsterReaction] = useState(null);
  const [partyGoesFirst, setPartyGoesFirst] = useState(true);
  const [showSpells, setShowSpells] = useState(null); // Track which hero is selecting spells
  const [showHealTarget, setShowHealTarget] = useState(null); // Track cleric index for heal target selection
  const [showBlessTarget, setShowBlessTarget] = useState(null); // Track cleric index for bless target selection
  const [showProtectionTarget, setShowProtectionTarget] = useState(null); // Track spellcaster index for Protection target selection
  
  const tabs = [
    { id: 'party', icon: Users, label: 'Party' }, 
    { id: 'dungeon', icon: Map, label: 'Dungeon' }, 
    { id: 'combat', icon: Sword, label: 'Combat' },
    { id: 'analytics', icon: TrendingUp, label: 'Stats' },
    { id: 'log', icon: Scroll, label: 'Log' }
  ];

  // Combined tile generation - rolls both shape and contents at once
  const generateTile = () => {
    const shapeRoll = d66();
    const shapeResult = TILE_SHAPE_TABLE[shapeRoll];
    const contentsRoll = r2d6();
    const contentsResult = TILE_CONTENTS_TABLE[contentsRoll];
    
    dispatch({ type: 'LOG', t: `🎲 NEW TILE: Shape d66=${shapeRoll}, Contents 2d6=${contentsRoll}` });
    dispatch({ type: 'LOG', t: `📐 ${shapeResult.description} | Doors: ${shapeResult.doors}` });
    dispatch({ type: 'LOG', t: `📦 ${contentsResult.description}` });
    
    const result = {
      shape: { roll: shapeRoll, ...shapeResult },
      contents: { roll: contentsRoll, ...contentsResult }
    };
    
    // Reset room state for new tile
    setTileResult(result);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]); // Clear events for new room
    
    // Add tile generated event
    const newEvents = [{
      type: EVENT_TYPES.TILE_GENERATED,
      data: result,
      timestamp: Date.now()
    }];
    
    // Process contents and add events
    processContents(contentsResult, newEvents);
  };
  
  // Add an event to the room events stack
  const addRoomEvent = (eventType, eventData = {}) => {
    setRoomEvents(prev => [...prev, {
      type: eventType,
      data: eventData,
      timestamp: Date.now()
    }]);
  };
  
  // Process tile contents and trigger appropriate actions
  const processContents = (contents, events = []) => {
    let newEvents = [...events];
    
    switch (contents.type) {
      case 'empty':
        newEvents.push({ type: EVENT_TYPES.EMPTY, data: {}, timestamp: Date.now() });
        setActionMode(ACTION_MODES.EMPTY);
        dispatch({ type: 'LOG', t: `The room is empty.` });
        break;
        
      case 'vermin':
        spawnMonster(dispatch, 'vermin', 1);
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'vermin', level: 1 }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;
        
      case 'minions':
        spawnMonster(dispatch, 'minion', 2);
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'minions', level: 2 }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;
        
      case 'treasure':
        rollTreasure(dispatch);
        newEvents.push({ type: EVENT_TYPES.TREASURE, data: { gold: state.gold }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.TREASURE);
        break;
        
      case 'special': {
        const specialRoll = d6();
        const specialKey = SPECIAL_FEATURE_TABLE[specialRoll];
        const special = SPECIAL_ROOMS[specialKey];
        const details = { type: 'special', specialKey, special, specialRoll };
        setRoomDetails(details);
        newEvents.push({ type: EVENT_TYPES.SPECIAL, data: details, timestamp: Date.now() });
        dispatch({ type: 'LOG', t: `✨ Special Feature! ${special.name}` });
        dispatch({ type: 'LOG', t: `📜 ${special.description}` });
        setActionMode(ACTION_MODES.SPECIAL);
        break;
      }
      
      case 'weird_monster':
        dispatch({ type: 'LOG', t: `👾 Weird Monster! Roll on the Weird Monster table.` });
        const weirdDetails = { type: 'weird_monster' };
        setRoomDetails(weirdDetails);
        newEvents.push({ type: EVENT_TYPES.WEIRD, data: weirdDetails, timestamp: Date.now() });
        setActionMode(ACTION_MODES.WEIRD);
        break;
        
      case 'minor_boss':
        spawnMonster(dispatch, 'boss', 3);
        dispatch({ type: 'MINOR' });
        dispatch({ type: 'LOG', t: `⚔️ Minor Boss appears! (Level 3)` });
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: 3, isBoss: false }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;
        
      case 'major_foe': {
        const bossRoll = d6();
        const bossResult = checkForBoss(state.majorFoes || 0, bossRoll);
        setBossCheckResult(bossResult);
        dispatch({ type: 'LOG', t: `🎲 Boss Check: ${bossResult.message}` });
        newEvents.push({ type: EVENT_TYPES.BOSS_CHECK, data: bossResult, timestamp: Date.now() });
        
        if (bossResult.isBoss) {
          spawnMajorFoe(dispatch, state.hcl, true);
          dispatch({ type: 'BOSS' });
          dispatch({ type: 'LOG', t: `👑 THE BOSS APPEARS! (+1 Life, +1 Attack, 3x Treasure)` });
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: state.hcl, isBoss: true }, timestamp: Date.now() });
        } else {
          spawnMajorFoe(dispatch, state.hcl, false);
          dispatch({ type: 'MAJOR' });
          dispatch({ type: 'LOG', t: `⚔️ Major Foe appears! (Level ${state.hcl})` });
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'major', level: state.hcl, isBoss: false }, timestamp: Date.now() });
        }
        setActionMode(ACTION_MODES.COMBAT);
        break;
      }
      
      case 'quest_room':
        dispatch({ type: 'LOG', t: `🏆 Quest Room / Final Room! The dungeon's objective is here.` });
        const questDetails = { type: 'quest_room' };
        setRoomDetails(questDetails);
        newEvents.push({ type: EVENT_TYPES.QUEST, data: questDetails, timestamp: Date.now() });
        setActionMode(ACTION_MODES.QUEST);
        break;
        
      default:
        setActionMode(ACTION_MODES.IDLE);
        break;
    }
    
    setRoomEvents(newEvents);
  };
  
  // Clear the current tile result and return to idle
  const clearTile = () => {
    setTileResult(null);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]);
    setActionMode(ACTION_MODES.IDLE);
    setCombatPhase(COMBAT_PHASES.NONE);
    setMonsterReaction(null);
    setPartyGoesFirst(true);
  };
  
  // Helper: Check if tile is a corridor
  const isCorridor = () => {
    return tileResult?.shape?.shape?.includes('corridor') || tileResult?.shape?.shape === 'corridor_dead_end';
  };
  
  // Helper: Get active monsters
  const getActiveMonsters = () => {
    return state.monsters?.filter(m => m.hp > 0 && (m.count === undefined || m.count > 0)) || [];
  };
  
  // Helper: Check if combat is won
  const isCombatWon = () => {
    return state.monsters?.length > 0 && getActiveMonsters().length === 0;
  };
  
  // Roll reaction for current monster
  const handleRollReaction = () => {
    if (!state.monsters || state.monsters.length === 0) return;
    
    const monster = state.monsters[0];
    const result = rollMonsterReaction(monster);
    
    // Update monster with reaction
    dispatch({ type: 'UPD_MONSTER', i: 0, u: { reaction: result } });
    setMonsterReaction(result);
    
    // Log the result
    dispatch({ type: 'LOG', t: `🎲 ${monster.name} Reaction (${result.roll}): ${result.name} - ${result.description}` });
    
    // Add event
    setRoomEvents(prev => [...prev, {
      type: 'REACTION',
      data: { monster: monster.name, reaction: result },
      timestamp: Date.now()
    }]);
    
    // Determine initiative based on reaction
    if (result.hostile === true) {
      // Monster is hostile - they attack first
      setPartyGoesFirst(false);
      setCombatPhase(COMBAT_PHASES.MONSTER_TURN);
      dispatch({ type: 'LOG', t: `⚡ ${monster.name} attacks first!` });
    } else if (result.hostile === false) {
      // Monster is not hostile - party can attack or pass
      setPartyGoesFirst(true);
      setCombatPhase(COMBAT_PHASES.PARTY_TURN);
      dispatch({ type: 'LOG', t: `⚡ Party has initiative!` });
    } else {
      // Conditional - party can choose
      setPartyGoesFirst(true);
      setCombatPhase(COMBAT_PHASES.INITIATIVE);
    }
  };
  
  // Party chooses to attack first
  const handlePartyAttacks = () => {
    setPartyGoesFirst(true);
    setCombatPhase(COMBAT_PHASES.PARTY_TURN);
    dispatch({ type: 'LOG', t: `⚔️ Party attacks!` });
  };
  
  // End party turn, monster turn begins
  const handleEndPartyTurn = () => {
    if (getActiveMonsters().length > 0) {
      setCombatPhase(COMBAT_PHASES.MONSTER_TURN);
      dispatch({ type: 'LOG', t: `👹 Monsters' turn to attack!` });
    } else {
      handleCombatVictory();
    }
  };
  
  // End monster turn, party turn begins
  const handleEndMonsterTurn = () => {
    setCombatPhase(COMBAT_PHASES.PARTY_TURN);
    dispatch({ type: 'LOG', t: `⚔️ Party's turn!` });
  };
  
  // Handle combat victory
  const handleCombatVictory = () => {
    setCombatPhase(COMBAT_PHASES.VICTORY);
    dispatch({ type: 'LOG', t: `🎉 Combat Victory!` });
    
    // Award XP for all defeated monsters
    state.monsters?.forEach(monster => {
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
    
    setRoomEvents(prev => [...prev, {
      type: 'VICTORY',
      data: {},
      timestamp: Date.now()
    }]);
  };
  
  // End combat encounter completely
  const handleEndCombat = () => {
    dispatch({ type: 'CLEAR_MONSTERS' });
    setCombatPhase(COMBAT_PHASES.NONE);
    setMonsterReaction(null);
    setShowSpells(null);
    // Clear protected status
    state.party.forEach((hero, idx) => {
      if (hero.status?.protected) {
        dispatch({ type: 'SET_HERO_STATUS', heroIdx: idx, statusKey: 'protected', value: false });
      }
    });
  };
  
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

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Render a single event card
  const renderEventCard = (event, index) => {
    switch (event.type) {
      case EVENT_TYPES.TILE_GENERATED:
        return (
          <div key={index} className="bg-slate-700/50 rounded p-2 text-xs border-l-2 border-blue-400">
            <div className="text-blue-400 font-bold">📐 Tile Generated</div>
            <div className="text-slate-300">{event.data.shape?.description}</div>
            <div className="text-slate-400">Doors: {event.data.shape?.doors}</div>
          </div>
        );
        
      case EVENT_TYPES.EMPTY:
        return (
          <div key={index} className="bg-slate-700/50 rounded p-2 text-xs border-l-2 border-slate-400">
            <div className="text-slate-400 font-bold">📦 Room Empty</div>
            <div className="text-slate-300">You may search for hidden features.</div>
          </div>
        );
        
      case EVENT_TYPES.TREASURE:
        return (
          <div key={index} className="bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-400">
            <div className="text-amber-400 font-bold">💰 Treasure Found!</div>
            <div className="text-slate-300">Check the log for details.</div>
          </div>
        );
        
      case EVENT_TYPES.SPECIAL:
        return (
          <div key={index} className="bg-purple-900/30 rounded p-2 text-xs border-l-2 border-purple-400">
            <div className="text-purple-400 font-bold">✨ {event.data.special?.name}</div>
            <div className="text-slate-300">{event.data.special?.description}</div>
            {event.data.special?.requiresGold && (
              <div className="text-amber-400">💰 Requires {event.data.special.requiresGold} gold</div>
            )}
          </div>
        );
        
      case EVENT_TYPES.MONSTER:
        return (
          <div key={index} className={`rounded p-2 text-xs border-l-2 ${
            event.data.isBoss ? 'bg-red-900/30 border-red-400' : 'bg-orange-900/30 border-orange-400'
          }`}>
            <div className={`font-bold ${event.data.isBoss ? 'text-red-400' : 'text-orange-400'}`}>
              {event.data.isBoss ? '👑 BOSS APPEARS!' : `⚔️ ${event.data.monsterType} (L${event.data.level})`}
            </div>
            {event.data.isBoss && (
              <div className="text-red-300">+1 Life, +1 Attack, 3× Treasure!</div>
            )}
          </div>
        );
        
      case EVENT_TYPES.BOSS_CHECK:
        return (
          <div key={index} className={`rounded p-2 text-xs border-l-2 ${
            event.data.isBoss ? 'bg-red-900/50 border-red-500' : 'bg-slate-700/50 border-slate-400'
          }`}>
            <div className={`font-bold ${event.data.isBoss ? 'text-red-400' : 'text-slate-400'}`}>
              🎲 Boss Check: {event.data.message}
            </div>
          </div>
        );
        
      case EVENT_TYPES.WEIRD:
        return (
          <div key={index} className="bg-purple-900/30 rounded p-2 text-xs border-l-2 border-purple-400">
            <div className="text-purple-400 font-bold">👾 Weird Monster!</div>
            <div className="text-slate-300">Roll on the Weird Monster table in the rulebook.</div>
          </div>
        );
        
      case EVENT_TYPES.QUEST:
        return (
          <div key={index} className="bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-500">
            <div className="text-amber-400 font-bold">🏆 Quest Room!</div>
            <div className="text-slate-300">The dungeon's objective is here!</div>
          </div>
        );
        
      case EVENT_TYPES.SEARCH:
        return (
          <div key={index} className="bg-cyan-900/30 rounded p-2 text-xs border-l-2 border-cyan-400">
            <div className="text-cyan-400 font-bold">🔍 Searched</div>
            <div className="text-slate-300">{event.data.result || 'Nothing found.'}</div>
          </div>
        );
      
      case 'REACTION':
        return (
          <div key={index} className={`rounded p-2 text-xs border-l-2 ${
            event.data.reaction?.hostile === true ? 'bg-red-900/30 border-red-400' :
            event.data.reaction?.hostile === false ? 'bg-green-900/30 border-green-400' :
            'bg-yellow-900/30 border-yellow-400'
          }`}>
            <div className={`font-bold ${
              event.data.reaction?.hostile === true ? 'text-red-400' :
              event.data.reaction?.hostile === false ? 'text-green-400' :
              'text-yellow-400'
            }`}>
              🎲 {event.data.monster}: {event.data.reaction?.name}
            </div>
            <div className="text-slate-300 text-xs">{event.data.reaction?.description}</div>
          </div>
        );
        
      case 'VICTORY':
        return (
          <div key={index} className="bg-green-900/30 rounded p-2 text-xs border-l-2 border-green-400">
            <div className="text-green-400 font-bold">🎉 Victory!</div>
            <div className="text-slate-300">Combat won! Roll for treasure.</div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Render the Action Pane content - progressive events + current action
  const renderActionPane = () => {
    const activeMonsters = getActiveMonsters();
    const hasActiveMonsters = activeMonsters.length > 0;
    const combatWon = isCombatWon();
    const corridor = isCorridor();
    
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
          {roomEvents.map((event, index) => renderEventCard(event, index))}
        </div>
        
        {/* COMBAT MODE - Show when monsters are active */}
        {hasActiveMonsters && (
          <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
            
            {/* Active Monsters Section */}
            <div className="bg-slate-800 rounded p-2">
              <div className="text-sm font-bold text-red-400 mb-2">
                🐉 Active Foes {corridor && <span className="text-yellow-400 text-xs ml-1">(Corridor)</span>}
              </div>
              <div className="space-y-1">
                {activeMonsters.map((monster, idx) => {
                  const isMinor = monster.count !== undefined || monster.isMinorFoe;
                  const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
                  return (
                    <div key={monster.id} className="bg-slate-700 rounded p-2 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {isMinor ? (
                            <span className="text-blue-400">👥</span>
                          ) : (
                            <span className="text-red-400">👹</span>
                          )}
                          <span className="font-bold text-amber-400">{monster.name}</span>
                          <span className="text-slate-400">L{monster.level}</span>
                        </div>
                        {isMinor ? (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: Math.max(0, (monster.count || 1) - 1) } })}
                              className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                            >-</button>
                            <span className="text-blue-300 font-bold min-w-[3rem] text-center">
                              {monster.count}/{monster.initialCount || monster.count}
                            </span>
                            <button 
                              onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: (monster.count || 0) + 1 } })}
                              className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                            >+</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: Math.max(0, monster.hp - 1) } })}
                              className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                            >-</button>
                            <span className="text-red-300 font-bold min-w-[3rem] text-center">
                              ❤️ {monster.hp}/{monster.maxHp}
                            </span>
                            <button 
                              onClick={() => dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: Math.min(monster.maxHp, monster.hp + 1) } })}
                              className="bg-slate-600 px-1.5 rounded hover:bg-slate-500"
                            >+</button>
                          </div>
                        )}
                      </div>
                      {/* Show reaction if rolled */}
                      {monster.reaction && (
                        <div className={`mt-1 px-2 py-0.5 rounded text-xs ${
                          monster.reaction.hostile === true ? 'bg-red-900/50 text-red-300' :
                          monster.reaction.hostile === false ? 'bg-green-900/50 text-green-300' :
                          'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {monster.reaction.name}: {monster.reaction.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Initiative Section - shows based on combat phase */}
            <div className="bg-slate-800 rounded p-2">
              <div className="text-sm font-bold text-cyan-400 mb-2">⚡ Initiative</div>
              
              {/* Phase: Need to roll reaction */}
              {combatPhase === COMBAT_PHASES.NONE && !monsterReaction && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Roll reaction to determine monster behavior:</div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRollReaction}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm font-bold"
                    >
                      🎲 Roll Reaction
                    </button>
                    <button
                      onClick={handlePartyAttacks}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded text-sm font-bold"
                    >
                      ⚔️ Attack First!
                    </button>
                  </div>
                </div>
              )}
              
              {/* Phase: Choose initiative (conditional reaction) */}
              {combatPhase === COMBAT_PHASES.INITIATIVE && (
                <div className="space-y-2">
                  <div className="text-xs text-yellow-400">
                    Foe reaction is conditional. Choose your approach:
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePartyAttacks}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded text-sm"
                    >
                      ⚔️ Attack
                    </button>
                    <button
                      onClick={() => {
                        // Handle the conditional reaction (bribe, flee, etc)
                        dispatch({ type: 'LOG', t: `Party chooses to negotiate...` });
                        setShowDungeonFeatures(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-2 rounded text-sm"
                    >
                      🤝 Negotiate
                    </button>
                  </div>
                </div>
              )}
              
              {/* Phase: Party's turn */}
              {combatPhase === COMBAT_PHASES.PARTY_TURN && (
                <div className="bg-green-900/30 rounded p-2">
                  <div className="text-green-400 font-bold text-sm mb-2">⚔️ Party's Turn - ATTACK!</div>
                  <div className="text-xs text-slate-300 mb-2">
                    {corridor 
                      ? 'Corridor: Only front 2 heroes can melee. Back can use ranged/spells.' 
                      : 'Room: All heroes can engage in melee.'}
                  </div>
                </div>
              )}
              
              {/* Phase: Monster's turn */}
              {combatPhase === COMBAT_PHASES.MONSTER_TURN && (
                <div className="bg-red-900/30 rounded p-2">
                  <div className="text-red-400 font-bold text-sm mb-2">👹 Monster's Turn - DEFEND!</div>
                  <div className="text-xs text-slate-300">
                    Roll defense for each hero being attacked.
                  </div>
                </div>
              )}
            </div>
            
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
                    setRoomEvents(prev => [...prev, { type: EVENT_TYPES.TREASURE, data: {}, timestamp: Date.now() }]);
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-500 px-3 py-2 rounded text-sm font-bold"
                >
                  💰 Roll Treasure
                </button>
                
                <button
                  onClick={() => {
                    handleEndCombat();
                    if (!corridor) {
                      setActionMode(ACTION_MODES.EMPTY); // Can search room after combat
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
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 p-2 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MarchingOrder state={state} selectedHero={selectedHero} onSelectHero={setSelectedHero} />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-amber-400">Four Against Darkness</h1>
              {state.party[selectedHero] && (
                <div className="text-xs text-slate-400">
                  Active: <span className="text-amber-300">{state.party[selectedHero].name}</span>
                  <span className="text-slate-500 ml-1">({state.party[selectedHero].key})</span>
                </div>
              )}
            </div>
            <h1 className="text-lg font-bold text-amber-400 sm:hidden">4AD</h1>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-bold">{state.gold}g</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{state.minorEnc}/10</span>
            <span className="text-red-400 font-bold">{state.majorFoes}M</span>
            <span className="text-blue-400">{state.clues}C</span>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-1">
            <Dice />
            <button onClick={() => setShowRules(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Rules">
              <Book size={18} />
            </button>
            <button onClick={() => setShowDungeonFeatures(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Features">
              <DoorOpen size={18} />
            </button>
            <button onClick={() => setShowEquipment(true)} className="text-orange-400 hover:text-orange-300 p-1" title="Equipment">
              <Package size={18} />
            </button>
            <button onClick={() => setShowAbilities(true)} className="text-purple-400 hover:text-purple-300 p-1" title="Abilities">
              <Zap size={18} />
            </button>
            <button onClick={() => setShowCampaign(true)} className="text-indigo-400 hover:text-indigo-300 p-1" title="Campaign">
              <Trophy size={18} />
            </button>
            <button onClick={() => setShowSaveLoad(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Save/Load">
              <Save size={18} />
            </button>
            <button onClick={() => setShowSettings(true)} className="text-slate-400 hover:text-amber-400 p-1" title="Settings">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile: Tabbed interface */}
        <div className="md:hidden flex-1 overflow-y-auto pb-16">
          <div className="p-3">
            {tab === 'party' && <Party state={state} dispatch={dispatch} />}
            {tab === 'dungeon' && <Dungeon state={state} dispatch={dispatch} tileResult={tileResult} generateTile={generateTile} clearTile={clearTile} bossCheckResult={bossCheckResult} roomDetails={roomDetails} />}
            {tab === 'combat' && <Combat state={state} dispatch={dispatch} selectedHero={selectedHero} setSelectedHero={setSelectedHero} />}
            {tab === 'analytics' && <Analytics state={state} />}
            {tab === 'log' && <Log state={state} dispatch={dispatch} />}
          </div>
        </div>

        {/* Desktop: Flexible equal-width columns layout */}
        <div className={`hidden md:flex flex-1 overflow-hidden relative ${leftPanelTab !== 'log' ? 'pb-8' : ''}`}>
          
          {/* Left Column - Party/Stats (Collapsible) */}
          {leftPanelOpen ? (
            <div className="flex-1 border-r border-slate-700 bg-slate-850 flex flex-col min-w-0" data-panel="sidebar">
              {/* Left Panel Tabs */}
              <div className="flex border-b border-slate-700 flex-shrink-0">
                <button
                  onClick={() => setLeftPanelTab('party')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'party' ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Users size={16} /> Party
                </button>
                <button
                  onClick={() => setLeftPanelTab('stats')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'stats' ? 'bg-slate-700 text-purple-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <TrendingUp size={16} /> Stats
                </button>
                <button
                  onClick={() => setLeftPanelTab('log')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'log' ? 'bg-slate-700 text-green-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Scroll size={16} /> Log
                </button>
                <button
                  onClick={() => setLeftPanelTab('rules')}
                  className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-2 ${
                    leftPanelTab === 'rules' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:bg-slate-750'
                  }`}
                >
                  <Book size={16} /> Rules
                </button>
                <button
                  onClick={() => setLeftPanelOpen(false)}
                  className="px-2 py-2 text-slate-400 hover:text-white hover:bg-slate-700"
                  title="Collapse Panel"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
              
              {/* Left Panel Content */}
              <div className={`flex-1 overflow-y-auto ${leftPanelTab === 'rules' ? '' : 'p-3'}`}>
                {leftPanelTab === 'party' ? (
                  <Party state={state} dispatch={dispatch} />
                ) : leftPanelTab === 'stats' ? (
                  <Analytics state={state} />
                ) : leftPanelTab === 'log' ? (
                  <Log state={state} dispatch={dispatch} />
                ) : (
                  <RulesPdfViewer />
                )}
              </div>
            </div>
          ) : (
            /* Collapsed Sidebar */
            <div className="w-12 flex-shrink-0 border-r border-slate-700 flex flex-col items-center py-2 gap-2" data-panel="sidebar">
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('party'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'party' ? 'text-amber-400' : 'text-slate-400'}`}
                title="Open Party Panel"
              >
                <Users size={20} />
              </button>
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('stats'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'stats' ? 'text-purple-400' : 'text-slate-400'}`}
                title="Open Stats Panel"
              >
                <TrendingUp size={20} />
              </button>
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('log'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'log' ? 'text-green-400' : 'text-slate-400'}`}
                title="Open Log Panel"
              >
                <Scroll size={20} />
              </button>
              <button
                onClick={() => { setLeftPanelOpen(true); setLeftPanelTab('rules'); }}
                className={`p-2 rounded hover:bg-slate-700 ${leftPanelTab === 'rules' ? 'text-blue-400' : 'text-slate-400'}`}
                title="Open Rules Panel"
              >
                <Book size={20} />
              </button>
              <div className="border-t border-slate-700 w-full my-2" />
              <button
                onClick={() => setLeftPanelOpen(true)}
                className="p-2 rounded hover:bg-slate-700 text-slate-500"
                title="Expand Panel"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
          
          {/* Middle Column - Dungeon Map */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0 border-r border-slate-700">
            {/* Dungeon Grid - Full width */}
            <div className="flex-1 overflow-y-auto p-2">
              <Dungeon 
                state={state} 
                dispatch={dispatch} 
                tileResult={tileResult}
                generateTile={generateTile}
                clearTile={clearTile}
                bossCheckResult={bossCheckResult}
                roomDetails={roomDetails}
                hideGenerationUI={true}
                sidebarCollapsed={!leftPanelOpen}
              />
            </div>
          </div>
          
          {/* Right Column - Action Pane */}
          <div className="flex-1 overflow-y-auto p-3 bg-slate-850 min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400">
                {actionMode === ACTION_MODES.COMBAT ? '⚔️ Combat' :
                 actionMode === ACTION_MODES.SPECIAL ? '✨ Special' :
                 actionMode === ACTION_MODES.TREASURE ? '💰 Treasure' :
                 actionMode === ACTION_MODES.QUEST ? '🏆 Quest' :
                 actionMode === ACTION_MODES.WEIRD ? '👾 Weird' :
                 actionMode === ACTION_MODES.EMPTY ? '📦 Empty' :
                 '🎮 Actions'}
              </span>
              {state.monsters?.length > 0 && (
                <span className="text-xs text-red-400">
                  {state.monsters.filter(m => m.hp > 0).length} active
                </span>
              )}
            </div>
            {renderActionPane()}
          </div>
          
          {/* Log Bar - Hidden when log tab is open in sidebar */}
          {leftPanelTab !== 'log' && (
            <div 
              className={`absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-800 transition-all duration-200 ${
                logCollapsed ? 'h-8' : 'h-[35vh]'
              }`}
              style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.3)' }}
            >
              <div 
                className="flex items-center justify-between px-3 py-1.5 bg-slate-800 cursor-pointer hover:bg-slate-700 h-8"
                onClick={() => setLogCollapsed(!logCollapsed)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Scroll size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 flex-shrink-0">
                    Log ({state.log?.length || 0})
                  </span>
                  {logCollapsed && state.log && state.log.length > 0 && (
                    <span className="text-xs text-slate-400 truncate ml-2">
                      {state.log[0]}
                      <span className="inline-block w-2 h-3 ml-1 bg-slate-400 animate-pulse" style={{ animation: 'blink 1s step-end infinite' }}></span>
                    </span>
                  )}
                </div>
                <button className="text-slate-400 hover:text-white flex-shrink-0 ml-2">
                  {logCollapsed ? '▲' : '▼'}
                </button>
              </div>
              
              {!logCollapsed && (
                <div className="h-[calc(100%-2rem)] overflow-hidden">
                  <Log state={state} dispatch={dispatch} isBottomPanel={true} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex md:hidden">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-amber-400' : 'text-slate-500'}`}
          >
            <t.icon size={18} />
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} state={state} dispatch={dispatch} />
      <RulesReference isOpen={showRules} onClose={() => setShowRules(false)} />
      <SaveLoadModal isOpen={showSaveLoad} onClose={() => setShowSaveLoad(false)} state={state} dispatch={dispatch} />
      <DungeonFeaturesModal isOpen={showDungeonFeatures} onClose={() => setShowDungeonFeatures(false)} state={state} dispatch={dispatch} selectedHero={selectedHero} />
      <CampaignManagerModal isOpen={showCampaign} onClose={() => setShowCampaign(false)} state={state} dispatch={dispatch} />
      <Equipment isOpen={showEquipment} state={state} dispatch={dispatch} onClose={() => setShowEquipment(false)} />
      <Abilities isOpen={showAbilities} state={state} dispatch={dispatch} onClose={() => setShowAbilities(false)} />
    </div>
  );
}
