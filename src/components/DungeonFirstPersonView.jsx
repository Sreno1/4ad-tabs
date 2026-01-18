import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/firstPersonView.css';
import LanternAnimation from './LanternAnimation.jsx';

const DIRS = [
  { name: 'N', dx: 0, dy: -1, edge: 'N' },
  { name: 'E', dx: 1, dy: 0, edge: 'E' },
  { name: 'S', dx: 0, dy: 1, edge: 'S' },
  { name: 'W', dx: -1, dy: 0, edge: 'W' },
];

const OPPOSITE = { N: 'S', S: 'N', E: 'W', W: 'E' };

const normalizeFacing = (value) => ((value % 4) + 4) % 4;
const easeInOutCubic = (t) => (t < 0.5
  ? 4 * t * t * t
  : 1 - Math.pow(-2 * t + 2, 3) / 2);

const TEXTURE_SOURCES = {
  wall: '/assets/stone_dungeon/stone_wall.png',
  floor: '/assets/stone_dungeon/stone_floor.png',
  ceiling: '/assets/stone_dungeon/stone_ceiling.png',
  door: '/assets/stone_dungeon/stone_door.png',
  lockedDoor: '/assets/stone_dungeon/locked_stone.png',
};

const TILESET_SRC = '/assets/stone_dungeon/tilemap.png';
const TILE_SIZE_X = 160;
const TILE_SIZE_Y = 120;
const TILE_COLS = 4;
const TILE_ROWS = 2;

// Helper: load the tileset image
function useTileset(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const image = new window.Image();
    image.src = src;
    image.onload = () => setImg(image);
    return () => {};
  }, [src]);
  return img;
}

// Helper: draw a tile from the tileset at a given frame rectangle (no skew)
function drawTileRect(ctx, frame, tileIndex, tilesetImg) {
  if (!tilesetImg) return;
  const sx = (tileIndex % TILE_COLS) * TILE_SIZE_X;
  const sy = Math.floor(tileIndex / TILE_COLS) * TILE_SIZE_Y;
  ctx.drawImage(tilesetImg, sx, sy, TILE_SIZE_X, TILE_SIZE_Y, frame.l, frame.t, frame.r - frame.l, frame.b - frame.t);
}

// Helper: draw a half tile from the tileset at a given frame rectangle (no skew)
function drawTileRectHalf(ctx, frame, tileIndex, tilesetImg, side = 'left') {
  if (!tilesetImg) return;
  const sx = (tileIndex % TILE_COLS) * TILE_SIZE_X;
  const sy = Math.floor(tileIndex / TILE_COLS) * TILE_SIZE_Y;
  const halfW = TILE_SIZE_X / 2;
  if (side === 'left') {
    ctx.drawImage(tilesetImg, sx, sy, halfW, TILE_SIZE_Y, frame.l, frame.t, (frame.r - frame.l) / 2, frame.b - frame.t);
  } else {
    ctx.drawImage(tilesetImg, sx + halfW, sy, halfW, TILE_SIZE_Y, frame.l + (frame.r - frame.l) / 2, frame.t, (frame.r - frame.l) / 2, frame.b - frame.t);
  }
}

// Helper: draw a half tile for floor/ceiling/door
function drawTileRectHalfGeneric(ctx, frame, tileIndex, tilesetImg, orientation = 'left') {
  if (!tilesetImg) return;
  const sx = (tileIndex % TILE_COLS) * TILE_SIZE_X;
  const sy = Math.floor(tileIndex / TILE_COLS) * TILE_SIZE_Y;
  const halfW = TILE_SIZE_X / 2;
  if (orientation === 'left' || orientation === 'top') {
    ctx.drawImage(tilesetImg, sx, sy, halfW, TILE_SIZE_Y, frame.l, frame.t, (frame.r - frame.l) / 2, frame.b - frame.t);
  } else {
    ctx.drawImage(tilesetImg, sx + halfW, sy, halfW, TILE_SIZE_Y, frame.l + (frame.r - frame.l) / 2, frame.t, (frame.r - frame.l) / 2, frame.b - frame.t);
  }
}

