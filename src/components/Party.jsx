import React, { useState } from 'react';
import { Plus, X, Heart } from 'lucide-react';
import { CLASSES, getMaxHP, getSpellSlots, getLuckPoints } from '../data/classes.js';
import { d6 } from '../utils/dice.js';

export default function Party({ state, dispatch }) {
  const [showClassPicker, setShowClassPicker] = useState(false);
  
  const addHero = (classKey) => {
    const classData = CLASSES[classKey];
    const hero = {
      id: Date.now(),
      name: classData.name,
      key: classKey,
      lvl: 1,
      hp: classData.life + 1,
      maxHp: classData.life + 1,
      xp: 0,
      equipment: {},
      inventory: [],
      abilities: {},
      status: {},
      stats: { monstersKilled: 0, dungeonsSurvived: 0, totalGoldEarned: 0 }
    };
    dispatch({ type: 'ADD_HERO', h: hero });
    setShowClassPicker(false);
  };
  
  const adjustLevel = (index, delta) => {
    const hero = state.party[index];
    const newLevel = Math.max(1, Math.min(5, hero.lvl + delta));
    const newMaxHp = getMaxHP(hero.key, newLevel);
    dispatch({ 
      type: 'UPD_HERO', 
      i: index, 
      u: { 
        lvl: newLevel, 
        maxHp: newMaxHp, 
        hp: Math.min(hero.hp, newMaxHp) 
      } 
    });
  };
  
  const adjustHP = (index, delta) => {
    const hero = state.party[index];
    const newHP = Math.max(0, Math.min(hero.maxHp, hero.hp + delta));
    dispatch({ type: 'UPD_HERO', i: index, u: { hp: newHP } });
  };
  
  const toggleAbility = (heroIndex, abilityKey) => {
    const currentValue = state.abilities[heroIndex]?.[abilityKey] || false;
    dispatch({ 
      type: 'SET_ABILITY', 
      heroIdx: heroIndex, 
      ability: abilityKey, 
      value: !currentValue 
    });
  };
  
  const renderAbilities = (hero, index) => {
    // Cleric: Heals and Blessings
    if (hero.key === 'cleric') {
      return (
        <div className="flex gap-2 text-xs mt-1">
          <div className="flex items-center gap-1">
            <span className="text-green-400">Heals:</span>
            {[1, 2, 3].map(n => (
              <button 
                key={n} 
                onClick={() => toggleAbility(index, `heal${n}`)}
                className={`w-4 h-4 rounded ${state.abilities[index]?.[`heal${n}`] ? 'bg-slate-600' : 'bg-green-600'}`}
              >
                {!state.abilities[index]?.[`heal${n}`] && '✓'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">Bless:</span>
            {[1, 2, 3].map(n => (
              <button 
                key={n} 
                onClick={() => toggleAbility(index, `bless${n}`)}
                className={`w-4 h-4 rounded ${state.abilities[index]?.[`bless${n}`] ? 'bg-slate-600' : 'bg-blue-600'}`}
              >
                {!state.abilities[index]?.[`bless${n}`] && '✓'}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // Wizard/Elf: Spell slots
    if (hero.key === 'wizard' || hero.key === 'elf') {
      const slots = getSpellSlots(hero.key, hero.lvl);
      return (
        <div className="flex gap-2 text-xs mt-1 flex-wrap">
          <span className="text-purple-400">Spells: {slots}</span>
          {Array.from({ length: slots }).map((_, n) => (
            <button 
              key={n} 
              onClick={() => toggleAbility(index, `spell${n}`)}
              className={`w-4 h-4 rounded ${state.abilities[index]?.[`spell${n}`] ? 'bg-slate-600' : 'bg-purple-600'}`}
            >
              {!state.abilities[index]?.[`spell${n}`] && '✓'}
            </button>
          ))}
        </div>
      );
    }
    
    // Halfling: Luck points
    if (hero.key === 'halfling') {
      const luckPoints = getLuckPoints(hero.lvl);
      return (
        <div className="flex gap-2 text-xs mt-1 flex-wrap">
          <span className="text-yellow-400">Luck: {luckPoints}</span>
          {Array.from({ length: luckPoints }).map((_, n) => (
            <button 
              key={n} 
              onClick={() => toggleAbility(index, `luck${n}`)}
              className={`w-4 h-4 rounded ${state.abilities[index]?.[`luck${n}`] ? 'bg-slate-600' : 'bg-yellow-600'}`}
            >
              {!state.abilities[index]?.[`luck${n}`] && '✓'}
            </button>
          ))}
        </div>
      );
    }
    
    // Barbarian: Rage toggle
    if (hero.key === 'barbarian') {
      const isRaging = state.abilities[index]?.rage || false;
      return (
        <div className="flex gap-2 text-xs mt-1">
          <button 
            onClick={() => toggleAbility(index, 'rage')}
            className={`px-2 py-0.5 rounded ${isRaging ? 'bg-red-600 text-white' : 'bg-slate-600'}`}
          >
            {isRaging ? '🔥 RAGING' : 'Rage'}
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="p-3 space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-bold text-amber-400">
          Party ({state.party.length}/4) · HCL {state.hcl}
        </span>
        {state.party.length < 4 && (
          <button 
            onClick={() => setShowClassPicker(!showClassPicker)} 
            className="bg-amber-600 px-2 py-1 rounded text-sm"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      
      {/* Class Picker */}
      {showClassPicker && (
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(CLASSES).map(([key, classData]) => (
            <button 
              key={key} 
              onClick={() => addHero(key)} 
              className="bg-slate-700 p-1.5 rounded text-left"
            >
              <div className="text-amber-400 text-sm font-bold">{classData.name}</div>
              <div className="text-slate-400 text-xs truncate">{classData.sp}</div>
            </button>
          ))}
        </div>
      )}
      
      {/* Hero Cards */}
      {state.party.map((hero, index) => (
        <div key={hero.id || index} className="bg-slate-700 rounded p-2 text-sm">
          <div className="flex justify-between">
            <input 
              value={hero.name} 
              onChange={e => dispatch({ type: 'UPD_HERO', i: index, u: { name: e.target.value } })} 
              className="bg-transparent text-amber-400 font-bold w-24 outline-none" 
            />
            <button 
              onClick={() => dispatch({ type: 'DEL_HERO', i: index })} 
              className="text-slate-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="flex justify-between items-center text-xs mt-1">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => adjustLevel(index, -1)} 
                className="bg-slate-600 px-1 rounded"
              >-</button>
              <span>L{hero.lvl} {CLASSES[hero.key].name}</span>
              <button 
                onClick={() => adjustLevel(index, 1)} 
                className="bg-slate-600 px-1 rounded"
              >+</button>
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <Heart size={12} />
              <button 
                onClick={() => adjustHP(index, -1)} 
                className="bg-slate-600 px-1 rounded"
              >-</button>
              {hero.hp}/{hero.maxHp}
              <button 
                onClick={() => adjustHP(index, 1)} 
                className="bg-slate-600 px-1 rounded"
              >+</button>
            </div>
          </div>
          
          {/* Class Abilities */}
          {renderAbilities(hero, index)}
        </div>
      ))}
      
      {/* Gold Tracker */}
      <div className="bg-slate-800 rounded p-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-amber-400">Gold: {state.gold}</span>
          <div className="flex gap-1">
            <button 
              onClick={() => dispatch({ type: 'GOLD', n: -1 })} 
              className="bg-slate-700 px-2 rounded"
            >-</button>
            <button 
              onClick={() => dispatch({ type: 'GOLD', n: 1 })} 
              className="bg-slate-700 px-2 rounded"
            >+</button>
            <button 
              onClick={() => dispatch({ type: 'GOLD', n: d6() })} 
              className="bg-amber-600 px-2 rounded"
            >+d6</button>
          </div>
        </div>
      </div>
    </div>
  );
}
