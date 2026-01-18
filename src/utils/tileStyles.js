// Shared tile-style utilities: style order, cycling, and edge-coverage helpers
export const STYLE_ORDER = ['full', 'diag1', 'diag2', 'diag3', 'diag4', 'round1', 'round2', 'round3', 'round4'];

export function nextStyle(current) {
  const idx = Math.max(0, STYLE_ORDER.indexOf(current));
  return STYLE_ORDER[(idx + 1) % STYLE_ORDER.length];
}

// Returns boolean whether a given style visually covers the specified edge
export function cellHasEdgeFromStyle(style, edge) {
  if (!style) return false;
  switch (style) {
    case 'full': return true;
    case 'diag1': return edge === 'N' || edge === 'W';
    case 'diag2': return edge === 'S' || edge === 'E';
    case 'diag3': return edge === 'N' || edge === 'E';
    case 'diag4': return edge === 'S' || edge === 'W';
    case 'round1': return edge === 'N' || edge === 'W';
    case 'round2': return edge === 'S' || edge === 'E';
    case 'round3': return edge === 'N' || edge === 'E';
    case 'round4': return edge === 'S' || edge === 'W';
    default: return false;
  }
}

// Returns normalized coverage [start, end] along an edge (0..1)
export function getEdgeCoverage(style, edge) {
  if (!style) return [0, 0];
  switch (style) {
    case 'full':
      return [0, 1];
    case 'diag1': // top-left triangle (N + W)
      if (edge === 'N' || edge === 'W') return [0, 1];
      return [0, 0];
    case 'diag2': // bottom-right triangle (S + E)
      if (edge === 'S' || edge === 'E') return [0, 1];
      return [0, 0];
    case 'diag3': // top-right (N + E)
      if (edge === 'N' || edge === 'E') return [0, 1];
      return [0, 0];
    case 'diag4': // bottom-left (S + W)
      if (edge === 'S' || edge === 'W') return [0, 1];
      return [0, 0];
    case 'round1': // top-left quarter-circle
      if (edge === 'N' || edge === 'W') return [0, 1];
      return [0, 0];
    case 'round2': // bottom-right
      if (edge === 'S' || edge === 'E') return [0, 1];
      return [0, 0];
    case 'round3': // top-right
      if (edge === 'N' || edge === 'E') return [0, 1];
      return [0, 0];
    case 'round4': // bottom-left
      if (edge === 'S' || edge === 'W') return [0, 1];
      return [0, 0];
    default:
      return [0, 0];
  }
}

export default {
  STYLE_ORDER,
  nextStyle,
  cellHasEdgeFromStyle,
  getEdgeCoverage,
};