const WALL_TILE_MAP = {
  close: {
    sides: 4,
    front: 5,
    corridor: 6,
  },
  far: {
    sides: 1,
    front: 2,
    corridor: 3,
  },
};

function getWallTileIndex({ segment, depth, corridorType }) {
  const isNear = depth === 0;
  const map = isNear ? WALL_TILE_MAP.close : WALL_TILE_MAP.far;
  if (segment === 'front') return map.front;
  if (segment === 'corridor') return map.corridor;
  if (segment === 'left' || segment === 'right') {
    if (corridorType === 'narrow') return map.corridor;
    return map.sides;
  }
  return map.front;
}

const FLOOR_TILE_MAP = {
  close: 7,
  far: 0,
};

const CEILING_TILE_MAP = {
  close: 7,
  far: 0,
};

const DOOR_TILE_MAP = {
  close: 5,
  far: 2,
};

function getFloorTileIndex({ depth }) {
  return depth === 0 ? FLOOR_TILE_MAP.close : FLOOR_TILE_MAP.far;
}
function getCeilingTileIndex({ depth }) {
  return depth === 0 ? CEILING_TILE_MAP.close : CEILING_TILE_MAP.far;
}
function getDoorTileIndex({ depth }) {
  return depth === 0 ? DOOR_TILE_MAP.close : DOOR_TILE_MAP.far;
}

const doorColorFor = (door) => {
  if (door && door.locked) return '#8b1e1e';
  const typ = door && (door.doorType || door.type || door.doorType);
  switch (typ) {
    case 'magically_sealed': return '#3b82f6';
    case 'iron': return '#9ca3af';
    case 'illusionary': return '#c4b5fd';
    case 'trapped': return '#6b21a8';
    case 'normal':
    default:
      return '#a36a2b';
  }
};

const isWalkable = (grid, x, y) => {
  if (!grid || y < 0 || x < 0 || y >= grid.length || x >= (grid[0] || []).length) return false;
  const cell = (grid[y] && grid[y][x]) || 0;
  return cell === 1 || cell === 2;
};

