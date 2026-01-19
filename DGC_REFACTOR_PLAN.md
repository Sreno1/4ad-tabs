# DungeonGridCanvas refactor plan

## Goals
- Reduce file size and cognitive load while keeping behavior identical.
- Separate rendering, input handling, and state management concerns.
- Make rotation, pan/zoom, and template placement logic easier to test.
- Preserve 60 FPS rendering and current interaction feel.

## Guardrails
- No behavior changes: keep keyboard, mouse, and touch interactions identical.
- Preserve performance and avoid extra renders in hot paths.
- Keep public props and callbacks stable unless a follow-up change is planned.

## Current pain points (from the file)
- Single 2k+ line component with mixed concerns (rendering + input + game logic).
- Repeated coordinate transforms (rotation, pan/zoom) scattered across handlers.
- Large draw loop mixing styling, markers, doors, walls, and hover states.
- Interleaved refs, state, and effects complicate reasoning about lifecycle.

## Proposed decomposition
- **Rendering helpers (pure functions)**
  - `drawCells`, `drawMarkers`, `drawDoors`, `drawWalls`, `drawOverlays`.
  - Shared helpers for colors, sizes, and glyph drawing.
- **Geometry/transform utilities**
  - `toLogicalPoint`, `toScreenPoint`, `applyRotationDelta`.
  - Centralize rotate/scale/pan math used by both draw and input.
- **Custom hooks**
  - `useCanvasSizing` (cols/rows/dimensions, rotation mapping).
  - `usePanZoom` (scale/pan state + wheel handling).
  - `useDragFill` (drag state, rectangle preview, fill logic).
  - `useTemplateTransform` (rotate/mirror template operations).
  - `useKeyboardMovement` (arrow key movement + loop).
  - `usePointerOverscrollLock` (pointer enter/leave behavior).
- **Constants module**
  - colors, glyph sizes, door thickness, and style mappings.

## Step-by-step refactor plan
1. **Extract constants + small pure helpers**
   - Move colors, glyph size helpers, `doorColorFor`, and style maps into `DungeonGridCanvas.constants.js`.
   - Move rotation mapping (`edgeMap`) and template transform helpers to `DungeonGridCanvas.template.js`.
2. **Introduce geometry utilities**
   - Create `DungeonGridCanvas.geometry.js` with `logicalToScreen`, `screenToLogical`, `applyRotationDelta`.
   - Replace ad-hoc math in draw and handlers with these helpers.
3. **Split rendering into pure functions**
   - `DungeonGridCanvas.draw.js` exposes `drawGrid` which calls smaller draw functions.
   - Pass a compact `drawContext` object (ctx, sizes, flags, data) to keep signatures manageable.
4. **Extract input and interaction hooks**
   - `useDragFill`, `usePanZoom`, `useKeyboardMovement`, `useTooltip`, `usePointerOverscrollLock`.
   - Each hook returns handlers or state, then compose in the component.
5. **Simplify the main component**
   - `DungeonGridCanvas.jsx` becomes a coordinator: state + hook wiring + rendering.
   - Keep refs close to the hooks that own them.
6. **Add lightweight verification**
   - Manual checklist: hover, drag fill, rect fill, markers, doors/walls, rotation, pan/zoom, template placement, pawn movement.
   - Optional: add a small unit test for geometry transforms if the repo has a test setup.

## Suggested file layout
- `4ad-tabs/src/components/DungeonGridCanvas.jsx`
- `4ad-tabs/src/components/DungeonGridCanvas.constants.js`
- `4ad-tabs/src/components/DungeonGridCanvas.draw.js`
- `4ad-tabs/src/components/DungeonGridCanvas.geometry.js`
- `4ad-tabs/src/components/DungeonGridCanvas.template.js`
- `4ad-tabs/src/components/hooks/usePanZoom.js`
- `4ad-tabs/src/components/hooks/useDragFill.js`
- `4ad-tabs/src/components/hooks/useKeyboardMovement.js`
- `4ad-tabs/src/components/hooks/useTooltip.js`
- `4ad-tabs/src/components/hooks/usePointerOverscrollLock.js`

## Acceptance checklist
- Canvas renders correctly with and without rotation.
- Hover tooltip positions are correct in both orientations.
- Drag fill, rectangle fill, and right-click actions still work.
- Doors/walls/markers render identically (colors, sizes, layering).
- Pawn movement and placement behavior unchanged.
- No new re-render loops or frame drops.
