export const ENVIRONMENTS = [
  { id: 'dungeon', label: 'Dungeon' },
  { id: 'caverns', label: 'Caverns' },
  { id: 'fungal_grottoes', label: 'Fungal Grottoes' }
];

export const ENVIRONMENT_LABELS = {
  dungeon: 'Dungeon',
  caverns: 'Caverns',
  fungal_grottoes: 'Fungal Grottoes'
};

export const ENVIRONMENT_MONSTER_CATEGORIES = {
  dungeon: {
    vermin: 'dungeonVermin',
    minions: 'dungeonMinions',
    weird: 'dungeonWeird',
    boss: 'dungeonBoss'
  },
  caverns: {
    vermin: 'cavernsVermin',
    minions: 'cavernsMinions',
    weird: 'cavernsWeird',
    boss: 'cavernsBoss'
  },
  fungal_grottoes: {
    vermin: 'fungalVermin',
    minions: 'fungalMinions',
    weird: 'fungalWeird',
    boss: 'fungalBoss'
  }
};

export const ENVIRONMENT_DRAGONS = {
  dungeon: 'smallDragon',
  caverns: 'caveDragon',
  fungal_grottoes: 'moldDragon'
};

export const normalizeEnvironment = (environment) => {
  if (!environment) return 'dungeon';
  const key = String(environment).toLowerCase();
  if (key === 'cave') return 'caverns';
  if (ENVIRONMENT_LABELS[key]) return key;
  return 'dungeon';
};
