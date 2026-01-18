const normalizeGrid = (grid) => (Array.isArray(grid) ? grid : []);

const computeStep = (rows, cols, maxVoxels) => {
  if (!rows || !cols) return 1;
  const target = Math.max(1, maxVoxels);
  return Math.max(1, Math.ceil(Math.sqrt((rows * cols) / target)));
};

const buildBlockGrid = (grid, step) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const blockRows = Math.ceil(rows / step);
  const blockCols = Math.ceil(cols / step);
  const blocks = Array.from({ length: blockRows }, () => Array(blockCols).fill(false));

  for (let by = 0; by < blockRows; by += 1) {
    for (let bx = 0; bx < blockCols; bx += 1) {
      let filled = false;
      for (let y = by * step; y < Math.min(rows, (by + 1) * step) && !filled; y += 1) {
        for (let x = bx * step; x < Math.min(cols, (bx + 1) * step); x += 1) {
          if (grid[y]?.[x] === 1) {
            filled = true;
            break;
          }
        }
      }
      blocks[by][bx] = filled;
    }
  }

  return { blocks, blockRows, blockCols };
};

const buildFloor = (grid, voxelSize, meshes, originX, originZ, step) => {
  const descriptors = [];
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  for (let by = 0; by < rows; by += step) {
    for (let bx = 0; bx < cols; bx += step) {
      let filled = false;
      for (let y = by; y < Math.min(rows, by + step) && !filled; y += 1) {
        for (let x = bx; x < Math.min(cols, bx + step); x += 1) {
          if (grid[y]?.[x] === 1) {
            filled = true;
            break;
          }
        }
      }
      if (!filled) continue;
      const centerX = bx + (step - 1) / 2;
      const centerY = by + (step - 1) / 2;
      descriptors.push({
        key: `floor:${bx},${by}`,
        x: originX + centerX * voxelSize,
        y: 0,
        z: originZ + centerY * voxelSize,
        size: voxelSize * step,
        mesh: meshes.floor,
      });
    }
  }
  return descriptors;
};

const buildEdgeSet = (edges, step) => {
  const set = new Set();
  (edges || []).forEach((edge) => {
    if (!edge || typeof edge.x !== 'number' || typeof edge.y !== 'number' || !edge.edge) return;
    const bx = Math.floor(edge.x / step);
    const by = Math.floor(edge.y / step);
    const nx = edge.edge === 'E' ? edge.x + 1 : edge.edge === 'W' ? edge.x - 1 : edge.x;
    const ny = edge.edge === 'S' ? edge.y + 1 : edge.edge === 'N' ? edge.y - 1 : edge.y;
    const nbx = Math.floor(nx / step);
    const nby = Math.floor(ny / step);
    if (bx === nbx && by === nby) return;
    set.add(`${bx},${by},${edge.edge}`);
  });
  return set;
};

const buildWalls = (grid, voxelSize, meshes, originX, originZ, walls, doors, wallHeight, doorHeight, step) => {
  const descriptors = [];
  const { blocks, blockRows, blockCols } = buildBlockGrid(grid, step);
  const wallSet = buildEdgeSet(walls, step);
  const doorSet = buildEdgeSet(doors, step);
  const directions = [
    { edge: 'N', dx: 0, dy: -1, axis: 'z', offset: -0.5 },
    { edge: 'S', dx: 0, dy: 1, axis: 'z', offset: 0.5 },
    { edge: 'W', dx: -1, dy: 0, axis: 'x', offset: -0.5 },
    { edge: 'E', dx: 1, dy: 0, axis: 'x', offset: 0.5 },
  ];

  for (let by = 0; by < blockRows; by += 1) {
    for (let bx = 0; bx < blockCols; bx += 1) {
      if (!blocks[by]?.[bx]) continue;
      const centerX = bx * step + (step - 1) / 2;
      const centerY = by * step + (step - 1) / 2;
      const cellX = originX + centerX * voxelSize;
      const cellZ = originZ + centerY * voxelSize;

      directions.forEach(({ edge, dx, dy, axis, offset }) => {
        const edgeKey = `${bx},${by},${edge}`;
        const isDoor = doorSet.has(edgeKey);
        const isWall = wallSet.has(edgeKey);
        const neighborFilled = blocks[by + dy]?.[bx + dx];
        if (!isDoor && !isWall && neighborFilled) return;

        const wallX = axis === 'x' ? cellX + offset * voxelSize * step : cellX;
        const wallZ = axis === 'z' ? cellZ + offset * voxelSize * step : cellZ;
        const height = isDoor ? doorHeight : wallHeight;
        const mesh = isDoor ? meshes.door : meshes.wall;

        const size = voxelSize * step;
        for (let layer = 1; layer <= height; layer += 1) {
          descriptors.push({
            key: `${isDoor ? 'door' : 'wall'}:${bx},${by},${edge},${layer}`,
            x: wallX,
            y: layer * size,
            z: wallZ,
            size,
            mesh,
          });
        }
      });
    }
  }

  return descriptors;
};

export const buildVoxelDescriptors = ({
  grid,
  doors,
  walls,
  voxelSize,
  meshes,
  partyPos,
  wallHeight,
  doorHeight,
  maxFloorVoxels = 300,
}) => {
  const safeGrid = normalizeGrid(grid);
  if (!meshes || safeGrid.length === 0) {
    return { descriptors: [], lightPosition: null, center: { x: 0, z: 0 }, floorHeight: voxelSize };
  }

  const rows = safeGrid.length;
  const cols = safeGrid[0]?.length || 0;
  const originX = -(cols - 1) * voxelSize / 2;
  const originZ = -(rows - 1) * voxelSize / 2;
  const step = computeStep(rows, cols, maxFloorVoxels);
  const floorHeight = voxelSize * step;
  const resolvedWallHeight = typeof wallHeight === 'number' ? wallHeight : (step > 1 ? 1 : 2);
  const resolvedDoorHeight = typeof doorHeight === 'number' ? doorHeight : 1;

  const descriptors = buildFloor(safeGrid, voxelSize, meshes, originX, originZ, step);
  const wallDescriptors = buildWalls(
    safeGrid,
    voxelSize,
    meshes,
    originX,
    originZ,
    walls,
    doors,
    resolvedWallHeight,
    resolvedDoorHeight,
    step
  );
  descriptors.push(...wallDescriptors);

  let lightPosition = null;
  if (partyPos && typeof partyPos.x === 'number' && typeof partyPos.y === 'number') {
    const partyX = originX + partyPos.x * voxelSize;
    const partyZ = originZ + partyPos.y * voxelSize;
    const floorTop = floorHeight / 2;
    const partyY = floorTop + voxelSize / 2;
    descriptors.push({
      key: 'party',
      x: partyX,
      y: partyY,
      z: partyZ,
      size: voxelSize,
      mesh: meshes.party,
    });
    lightPosition = {
      x: partyX,
      y: floorTop + voxelSize * 3,
      z: partyZ,
    };
  }

  return {
    descriptors,
    lightPosition,
    center: { x: originX + (cols - 1) * voxelSize / 2, z: originZ + (rows - 1) * voxelSize / 2 },
    floorHeight,
  };
};
