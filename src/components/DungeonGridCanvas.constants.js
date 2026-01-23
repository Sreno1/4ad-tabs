/**
 * DungeonGridCanvas Constants
 *
 * Centralized color definitions, size calculations, and style mappings
 * for the dungeon grid canvas rendering.
 */

// =============================================================================
// COLOR CONSTANTS
// =============================================================================

export const COLORS = {
  // Background colors
  background: {
    light: '#f8fafc',      // slate-50 - for dots/fill markers
    dark: '#1f1f1f',       // dark gray - unused cell texture
    black: '#000000',      // pure black - cell base
  },

  // Cell colors
  cell: {
    empty: '#334155',      // slate-700 - empty cell border
    room: '#000000',       // black - room fill
    corridor: '#1d4ed8',   // blue-700 - corridor fill
    hover: '#38bdf8',      // sky-400 - hovered cell fill
    selected: '#34d399',   // green-400 - selected tile border
  },

  // Hover overlay
  hover: {
    fill: 'rgba(245, 158, 11, 1)',    // amber-400
    fillAlpha: 0.25,
    stroke: 'rgba(245, 158, 11, 0.16)', // amber-400 semi-transparent
  },

  // Door colors by state/type
  door: {
    open: '#10b981',         // green - opened
    locked: '#ef4444',       // red - locked
    magicallySealead: '#3b82f6', // blue - magically sealed
    iron: '#9ca3af',         // gray - iron door
    illusionary: '#c4b5fd',  // light purple - illusionary
    trapped: '#6b21a8',      // deep purple - trapped
    normal: '#f59e0b',       // amber - normal/default
    hoverGlow: 'rgba(251, 191, 36, 0.15)', // amber glow on hover
    hoverStroke: '#fbbf24',  // amber-400 - hovered door stroke
    normalStroke: '#94a3b8', // slate-400 - normal door stroke
  },

  // Wall colors by source
  wall: {
    room: '#B45309',         // amber-brown - room walls
    corridor: '#1D4ED8',     // blue - corridor walls
    default: '#ffffff',      // white - fallback
  },

  // Template preview colors
  template: {
    room: 'rgba(180, 83, 9, 0.6)',      // semi-transparent amber
    corridor: 'rgba(29, 78, 216, 0.6)', // semi-transparent blue
    outline: 'rgba(255, 255, 255, 0.06)', // faint white outline
    openEdge: 'rgba(110, 231, 183, 0.6)', // mint green - open edges
    innerEdge: 'rgba(110, 231, 183, 0.95)', // strong mint - inner edges
  },

  // Rectangle preview (drag fill)
  rectangle: {
    empty: 'rgba(100, 116, 139, 0.4)',  // slate - empty fill
    room: 'rgba(180, 83, 9, 0.5)',      // amber - room fill
    corridor: 'rgba(29, 78, 216, 0.5)', // blue - corridor fill
    border: '#fbbf24',                   // amber - border
  },

  // Marker colors
  marker: {
    ring: 'rgba(34, 197, 94, 0.98)',   // lime-500 - marker rings
    text: '#ffffff',                    // white - marker text
  },

  // Light/pawn colors
  light: {
    glow: 'rgba(253, 224, 71, 0.4)',   // yellow glow
    pawnFill: '#fde047',               // yellow-300 - pawn fill
    pawnStroke: '#ca8a04',             // yellow-600 - pawn stroke
  },
};

// =============================================================================
// SIZE CALCULATIONS
// =============================================================================

/**
 * Calculate door dimensions based on cell size
 */
export function getDoorMetrics(cellSize) {
  const thickness = Math.max(2, Math.floor(cellSize * 0.15)) + 1;
  const length = Math.max(2, Math.floor(cellSize * 0.66));
  const offset = Math.floor((cellSize - length) / 2);
  return { thickness, length, offset };
}

/**
 * Calculate wall thickness based on cell size
 */
export function getWallThickness(cellSize) {
  return Math.max(1, Math.floor(cellSize * 0.08));
}

/**
 * Calculate marker ring size
 */
export function getMarkerRingSize(cellSize) {
  return Math.max(4, Math.floor(cellSize * 0.35));
}

/**
 * Calculate glyph sizes for rendering
 */
export function getGlyphSizes(cellSize) {
  return {
    dot: Math.max(8, cellSize * 0.3),      // fill dot glyph
    empty: Math.max(8, cellSize * 0.8),    // empty cell texture glyph
    marker: Math.max(8, cellSize * 0.6),   // marker text
  };
}

/**
 * Calculate edge detection threshold for door placement
 */
export function getEdgeThreshold(cellSize) {
  return cellSize * 0.2;
}

/**
 * Calculate stroke widths based on cell size
 */
export function getStrokeWidths(cellSize) {
  return {
    cellBorder: 1,
    selectedBorder: 2,
    hoverBorder: Math.max(1, Math.floor(cellSize * 0.06)),
    doorGuide: Math.max(1, Math.floor(cellSize * 0.03)) + 1,
    templateOutline: Math.max(1, Math.floor(cellSize * 0.06)),
  };
}

