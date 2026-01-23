// Unit test for crushing weapon bonus vs skeletons
import { buildAttackModifiers } from './combatActions.modifiers.js';

describe('Crushing Weapon Bonus vs Skeletons', () => {
  const hero = {
    name: 'Test Hero',
    lvl: 1,
    key: 'warrior',
    traits: [],
    equipment: ['mace'],
  };
  const mace = {
    id: 'mace',
    name: 'Mace',
    damageType: 'crushing',
    attackMod: 0,
    category: 'weapon',
    type: 'weapon',
  };
  const skeleton = {
    name: 'Skeleton',
    vulnerableTo: 'crushing',
  };
  it('applies +1 bonus for crushing weapon vs skeleton', () => {
    const { mod, modifiers } = buildAttackModifiers(hero, { weapon: mace, target: skeleton });
    expect(mod).toBeGreaterThanOrEqual(1);
    expect(modifiers.join(' ')).toMatch(/crushing vs skeleton/);
  });
  it('does not apply bonus for non-crushing weapon', () => {
    const sword = { ...mace, damageType: 'slashing', name: 'Sword' };
    const { mod, modifiers } = buildAttackModifiers(hero, { weapon: sword, target: skeleton });
    expect(modifiers.join(' ')).not.toMatch(/crushing vs skeleton/);
  });
  it('does not apply bonus vs non-skeleton', () => {
    const goblin = { name: 'Goblin' };
    const { mod, modifiers } = buildAttackModifiers(hero, { weapon: mace, target: goblin });
    expect(modifiers.join(' ')).not.toMatch(/crushing vs skeleton/);
  });
});
