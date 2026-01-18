# Game Core Separation Plan (#1)

## Summary
Separate the rules engine from React components so game logic is pure and UI is a thin layer.
This reduces coupling, makes rules testable, and allows multiple views to share one core.

## Reasoning
- The current logic is spread across UI components and action files, which makes it hard to refactor safely.
- Pure rules are easier to test, debug, and extend without touching rendering.
- A core engine enables future views (grid, first person, mobile) to stay consistent.

## Plan
1. Inventory current state shape and action flows used by components.
2. Define a stable GameState and GameAction contract (JSDoc or TS types).
3. Create src/game/ with a pure reducer: applyAction(state, action, ctx) -> { state, events }.
4. Move combat and dungeon rule logic into src/game/rules/ as pure functions.
5. Create an adapter layer that converts events to current dispatch/log/sfx calls.
6. Update components to dispatch GameAction objects instead of calling rules directly.

## Explanation
The core should return a next state plus a list of events. Events include logs, sfx, and UI hints.
UI code consumes events and performs side effects, but rules never touch the DOM or dispatch.
Example flow:
- Input event -> GameAction -> core applyAction -> { state, events }
- UI applies state and executes events (LOG, SFX, TOAST, ANIMATE).

## Risks and Mitigations
- Risk: big-bang change breaks behavior. Mitigation: use a strangle pattern and move one domain at a time.
- Risk: logs or sfx order changes. Mitigation: keep event ordering identical to current dispatch order.

## Acceptance Checklist
- All combat and dungeon outcomes match current behavior.
- UI components no longer contain rule logic beyond input mapping.
- Rules can be tested without React or DOM.
- Event logs and sfx triggers are unchanged.