// =============================================================================
// DOOR COLOR HELPER
// =============================================================================

/**
 * Get door color based on door state and type
 */
export function getDoorColor(door) {
  try {
    if (door?.opened) return COLORS.door.open;
    if (door?.locked) return COLORS.door.locked;

    const doorType = door?.doorType || door?.type;
    switch (doorType) {
      case 'magically_sealed': return COLORS.door.magicallySealead;
      case 'iron': return COLORS.door.iron;
      case 'illusionary': return COLORS.door.illusionary;
      case 'trapped': return COLORS.door.trapped;
      case 'normal':
      default:
        return COLORS.door.normal;
    }
  } catch (e) {
    return COLORS.door.normal;
  }
}

/**
 * Get wall color based on source tag or cell type
 */
export function getWallColor(wall, grid) {
  try {
    // Check source tag first (from room designer)
    if (wall.srcTag && typeof wall.srcTag === 'string') {
      const tag = wall.srcTag.toLowerCase();
      if (tag === 'room') return COLORS.wall.room;
      if (tag === 'corridor') return COLORS.wall.corridor;
    }

    // Fall back to cell value lookup
    const originVal = grid[wall.y]?.[wall.x] || 0;
    let lookup = originVal;

    // If origin is empty and edge is cardinal, check neighbor
    const isCardinal = ['N', 'S', 'E', 'W'].includes(wall.edge);
    if (!lookup && isCardinal) {
      if (wall.edge === 'N') lookup = grid[wall.y - 1]?.[wall.x] || 0;
      else if (wall.edge === 'S') lookup = grid[wall.y + 1]?.[wall.x] || 0;
      else if (wall.edge === 'E') lookup = grid[wall.y]?.[wall.x + 1] || 0;
      else if (wall.edge === 'W') lookup = grid[wall.y]?.[wall.x - 1] || 0;
    }

    if (lookup === 1) return COLORS.wall.room;
    if (lookup === 2) return COLORS.wall.corridor;

    return COLORS.wall.default;
  } catch (e) {
    return COLORS.wall.default;
  }
}

/**
 * Get template fill color based on cell type
 */
export function getTemplateFillColor(cellValue) {
  if (cellValue === 1) return COLORS.template.room;
  if (cellValue === 2) return COLORS.template.corridor;
  return null;
}

/**
 * Get rectangle preview fill color based on fill value
 */
export function getRectangleFillColor(value) {
  if (value === 0) return COLORS.rectangle.empty;
  if (value === 1) return COLORS.rectangle.room;
  if (value === 2) return COLORS.rectangle.corridor;
  return COLORS.rectangle.empty;
}

// =============================================================================
// EDGE MAPPINGS (for template rotation)
// =============================================================================

/**
 * Clockwise rotation mapping for edges
 * N -> E -> S -> W -> N
 */
export const EDGE_ROTATE_CW = {
  'N': 'E',
  'E': 'S',
  'S': 'W',
  'W': 'N',
};

/**
 * Counter-clockwise rotation mapping for edges
 */
export const EDGE_ROTATE_CCW = {
  'N': 'W',
  'W': 'S',
  'S': 'E',
  'E': 'N',
};

/**
 * Diagonal edge clockwise rotation mapping
 * From the actual code: diag1->diag3->diag2->diag4->diag1
 */
export const DIAG_ROTATE_CW = {
  'diag1': 'diag3',
  'diag3': 'diag2',
  'diag2': 'diag4',
  'diag4': 'diag1',
};

/**
 * Rounded corner clockwise rotation mapping
 * From the actual code: round1->round3->round2->round4->round1
 */
export const ROUND_ROTATE_CW = {
  'round1': 'round3',
  'round3': 'round2',
  'round2': 'round4',
  'round4': 'round1',
};

/**
 * Horizontal mirror mapping for edges
 */
export const EDGE_MIRROR_H = {
  'E': 'W',
  'W': 'E',
  'N': 'N',
  'S': 'S',
};

/**
 * Horizontal mirror mapping for diagonals
 */
export const DIAG_MIRROR_H = {
  'diag1': 'diag3',
  'diag2': 'diag4',
  'diag3': 'diag1',
  'diag4': 'diag2',
};

/**
 * Horizontal mirror mapping for rounded corners
 */
export const ROUND_MIRROR_H = {
  'round1': 'round3',
  'round2': 'round4',
  'round3': 'round1',
  'round4': 'round2',
};

// =============================================================================
// ZOOM/PAN CONSTANTS
// =============================================================================

export const ZOOM = {
  min: 0.5,
  max: 3.0,
  sensitivity: 0.0015,
  default: 1,
};

export const PAN = {
  default: { x: 0, y: 0 },
};

// =============================================================================
// GLYPHS
// =============================================================================

export const GLYPHS = {
  dot: '\u2219',           // bullet dot for filled cells
  texture: '\u2592',       // medium shade for empty cells
};