export default function DungeonFirstPersonView({
  grid,
  doors = [],
  walls = [],
  partyPos,
  facing = 0,
  onFacingChange,
  onPartyMove,
  className = '',
  active = false,
  hasLightSource = false, // NEW PROP
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const lastMoveRef = useRef(0);
  const texturesRef = useRef({});
  const textureCacheRef = useRef({});
  const [textureTick, setTextureTick] = useState(0);
  const animationRef = useRef({
    active: false,
    start: 0,
    duration: 0,
    fromPos: null,
    toPos: null,
    fromFacing: 0,
    toFacing: 0,
    move: null,
    turnDelta: 0,
  });
  const animationFrameRef = useRef(null);
  const [animationTick, setAnimationTick] = useState(0);
  const prevPosRef = useRef(null);
  const prevFacingRef = useRef(null);
  const offscreenARef = useRef(null);
  const offscreenBRef = useRef(null);
  const [flicker, setFlicker] = useState(1);
  const tilesetImg = useTileset(TILESET_SRC);

  useEffect(() => {
    if (!hasLightSource) return;
    let running = true;
    function animate() {
      setFlicker(0.85 + Math.random() * 0.3);
      if (running) setTimeout(animate, 160 + Math.random() * 120); // slower flicker
    }
    animate();
    return () => { running = false; };
  }, [hasLightSource]);

  const doorMap = useMemo(() => {
    const map = new Map();
    (doors || []).forEach((d) => {
      if (!d || typeof d.x !== 'number' || typeof d.y !== 'number' || !d.edge) return;
      map.set(`${d.x},${d.y},${d.edge}`, d);
    });
    return map;
  }, [doors]);

  const wallSet = useMemo(() => {
    const set = new Set();
    (walls || []).forEach((w) => {
      if (!w || !['N', 'S', 'E', 'W'].includes(w.edge)) return;
      set.add(`${w.x},${w.y},${w.edge}`);
    });
    return set;
  }, [walls]);

  useEffect(() => {
    let cancelled = false;
    Object.entries(TEXTURE_SOURCES).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        if (cancelled) return;
        texturesRef.current[key] = img;
        setTextureTick((tick) => tick + 1);
      };
      img.onerror = () => {
        if (cancelled) return;
        texturesRef.current[key] = null;
        setTextureTick((tick) => tick + 1);
      };
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestRedraw = useCallback(() => {
    if (animationFrameRef.current) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      setAnimationTick((tick) => tick + 1);
    });
  }, []);

  useEffect(() => {
    if (!partyPos) {
      prevPosRef.current = null;
      prevFacingRef.current = facing;
      animationRef.current.active = false;
      return;
    }

    const prevPos = prevPosRef.current;
    const prevFacing = prevFacingRef.current;
    if (!prevPos || typeof prevFacing !== 'number') {
      prevPosRef.current = partyPos;
      prevFacingRef.current = facing;
      return;
    }

    const moved = prevPos.x !== partyPos.x || prevPos.y !== partyPos.y;
    const turned = prevFacing !== facing;
    if (!moved && !turned) {
      return;
    }

    const deltaFacing = turned ? ((facing - prevFacing + 6) % 4) - 2 : 0;
    const duration = Math.max(moved ? 120 : 0, turned ? 100 : 0);
    animationRef.current = {
      active: duration > 0,
      start: performance.now(),
      duration,
      fromPos: prevPos,
      toPos: partyPos,
      fromFacing: prevFacing,
      toFacing: prevFacing + deltaFacing,
      move: moved ? { dx: partyPos.x - prevPos.x, dy: partyPos.y - prevPos.y } : null,
      turnDelta: deltaFacing,
    };
    if (duration > 0) {
      requestRedraw();
    }

    prevPosRef.current = partyPos;
    prevFacingRef.current = facing;
  }, [partyPos, facing, requestRedraw]);

  const getEdgeInfo = useCallback((x, y, edge) => {
    const dir = DIRS.find((d) => d.edge === edge);
    if (!dir) return { blocked: true, door: null, wall: true };
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    const outOfBounds = ny < 0 || nx < 0 || ny >= grid.length || nx >= (grid[0] || []).length;
    if (outOfBounds) return { blocked: true, door: null, wall: true };

    const key = `${x},${y},${edge}`;
    const oppKey = `${nx},${ny},${OPPOSITE[edge]}`;
    if (wallSet.has(key) || wallSet.has(oppKey)) {
      return { blocked: true, door: null, wall: true };
    }
    const door = doorMap.get(key) || doorMap.get(oppKey) || null;
    if (door && (door.locked || door.opened === false)) {
      return { blocked: true, door, wall: false };
    }
    return { blocked: false, door, wall: false };
  }, [doorMap, grid, wallSet]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const next = { width, height, dpr };
    const prev = sizeRef.current;
    if (prev.width === width && prev.height === height && prev.dpr === dpr) return;
    sizeRef.current = next;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, []);

  useEffect(() => {
    resizeCanvas();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = sizeRef.current;
    if (width <= 0 || height <= 0) return;

    const renderScene = (targetCtx, viewPos, viewFacing) => {
      const ctx = targetCtx;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      if (!viewPos) {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 16px "DungeonMode", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Place the party pawn in 2D mode to enter the dungeon.', width / 2, height / 2);
        return;
      }

      const baseLeft = width * 0.08;
      const baseRight = width * 0.92;
      const baseTop = height * 0.08;
      const baseBottom = height * 0.92;
      const step = Math.min(width, height) * 0.07;
      const depthMax = 5;
      const frames = [];
      for (let d = 0; d <= depthMax; d += 1) {
        const inset = step * d;
        frames.push({
          l: baseLeft + inset,
          r: baseRight - inset,
          t: baseTop + inset,
          b: baseBottom - inset,
        });
      }

      const facingIndex = normalizeFacing(viewFacing);
      const viewDir = DIRS[facingIndex];
      const leftDir = DIRS[(facingIndex + 3) % 4];
      const rightDir = DIRS[(facingIndex + 1) % 4];

      let visibleDepth = depthMax;

      for (let d = 0; d < depthMax; d += 1) {
        const cellX = viewPos.x + viewDir.dx * d;
        const cellY = viewPos.y + viewDir.dy * d;
        if (!isWalkable(grid, cellX, cellY)) {
          // Front wall: draw on the current frame, not the next frame
          const frame = frames[d];
          drawTileRect(ctx, frame, getWallTileIndex({ segment: 'front', depth: d }), tilesetImg);
          visibleDepth = d;
          break;
        }

        // Left wall
        const leftEdge = getEdgeInfo(cellX, cellY, leftDir.edge);
        if (leftEdge.blocked) {
          const frame = frames[d];
          const nextFrame = frames[d + 1];
          const corridorType = (leftEdge.blocked && getEdgeInfo(cellX, cellY, rightDir.edge).blocked && isWalkable(grid, cellX + viewDir.dx, cellY + viewDir.dy)) ? 'narrow' : undefined;
          if (corridorType === 'narrow') {
            drawTileRect(ctx, { l: frame.l, t: frame.t, r: nextFrame.l, b: frame.b }, getWallTileIndex({ segment: 'left', depth: d, corridorType }), tilesetImg);
          } else {
            drawTileRectHalf(ctx, { l: frame.l, t: frame.t, r: nextFrame.l, b: frame.b }, getWallTileIndex({ segment: 'left', depth: d, corridorType }), tilesetImg, 'left');
          }
        }

        // Right wall
        const rightEdge = getEdgeInfo(cellX, cellY, rightDir.edge);
        if (rightEdge.blocked) {
          const frame = frames[d];
          const nextFrame = frames[d + 1];
          const corridorType = (rightEdge.blocked && getEdgeInfo(cellX, cellY, leftDir.edge).blocked && isWalkable(grid, cellX + viewDir.dx, cellY + viewDir.dy)) ? 'narrow' : undefined;
          if (corridorType === 'narrow') {
            drawTileRect(ctx, { l: nextFrame.r, t: frame.t, r: frame.r, b: frame.b }, getWallTileIndex({ segment: 'right', depth: d, corridorType }), tilesetImg);
          } else {
            drawTileRectHalf(ctx, { l: nextFrame.r, t: frame.t, r: frame.r, b: frame.b }, getWallTileIndex({ segment: 'right', depth: d, corridorType }), tilesetImg, 'right');
          }
        }
      }

      // Always draw the front wall if the view is open to the max depth
      if (visibleDepth === depthMax) {
        const frame = frames[depthMax];
        drawTileRect(ctx, frame, getWallTileIndex({ segment: 'front', depth: depthMax }), tilesetImg);
      }

      // --- Fill floor and ceiling to canvas edges ---
      // Fill above the topmost corridor frame with ceiling tiles
      if (frames[0].t > 0) {
        drawTileRect(ctx, { l: 0, r: width, t: 0, b: frames[0].t }, getCeilingTileIndex({ depth: 0 }), texturesRef.current.ceiling);
      }
      // Fill below the bottommost corridor frame with floor tiles
      if (frames[0].b < height) {
        drawTileRect(ctx, { l: 0, r: width, t: frames[0].b, b: height }, getFloorTileIndex({ depth: 0 }), texturesRef.current.floor);
      }
      // Floor: fill from bottom of each frame to next (or canvas bottom)
      for (let d = depthMax - 1; d >= 0; d -= 1) {
        const frame = frames[d];
        const nextFrame = frames[d - 1] || { l: 0, r: width, b: height };
        // Floor region: from frame.b to nextFrame.b
        if (frame.b < nextFrame.b) {
          drawTileRect(ctx, { l: 0, r: width, t: frame.b, b: nextFrame.b }, getFloorTileIndex({ depth: d }), texturesRef.current.floor);
        }
      }
      // Ceiling: fill from top of each frame to next (or canvas top)
      for (let d = depthMax - 1; d >= 0; d -= 1) {
        const frame = frames[d];
        const nextFrame = frames[d - 1] || { l: 0, r: width, t: 0 };
        // Ceiling region: from nextFrame.t to frame.t
        if (nextFrame.t < frame.t) {
          drawTileRect(ctx, { l: 0, r: width, t: nextFrame.t, b: frame.t }, getCeilingTileIndex({ depth: d }), texturesRef.current.ceiling);
        }
      }
      // Floor and ceiling rendering (draw for all frames, inside corridor)
      for (let d = depthMax - 1; d >= 0; d -= 1) {
        const frame = frames[d];
        drawTileRect(ctx, frame, getFloorTileIndex({ depth: d }), texturesRef.current.floor);
        drawTileRect(ctx, frame, getCeilingTileIndex({ depth: d }), texturesRef.current.ceiling);
      }

      // Door rendering (if present in front)
      const doorCellX = viewPos.x + viewDir.dx * visibleDepth;
      const doorCellY = viewPos.y + viewDir.dy * visibleDepth;
      const doorFrontEdge = getEdgeInfo(doorCellX, doorCellY, viewDir.edge);
      if (doorFrontEdge.door) {
        const frame = frames[visibleDepth];
        const doorTex = doorFrontEdge.door.locked ? texturesRef.current.lockedDoor : texturesRef.current.door;
        drawTileRectHalfGeneric(ctx, frame, getDoorTileIndex({ depth: visibleDepth, locked: doorFrontEdge.door.locked }), doorTex, 'left');
        drawTileRectHalfGeneric(ctx, frame, getDoorTileIndex({ depth: visibleDepth, locked: doorFrontEdge.door.locked }), doorTex, 'right');
      }
    };

    const getOffscreenContext = (ref) => {
      if (!ref.current) {
        ref.current = document.createElement('canvas');
      }
      const canvas = ref.current;
      const nextWidth = Math.floor(width * dpr);
      const nextHeight = Math.floor(height * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      const offscreenCtx = canvas.getContext('2d');
      if (offscreenCtx) {
        offscreenCtx.imageSmoothingEnabled = false;
      }
      return offscreenCtx;
    };

    const drawCompositeScene = (sourceCanvas, alpha, offsetX, offsetY, scale) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(width / 2, height / 2);
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-width / 2, -height / 2);
      ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);
      ctx.restore();
    };

    const drawOverlay = () => {
      if (!partyPos) return;
      const radius = 4;
      const tiles = radius * 2 + 1;
      const cell = 8;
      const mapW = tiles * cell;
      const mapH = tiles * cell;
      const margin = 12;
      const mapX = width - mapW - margin;
      const mapY = margin;

      ctx.save();
      ctx.fillStyle = 'rgba(3, 7, 18, 0.75)';
      ctx.fillRect(mapX - 6, mapY - 6, mapW + 12, mapH + 12);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mapX - 6, mapY - 6, mapW + 12, mapH + 12);

      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const gx = partyPos.x + dx;
          const gy = partyPos.y + dy;
          const screenX = mapX + (dx + radius) * cell;
          const screenY = mapY + (dy + radius) * cell;
          const walkable = isWalkable(grid, gx, gy);
          ctx.fillStyle = walkable ? '#1f2937' : '#0b0b0b';
          ctx.fillRect(screenX, screenY, cell, cell);

          const key = `${gx},${gy}`;
          if (walkable) {
            ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
            ctx.strokeRect(screenX, screenY, cell, cell);
          }

          if (walkable) {
            const edges = ['N', 'S', 'E', 'W'];
            edges.forEach((edge) => {
              const door = doorMap.get(`${key},${edge}`);
              const wall = wallSet.has(`${key},${edge}`);
              if (!door && !wall) return;
              ctx.strokeStyle = door ? '#fbbf24' : '#475569';
              ctx.lineWidth = door ? 2 : 1;
              if (edge === 'N') {
                ctx.beginPath();
                ctx.moveTo(screenX + 1, screenY + 1);
                ctx.lineTo(screenX + cell - 1, screenY + 1);
                ctx.stroke();
              } else if (edge === 'S') {
                ctx.beginPath();
                ctx.moveTo(screenX + 1, screenY + cell - 1);
                ctx.lineTo(screenX + cell - 1, screenY + cell - 1);
                ctx.stroke();
              } else if (edge === 'E') {
                ctx.beginPath();
                ctx.moveTo(screenX + cell - 1, screenY + 1);
                ctx.lineTo(screenX + cell - 1, screenY + cell - 1);
                ctx.stroke();
              } else if (edge === 'W') {
                ctx.beginPath();
                ctx.moveTo(screenX + 1, screenY + 1);
                ctx.lineTo(screenX + 1, screenY + cell - 1);
                ctx.stroke();
              }
            });
          }
        }
      }

      const centerX = mapX + radius * cell + cell / 2;
      const centerY = mapY + radius * cell + cell / 2;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, cell * 0.35, 0, Math.PI * 2);
      ctx.fill();

      const dir = DIRS[normalizeFacing(facing)];
      const arrowX = centerX + dir.dx * (cell * 0.45);
      const arrowY = centerY + dir.dy * (cell * 0.45);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(arrowX, arrowY);
      ctx.stroke();

      ctx.restore();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px "DungeonMode", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Facing ${DIRS[normalizeFacing(facing)].name}`, width / 2, 8);
    };

    const anim = animationRef.current;
    const hasAnimation = anim.active && anim.fromPos && anim.toPos && anim.duration > 0;

    if (hasAnimation) {
      const raw = Math.min(1, Math.max(0, (performance.now() - anim.start) / anim.duration));
      const t = easeInOutCubic(raw);
      const fromCtx = getOffscreenContext(offscreenARef);
      const toCtx = getOffscreenContext(offscreenBRef);

      if (fromCtx && toCtx) {
        renderScene(fromCtx, anim.fromPos, anim.fromFacing);
        renderScene(toCtx, anim.toPos, anim.toFacing);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, width, height);

        const move = anim.move;
        const zoom = 0.06;
        const moveShift = Math.min(width, height) * 0.08;
        let fromScale = 1;
        let toScale = 1;
        let fromOffsetX = 0;
        let toOffsetX = 0;
        let fromOffsetY = 0;
        let toOffsetY = 0;

        if (move) {
          const facingIndex = normalizeFacing(anim.fromFacing);
          const viewDir = DIRS[facingIndex];
          const leftDir = DIRS[(facingIndex + 3) % 4];
          const dotForward = move.dx * viewDir.dx + move.dy * viewDir.dy;
          const dotLeft = move.dx * leftDir.dx + move.dy * leftDir.dy;

          if (dotForward === 1) {
            fromScale = 1 + zoom * t;
            toScale = 1 - zoom * (1 - t);
          } else if (dotForward === -1) {
            fromScale = 1 - zoom * t;
            toScale = 1 + zoom * (1 - t);
          } else if (dotLeft === 1) {
            fromOffsetX = moveShift * t;
            toOffsetX = -moveShift * (1 - t);
          } else if (dotLeft === -1) {
            fromOffsetX = -moveShift * t;
            toOffsetX = moveShift * (1 - t);
          }
        }

        const turnDir = Math.sign(anim.turnDelta || 0);
        if (turnDir) {
          const turnShift = width * 0.12;
          fromOffsetX += -turnDir * turnShift * t;
          toOffsetX += turnDir * turnShift * (1 - t);
        }

        drawCompositeScene(fromCtx.canvas, 1 - t, fromOffsetX, fromOffsetY, fromScale);
        drawCompositeScene(toCtx.canvas, t, toOffsetX, toOffsetY, toScale);
      } else {
        renderScene(ctx, partyPos, facing);
      }

      if (raw < 1) {
        requestRedraw();
      } else {
        anim.active = false;
      }
    } else {
      renderScene(ctx, partyPos, facing);
    }

    if (canvasRef.current && hasLightSource) {
      const ctx = canvasRef.current.getContext('2d');
      const { width, height } = canvasRef.current;
      ctx.save();
      const glowRadius = Math.floor(Math.min(width, height) * 0.45 * flicker);
      // Move the glow to match the lantern's new position (60% from left)
      const glowX = width * 0.6;
      const glowY = height - Math.floor(height * 0.18);
      const gradient = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
      gradient.addColorStop(0, 'rgba(255, 220, 120, 0.28)');
      gradient.addColorStop(0.4, 'rgba(255, 200, 80, 0.12)');
      gradient.addColorStop(1, 'rgba(255, 200, 80, 0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    drawOverlay();
  }, [grid, partyPos, facing, getEdgeInfo, doorMap, wallSet, textureTick, animationTick, requestRedraw, hasLightSource, flicker, tilesetImg]);

  useEffect(() => {
    if (!active) return undefined;
    const handleKeyDown = (e) => {
      if (!partyPos) return;
      const now = Date.now();
      const moveCooldown = 120;
      const useCooldown = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', 'q', 'Q', 'e', 'E'].includes(e.key);
      if (useCooldown && now - lastMoveRef.current < moveCooldown) return;

      const dir = DIRS[facing % 4];
      const left = DIRS[(facing + 3) % 4];
      const right = DIRS[(facing + 1) % 4];
      let moved = false;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const nx = partyPos.x + dir.dx;
        const ny = partyPos.y + dir.dy;
        const edge = getEdgeInfo(partyPos.x, partyPos.y, dir.edge);
        if (!edge.blocked && isWalkable(grid, nx, ny)) {
          onPartyMove && onPartyMove(nx, ny);
          moved = true;
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        const nx = partyPos.x - dir.dx;
        const ny = partyPos.y - dir.dy;
        const backEdge = getEdgeInfo(nx, ny, dir.edge);
        if (!backEdge.blocked && isWalkable(grid, nx, ny)) {
          onPartyMove && onPartyMove(nx, ny);
          moved = true;
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        const nx = partyPos.x + left.dx;
        const ny = partyPos.y + left.dy;
        const edge = getEdgeInfo(partyPos.x, partyPos.y, left.edge);
        if (!edge.blocked && isWalkable(grid, nx, ny)) {
          onPartyMove && onPartyMove(nx, ny);
          moved = true;
        }
      } else if (e.key === 'e' || e.key === 'E') {
        const nx = partyPos.x + right.dx;
        const ny = partyPos.y + right.dy;
        const edge = getEdgeInfo(partyPos.x, partyPos.y, right.edge);
        if (!edge.blocked && isWalkable(grid, nx, ny)) {
          onPartyMove && onPartyMove(nx, ny);
          moved = true;
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        onFacingChange && onFacingChange((facing + 3) % 4);
        moved = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        onFacingChange && onFacingChange((facing + 1) % 4);
        moved = true;
      }

      if (moved) {
        e.preventDefault();
        lastMoveRef.current = now;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, facing, getEdgeInfo, grid, onFacingChange, onPartyMove, partyPos]);

  return (
    <div ref={containerRef} className={`dungeon-first-person-view ${className}`.trim()}>
      <canvas ref={canvasRef} />
      {/* Lantern overlay at bottom center if light source */}
      {hasLightSource && (
        <div style={{
          position: 'absolute',
          left: '60%', // moved from 50% to 60% to shift right
          bottom: 0,
          transform: 'translateX(-50%) translateY(30%)', // keep vertical offset
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <LanternAnimation size={80} />
        </div>
      )}
      <div className="dungeon-first-person-hud">
        <div className="hud-title">First Person Mode</div>
        <div className="hud-keys">W/S: forward/back - A/D: turn - Q/E: strafe</div>
      </div>
    </div>
  );
}
