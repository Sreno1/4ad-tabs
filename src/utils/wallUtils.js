import { getEdgeCoverage } from './tileStyles.js';

const EDGE_OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

function collectRoomRegion(grid, sx, sy) {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const region = new Set();
  if (!(sy >= 0 && sy < rows && sx >= 0 && sx < cols)) return region;
  if (grid[sy][sx] !== 1) return region;
  const toVisit = [{ x: sx, y: sy }];
  const key = (x, y) => `${x},${y}`;
  while (toVisit.length) {
    const c = toVisit.pop();
    const k = key(c.x, c.y);
    if (region.has(k)) continue;
    if (!(c.y >= 0 && c.y < rows && c.x >= 0 && c.x < cols)) continue;
    if (grid[c.y][c.x] !== 1) continue;
    region.add(k);
    toVisit.push({ x: c.x + 1, y: c.y });
    toVisit.push({ x: c.x - 1, y: c.y });
    toVisit.push({ x: c.x, y: c.y + 1 });
    toVisit.push({ x: c.x, y: c.y - 1 });
  }
  return region;
}

function edgeCoverage(grid, cellStyles, x, y, edge) {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  if (!(y >= 0 && y < rows && x >= 0 && x < cols)) return [0, 0];
  const key = `${x},${y}`;
  let style = cellStyles[key];
  if (!style) style = (grid[y] && grid[y][x]) === 1 ? 'full' : null;
  return getEdgeCoverage(style, edge);
}

function hasCoverage(cov) {
  return cov[1] > cov[0];
}

function isCoveredBy(covA, covB) {
  if (!hasCoverage(covA)) return true;
  if (!hasCoverage(covB)) return false;
  return covA[0] >= covB[0] && covA[1] <= covB[1];
}

function addShapeWalls(region, cellStyles, perimeter) {
  region.forEach(k => {
    const [rx, ry] = k.split(',').map(Number);
    const style = cellStyles[`${rx},${ry}`];
    if (!style) return;
    if (style.startsWith('diag') || style.startsWith('round')) {
      if (!perimeter.some(pe => pe.x === rx && pe.y === ry && pe.edge === style)) {
        perimeter.push({ x: rx, y: ry, edge: style });
      }
    }
  });
}

export function buildWallOffPerimeter(grid, cellStyles, sx, sy, { allowFallback = false } = {}) {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const region = collectRoomRegion(grid, sx, sy);
  const perimeter = [];

  region.forEach(k => {
    const [rx, ry] = k.split(',').map(Number);
    const neighbors = [
      { edge: 'N', nx: rx, ny: ry - 1 },
      { edge: 'S', nx: rx, ny: ry + 1 },
      { edge: 'E', nx: rx + 1, ny: ry },
      { edge: 'W', nx: rx - 1, ny: ry },
    ];
    neighbors.forEach(n => {
      const covA = edgeCoverage(grid, cellStyles, rx, ry, n.edge);
      if (!hasCoverage(covA)) return;
      if (!(n.ny >= 0 && n.ny < rows && n.nx >= 0 && n.nx < cols) || grid[n.ny][n.nx] !== 1) {
        perimeter.push({ x: rx, y: ry, edge: n.edge });
        return;
      }
      const covB = edgeCoverage(grid, cellStyles, n.nx, n.ny, EDGE_OPPOSITE[n.edge]);
      if (!isCoveredBy(covA, covB)) perimeter.push({ x: rx, y: ry, edge: n.edge });
    });
  });

  if (allowFallback && perimeter.length === 0) {
    region.forEach(k2 => {
      const [rx2, ry2] = k2.split(',').map(Number);
      const neighbors2 = [
        { edge: 'N', nx: rx2, ny: ry2 - 1 },
        { edge: 'S', nx: rx2, ny: ry2 + 1 },
        { edge: 'E', nx: rx2 + 1, ny: ry2 },
        { edge: 'W', nx: rx2 - 1, ny: ry2 },
      ];
      neighbors2.forEach(n2 => {
        const covA = edgeCoverage(grid, cellStyles, rx2, ry2, n2.edge);
        if (!hasCoverage(covA)) return;
        if (!(n2.ny >= 0 && n2.ny < rows && n2.nx >= 0 && n2.nx < cols) || grid[n2.ny][n2.nx] !== 1) {
          perimeter.push({ x: rx2, y: ry2, edge: n2.edge });
        }
      });
    });
  }

  addShapeWalls(region, cellStyles, perimeter);
  return { region, perimeter };
}

export function buildWallOffPerimeters(grid, cellStyles, { allowFallback = false } = {}) {
  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const visited = new Set();
  const merged = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y]?.[x] !== 1) continue;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      const { region, perimeter } = buildWallOffPerimeter(grid, cellStyles, x, y, { allowFallback });
      region.forEach(k => visited.add(k));
      perimeter.forEach(pe => {
        if (!merged.some(m => m.x === pe.x && m.y === pe.y && m.edge === pe.edge)) {
          merged.push(pe);
        }
      });
    }
  }
  return merged;
}

export default {
  buildWallOffPerimeter,
  buildWallOffPerimeters,
};
