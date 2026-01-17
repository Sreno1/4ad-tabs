import { hasEquipment } from '../data/equipment.js';
import LanternAnimation from './LanternAnimation.jsx';
import React, { useState, useCallback } from 'react';
import { Plus, X, Heart, Star, Target } from 'lucide-react';
import { CLASSES, getMaxHP, getSpellSlots, getLuckPoints } from '../data/classes.js';
import { d6 } from '../utils/dice.js';
import { getXPForNextLevel, canLevelUp } from '../data/monsters.js';
import { hasTraits, getTrait } from '../data/traits.js';
import TraitSelector from './TraitSelector.jsx';
import { selectParty, selectIsPartyFull, selectHeroAbilities } from '../state/selectors.js';
import {
  addHero as createAddHeroAction,
  updateHero,
  logMessage,
  setAbility,
  deleteHero,
  adjustGold
} from '../state/actionCreators.js';
import { addHeroClue, removeHeroClue } from '../state/actionCreators.js';

export default function Party({ state, dispatch, selectedHero = 0, onSelectHero }) {
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [traitSelectorHero, setTraitSelectorHero] = useState(null);

  // Use selectors
  const party = selectParty(state);
  const isPartyFull = selectIsPartyFull(state);

  const addHeroToParty = useCallback((classKey) => {
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
      clues: 0,
      stats: { monstersKilled: 0, dungeonsSurvived: 0, totalGoldEarned: 0 }
    };
    dispatch(createAddHeroAction(hero));
    setShowClassPicker(false);
  }, [dispatch]);

  const adjustLevel = useCallback((index, delta) => {
    const hero = party[index];
    const newLevel = Math.max(1, Math.min(5, hero.lvl + delta));
    const newMaxHp = getMaxHP(hero.key, newLevel);
    dispatch(updateHero(index, {
      lvl: newLevel,
      maxHp: newMaxHp,
      hp: Math.min(hero.hp, newMaxHp)
    }));
  }, [party, dispatch]);

  const handleLevelUp = useCallback((index) => {
    const hero = party[index];
    if (!canLevelUp(hero)) return;

    const newLevel = hero.lvl + 1;
    const newMaxHp = getMaxHP(hero.key, newLevel);
    dispatch(updateHero(index, {
      lvl: newLevel,
      maxHp: newMaxHp,
      hp: hero.hp + 1 // Gain 1 HP on level up
    }));
    dispatch(logMessage(`🎉 ${hero.name} leveled up to L${newLevel}!`));
  }, [party, dispatch]);

  const adjustHP = useCallback((index, delta) => {
    const hero = party[index];
    const newHP = Math.max(0, Math.min(hero.maxHp, hero.hp + delta));
    dispatch(updateHero(index, { hp: newHP }));
  }, [party, dispatch]);

  const toggleAbility = useCallback((heroIndex, abilityKey) => {
    const heroAbilities = selectHeroAbilities(state, heroIndex);
    const currentValue = heroAbilities[abilityKey] || false;
    dispatch(setAbility(heroIndex, abilityKey, !currentValue));
  }, [state, dispatch]);

  const renderAbilities = (hero, index) => {
    // Cleric: Heals and Blessings
    if (hero.key === 'cleric') {
      return (
        <div className="flex gap-2 text-xs mt-1">
          <div className="flex items-center gap-1">
            <span className="text-green-400">Heals:</span>
            {[1, 2, 3].map(n => {
              const heroAbilities = selectHeroAbilities(state, index);
              return (
                <button
                  key={n}
                  onClick={() => toggleAbility(index, `heal${n}`)}
                  className={`w-4 h-4 rounded ${heroAbilities[`heal${n}`] ? 'bg-slate-600' : 'bg-green-600'}`}
                  aria-label={`${hero.name} heal slot ${n}: ${heroAbilities[`heal${n}`] ? 'used' : 'available'}`}
                  aria-pressed={!heroAbilities[`heal${n}`]}
                >
                  {!heroAbilities[`heal${n}`] && '✓'}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400">Bless:</span>
            {[1, 2, 3].map(n => {
              const heroAbilities = selectHeroAbilities(state, index);
              return (
                <button
                  key={n}
                  onClick={() => toggleAbility(index, `bless${n}`)}
                  className={`w-4 h-4 rounded ${heroAbilities[`bless${n}`] ? 'bg-slate-600' : 'bg-yellow-600'}`}
                  aria-label={`${hero.name} bless slot ${n}: ${heroAbilities[`bless${n}`] ? 'used' : 'available'}`}
                  aria-pressed={!heroAbilities[`bless${n}`]}
                >
                  {!heroAbilities[`bless${n}`] && '✓'}
                </button>
              );
            })}
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
          {Array.from({ length: slots }).map((_, n) => {
            const heroAbilities = selectHeroAbilities(state, index);
            return (
              <button
                key={`spell-${index}-${n}`}
                onClick={() => toggleAbility(index, `spell${n}`)}
                className={`w-4 h-4 rounded ${heroAbilities[`spell${n}`] ? 'bg-slate-600' : 'bg-purple-600'}`}
                aria-label={`${hero.name} spell slot ${n + 1}: ${heroAbilities[`spell${n}`] ? 'used' : 'available'}`}
                aria-pressed={!heroAbilities[`spell${n}`]}
              >
                {!heroAbilities[`spell${n}`] && '✓'}
              </button>
            );
          })}
        </div>
      );
    }

    // Halfling: Luck points
    if (hero.key === 'halfling') {
      const luckPoints = getLuckPoints(hero.lvl);
      return (
        <div className="flex gap-2 text-xs mt-1 flex-wrap">
          <span className="text-yellow-400">Luck: {luckPoints}</span>
          {Array.from({ length: luckPoints }).map((_, n) => {
            const heroAbilities = selectHeroAbilities(state, index);
            return (
              <button
                key={`luck-${index}-${n}`}
                onClick={() => toggleAbility(index, `luck${n}`)}
                className={`w-4 h-4 rounded ${heroAbilities[`luck${n}`] ? 'bg-slate-600' : 'bg-cyan-600'}`}
                aria-label={`${hero.name} luck point ${n + 1}: ${heroAbilities[`luck${n}`] ? 'used' : 'available'}`}
                aria-pressed={!heroAbilities[`luck${n}`]}
              >
                {!heroAbilities[`luck${n}`] && '✓'}
              </button>
            );
          })}
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
            aria-label={`${hero.name} rage: ${isRaging ? 'active' : 'inactive'}`}
            aria-pressed={isRaging}
          >
            {isRaging ? '🔥 RAGING' : 'Rage'}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <section id="party_section" className="p-3 space-y-2">
  {/* Marching Order UI moved to Action Pane */}
      {/* Active Hero Info */}
      {state.party[selectedHero] && (
        <div className="text-xs text-slate-400 mb-2">
          Active: <span className="text-amber-300">{state.party[selectedHero].name}</span>
          <span className="text-slate-500 ml-1">({state.party[selectedHero].key})</span>
        </div>
      )}
      {/* Header */}
      <div id="party_header" className="flex justify-between items-center">
        <span id="party_header_title" className="font-bold text-amber-400">
          Party ({state.party.length}/4) · HCL {state.hcl}
        </span>
        {!isPartyFull && (
          <button
            id="party_add_hero_button"
            onClick={() => setShowClassPicker(!showClassPicker)}
            className="bg-amber-600 px-2 py-1 rounded text-sm"
            aria-label="Add hero to party"
            aria-expanded={showClassPicker}
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Class Picker */}
      {showClassPicker && (
        <div id="party_controls" className="grid grid-cols-2 gap-1" role="menu" aria-label="Character class selection">
          {Object.entries(CLASSES).map(([key, classData]) => (
            <button
              key={key}
              onClick={() => addHeroToParty(key)}
              className="bg-slate-700 p-1.5 rounded text-left"
              role="menuitem"
              aria-label={`Add ${classData.name}: ${classData.sp}`}
            >
              <div className="text-amber-400 text-sm font-bold">{classData.name}</div>
              <div className="text-slate-400 text-xs truncate">{classData.sp}</div>
            </button>
          ))}
        </div>
      )}

      {/* Hero Cards */}
      <div id="party_cards">
      {party.map((hero, i) => {
        const xpNeeded = getXPForNextLevel(hero.lvl);
        const currentXP = hero.xp || 0;
        const readyToLevel = canLevelUp(hero);

        return (
        <div key={hero.id || i} id={`party_card_${i}`} className={`party_card bg-slate-700 rounded p-2 text-sm ${readyToLevel ? 'ring-2 ring-yellow-400' : ''}`}>
          <div id={`party_card_${i}_header`} className="flex justify-between">
            <div className="flex items-center gap-2">
              <input
                id={`party_card_${i}_name`}
                value={hero.name}
                onChange={e => dispatch(updateHero(i, { name: e.target.value }))}
                className="bg-transparent text-amber-400 font-bold w-24 outline-none"
                aria-label={`Hero ${i + 1} name`}
              />
              {/* Lantern animation if hero has lantern */}
              {hasEquipment(hero, 'lantern') && (
                <LanternAnimation size={22} className="ml-1" />
              )}
            </div>
            <button
              id={`party_card_${i}_delete_button`}
              onClick={() => dispatch(deleteHero(i))}
              className="text-slate-500 hover:text-red-400"
              aria-label={`Remove ${hero.name} from party`}
            >
              <X size={14} />
            </button>          </div>

          {/* Level and HP Controls */}
          <div id={`party_card_${i}_stats`} className="flex justify-between items-center text-xs mt-1">
            <div id={`party_card_${i}_level_section`} className="flex items-center gap-1">
              <button
                id={`party_card_${i}_level_decrease_button`}
                onClick={() => adjustLevel(i, -1)}
                className="bg-slate-600 px-1 rounded"
                aria-label={`Decrease ${hero.name} level`}
              >-</button>
              <span id={`party_card_${i}_level`}>L{hero.lvl} {CLASSES[hero.key].name}</span>
              <button
                id={`party_card_${i}_level_increase_button`}
                onClick={() => adjustLevel(i, 1)}
                className="bg-slate-600 px-1 rounded"
                aria-label={`Increase ${hero.name} level`}
              >+</button>
              {readyToLevel && (
                <button
                  id={`party_card_${i}_level_up_button`}
                  onClick={() => handleLevelUp(i)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-2 py-0.5 rounded text-xs font-bold animate-pulse ml-2"
                  aria-label={`Level up ${hero.name} to level ${hero.lvl + 1}`}
                >
                  Level Up!
                </button>
              )}
            </div>
            <div id={`party_card_${i}_hp_section`} className="flex items-center gap-1 text-red-400">
              <Heart size={12} aria-hidden="true" />
              <button
                id={`party_card_${i}_hp_decrease_button`}
                onClick={() => adjustHP(i, -1)}
                className="bg-slate-600 px-1 rounded"
                aria-label={`Decrease ${hero.name} HP`}
                aria-describedby={`party_card_${i}_hp_display`}
              >-</button>
              <span id={`party_card_${i}_hp_display`}>{hero.hp}/{hero.maxHp}</span>
              <button
                id={`party_card_${i}_hp_increase_button`}
                onClick={() => adjustHP(i, 1)}
                className="bg-slate-600 px-1 rounded"
                aria-label={`Increase ${hero.name} HP`}
                aria-describedby={`party_card_${i}_hp_display`}
              >+</button>
            </div>
          </div>

          {/* Status Effects */}
          {(hero.status?.blessed || hero.status?.wounded || hero.status?.dead) && (
            <div id={`party_card_${i}_status`} className="flex gap-1 mt-1 text-xs">
              {hero.status?.blessed && <span className="bg-amber-600 px-1 rounded">✨ Blessed</span>}
              {hero.status?.wounded && <span className="bg-orange-600 px-1 rounded">🩹 Wounded</span>}
              {hero.status?.dead && <span className="bg-red-800 px-1 rounded">💀 Dead</span>}
            </div>
          )}

          {/* Clues Tracker */}
          <div id={`party_card_${i}_clues`} className="flex gap-1 mt-1 text-xs items-center">
            <span className="text-blue-400 font-semibold">🔍 Clues:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3].map(clueNum => {
                  const filled = clueNum <= (hero.clues || 0);
                  return (
                    <button
                      key={clueNum}
                      id={`party_card_${i}_clue_${clueNum}_button`}
                      type="button"
                      onClick={() => {
                        // filled dot removes a clue, empty dot adds one
                        if (filled) dispatch(removeHeroClue(i, 1));
                        else dispatch(addHeroClue(i, 1));
                      }}
                      className={`w-3 h-3 rounded-full focus:outline-none ${filled ? '' : ''} cursor-pointer`}
                      aria-label={`Clue ${clueNum} for ${hero.name} - ${filled ? 'remove' : 'add'}`}
                      aria-pressed={filled}
                      title={filled ? 'Click to remove clue' : 'Click to add clue'}
                      style={{ backgroundColor: filled ? 'rgb(59 130 246)' : 'rgb(15 23 42)' }}
                    />
                  );
                })}
              </div>
            <span className="text-blue-300">({hero.clues || 0}/3)</span>
          </div>

          {/* Bandage & Carried Treasure */}
          <div id={`party_card_${i}_bandage_treasure`} className="flex gap-3 mt-1 text-xs items-center">
            <div className="flex items-center gap-1">
              <span className="text-emerald-300 font-semibold">🩹 Bandage:</span>
              <span className="text-slate-300">{Math.max(0, 1 - ((state.abilities?.[i]?.bandagesUsed) || 0))}/1</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-yellow-300 font-semibold">💰 Carried:</span>
              <span className="text-slate-300">{(hero.carriedTreasureWeight || 0)}gp/{hero.maxCarryWeight || 200}gp</span>
            </div>
          </div>

          {/* Character Trait */}
          {hasTraits(hero.key) && (
            <div id={`party_card_${i}_trait`} className="flex gap-2 items-center mt-1">
              {hero.trait ? (
                <div id={`party_card_${i}_trait_display`} className="flex-1 bg-cyan-900 border border-cyan-600 rounded px-2 py-1 flex justify-between items-center">
                  <div>
                    <span className="text-cyan-400 text-xs font-bold">
                      🎯 {getTrait(hero.key, hero.trait)?.name || hero.trait}
                    </span>
                    {hero.traitChoice && (
                      <span className="text-cyan-300 text-xs ml-1">({hero.traitChoice})</span>
                    )}
                  </div>
                  <button
                    id={`party_card_${i}_trait_edit_button`}
                    onClick={() => setTraitSelectorHero({ hero, index: i })}
                    className="text-cyan-400 hover:text-cyan-300 text-xs ml-2"
                    title="Change Trait"
                    aria-label={`Change ${hero.name} trait`}
                  >
                    ✏️
                  </button>
                </div>
              ) : (
                <button
                  id={`party_card_${i}_trait_select_button`}
                  onClick={() => setTraitSelectorHero({ hero, index: i })}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 rounded px-2 py-1 text-xs text-slate-300 flex items-center justify-center gap-1"
                  aria-label={`Select trait for ${hero.name}`}
                >
                  <Target size={12} aria-hidden="true" />
                  <span>Select Trait</span>
                </button>
              )}
            </div>
          )}
            {/* Class Abilities */}
          <div id={`party_card_${i}_abilities`}>
            {renderAbilities(hero, i)}
          </div>

          {/* Divider between heroes (RPGUI styled) */}
          {i < state.party.length - 1 && <hr className="my-2" />}
        </div>
        );
      })}
      </div>

        {/* Gold Tracker */}
      <div id="party_gold_section" className="bg-slate-800 rounded p-2 text-sm">
        <div className="flex justify-between items-center">
          <span id="party_gold_display" className="text-amber-400">Gold: {state.gold}</span>
          <div id="party_gold_controls" className="flex gap-1">
            <button
              id="party_gold_decrease_button"
              onClick={() => dispatch(adjustGold(-1))}
              className="bg-slate-700 px-2 rounded"
              aria-label="Decrease gold by 1"
              aria-describedby="party_gold_display"
            >-</button>
            <button
              id="party_gold_increase_button"
              onClick={() => dispatch(adjustGold(1))}
              className="bg-slate-700 px-2 rounded"
              aria-label="Increase gold by 1"
              aria-describedby="party_gold_display"
            >+</button>
            <button
              id="party_gold_roll_d6_button"
              onClick={() => dispatch(adjustGold(d6()))}
              className="bg-amber-600 px-2 rounded"
              aria-label="Add 1d6 gold"
              aria-describedby="party_gold_display"
            >+d6</button>
          </div>
        </div>
      </div>



      {/* Trait Selector Modal */}
      {traitSelectorHero && (
        <TraitSelector
          isOpen={true}
          hero={traitSelectorHero.hero}
          heroIdx={traitSelectorHero.index}
          dispatch={dispatch}
          onClose={() => setTraitSelectorHero(null)}
        />
      )}
    </section>
  );
}
