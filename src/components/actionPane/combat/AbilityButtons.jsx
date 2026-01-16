import React, { memo } from 'react';
import { getScroll } from '../../../data/scrolls.js';
// TODO: Import Button and any other needed UI components

/**
 * AbilityButtons - Handles all class ability buttons and popups (heal, bless, spell, etc)
 * Extracted from ActionPane.jsx (lines 881-1144)
 */
const AbilityButtons = memo(function AbilityButtons({
  state,
  dispatch,
  showSpells,
  setShowSpells,
  showHealTarget,
  setShowHealTarget,
  showBlessTarget,
  setShowBlessTarget,
  showProtectionTarget,
  setShowProtectionTarget,
  showScrolls,
  setShowScrolls,
  ...rest
}) {
  // Ability buttons and popups extracted from ActionPane.jsx
  return (
    <div className="bg-slate-800 rounded p-2">
      <div className="text-purple-400 font-bold text-sm mb-1">
        Class Abilities
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
                  {hero.name.slice(0,3)} Heal ({3 - (abilities.healsUsed || 0)}/3)
                </button>
              )}

              {/* Cleric Bless */}
              {hero.key === 'cleric' && (abilities.blessingsUsed || 0) < 3 && (
                <button
                  onClick={() => setShowBlessTarget(index)}
                  className="bg-amber-700 hover:bg-amber-600 px-2 py-0.5 rounded text-xs"
                  title="Grant +1 to next attack/defense roll (3 per adventure)"
                >
                  {hero.name.slice(0,3)} Bless ({3 - (abilities.blessingsUsed || 0)}/3)
                </button>
              )}

              {/* Barbarian Rage */}
              {hero.key === 'barbarian' && (
                <button
                  onClick={() => dispatch({ type: 'SET_ABILITY', heroIdx: index, ability: 'rageActive', value: !abilities.rageActive })}
                  className={`px-2 py-0.5 rounded text-xs ${abilities.rageActive ? 'bg-red-500' : 'bg-red-700 hover:bg-red-600'}`}
                  title={abilities.rageActive ? 'End Rage (remove +1 Attack, -1 Defense)' : 'Enter Rage (+1 Attack, -1 Defense)'}
                >
                  {hero.name.slice(0,3)} {abilities.rageActive ? 'End Rage' : 'Rage'}
                </button>
              )}

              {/* Halfling Luck */}
              {hero.key === 'halfling' && (abilities.luckUsed || 0) < hero.lvl + 1 && (
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_ABILITY', heroIdx: index, ability: 'luckUsed', value: (abilities.luckUsed || 0) + 1 });
                    dispatch({ type: 'LOG', t: `${hero.name} uses Luck! (Re-roll any die)` });
                  }}
                  className="bg-green-700 hover:bg-green-600 px-2 py-0.5 rounded text-xs"
                  title="Re-roll any single die (Lvl+1 per adventure)"
                >
                  {hero.name.slice(0,3)} Luck ({hero.lvl + 1 - (abilities.luckUsed || 0)}/{hero.lvl + 1})
                </button>
              )}

              {/* Wizard Spells */}
              {hero.key === 'wizard' && (abilities.spellsUsed || 0) < hero.lvl + 2 && (
                <button
                  onClick={() => {
                    dispatch({ type: 'LOG', t: `${hero.name} prepares to cast a spell...` });
                    setShowSpells(index);
                  }}
                  className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs"
                  title="Cast any wizard spell (Lvl+2 per adventure)"
                >
                  {hero.name.slice(0,3)} Spell ({hero.lvl + 2 - (abilities.spellsUsed || 0)}/{hero.lvl + 2})
                </button>
              )}

              {/* Elf Spells */}
              {hero.key === 'elf' && (abilities.spellsUsed || 0) < hero.lvl && (
                <button
                  onClick={() => {
                    dispatch({ type: 'LOG', t: `${hero.name} prepares to cast a spell...` });
                    setShowSpells(index);
                  }}
                  className="bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-xs"
                  title="Cast any wizard spell (Lvl per adventure)"
                >
                  {hero.name.slice(0,3)} Spell ({hero.lvl - (abilities.spellsUsed || 0)}/{hero.lvl})
                </button>
              )}

              {/* Use Scroll (any hero except barbarians) */}
              {hero.key !== 'barbarian' && (hero.inventory || []).some(key => key.startsWith('scroll_')) && (
                <button
                  onClick={() => setShowScrolls(index)}
                  className="bg-purple-700 hover:bg-purple-600 px-2 py-0.5 rounded text-xs"
                  title="Read and cast a spell from a scroll"
                >
                  {hero.name.slice(0,3)} Scroll ({(hero.inventory || []).filter(k => k.startsWith('scroll_')).length})
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Spell Selection Popup */}
      {showSpells !== null && rest.getAvailableSpells && rest.SPELLS && (
        <div className="mt-2 p-2 bg-slate-700 rounded border border-blue-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-blue-400">
              {state.party[showSpells]?.name} - Select Spell
            </span>
            <button
              onClick={() => setShowSpells(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {rest.getAvailableSpells(state.party[showSpells]?.key).map(spellKey => (
              <button
                key={spellKey}
                onClick={() => rest.handleCastSpell(showSpells, spellKey)}
                className="bg-blue-600 hover:bg-blue-500 px-2 py-1.5 rounded text-xs text-left"
                title={rest.SPELLS[spellKey].description}
              >
                <div className="font-bold">{rest.SPELLS[spellKey].name}</div>
                <div className="text-blue-200 text-[10px]">{rest.SPELLS[spellKey].description}</div>
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
              {state.party[showHealTarget]?.name} - Select Heal Target
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
                      dispatch({ type: 'LOG', t: `${state.party[showHealTarget].name} heals ${target.name} for 1 HP! (${target.hp + 1}/${target.maxHp})` });
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
                    {target.hp}/{target.maxHp} {target.hp <= 0 ? '' : target.hp >= target.maxHp ? '(Full)' : ''}
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
              {state.party[showBlessTarget]?.name} - Select Bless Target
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
                      dispatch({ type: 'LOG', t: `${state.party[showBlessTarget].name} blesses ${target.name}! (+1 to next attack/defense)` });
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
                    {target.hp <= 0 ? 'KO' : target.status?.blessed ? 'Already Blessed' : 'Ready'}
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
              {state.party[showProtectionTarget]?.name} - Select Protection Target
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
                      dispatch({ type: 'LOG', t: `${caster.name} casts Protection on ${target.name}! (+1 Defense until end of encounter)` });
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
                    {target.hp <= 0 ? 'KO' : target.status?.protected ? 'Already Protected' : 'Ready'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scroll Selection Popup */}
      {showScrolls !== null && state.party[showScrolls] && (
        <div className="mt-2 p-2 bg-slate-700 rounded border border-purple-500">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-purple-400">
              {state.party[showScrolls]?.name} - Select Scroll
            </span>
            <button
              onClick={() => setShowScrolls(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {(state.party[showScrolls]?.inventory || [])
              .filter(key => key.startsWith('scroll_'))
              .map((scrollKey, idx) => {
                const scroll = getScroll(scrollKey);
                return scroll ? (
                  <div key={`${scrollKey}-${idx}`} className="bg-slate-600 rounded p-1.5 border border-purple-600">
                    <div className="font-bold text-purple-300 text-xs mb-1">{scroll.name}</div>
                    <div className="text-purple-200 text-[10px] mb-1">{scroll.description}</div>
                    <button
                      onClick={() => {
                        rest.handleCastScroll?.(showScrolls, scrollKey);
                        setShowScrolls(null);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 px-2 py-0.5 rounded text-xs w-full"
                    >
                      Cast
                    </button>
                    {state.party[showScrolls]?.key === 'wizard' && (
                      <button
                        onClick={() => {
                          rest.handleCopyScroll?.(showScrolls, scrollKey);
                          setShowScrolls(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 px-2 py-0.5 rounded text-xs w-full mt-0.5"
                      >
                        Copy to Spellbook
                      </button>
                    )}
                  </div>
                ) : null;
              })}
          </div>
        </div>
      )}
    </div>
  );
});

export default AbilityButtons;
