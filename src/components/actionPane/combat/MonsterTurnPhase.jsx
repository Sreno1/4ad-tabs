import React from 'react';
import { Button } from '../../ui/Button';

import { d6 } from '../../../utils/dice.js';

export default function MonsterTurnPhase({
  state,
  dispatch,
  activeMonsters,
  onEndTurn
}) {
  const handleDefense = (hero, index) => {
    const abilities = state.abilities?.[index] || {};
    const defBonus = hero.key === 'rogue' ? hero.lvl : 0;
    const ragePenalty = (hero.key === 'barbarian' && abilities.rageActive) ? -1 : 0;
    const protectedBonus = hero.status?.protected ? 1 : 0;
    const totalBonus = defBonus + ragePenalty + protectedBonus;
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

  dispatch({ type: 'LOG', t: `${hero.name} defends: ${bonusBreakdown} vs ${targetNum}+ - ${blocked ? 'Blocked!' : 'HIT!'}` });

    if (!blocked) {
      const newHp = Math.max(0, hero.hp - 1);
      dispatch({ type: 'UPD_HERO', i: index, u: { hp: newHp } });
      if (newHp <= 0) {
    dispatch({ type: 'LOG', t: `${hero.name} takes 1 damage and falls unconscious! (0/${hero.maxHp})` });
      } else {
  dispatch({ type: 'LOG', t: `${hero.name} takes 1 damage! (${newHp}/${hero.maxHp} HP)` });
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded p-2" data-phase="monster-turn">
      <div className="text-red-400 font-bold text-sm mb-2">
    Defense Rolls
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
            <Button
              key={hero.id || index}
              onClick={() => handleDefense(hero, index)}
              disabled={hero.hp <= 0}
              variant="warning"
              size="xs"
              dataAction={`defend-${hero.name}`}
              aria-label={`Defend with ${hero.name}`}
              className="truncate"
            >
              {hero.name} {hero.hp <= 0 ? '' : `(${hero.hp}HP${totalBonus !== 0 ? `, ${totalBonus > 0 ? '+' : ''}${totalBonus}` : ''})`}
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
        dataAction="end-monster-turn"
      >
        End Turn → Party's Turn
      </Button>
    </div>
  );
}
