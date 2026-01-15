import React from 'react';
import { Button } from '../../ui/Button';

import { d6 } from '../../../utils/dice.js';

export default function PartyTurnPhase({
  state,
  dispatch,
  activeMonsters,
  corridor,
  onEndTurn
}) {
  const handleAttack = (hero, index) => {
    const abilities = state.abilities?.[index] || {};
    const rageBonus = (hero.key === 'barbarian' && abilities.rageActive) ? 1 : 0;
    const classBonus = hero.key === 'warrior' ? hero.lvl : 0;
    const totalBonus = hero.lvl + classBonus + rageBonus;
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

  dispatch({ type: 'LOG', t: `${hero.name} attacks: ${bonusBreakdown} vs L${monster.level} - ${hit ? 'HIT!' : 'Miss'}` });

    if (hit && monster.count !== undefined) {
      // Minor foe - multi-kill
      const kills = Math.floor(total / monster.level);
      const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
      const remaining = Math.max(0, monster.count - kills);
      dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { count: remaining } });
  dispatch({ type: 'LOG', t: `${kills} ${monster.name} slain! (${remaining} remain)` });
    } else if (hit) {
      // Major foe - 1 damage
      const originalIdx = state.monsters.findIndex(m => m.id === monster.id);
      const newHp = monster.hp - 1;
      dispatch({ type: 'UPD_MONSTER', i: originalIdx, u: { hp: newHp } });
      if (newHp <= 0) {
  dispatch({ type: 'LOG', t: `${monster.name} takes 1 damage and is DEFEATED!` });
      } else {
  dispatch({ type: 'LOG', t: `${monster.name} takes 1 damage! (${newHp}/${monster.maxHp} HP)` });
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded p-2" data-phase="party-turn">
      <div className="text-orange-400 font-bold text-sm mb-2">
    Attack Rolls
        <span className="text-slate-500 text-xs ml-2 font-normal">
          (Roll {activeMonsters[0]?.level ?? '?'}+ to hit)
        </span>
      </div>
      {corridor && (
        <div className="text-xs text-slate-300 mb-2">
          Corridor: Only front 2 heroes can melee. Back can use ranged/spells.
        </div>
      )}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {state.party.map((hero, index) => {
          const abilities = state.abilities?.[index] || {};
          const rageBonus = (hero.key === 'barbarian' && abilities.rageActive) ? 1 : 0;
          const classBonus = hero.key === 'warrior' ? hero.lvl : 0;
          const totalBonus = hero.lvl + classBonus + rageBonus;
          return (
            <Button
              key={hero.id || index}
              onClick={() => handleAttack(hero, index)}
              disabled={hero.hp <= 0}
              variant="danger"
              size="xs"
              dataAction={`attack-${hero.name}`}
              aria-label={`Attack with ${hero.name}`}
              className="truncate relative"
            >
              {hero.name} {hero.hp <= 0 ? '' : `(+${totalBonus})`}
                {hero.status?.blessed && <span className="absolute -top-1 -right-1 text-yellow-300"></span>}
            </Button>
          );
        })}
      </div>
      <Button
        onClick={onEndTurn}
        variant="secondary"
        size="sm"
        fullWidth
        dataAction="end-party-turn"
      >
        End Turn → Monster's Turn
      </Button>
    </div>
  );
}
