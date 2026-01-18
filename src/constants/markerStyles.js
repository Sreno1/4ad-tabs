const MARKER_STYLES = {
  monster: {
    color: '#f87171', // red-400
    char: '\u2687', // Monster: ⚇
  },
  boss: {
    color: '#fbbf24', // yellow-400
    char: '\u22D2', // Boss: ⋒
  },
  treasure: {
    color: '#facc15', // amber-400
    char: '$',
  },
  trap: {
    color: '#f59e42', // orange-400
    image: '/assets/trap.png', // Trap: use image
  },
  special: {
    color: '#38bdf8', // sky-400
    char: '\u203D', // Special: ‽
  },
  cleared: { char: '⊙', color: '#22c55e' },
  entrance: { char: '⌂', color: '#06b6d4' },
  exit: { char: '⛨', color: '#10b981' },
  clear: { char: '✖', color: '#ef4444' },
  note: {
    color: '#a3e635', // lime-400
    char: '✎',
  },
};

export default MARKER_STYLES;
