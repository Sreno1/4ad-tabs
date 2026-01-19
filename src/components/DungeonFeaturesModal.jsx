import React, { useState } from 'react';
import { selectHero } from '../state/selectors.js';
import { logMessage, updateHero } from '../state/actionCreators.js';
import { X, DoorOpen, AlertTriangle, Sparkles, Puzzle, Lock } from 'lucide-react';
import { 
  rollDoorType, attemptOpenDoor,
  rollTrap, attemptDetectTrap, attemptDisarmTrap, triggerTrap,
  rollSpecialRoom, interactShrine, interactFountain, interactStatue, interactAltar, interactLibrary, interactArmory,
  rollPuzzle, attemptPuzzle
} from "../utils/gameActions/index.js";

export default function DungeonFeaturesModal({ isOpen, onClose, state, dispatch, selectedHero, activeSection = null }) {
  const [currentDoor, setCurrentDoor] = useState(null);
  const [currentTrap, setCurrentTrap] = useState(null);
  const [currentSpecial, setCurrentSpecial] = useState(null);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const doorRef = React.useRef(null);
  const trapRef = React.useRef(null);
  const specialRef = React.useRef(null);
  const puzzleRef = React.useRef(null);
  const activeHero = selectHero(state, selectedHero) || null;

  // Scroll to requested section when modal opens with activeSection
  React.useEffect(() => {
    if (!isOpen || !activeSection) return;
    setTimeout(() => {
      const map = {
        door: doorRef.current,
        trap: trapRef.current,
        special: specialRef.current,
        puzzle: puzzleRef.current,
        reference: document.getElementById('dungeon_features_reference_section'),
      };
      const el = map[activeSection];
      if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [isOpen, activeSection]);

  if (!isOpen) return null;

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
    const result = rollTrap(dispatch, { environment: state.currentEnvironment });
    setCurrentTrap({ ...result, detected: false, disarmed: false });
  };

  const handleDetectTrap = () => {
    if (!activeHero) return;
    const result = attemptDetectTrap(dispatch, activeHero, currentTrap?.typeKey, { environment: state.currentEnvironment });
    setCurrentTrap(prev => prev ? { ...prev, detected: result.detected, trapInfo: result } : {
      typeKey: result.trapType,
      ...result.trap,
      detected: result.detected,
      disarmed: false
    });
  };

  const handleDisarmTrap = () => {
    if (!currentTrap || !activeHero) return;
    const result = attemptDisarmTrap(dispatch, activeHero, currentTrap.typeKey, { environment: state.currentEnvironment });
    if (result.success) {
      setCurrentTrap({ ...currentTrap, disarmed: true });
    } else if (result.triggered) {
      handleTriggerTrap();
    }
  };

  const handleTriggerTrap = () => {
    if (!currentTrap || !activeHero) return;
    const heroWithIndex = { ...activeHero, index: selectedHero };
    triggerTrap(dispatch, heroWithIndex, currentTrap.typeKey, { state, environment: state.currentEnvironment });
    setCurrentTrap({ ...currentTrap, triggered: true });
  };

  // ========== Special Rooms ==========
  const handleRollSpecial = () => {
    const result = rollSpecialRoom(dispatch, { environment: state.currentEnvironment });
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
        result = interactStatue(dispatch, heroWithIndex, { environment: state.currentEnvironment });
        if (result.triggered) {
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

  return (
    <div
      id="dungeon_features_modal_overlay"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dungeon_features_modal_title"
    >
      <div
        id="dungeon_features_modal"
        className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div id="dungeon_features_modal_header" className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 id="dungeon_features_modal_title" className="text-lg font-bold text-amber-400">Dungeon Features</h2>
          <button
            id="dungeon_features_modal_close_button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Close dungeon features"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>        <div id="dungeon_features_modal_content" className="p-4 space-y-4">
          {/* Active Hero Display */}
          {activeHero ? (
            <div className="bg-slate-700/50 rounded p-2 text-sm">
              <span className="text-slate-400">Active Hero: </span>
              <span className="text-amber-400 font-bold">{activeHero.name}</span>
              <span className="text-slate-500"> ({activeHero.key})</span>
            </div>
          ) : (
            <div className="bg-red-900/30 rounded p-2 text-sm text-red-400">
              No active hero selected. Select one in the Combat tab.
            </div>
          )}

          {/* Door Mechanics */}
          <div ref={doorRef} id="dungeon_features_door_section" className="bg-slate-700/50 rounded p-3">
            <div id="dungeon_features_door_title" className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <DoorOpen size={16} /> Door Mechanics
            </div>
            
            <div className="flex gap-2 mb-2">
              <button 
                onClick={handleRollDoorType}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs"
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
              <div className={`p-2 rounded text-xs ${currentDoor.opened ? 'bg-green-900/50' : 'bg-slate-600'}`}>
                <div className="font-bold text-amber-400">{currentDoor.name}</div>
                <div className="text-slate-300">{currentDoor.description}</div>
                {currentDoor.opened && <div className="text-green-400 mt-1">✓ Door Opened!</div>}
              </div>
            )}
          </div>

          {/* Trap Mechanics */}
          <div ref={trapRef} id="dungeon_features_trap_section" className="bg-slate-700/50 rounded p-3">
            <div id="dungeon_features_trap_title" className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
              <AlertTriangle size={16} /> Trap Mechanics
            </div>
            
            <div className="flex gap-2 flex-wrap mb-2">
              <button 
                onClick={handleRollTrap}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs"
              >
                Roll Trap Type
              </button>
              <button 
                onClick={handleDetectTrap}
                disabled={!activeHero}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
              >
                 Detect Trap
              </button>
              {currentTrap?.detected && !currentTrap?.disarmed && !currentTrap?.triggered && (
                <button 
                  onClick={handleDisarmTrap}
                  disabled={!activeHero}
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
                >
                   Disarm
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
                currentTrap.triggered ? 'bg-red-900/50' : 'bg-slate-600'
              }`}>
                <div className="font-bold text-red-400">{currentTrap.name}</div>
                <div className="text-slate-300">{currentTrap.description}</div>
                <div className="text-slate-400 mt-1">
                  Damage: {currentTrap.damage} | Detect DC: {currentTrap.detectDC} | Disarm DC: {currentTrap.disarmDC}
                </div>
                {currentTrap.detected && !currentTrap.disarmed && !currentTrap.triggered && (
                  <div className="text-blue-400 mt-1"> Trap Detected!</div>
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
          <div ref={specialRef} id="dungeon_features_special_section" className="bg-slate-700/50 rounded p-3">
            <div id="dungeon_features_special_title" className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Sparkles size={16} /> Special Rooms
            </div>
            
            <div className="flex gap-2 mb-2">
              <button 
                onClick={handleRollSpecial}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs"
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
              <div className={`p-2 rounded text-xs ${currentSpecial.interacted ? 'bg-purple-900/30' : 'bg-slate-600'}`}>
                <div className="font-bold text-purple-400">{currentSpecial.name}</div>
                <div className="text-slate-300">{currentSpecial.description}</div>
                {currentSpecial.requiresGold && (
                  <div className="text-amber-400 mt-1"> Requires {currentSpecial.requiresGold} gold</div>
                )}
                {currentSpecial.interacted && <div className="text-purple-400 mt-1">✓ Interacted!</div>}
              </div>
            )}
          </div>

          {/* Puzzle Rooms */}
          <div ref={puzzleRef} id="dungeon_features_puzzle_section" className="bg-slate-700/50 rounded p-3">
            <div id="dungeon_features_puzzle_title" className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
              <Puzzle size={16} /> Puzzle Rooms
            </div>
            
            <div className="flex gap-2 mb-2">
              <button 
                onClick={handleRollPuzzle}
                className="bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded text-xs"
              >
                Roll Puzzle Type
              </button>
              {currentPuzzle && !currentPuzzle.attempted && (
                <button 
                  onClick={handleAttemptPuzzle}
                  disabled={!activeHero}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 px-3 py-1.5 rounded text-xs"
                >
                   Attempt Puzzle
                </button>
              )}
            </div>
            
            {currentPuzzle && (
              <div className={`p-2 rounded text-xs ${
                currentPuzzle.attempted 
                  ? currentPuzzle.success ? 'bg-green-900/50' : 'bg-red-900/30'
                  : 'bg-slate-600'
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

          {/* Quick Reference */}
          <div id="dungeon_features_reference_section" className="bg-slate-700/50 rounded p-3">
            <div id="dungeon_features_reference_title" className="text-amber-400 font-bold text-sm mb-2"> Quick Reference</div>
            <div id="dungeon_features_reference_content" className="text-xs text-slate-400 space-y-1">
              <div><span className="text-amber-400">Warriors/Barbarians:</span> Auto-open stuck doors</div>
              <div><span className="text-amber-400">Rogues:</span> +Level to detect/disarm traps, pick locks</div>
              <div><span className="text-amber-400">Dwarves:</span> +1 to detect stone traps (pit, blade)</div>
              <div><span className="text-amber-400">Wizards/Elves:</span> +Level to riddle puzzles</div>
              <div><span className="text-amber-400">Rogues/Halflings:</span> +Level to pressure plate puzzles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
