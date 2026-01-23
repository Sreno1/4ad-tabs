// Targeting and AI helpers for combat actions
import { monsterHatesHero } from './combatActions.js';

export function expandAttackers(monsters) {
  // Expand monsters for multi-attack logic (minor foes with count)
  const expanded = [];
  monsters.forEach(m => {
    const count = m.count && m.isMinorFoe ? m.count : 1;
    for (let i = 0; i < count; i++) expanded.push(m);
  });
  return expanded;
}

export function selectTargetsRoom(room, heroes, monsters) {
  // Assign targets for all heroes and monsters, even if dead
  const aliveHeroes = heroes.filter(h => h.hp > 0);
  const aliveMonsters = monsters.filter(m => !m.defeated);
  const heroCount = aliveHeroes.length;
  const monsterCount = aliveMonsters.length;

  // Assign each monster to a hero
  // Per 4AD rules (combat.txt p.169): When more Foes than PCs,
  // outstanding extra attacks target hated character classes
  const monsterAssignments = monsters.map((m, i) => {
    if (m.defeated) return { ...m, target: null };

    // If more monsters than heroes, check if this is an "extra" monster
    if (monsterCount > heroCount && i >= heroCount) {
      // Extra monster - prioritize hated heroes
      const hatedHero = aliveHeroes.find(h => monsterHatesHero(m, h));
      if (hatedHero) {
        return { ...m, target: hatedHero.id };
      }
    }

    // Normal assignment: round-robin
    const targetHero = aliveHeroes[i % heroCount];
    return { ...m, target: targetHero ? targetHero.id : null };
  });

  // Assign each hero to a monster
  const heroAssignments = heroes.map((h, i) => {
    if (h.hp <= 0) return { ...h, target: null };
    const targetMonster = aliveMonsters[i % monsterCount];
    return { ...h, target: targetMonster ? targetMonster.id : null };
  });
  return { heroes: heroAssignments, monsters: monsterAssignments };
}

export function selectTargetsCorridor(corridor, heroes, monsters) {
  // Assign targets for all heroes and monsters, even if dead
  const marchingOrder = corridor.marchingOrder || [0,1,2,3];
  const frontPositions = [marchingOrder[0], marchingOrder[1]].filter(i => typeof i === 'number' && heroes[i] && heroes[i].hp > 0);
  const aliveMonsters = monsters.filter(m => !m.defeated);
  // Assign up to two monsters to front heroes
  const monsterAssignments = monsters.map((m, i) => {
    if (m.defeated || i >= 2 || frontPositions.length === 0) return { ...m, target: null };
    return { ...m, target: heroes[frontPositions[i % frontPositions.length]]?.id || null };
  });
  // Assign each hero to a monster (optional, for symmetry)
  const heroAssignments = heroes.map((h, i) => {
    if (h.hp <= 0) return { ...h, target: null };
    const targetMonster = aliveMonsters[i % aliveMonsters.length];
    return { ...h, target: targetMonster ? targetMonster.id : null };
  });
  return { heroes: heroAssignments, monsters: monsterAssignments };
}
// ...add more targeting helpers as needed
