import React, { useState } from 'react';
import { selectParty, selectHero } from '../state/selectors.js';
import { logMessage, updateHero, encounterBoss, incrementMajorFoe } from '../state/actionCreators.js';
import { DoorOpen, AlertTriangle, Sparkles, Compass, Lock, Puzzle, Skull, Info } from 'lucide-react';
import { d6 } from '../utils/dice.js';
import { 
  DOOR_TYPES, TRAP_TYPES, SPECIAL_ROOMS, PUZZLE_TYPES,
  DOOR_TYPE_TABLE, TRAP_TABLE, SPECIAL_FEATURE_TABLE, PUZZLE_TABLE,
  CORRIDOR_DIRECTION_TABLE, CORRIDOR_LENGTH_TABLE,
  checkForBoss, BOSS_RULES
} from '../data/rooms.js';
import {
  rollDoorType, attemptOpenDoor,
  rollTrap, attemptDetectTrap, attemptDisarmTrap, triggerTrap,
  rollSpecialRoom, interactShrine, interactFountain, interactStatue, interactAltar, interactLibrary, interactArmory,
  rollPuzzle, attemptPuzzle,
  generateCorridor,
  spawnMajorFoe
} from "../utils/gameActions/index.js";

export default function Exploration({ state, dispatch }) {
  const [currentDoor, setCurrentDoor] = useState(null);
  const [currentTrap, setCurrentTrap] = useState(null);
  const [currentSpecial, setCurrentSpecial] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [currentCorridor, setCurrentCorridor] = useState(null);
  const [selectedHero, setSelectedHero] = useState(0);
  const [bossCheckResult, setBossCheckResult] = useState(null);

  const party = selectParty(state);
  const activeHero = selectHero(state, selectedHero) || null;

  // ========== Door Mechanics ==========
  const handleRollDoorType = () => {
    const result = rollDoorType(dispatch);
    setCurrentDoor({ ...result, opened: false });
  };

  const handleOpenDoor = () => {
    if (!currentDoor || !activeHero) return;
    const result = attemptOpenDoor(dispatch, activeHero, currentDoor.typeKey);
    if (result.success) {
      setCurrentDoor({ ...currentDoor, opened: true });
    }
  };

  // ========== Trap Mechanics ==========
  const handleRollTrap = () => {
    const result = rollTrap(dispatch);
    setCurrentTrap({ ...result, detected: false, disarmed: false });
  };

  const handleDetectTrap = () => {
    if (!activeHero) return;
    const result = attemptDetectTrap(dispatch, activeHero, currentTrap?.typeKey);
    setCurrentTrap(prev => prev ? { ...prev, detected: result.detected, trapInfo: result } : {
      typeKey: result.trapType,
      ...result.trap,
      detected: result.detected,
      disarmed: false
    });
  };

  const handleDisarmTrap = () => {
    if (!currentTrap || !activeHero) return;
    const result = attemptDisarmTrap(dispatch, activeHero, currentTrap.typeKey);
    if (result.success) {
      setCurrentTrap({ ...currentTrap, disarmed: true });
    } else if (result.triggered) {
      handleTriggerTrap();
    }
  };

  const handleTriggerTrap = () => {
    if (!currentTrap || !activeHero) return;
    const heroWithIndex = { ...activeHero, index: selectedHero };
    triggerTrap(dispatch, heroWithIndex, currentTrap.typeKey);
    setCurrentTrap({ ...currentTrap, triggered: true });
  };

  // ========== Special Rooms ==========
  const handleRollSpecial = () => {
    const result = rollSpecialRoom(dispatch);
    setCurrentSpecial({ ...result, interacted: false });
  };

  const handleInteractSpecial = () => {
    if (!currentSpecial || !activeHero) return;
    
    let result;
    const heroWithIndex = { ...activeHero, index: selectedHero };
    
    switch (currentSpecial.typeKey) {
      case 'shrine':
        if (state.gold < 1) {
          dispatch(logMessage('Not enough gold for shrine offering!'));
          return;
        }
        result = interactShrine(dispatch, heroWithIndex, 1);
        if (result.result === 'curse') {
          dispatch(updateHero(selectedHero, { hp: Math.max(0, activeHero.hp - 1) }));
        } else if (result.result === 'blessing') {
          dispatch(updateHero(selectedHero, { hp: Math.min(activeHero.maxHp, activeHero.hp + 1) }));
        }
        break;
      case 'fountain':
        result = interactFountain(dispatch, heroWithIndex);
        if (result.healing !== 0) {
          const newHp = result.healing === 999 
            ? activeHero.maxHp 
            : Math.max(0, Math.min(activeHero.maxHp, activeHero.hp + result.healing));
          dispatch(updateHero(selectedHero, { hp: newHp }));
        }
        break;
      case 'statue':
        result = interactStatue(dispatch, heroWithIndex);
        if (result.triggered) {
          // Statue triggered a trap
          handleRollTrap();
        }
        break;
      case 'altar':
        if (state.gold < 2) {
          dispatch(logMessage('Not enough gold for altar sacrifice!'));
          return;
        }
        result = interactAltar(dispatch, 2);
        break;
      case 'library':
        result = interactLibrary(dispatch, heroWithIndex);
        if (result.result === 'trap') {
          dispatch(updateHero(selectedHero, { hp: Math.max(0, activeHero.hp - 1) }));
        }
        break;
      case 'armory':
        result = interactArmory(dispatch, heroWithIndex);
        // TODO: Add temporary bonus tracking
        break;
      default:
  dispatch(logMessage('Unknown special room type.'));
    }
    
    setCurrentSpecial({ ...currentSpecial, interacted: true, result });
  };

  // ========== Puzzle Rooms ==========
  const handleRollPuzzle = () => {
    const result = rollPuzzle(dispatch);
    setCurrentPuzzle({ ...result, attempted: false });
  };

  const handleAttemptPuzzle = () => {
    if (!currentPuzzle || !activeHero) return;
    const result = attemptPuzzle(dispatch, activeHero, currentPuzzle.typeKey);
    setCurrentPuzzle({ ...currentPuzzle, attempted: true, success: result.success, result });
  };

  // ========== Corridors ==========
  const handleGenerateCorridor = () => {
    const result = generateCorridor(dispatch);
    setCurrentCorridor(result);
  };

  // ========== Boss Check (for Major Foe encounters) ==========
  const handleBossCheck = () => {
    const roll = d6();
    const result = checkForBoss(state.majorFoes || 0, roll);
    setBossCheckResult(result);
  dispatch(logMessage(`🎲 Boss Check: ${result.message}`));
    
    if (result.isBoss) {
      // Spawn the boss
      spawnMajorFoe(dispatch, state.hcl, true);
  dispatch(encounterBoss());
    } else {
      // Spawn regular major foe
      spawnMajorFoe(dispatch, state.hcl, false);
  dispatch(incrementMajorFoe());
    }
  };

  // ========== Hero Selector ==========
  const HeroSelector = () => (
    <div className="mb-3">
      <div className="text-xs text-slate-400 mb-1">Active Hero:</div>
      <div className="flex gap-1 flex-wrap">
        {state.party.map((hero, i) => (
          <button
            key={i}
            onClick={() => setSelectedHero(i)}
            className={`px-2 py-1 rounded text-xs ${
              selectedHero === i 
                ? 'bg-amber-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {hero.name} ({hero.key.slice(0, 3)})
          </button>
        ))}
      </div>
      {!activeHero && (
        <div className="text-red-400 text-xs mt-1">Add heroes to your party first!</div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Hero Selector */}
      <HeroSelector />

      {/* Door Mechanics */}
      <div className="bg-slate-800 rounded p-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <DoorOpen size={16} /> Door Mechanics
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleRollDoorType}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs"
          >
            Roll Door Type
          </button>
          {currentDoor && !currentDoor.opened && (
            <button 
              onClick={handleOpenDoor}
              disabled={!activeHero}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
            >
              <Lock size={12} className="inline mr-1" />
              Attempt Open
            </button>
          )}
        </div>
        
        {currentDoor && (
          <div className={`p-2 rounded text-xs ${currentDoor.opened ? 'bg-green-900/50' : 'bg-slate-700'}`}>
            <div className="font-bold text-amber-400">{currentDoor.name}</div>
            <div className="text-slate-300">{currentDoor.description}</div>
            {currentDoor.opened && <div className="text-green-400 mt-1">✓ Door Opened!</div>}
          </div>
        )}
      </div>

      {/* Trap Mechanics */}
      <div className="bg-slate-800 rounded p-3">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <AlertTriangle size={16} /> Trap Mechanics
        </div>
        
        <div className="flex gap-2 flex-wrap mb-2">
          <button 
            onClick={handleRollTrap}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs"
          >
            Roll Trap Type
          </button>
          <button 
            onClick={handleDetectTrap}
            disabled={!activeHero}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
          >
            🔍 Detect Trap
          </button>
          {currentTrap?.detected && !currentTrap?.disarmed && !currentTrap?.triggered && (
            <button 
              onClick={handleDisarmTrap}
              disabled={!activeHero}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
            >
              🔧 Disarm
            </button>
          )}
          {currentTrap && !currentTrap?.triggered && !currentTrap?.disarmed && (
            <button 
              onClick={handleTriggerTrap}
              className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-xs"
            >
              Trigger!
            </button>
          )}
        </div>
        
        {currentTrap && (
          <div className={`p-2 rounded text-xs ${
            currentTrap.disarmed ? 'bg-green-900/50' : 
            currentTrap.triggered ? 'bg-red-900/50' : 'bg-slate-700'
          }`}>
            <div className="font-bold text-red-400">{currentTrap.name}</div>
            <div className="text-slate-300">{currentTrap.description}</div>
            <div className="text-slate-400 mt-1">
              Damage: {currentTrap.damage} | Detect DC: {currentTrap.detectDC} | Disarm DC: {currentTrap.disarmDC}
            </div>
            {currentTrap.detected && !currentTrap.disarmed && !currentTrap.triggered && (
              <div className="text-blue-400 mt-1">🔍 Trap Detected!</div>
            )}
            {currentTrap.disarmed && <div className="text-green-400 mt-1">✓ Trap Disarmed!</div>}
            {currentTrap.triggered && <div className="text-red-400 mt-1">Trap Triggered!</div>}
          </div>
        )}
        
        {activeHero?.key === 'rogue' && (
          <div className="text-xs text-green-400 mt-2">
            Rogue Bonus: +{activeHero.lvl} to detect/disarm
          </div>
        )}
      </div>

      {/* Special Rooms */}
      <div className="bg-slate-800 rounded p-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
          <Sparkles size={16} /> Special Rooms
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleRollSpecial}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs"
          >
            Roll Special Feature
          </button>
          {currentSpecial && !currentSpecial.interacted && (
            <button 
              onClick={handleInteractSpecial}
              disabled={!activeHero}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
            >
              Interact
            </button>
          )}
        </div>
        
        {currentSpecial && (
          <div className={`p-2 rounded text-xs ${currentSpecial.interacted ? 'bg-purple-900/30' : 'bg-slate-700'}`}>
            <div className="font-bold text-purple-400">{currentSpecial.name}</div>
            <div className="text-slate-300">{currentSpecial.description}</div>
            {currentSpecial.requiresGold && (
              <div className="text-amber-400 mt-1">💰 Requires {currentSpecial.requiresGold} gold</div>
            )}
            {currentSpecial.interacted && <div className="text-purple-400 mt-1">✓ Interacted!</div>}
          </div>
        )}
      </div>

      {/* Puzzle Rooms */}
      <div className="bg-slate-800 rounded p-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
          <Puzzle size={16} /> Puzzle Rooms
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={handleRollPuzzle}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs"
          >
            Roll Puzzle Type
          </button>
          {currentPuzzle && !currentPuzzle.attempted && (
            <button 
              onClick={handleAttemptPuzzle}
              disabled={!activeHero}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
            >
              🧩 Attempt Puzzle
            </button>
          )}
        </div>
        
        {currentPuzzle && (
          <div className={`p-2 rounded text-xs ${
            currentPuzzle.attempted 
              ? currentPuzzle.success ? 'bg-green-900/50' : 'bg-red-900/30'
              : 'bg-slate-700'
          }`}>
            <div className="font-bold text-cyan-400">{currentPuzzle.name}</div>
            <div className="text-slate-300">{currentPuzzle.description}</div>
            <div className="text-slate-400 mt-1">DC: {currentPuzzle.successDC}</div>
            {currentPuzzle.attempted && (
              <div className={`mt-1 ${currentPuzzle.success ? 'text-green-400' : 'text-red-400'}`}>
                {currentPuzzle.success ? '✓ Puzzle Solved!' : '✗ Puzzle Failed'}
              </div>
            )}
          </div>
        )}
        
        {activeHero && ['wizard', 'elf'].includes(activeHero.key) && (
          <div className="text-xs text-cyan-400 mt-2">
            {(activeHero.key === 'wizard' ? 'Wizard' : 'Elf')} Bonus: +{activeHero.lvl} to riddles
          </div>
        )}
        {activeHero && ['rogue', 'halfling'].includes(activeHero.key) && (
          <div className="text-xs text-cyan-400 mt-2">
            {(activeHero.key === 'rogue' ? 'Rogue' : 'Halfling')} Bonus: +{activeHero.lvl} to pressure plates
          </div>
        )}
      </div>

      {/* Corridor Generation */}
      <div className="bg-slate-800 rounded p-3">
        <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-2">
          <Compass size={16} /> Corridors & Passages
        </div>
        
        <button 
          onClick={handleGenerateCorridor}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs mb-2"
        >
          Generate Corridor
        </button>
        
        {currentCorridor && (
          <div className="p-2 bg-slate-700 rounded text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400">Direction:</span>
                <span className="text-green-400 ml-1 font-bold">{currentCorridor.direction}</span>
              </div>
              <div>
                <span className="text-slate-400">Length:</span>
                <span className="text-green-400 ml-1 font-bold">{currentCorridor.length} squares</span>
              </div>
              <div>
                <span className="text-slate-400">Contains:</span>
                <span className={`ml-1 font-bold ${
                  currentCorridor.contents === 'trap' ? 'text-red-400' :
                  currentCorridor.contents === 'wandering' ? 'text-orange-400' :
                  currentCorridor.contents === 'door' ? 'text-amber-400' :
                  'text-slate-300'
                }`}>{currentCorridor.contents}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boss Room */}
      <div className="bg-slate-800 rounded p-3 border border-red-800">
        <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
          <Skull size={16} /> Boss Mechanics
        </div>
        
        <div className="text-xs text-slate-300 mb-2">
          <div className="flex items-start gap-1">
            <Info size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <span>When you encounter a <span className="text-amber-400">Major Foe</span> (2d6=11 on contents), 
            roll d6 + major foes faced. On <span className="text-red-400 font-bold">6+</span>, it's the BOSS!</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-slate-700 p-2 rounded">
            <div className="text-slate-400">Major Foes Faced:</div>
            <div className="text-amber-400 font-bold text-lg">{state.majorFoes || 0}</div>
          </div>
          <div className="bg-slate-700 p-2 rounded">
            <div className="text-slate-400">Boss Defeated:</div>
            <div className={`font-bold text-lg ${state.finalBoss ? 'text-green-400' : 'text-red-400'}`}>
              {state.finalBoss ? 'Yes!' : 'No'}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleBossCheck}
          disabled={state.finalBoss}
          className={`w-full px-3 py-2 rounded text-sm font-bold ${
            state.finalBoss
              ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
              : 'bg-red-600 hover:bg-red-500'
          }`}
        >
          {state.finalBoss ? 'Boss Already Faced' : 'Major Foe Encounter (Boss Check)'}
        </button>
        
        {bossCheckResult && (
          <div className={`mt-2 p-2 rounded text-xs ${
            bossCheckResult.isBoss ? 'bg-red-900/50 border border-red-600' : 'bg-slate-700'
          }`}>
            <div className={`font-bold ${bossCheckResult.isBoss ? 'text-red-400' : 'text-amber-400'}`}>
              {bossCheckResult.message}
            </div>
            {bossCheckResult.isBoss && (
              <div className="text-red-300 mt-1">
                👑 BOSS: +1 Life, +1 Attack, 3× Treasure!
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-slate-500 mt-2 border-t border-slate-700 pt-2">
          <div className="font-bold text-slate-400 mb-1">Boss Formula:</div>
          <div>Roll d6 + {state.majorFoes || 0} = needs ≥6 for Boss</div>
          <div className="text-slate-600 mt-1">
            (Currently need to roll {Math.max(1, 6 - (state.majorFoes || 0))}+ on d6)
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-slate-800 rounded p-3">
        <div className="text-amber-400 font-bold text-sm mb-2">📖 Quick Reference</div>
        <div className="text-xs text-slate-400 space-y-1">
          <div><span className="text-amber-400">Warriors/Barbarians:</span> Auto-open stuck doors</div>
          <div><span className="text-amber-400">Rogues:</span> +Level to detect/disarm traps, pick locks</div>
          <div><span className="text-amber-400">Dwarves:</span> +1 to detect stone traps (pit, blade)</div>
          <div><span className="text-amber-400">Wizards/Elves:</span> +Level to riddle puzzles</div>
          <div><span className="text-amber-400">Rogues/Halflings:</span> +Level to pressure plate puzzles</div>
        </div>
      </div>
    </div>
  );
}
