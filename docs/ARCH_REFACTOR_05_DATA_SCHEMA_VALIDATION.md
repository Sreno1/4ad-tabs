# Data Schema and Validation Plan (#5)

## Summary
Normalize data into structured schemas with validation to catch errors early.
This reduces content bugs, makes data changes safer, and enables tooling.

## Reasoning
- Data is spread across JS modules and can contain implicit assumptions.
- Normalized schemas enable tools, migrations, and consistent use across the app.
- Validation surfaces data issues before they impact gameplay.

## Scope and non-goals
- This plan focuses on content data (monsters, equipment, traits, rooms, spells).
- Save data and user state persistence are a related but separate decision.
- Do not change gameplay rules or probabilities as part of this step.

## Plan
1. Inventory data sources and how they are referenced.
   - monsters, equipment, traits, rooms, spells, classes, saves, reactions.
2. Define schemas and stable IDs for each domain.
   - Require `id`, `name`, `type`, and any rule-critical fields.
   - Replace name lookups with id references where possible.
3. Build a normalization loader.
   - Parse JSON, apply defaults, coerce types, validate invariants.
   - Build indexes: byId, byTag, byTier, byClass.
4. Add validation in dev mode.
   - Custom checks or a schema library (lightweight, no runtime cost in prod).
   - Fail fast with clear error messages and data paths.
5. Add versioning and migrations.
   - Include `dataVersion` in each dataset.
   - Provide migration steps for breaking changes.
6. Replace direct imports with loader access.
   - Centralize data access via a single module per domain.
7. Add targeted tests.
   - Schema tests for required fields and reference integrity.

## Schema guidelines
- Keep schema fields explicit and stable, avoid implicit defaults.
- Use ids for cross references (no free-form string matching).
- Keep derived values in code, not stored in raw data files.
- Separate display text from rule data to allow localization later.
- Use enum-like fields for tags and categories to reduce typos.

## Validation approach
- Dev runtime validation:
  - Validate on app startup and fail loudly in dev.
  - Report file path, id, and field to make fixes fast.
- Build-time validation (optional):
  - A small script to validate all data files in CI.
- Recommended checks:
  - Required fields present, correct types, and ids are unique.
  - References point to known ids (traits, equipment, monsters).
  - Numeric ranges are valid (level, hp, count, tier).

## Data loading flow
- Load raw JSON -> parse -> validate -> normalize -> index -> freeze.
- Keep one module per domain to expose safe accessors.

## Storage decision: local storage vs database
This plan is about content data, not user saves. For saves and state, here are options:

### Option A: Static JSON + localStorage (current style)
Pros: simplest, offline, zero infra, quick to iterate.
Cons: size limits (browser), no transactions, no sync.
Use when: single device, small save data, no sharing.

### Option B: Static JSON + IndexedDB for saves
Pros: larger capacity, structured storage, async, transactions.
Cons: more code complexity, async access patterns.
Use when: save data grows, multiple slots, or large logs.

### Option C: Local database (SQLite via WASM)
Pros: powerful querying, strong schema, offline.
Cons: heavier runtime, more tooling, higher complexity.
Use when: complex queries or large local datasets.

### Option D: Remote database with accounts
Pros: multi-device sync, sharing, analytics, backups.
Cons: auth, hosting cost, offline complexity, privacy concerns.
Use when: you want user accounts or cloud sync.

### Recommendation now
Given the current app scope, keep content as static JSON and use localStorage for saves.
Move to IndexedDB when save data or logs exceed localStorage limits.
Adopt a remote database only if you need multi-device sync or shared content.

## Risks and Mitigations
- Risk: data conversion churn. Mitigation: migrate one dataset at a time.
- Risk: validation overhead in prod. Mitigation: run validation only in dev builds.
- Risk: breaking references. Mitigation: add reference integrity checks.

## Acceptance Checklist
- All content data loads through a single validation and normalization path.
- No runtime errors from missing fields or unexpected types.
- Data modules expose stable ids and predictable shapes.
- Storage choice is documented with clear triggers to revisit.
