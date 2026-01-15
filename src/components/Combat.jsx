import React, { useState } from 'react';
import { d6 } from '../utils/dice.js';
import { rollWanderingMonster, rollTreasure, calculateAttack, calculateDefense } from '../utils/gameActions.js';

export default function Combat({ state, dispatch }) {
  const [foeLevel, setFoeLevel] = useState(4);
  const [combatLog, setCombatLog] = useState([]);
  
  const addToCombatLog = (message) => {
    setCombatLog(prev => [message, ...prev].slice(0, 15));
    dispatch({ type: 'LOG', t: message });
  };
  
  const clearCombatLog = () => {
    setCombatLog([]);
  };
  
  const handleClearMonsters = () => {
    dispatch({ type: 'CLEAR_MONSTERS' });
    clearCombatLog(); // Clear combat log when encounter ends
    dispatch({ type: 'LOG', t: '--- Encounter ended ---' });
  };
  
  const handleAttack = (heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero || hero.hp <= 0) return;
    
    const result = calculateAttack(hero, foeLevel);
    addToCombatLog(result.message);
  };
  
  const handleDefense = (heroIndex) => {
    const hero = state.party[heroIndex];
    if (!hero) return;
    
    const result = calculateDefense(hero, foeLevel);
    
    if (!result.blocked) {
      dispatch({ type: 'UPD_HERO', i: heroIndex, u: { hp: Math.max(0, hero.hp - 1) } });
    }
    
    addToCombatLog(result.message);
  };
  
  const handleWanderingMonster = () => {
    rollWanderingMonster(dispatch);
  };
  
  const handleCustomMonster = () => {
    const level = parseInt(prompt('Monster Level (1-5)?', '2')) || 2;
    const hp = parseInt(prompt('HP?', '6')) || 6;
    const name = prompt('Monster Name?', 'Custom Monster') || 'Custom Monster';
    
    const monster = { 
      id: Date.now(), 
      name, 
      level, 
      hp, 
      maxHp: hp, 
      type: 'custom' 
    };
    
    dispatch({ type: 'ADD_MONSTER', m: monster });
    dispatch({ type: 'LOG', t: `${name} L${level} (${hp}HP) added` });
  };
  
  const handleTreasure = () => {
    rollTreasure(dispatch);
  };
  
  const adjustMonsterHP = (index, delta) => {
    const monster = state.monsters[index];
    const newHP = Math.max(0, Math.min(monster.maxHp, monster.hp + delta));
    dispatch({ type: 'UPD_MONSTER', i: index, u: { hp: newHP } });
  };
  
  return (
    <div className="space-y-2">
      {/* Active Monsters */}
      <div className="bg-slate-800 rounded p-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber-400 font-bold text-sm">
            🐉 Active Monsters ({state.monsters.length})
          </span>          {state.monsters.length > 0 && (
            <button 
              onClick={handleClearMonsters} 
              className="bg-red-600 px-2 py-0.5 rounded text-xs"
            >
              End Encounter
            </button>
          )}
        </div>
        
        <div className="space-y-1 max-h-32 overflow-y-auto mb-2">
          {state.monsters.map((monster, index) => (
            <div key={monster.id} className="bg-slate-700 rounded p-1.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-amber-400 font-bold text-xs">{monster.name}</span>
                <button 
                  onClick={() => dispatch({ type: 'DEL_MONSTER', i: index })} 
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-between items-center mt-0.5 text-xs">
                <span className="text-slate-400">L{monster.level}</span>
                <div className="flex items-center gap-1 text-red-400">
                  <button 
                    onClick={() => adjustMonsterHP(index, -1)} 
                    className="bg-slate-600 px-1 rounded"
                  >-</button>
                  <span>{monster.hp}/{monster.maxHp}</span>
                  <button 
                    onClick={() => adjustMonsterHP(index, 1)} 
                    className="bg-slate-600 px-1 rounded"
                  >+</button>
                </div>
              </div>
              {monster.hp === 0 && (
                <div className="text-green-400 text-xs mt-0.5">💀 Defeated!</div>
              )}
            </div>
          ))}
          {state.monsters.length === 0 && (
            <div className="text-slate-500 text-xs text-center py-2">No active monsters</div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-1">
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
      </div>
      
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
          Attack: {foeLevel}+ to hit | Defense: {foeLevel + 1}+ to block
        </div>
      </div>
      
      {/* Attack/Defense Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded p-2">
          <div className="text-orange-400 font-bold text-sm mb-2">⚔️ Attack</div>
          {state.party.map((hero, index) => (
            <button 
              key={hero.id || index} 
              onClick={() => handleAttack(index)} 
              disabled={hero.hp <= 0} 
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate"
            >
              {hero.name}
            </button>
          ))}
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
