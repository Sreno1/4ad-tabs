# Input to Action Mapping Plan (#4)

## Summary
Create a centralized input layer that maps keyboard, mouse, and touch to GameAction objects.
This keeps components focused on rendering and avoids duplicated input logic.

## Reasoning
- Input handling is large and scattered across components, which makes behavior drift likely.
- Central mapping makes it easy to change keybinds and resolve conflicts.
- Shared input logic ensures grid and first person views behave consistently.

## Plan
1. Define a clear GameAction enum or union for all game actions.
2. Create src/input/ with an input map that translates DOM events to GameAction.
3. Build a useInputController hook to manage pointer state, drag, and hover.
4. Add mode awareness (placement, edit, normal) and priority rules.
5. Replace component-specific handlers with a small adapter that feeds actions to core.

## Explanation
Instead of writing custom handlers per component, input flows through one place:
- DOM event -> input map -> GameAction -> core -> state and events.
This makes it easy to add new actions (for example, alternate keybinds) without touching all views.

## Risks and Mitigations
- Risk: behavior changes from mapping order. Mitigation: add mode tests and keep mapping rules explicit.
- Risk: too many actions at once. Mitigation: keep actions small and compose in the core.

## Acceptance Checklist
- Keybinds, mouse actions, and gestures match current behavior.
- Input conflicts are resolved by explicit priority rules.
- Components only handle rendering and high level state wiring.
