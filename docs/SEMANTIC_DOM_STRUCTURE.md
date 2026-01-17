# Semantic DOM Structure - Four Against Darkness

**Date:** 2026-01-16
**Status:** In Progress (Phase 8 ✓ Complete)
**Priority:** Medium (UI Organization)
**Effort:** 16-23 hours across 9 phases
**Progress:** 8/9 phases complete (89% overall)

---

## 📌 Overview

Add descriptive, hierarchical IDs and classes to all meaningful DOM elements to create a self-documenting structure. This enables:
- Easy reference when communicating about UI changes ("edit the `party_cards`")
- AI-friendly targeting for element selection and modification
- Consistent semantic structure across all components
- Better developer experience when debugging/extending

**Example Usage:**
Instead of: "Fix the styling of the fourth card in the hero list with the HP controls"
Say: "Fix `#party_card_3_hp_controls`"

---

## 🎯 Core Philosophy

Every meaningful DOM element should have a human-readable identifier that clearly states:
1. **What it is** (party_card, dungeon_grid, combat_log)
2. **Where it belongs** (within party_cards, inside combat_section)
3. **Its relationship** to other elements (hierarchical)

---

## 📐 Naming Convention

### Pattern
```
<section>_<component>_<sub_element>
```

### Rules

| Element Type | Pattern | Example |
|---|---|---|
| **Major Sections** | `id="<name>_section"` | `id="party_section"` |
| **Containers** | `id="<name>s"` (pluralized) | `id="party_cards"` |
| **Individual Items** | `class="<singular_name>"` | `class="party_card"` |
| **Item Instances** | `id="<item>_N"` (N = index) | `id="party_card_0"` |
| **Sub-sections** | `id="<item>_N_<section>"` | `id="party_card_0_stats"` |
| **Buttons/Actions** | `id="<context>_<action>_button"` | `id="party_card_0_hp_increase_button"` |
| **Modals** | `id="<name>_modal"` | `id="equipment_modal"` |
| **Modal Sections** | `id="<modal>_<section>"` | `id="equipment_modal_header"` |
| **Grid Cells** | `id="grid_cell_Y_X"` | `id="grid_cell_5_3"` |
| **Navigation** | `id="nav_<name>_tab"` | `id="nav_party_tab"` |
| **Form Fields** | `id="<form>_<field>_field"` | `id="settings_theme_field"` |

### Key Rules
- Use **underscores** to separate words (machine-readable, easy to scan)
- Use **zero-based indexing** for items (0, 1, 2, not 1, 2, 3)
- Use **Y_X for grid coordinates** (row, column pattern)
- Container IDs are **plural** (`party_cards`, `modals_container`)
- Individual items use **singular class name** (`class="party_card"`)
- Item instances get **numeric ID suffix** (`id="party_card_0"`)

---

## 🏗️ Semantic DOM Map

### Root Structure
```
#app_root
├── #app_header
│   └── #app_header_content
├── #app_nav
├── #main_content
│   ├── #party_section
│   ├── #dungeon_section
│   ├── #combat_section
│   ├── #log_section
│   └── #dice_section
└── #modals_container
```

### Party Section
```
#party_section
├── #party_header
│   └── #party_header_title
├── #party_controls
│   ├── #party_add_hero_button
│   └── #party_gold_display
├── #party_cards
│   ├── .party_card (for each hero)
│   │   ├── id="party_card_N"
│   │   ├── #party_card_N_header
│   │   │   ├── #party_card_N_name
│   │   │   ├── #party_card_N_class
│   │   │   └── #party_card_N_level
│   │   ├── #party_card_N_hp_section
│   │   │   ├── #party_card_N_hp_display
│   │   │   ├── #party_card_N_hp_decrease_button
│   │   │   └── #party_card_N_hp_increase_button
│   │   ├── #party_card_N_abilities
│   │   │   └── .party_card_ability (for each ability)
│   │   │       ├── id="party_card_N_ability_<ability_name>"
│   │   │       ├── #party_card_N_ability_<ability_name>_button
│   │   │       └── #party_card_N_ability_<ability_name>_status
│   │   └── #party_card_N_actions
│   │       ├── #party_card_N_delete_button
│   │       └── #party_card_N_level_controls
```

### Dungeon Section
```
#dungeon_section
├── #dungeon_header
├── #dungeon_grid (container)
│   └── .grid_cell (for each cell)
│       ├── id="grid_cell_Y_X"
│       ├── class="grid_cell grid_cell_<content_type>"
│       └── #grid_cell_Y_X_content
├── #dungeon_legend
├── #dungeon_light_display
└── #dungeon_controls
    ├── #dungeon_light_toggle_button
    ├── #dungeon_map_toggle_button
    └── #dungeon_environment_display
```

### Combat Section
```
#combat_section
├── #combat_header
├── #monster_group
│   ├── #monster_group_title
│   └── #monster_cards (container)
│       └── .monster_card (for each monster)
│           ├── id="monster_N"
│           ├── #monster_N_name
│           ├── #monster_N_hp_display
│           ├── #monster_N_hp_decrease_button
│           ├── #monster_N_hp_increase_button
│           └── #monster_N_controls
├── #combat_phase
│   ├── #combat_phase_display
│   └── #combat_phase_description
├── #combat_actions (container)
│   └── .combat_action_button (for each hero)
│       ├── id="combat_action_N_button"
│       └── class="combat_action_button"
└── #combat_results
    └── .combat_result_entry (for each result)
        ├── id="combat_result_N"
        └── class="combat_result_entry"
```

### Log Section
```
#adventure_log
├── #log_header
│   ├── #log_title
│   └── #log_filter_controls
│       └── #log_filter_select
├── #log_entries (container)
│   └── .log_entry (for each entry)
│       ├── id="log_entry_N"
│       ├── class="log_entry log_entry_<type>"
│       └── #log_entry_N_content
└── #log_footer
    ├── #log_archive_button
    └── #log_clear_button
```

### Dice Section
```
#dice_section
├── #dice_header
├── #dice_roller
│   ├── #dice_display
│   │   └── #dice_result
│   ├── #dice_controls
│   │   ├── #dice_roll_button
│   │   └── #dice_clear_button
│   └── #dice_history (optional)
```

### Navigation
```
#app_nav (or #mobile_nav)
├── #nav_party_tab
├── #nav_dungeon_tab
├── #nav_combat_tab
├── #nav_log_tab
└── #nav_more_tab
```

### Modals Container
```
#modals_container
├── #equipment_modal
├── #abilities_modal
├── #settings_modal
├── #campaign_manager_modal
├── #dungeon_features_modal
├── #rules_reference_modal
├── #search_modal
├── #gold_sense_modal
├── #lantern_modal
├── #party_tracker_modal
└── #trait_selector_modal
```

### Modal Structure (Template)
```
#<name>_modal
├── role="dialog"
├── aria-modal="true"
├── aria-labelledby="<name>_modal_title"
│
├── #<name>_modal_header
│   ├── #<name>_modal_title (h2)
│   └── #<name>_modal_close_button
│       └── aria-label="Close <name>"
│
├── #<name>_modal_content
│   └── (component-specific content)
│
└── #<name>_modal_footer (if needed)
    └── (footer buttons/controls)
```

---

## 📋 Implementation Phases

### Phase 1: Core Infrastructure (2-3 hours)

**Goal**: Establish patterns and add root-level IDs

**Components to update:**
- `App.jsx` - Add `#app_root`, `#app_header`, `#main_content`, `#modals_container`
- `layout/AppHeader.jsx` - Add `#app_header` sub-structure
- `layout/MobileNavigation.jsx` - Add `#app_nav` with tab IDs
- `layout/ActionPane.jsx` - Add `#action_pane` wrapper

**Deliverables:**
- [x] `#app_root` added to App.jsx (line 317)
- [x] `#app_header` structure defined (AppHeader.jsx line 31 + sections: #app_header_title, #app_header_stats, #app_header_actions)
- [x] `#main_content` wrapper added (App.jsx line 338)
- [x] `#modals_container` added (App.jsx line 554)
- [x] `#app_nav` with nav item IDs (MobileNavigation.jsx lines 15 + tabs: #nav_party_tab, #nav_dungeon_tab, #nav_combat_tab, #nav_analytics_tab, #nav_story_tab)
- [x] `#action_pane` wrapper added (App.jsx line 494)
- [x] Document created with this structure (✓ this file)

**Testing:**
- [x] All root IDs are unique
- [x] No ID conflicts with existing classes

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- App.jsx: Added #app_root, #main_content, #modals_container, #action_pane
- AppHeader.jsx: Added #app_header, #app_header_title, #app_header_stats, #app_header_actions
- MobileNavigation.jsx: Added #app_nav, #nav_{party|dungeon|combat|analytics|story}_tab

---

### Phase 2: Party Component (2-3 hours)

**Goal**: Make party card structure fully identifiable

**Component**: `src/components/Party.jsx`

**Changes required:**
```jsx
<section id="party_section">
  <div id="party_header">
    <h2 id="party_header_title">Party</h2>
  </div>

  <div id="party_controls">
    <button id="party_add_hero_button">Add Hero</button>
    <div id="party_gold_display">Gold: {gold}</div>
  </div>

  <div id="party_cards">
    {party.map((hero, i) => (
      <div key={hero.id} className="party_card" id={`party_card_${i}`}>
        <div id={`party_card_${i}_header`} className="party_card_header">
          <span id={`party_card_${i}_name`}>{hero.name}</span>
          <span id={`party_card_${i}_class`}>{hero.key}</span>
          <span id={`party_card_${i}_level`}>Lvl {hero.level}</span>
        </div>

        <div id={`party_card_${i}_hp_section`} className="party_card_hp">
          <span id={`party_card_${i}_hp_display`}>{hero.hp}</span>
          <button id={`party_card_${i}_hp_decrease_button`}>−</button>
          <button id={`party_card_${i}_hp_increase_button`}>+</button>
        </div>

        <div id={`party_card_${i}_abilities`} className="party_card_abilities">
          {/* ability buttons */}
        </div>
      </div>
    ))}
  </div>
</section>
```

**Files to update:**
- [x] `src/components/Party.jsx`

**Testing:**
- [x] All hero cards are `id="party_card_N"` where N starts at 0
- [x] All controls reference correct ID paths
- [x] Can target specific hero: `#party_card_0_hp_increase_button`

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- Party.jsx: Added #party_section, #party_header, #party_header_title, #party_add_hero_button
- Added #party_controls for class picker
- Added #party_cards container and #party_card_N for each hero (N=0-3)
- Added sub-element IDs for each card:
  - #party_card_N_header, #party_card_N_name, #party_card_N_delete_button
  - #party_card_N_stats, #party_card_N_level_section, #party_card_N_level (with increase/decrease buttons)
  - #party_card_N_hp_section, #party_card_N_hp_display (with increase/decrease buttons)
  - #party_card_N_status, #party_card_N_clues (with #party_card_N_clue_N_button for each clue)
  - #party_card_N_trait, #party_card_N_trait_display, #party_card_N_trait_edit_button, #party_card_N_trait_select_button
  - #party_card_N_abilities
- Added #party_gold_section with #party_gold_display, #party_gold_controls
- Added button IDs: #party_gold_decrease_button, #party_gold_increase_button, #party_gold_roll_d6_button

---

### Phase 3: Dungeon Component (2-3 hours)

**Goal**: Make dungeon section and controls identifiable

**Components**:
- `src/components/Dungeon.jsx` (controls, section header)
- `src/components/DungeonGridCanvas.jsx` (canvas-based, no individual cell elements)

**Note**: The grid itself is rendered using an HTML5 canvas for performance reasons, so individual cells don't have DOM elements. Grid interactions happen through event handlers on the canvas element.

**Changes made:**
```jsx
<section id="dungeon_section">
  <div id="dungeon_controls">
    <div id="dungeon_view_display">Viewing: Map</div>
    <div id="dungeon_header_buttons">
      <button id="dungeon_toggle_log_button">Log/Map</button>
      <button id="dungeon_room_designer_button">Designer</button>
    </div>
  </div>

  <div id="dungeon_grid">
    {/* Canvas-based grid - no individual cell DOM elements */}
    <DungeonGridCanvas id="dungeon_grid_canvas" ... />
    {radialMenu && (
      <div id="dungeon_radial_menu">
        <RadialMenu ... />
      </div>
    )}
  </div>
</section>
```

**Files updated:**
- [x] `src/components/Dungeon.jsx` - Added section, controls, and grid IDs
- [N/A] `src/components/DungeonGridCanvas.jsx` - Canvas-based, no DOM cell elements needed

**IDs Added:**
- `#dungeon_section` - Main section wrapper
- `#dungeon_controls` - Controls container
- `#dungeon_view_display` - View mode display (Log/Map)
- `#dungeon_header_buttons` - Button container
- `#dungeon_toggle_log_button` - Toggle log view button
- `#dungeon_room_designer_button` - Open room designer button
- `#dungeon_grid` - Grid container (contains canvas)
- `#dungeon_grid_canvas` - The canvas element itself
- `#dungeon_radial_menu` - Radial context menu wrapper

**Testing:**
- [x] Section uses semantic `<section>` element
- [x] All controls have descriptive IDs
- [x] Can target grid: `#dungeon_grid`
- [x] Can target canvas: `#dungeon_grid_canvas`

**Completed:** 2026-01-16 by Claude Code
**Implementation Notes:** Grid is canvas-based for performance. Cell interactions handled via event listeners rather than DOM elements.

---

### Phase 4: Combat Component (2-3 hours)

**Goal**: Make combat state and actions identifiable

**Component**: `src/components/Combat.jsx`

**Changes required:**
```jsx
<section id="combat_section">
  <div id="combat_header">
    <h2>Combat</h2>
  </div>

  <div id="monster_group">
    <h3 id="monster_group_title">Enemies</h3>
    <div id="monster_cards">
      {monsters.map((m, i) => (
        <div key={m.id} className="monster_card" id={`monster_${i}`}>
          <h3 id={`monster_${i}_name`}>{m.name}</h3>
          <div id={`monster_${i}_hp_section`}>
            <span id={`monster_${i}_hp_display`}>{m.hp}</span>
            <button id={`monster_${i}_hp_decrease_button`}>−</button>
            <button id={`monster_${i}_hp_increase_button`}>+</button>
          </div>
        </div>
      ))}
    </div>
  </div>

  <div id="combat_phase">
    <div id="combat_phase_display">{phase}</div>
    <div id="combat_phase_description">{phaseDescription}</div>
  </div>

  <div id="combat_actions">
    {party.map((hero, i) => (
      <button
        key={hero.id}
        id={`combat_action_${i}_button`}
        className="combat_action_button"
      >
        {hero.name} Acts
      </button>
    ))}
  </div>

  <div id="combat_results">
    {results.map((r, i) => (
      <div key={i} className="combat_result_entry" id={`combat_result_${i}`}>
        {r.text}
      </div>
    ))}
  </div>
</section>
```

**Files updated:**
- [x] `src/components/Combat.jsx` - Full structure with 40+ semantic IDs

**IDs Added:**
- `#combat_section` - Main section wrapper (semantic section element)
- `#combat_location` - Combat location display (corridor/room)
- `#combat_location_controls` - Controls for location
- `#combat_location_display` - Location type display
- `#combat_location_clear_button` - Clear location button
- `#combat_save_modal` - Save roll modal (when hero takes damage)
- `#combat_save_title` - Save roll title
- `#combat_save_buttons` - Container for save roll buttons
- `#combat_save_roll_button` - Roll save button
- `#monster_group` - Monster group container
- `#monster_group_header` - Monster group header
- `#monster_group_title` - Monster title/count
- `#monster_cards` - Container for all monster cards
- `#monster_N` - Individual monster card (N = index 0-based)
- `#monster_N_header` - Monster header with name/level
- `#monster_N_info` - Monster info section
- `#monster_N_name` - Monster name display
- `#monster_N_level_controls` - Level adjustment buttons
- `#monster_N_level_decrease_button` / `_level_increase_button` - Level adjustment
- `#monster_N_level` - Current level display
- `#monster_N_ability` - Special ability display
- `#monster_N_level_reduced` - Level reduced indicator
- `#monster_N_delete_button` - Delete monster button
- `#monster_N_hp_section` - HP/Count section
- `#monster_N_stats` - Stats display (XP, Minor Foe)
- `#monster_N_hp_controls` - HP adjustment buttons (for major foes)
- `#monster_N_hp_decrease_button` / `_hp_increase_button` - HP adjustment
- `#monster_N_hp_display` - HP value display
- `#monster_N_count_controls` - Count adjustment buttons (for minor foes)
- `#monster_N_count_decrease_button` / `_count_increase_button` - Count adjustment
- `#monster_N_count` - Current count display
- `#combat_abilities` - Class abilities section
- `#combat_abilities_title` - Class abilities title
- `#combat_ability_list` - List of ability cards
- `#combat_ability_N` - Individual hero's abilities section (N = hero index)
- `#combat_ability_N_name` - Hero name in abilities section
- `#combat_victory` - Victory phase wrapper

**Testing:**
- [x] Monsters use: `id="monster_N"` (each monster indexed 0-based)
- [x] Monster controls reference correct paths (HP, count, level, etc.)
- [x] Combat location and save roll have proper IDs
- [x] Abilities section has hero-indexed IDs
- [x] Victory phase is wrapped with ID

**Completed:** 2026-01-16 by Claude Code
**Implementation Notes:**
- Combat.jsx changed from `<div>` to semantic `<section id="combat_section">`
- 40+ semantic IDs added for comprehensive DOM structure
- Monsters support both Major Foes (HP-based) and Minor Foes (count-based) with separate controls
- Save roll modal has proper structure for critical interactions

---

### Phase 5: Modals (2-3 hours) ✓ COMPLETED

**Goal**: Make all modals consistently structured

**Components updated:**
- [x] `src/components/SettingsModal.jsx` → `#settings_modal` (25+ IDs)
- [x] `src/components/Equipment.jsx` → `#equipment_modal` (30+ IDs)
- [x] `src/components/Abilities.jsx` → `#abilities_modal` (100+ IDs for 14 character classes)
- [x] `src/components/CampaignManagerModal.jsx` → `#campaign_manager_modal` (20+ IDs)
- [x] `src/components/DungeonFeaturesModal.jsx` → `#dungeon_features_modal` (core sections)
- [x] `src/components/RulesReference.jsx` → `#rules_reference_modal` (15+ IDs including PDF viewer)
- [x] `src/components/SearchModal.jsx` → 4 exported modals (50+ IDs across 4 functions)
- [x] `src/components/GoldSenseModal.jsx` → `#gold_sense_modal` (10+ IDs)
- [x] `src/components/LanternModal.jsx` → `#lantern_modal` (12+ IDs)
- [x] `src/components/PartyTracker.jsx` → `#party_tracker` draggable widget (12+ IDs)
- [x] `src/components/TraitSelector.jsx` → `#trait_selector_modal` (25+ IDs)

**Pattern applied to all modals:**
```jsx
<div
  id="<name>_modal_overlay"
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
>
  <div
    id="<name>_modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="<name>_modal_title"
  >
    <div id="<name>_modal_header" className="modal_header">
      <h2 id="<name>_modal_title">{title}</h2>
      <button
        id="<name>_modal_close_button"
        aria-label={`Close ${title}`}
        onClick={onClose}
      >
        ×
      </button>
    </div>

    <div id="<name>_modal_content" className="modal_content">
      {/* component-specific content with semantic sub-IDs */}
    </div>

    {hasFooter && (
      <div id="<name>_modal_footer" className="modal_footer">
        {/* footer content */}
      </div>
    )}
  </div>
</div>
```

**Testing completed:**
- [x] All modals have `id="<name>_modal"`
- [x] All modals have overlay with `id="<name>_modal_overlay"`
- [x] All modals have close button: `id="<name>_modal_close_button"`
- [x] All modals have header: `id="<name>_modal_header"`
- [x] All modals have title: `id="<name>_modal_title"`
- [x] All modals have content: `id="<name>_modal_content"`

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- All 11 modal components now have full semantic ID structure
- Each modal follows consistent pattern: overlay → modal → header/title/close/content
- Modals with multiple sections/items use indexed IDs (e.g., `trait_selector_trait_${idx}`)
- Equipment modal includes nested modals (shop, new item, new scroll)
- Abilities modal includes 14 class-specific sections with individual ability IDs
- SearchModal.jsx includes 4 exported functions (SearchModal, HiddenTreasureModal, SecretDoorModal, SecretPassageModal)
- PartyTracker.jsx is a draggable floating widget (not a traditional modal)
- All hero references use consistent pattern: `${component}_hero_${idx}` or `${component}_${hero_type}_${idx}`

---

### Phase 6: Log & Dice (1-2 hours) ✓ COMPLETED

**Goal**: Make transient UI elements identifiable

**Components updated:**
- [x] `src/components/Log.jsx` → 30+ IDs (desktop & mobile layouts)
- [x] `src/components/Dice.jsx` → 8+ IDs (dice roller)

**Changes made:**

**Log.jsx** (2 layout variants):
```jsx
// Desktop/Bottom Panel Layout
<div id="adventure_log_section">
  <div id="adventure_log_controls">
    <div id="adventure_log_actions">
      <button id="adventure_log_archive_button">Archive</button>
      <div id="adventure_log_filter_section">
        <select id="adventure_log_filter_select">...</select>
      </div>
    </div>
    <div id="adventure_log_archive_indicator">...</div>
  </div>

  <div id="adventure_log_entries" role="log" aria-live="polite">
    {filteredLog.map((entry, index) => (
      <div id={`adventure_log_entry_${index}`}>
        <span id={`adventure_log_entry_${index}_timestamp`}>...</span>
        <span id={`adventure_log_entry_${index}_type`}>...</span>
        <span id={`adventure_log_entry_${index}_message`}>...</span>
      </div>
    ))}
    <div id="adventure_log_empty">Adventure awaits...</div>
    <div id="adventure_log_filter_empty">No entries match...</div>
  </div>
</div>

// Mobile/Tablet Layout
<div id="adventure_log_container">
  <div id="adventure_log_mobile_section">
    <div id="adventure_log_mobile_header">
      <span id="adventure_log_mobile_title">Log ({count})</span>
      <div id="adventure_log_mobile_actions">
        <div id="adventure_log_mobile_filter_section">
          <select id="adventure_log_mobile_filter_select">...</select>
        </div>
        <button id="adventure_log_mobile_archive_button">Archive</button>
      </div>
    </div>

    <div id="adventure_log_mobile_entries" role="log" aria-live="polite">
      {filteredLog.map((entry, index) => (
        <div id={`adventure_log_mobile_entry_${index}`}>
          <span id={`adventure_log_mobile_entry_${index}_timestamp`}>...</span>
          <span id={`adventure_log_mobile_entry_${index}_type`}>...</span>
          <span id={`adventure_log_mobile_entry_${index}_message`}>...</span>
        </div>
      ))}
    </div>

    <div id="adventure_log_mobile_archive_indicator">...</div>
  </div>
</div>
```

**Dice.jsx:**
```jsx
<div id="dice_roller_section">
  <div id="dice_roller_buttons">
    {['d6', '2d6', 'd66'].map(type => (
      <Button id={`dice_roll_${type}_button`}>{type}</Button>
    ))}
  </div>

  {result && (
    <span id="dice_result_display" role="status" aria-live="polite">
      <span id="dice_result_value">{result.value}</span>
      <span id="dice_result_type">({result.type})</span>
    </span>
  )}
</div>
```

**Files updated:**
- [x] `src/components/Log.jsx` - 30+ IDs across two layout variants
- [x] `src/components/Dice.jsx` - 8+ IDs for roller interface

**Testing completed:**
- [x] Desktop log entries: `id="adventure_log_entry_N"`
- [x] Mobile log entries: `id="adventure_log_mobile_entry_N"`
- [x] Dice buttons: `id="dice_roll_${type}_button"`
- [x] Dice result: `id="dice_result_display"` with `role="status"` + `aria-live="polite"`
- [x] Filter controls accessible: `#adventure_log_filter_select` (desktop & mobile)
- [x] Archive button identifiable: `#adventure_log_archive_button`
- [x] Both layouts have complete semantic structure

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- Log.jsx updated with 30+ semantic IDs covering both desktop (bottom panel) and mobile layouts
- Each log entry indexed: `adventure_log_entry_N` with sub-elements for timestamp, type, message
- Mobile variant uses `_mobile_` naming to differentiate (e.g., `adventure_log_mobile_entry_${index}`)
- Dice.jsx updated with 8+ semantic IDs for roller buttons and result display
- All controls follow consistent naming pattern: `component_element_${index|name}_${property}`

---

### Phase 7: Navigation & Menus (1-2 hours) ✓ COMPLETED

**Goal**: Make navigation structure semantic

**Components updated:**
- [x] `src/components/layout/MobileNavigation.jsx` → 15+ IDs
- [x] `src/components/RadialMenu.jsx` → 8+ IDs

**Changes made:**

**MobileNavigation.jsx:**
```jsx
<nav id="app_nav" aria-label="Main navigation">
  {tabs.map(t => (
    <button
      id={`nav_${t.id}_tab`}
      className="nav_tab"
      aria-label={t.label}
      aria-current={activeTab === t.id ? 'page' : undefined}
    >
      <t.icon id={`nav_${t.id}_tab_icon`} aria-hidden="true" />
      <span id={`nav_${t.id}_tab_label`}>{t.label}</span>
    </button>
  ))}
</nav>
```

Tabs created: party, dungeon, combat, analytics, story
- `#nav_party_tab`, `#nav_dungeon_tab`, `#nav_combat_tab`, `#nav_analytics_tab`, `#nav_story_tab`
- Each with `_icon` and `_label` variants

**RadialMenu.jsx:**
```jsx
<div id="radial_menu_overlay">
  <div id="radial_menu" role="menu" aria-label="Radial context menu">
    {items.map((it, i) => (
      <button
        id={`radial_menu_option_${it.key}`}
        role="menuitem"
        aria-label={it.label}
      >
        <span id={`radial_menu_option_${it.key}_icon`}>{char}</span>
      </button>
    ))}
    <button
      id="radial_menu_close_button"
      role="menuitem"
      aria-label="Close menu"
    >
      ×
    </button>
  </div>
</div>
```

**Files updated:**
- [x] `src/components/layout/MobileNavigation.jsx` - 15+ IDs added
- [x] `src/components/RadialMenu.jsx` - 8+ IDs added

**Testing completed:**
- [x] Navigation tabs fully identifiable
- [x] Tab icons and labels have semantic IDs
- [x] Radial menu has proper ARIA roles and IDs
- [x] Menu items uniquely identified by key
- [x] Accessibility attributes in place

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- MobileNavigation.jsx enhanced with icon and label IDs (already had main tab structure)
- RadialMenu.jsx now has complete semantic menu structure with proper ARIA roles
- All navigation and menu elements fully identifiable and accessible

---

### Phase 8: Forms & Settings (1-2 hours) ✓ COMPLETED

**Goal**: Make form controls identifiable

**Components updated:**
- [x] `src/components/SettingsModal.jsx` → 50+ IDs
- [x] `src/components/OnboardingScreen.jsx` → 25+ IDs

**Changes made:**

**SettingsModal.jsx** (Settings form sections):
```jsx
// Theme Selection
<div id="settings_theme_section">
  <h3 id="settings_theme_label">Theme</h3>
  <div id="settings_theme_options" role="group" aria-labelledby="settings_theme_label">
    {Object.values(THEMES).map((t) => (
      <button
        id={`settings_theme_${t.id}_button`}
        role="radio"
        aria-checked={theme === t.id}
      >
        <div id={`settings_theme_${t.id}_name`}>{t.name}</div>
        <div id={`settings_theme_${t.id}_description`}>{t.description}</div>
      </button>
    ))}
  </div>
  <p id="settings_theme_help">...</p>
</div>

// Dice Theme Selection
<div id="settings_dice_theme_section">
  <h3 id="settings_dice_theme_label">Dice Theme</h3>
  <div id="settings_dice_theme_options" role="group">
    {Object.values(DICE_THEMES).map((dt) => (
      <button id={`settings_dice_theme_${dt.id}_button`} role="radio">
        <span id={`settings_dice_theme_${dt.id}_name`}>{dt.name}</span>
      </button>
    ))}
  </div>
</div>

// Dice Color Selection
<div id="settings_dice_color_section">
  <h3 id="settings_dice_color_label">Dice Color</h3>
  <div id="settings_dice_color_options" role="group">
    {Object.values(DICE_COLORS).map((dc) => (
      <button id={`settings_dice_color_${dc.id}_button`} role="radio">
        <div id={`settings_dice_color_${dc.id}_swatch`}/>
        <span id={`settings_dice_color_${dc.id}_name`}>{dc.name}</span>
      </button>
    ))}
  </div>
</div>

// Log Management
<div id="settings_log_management_section">
  <h3 id="settings_log_management_label">Log Management</h3>
  <div id="settings_log_actions">
    <button id="settings_log_archive_button">Archive & Clear Log</button>
  </div>
  <p id="settings_log_current_count">...</p>
  <div id="settings_log_archive_summary">
    <button id="settings_log_archive_toggle_button">...</button>
    <div id="settings_log_archive_list">
      {state.logArchive.map((archive, idx) => (
        <div id={`settings_log_archive_item_${idx}`}>
          <div id={`settings_log_archive_item_${idx}_name`}/>
          <div id={`settings_log_archive_item_${idx}_info`}/>
        </div>
      ))}
    </div>
  </div>
</div>

// Campaign Stats
<div id="settings_campaign_stats_section">
  <h3 id="settings_campaign_stats_label">Campaign Stats</h3>
  <div id="settings_campaign_stats_display">
    <div id="settings_stats_party_members"/>
    <div id="settings_stats_total_gold"/>
    <div id="settings_stats_clues"/>
    <div id="settings_stats_minor_encounters"/>
    <div id="settings_stats_major_foes"/>
    <div id="settings_stats_boss"/>
  </div>
  <div id="settings_keyboard_shortcuts_section">
    <div id="settings_keyboard_shortcuts_title"/>
    <div id="settings_keyboard_shortcuts_list"/>
  </div>
</div>
```

**OnboardingScreen.jsx** (Campaign creation form):
```jsx
// Campaign Name Step
<div id="onboarding_campaign_name_screen">
  <h1 id="onboarding_campaign_name_title">New Campaign</h1>
  <p id="onboarding_campaign_name_description">...</p>
  <input id="onboarding_campaign_name_input" type="text" />
  <button id="onboarding_campaign_name_confirm_button">Continue</button>
</div>

// Hero Creation Form
<div id={`onboarding_hero_${heroNumber}_header`}>
  <h4 id={`onboarding_hero_${heroNumber}_title`}>Hero {heroNumber}</h4>
  <span id={`onboarding_hero_${heroNumber}_created_badge`}>✓ Created</span>
</div>
<input id={`onboarding_hero_${heroNumber}_name_input`} type="text" />
<select id={`onboarding_hero_${heroNumber}_class_select`}>...</select>

// Equipment Shop
<div id="onboarding_shop_filters">
  <button id="onboarding_shop_sort_button" aria-pressed={sortByPrice}>...</button>
  <button id="onboarding_shop_affordability_button" aria-pressed={hideUnaffordable}>...</button>
</div>

{availableItems.map((item) => (
  <div id={`onboarding_shop_item_${item.key}_actions`}>
    <select id={`onboarding_shop_item_${item.key}_buy_select`}/>
    <button id={`onboarding_shop_item_${item.key}_inventory_button`}/>
  </div>
))}
```

**Files updated:**
- [x] `src/components/SettingsModal.jsx` - 50+ IDs added (theme, dice, log, stats)
- [x] `src/components/OnboardingScreen.jsx` - 25+ IDs added (campaign, heroes, shop)

**Testing completed:**
- [x] All form sections identifiable with semantic IDs
- [x] Theme/color selections use proper ARIA roles (radio)
- [x] Form controls properly grouped with aria-labelledby
- [x] Indexed items in lists (archive items, shop items)
- [x] All interactive elements have identifiable names

**Completed:** 2026-01-16 by Claude Code
**Changes Summary:**
- SettingsModal.jsx: 50+ IDs covering 5 major sections (theme, dice theme, dice color, log management, campaign stats)
- OnboardingScreen.jsx: 25+ IDs covering campaign setup and equipment shop
- All form-like controls use semantic ARIA attributes
- Consistent naming pattern: `component_section_element_${property}`
- Indexed lists for archive items and equipment selections

---

### Phase 9: Testing & Documentation (2-3 hours)

**Goal**: Verify and document the semantic structure

**Tasks:**
- [ ] **Create ID/Class Reference** (`SEMANTIC_DOM_REFERENCE.md`)
  - Comprehensive list of all IDs and classes
  - Where each appears
  - What it contains

- [ ] **Update CONTRIBUTING.md**
  - Add section: "Semantic DOM Structure"
  - Show examples of ID/class naming
  - Add to PR checklist:
    - "All new elements have semantic IDs/classes"
    - "IDs follow naming convention"
    - "No ID collisions"

- [ ] **Create Implementation Checklist** (`SEMANTIC_DOM_CHECKLIST.md`)
  - Track completion per phase
  - List all components
  - Sign off boxes

- [ ] **Test accessibility**
  - Verify IDs are unique within scope
  - Check aria-labelledby references exist
  - Test keyboard navigation
  - Validate modal structure

- [ ] **Visual inspection**
  - DevTools: Can inspect any element and know its purpose
  - No console warnings about IDs

---

## 📊 Progress Tracking

### Implementation Checklist

#### Phase 1: Core Infrastructure
- [x] `App.jsx` - Root IDs added (#app_root, #main_content, #modals_container, #action_pane)
- [x] `layout/AppHeader.jsx` - Structure added (#app_header, #app_header_title, #app_header_stats, #app_header_actions)
- [x] `layout/MobileNavigation.jsx` - Nav IDs added (#app_nav, #nav_*_tab)
- [x] Documentation updated (SEMANTIC_DOM_STRUCTURE.md)

#### Phase 2: Party Component
- [x] `Party.jsx` - Full structure added (40+ IDs added)
- [x] Party cards use `id="party_card_N"` (each hero card indexed 0-3)
- [x] All controls reference correct IDs (stats, HP, abilities, gold, traits, clues)

#### Phase 3: Dungeon Component
- [x] `Dungeon.jsx` - Section, controls, and grid IDs added (#dungeon_section, #dungeon_controls, #dungeon_grid)
- [N/A] `DungeonGridCanvas.jsx` - Canvas-based (no individual cell DOM elements)
- [N/A] Grid cells use canvas rendering (event-based, not DOM-based)

#### Phase 4: Combat Component
- [x] `Combat.jsx` - Full structure added (40+ IDs)
- [x] Monsters use `id="monster_N"` (each monster indexed 0-based)
- [x] Combat location, save roll, abilities, and victory have IDs

#### Phase 5: Modals (All 11) ✓ COMPLETED
- [x] `SettingsModal.jsx` - 25+ IDs added
- [x] `Equipment.jsx` - 30+ IDs added
- [x] `Abilities.jsx` - 100+ IDs added (14 character classes)
- [x] `CampaignManagerModal.jsx` - 20+ IDs added
- [x] `DungeonFeaturesModal.jsx` - Core sections with IDs added
- [x] `RulesReference.jsx` - 15+ IDs added (includes PDF viewer modal)
- [x] `SearchModal.jsx` - 50+ IDs added (4 exported functions)
- [x] `GoldSenseModal.jsx` - 10+ IDs added
- [x] `LanternModal.jsx` - 12+ IDs added
- [x] `PartyTracker.jsx` - 12+ IDs added (draggable widget)
- [x] `TraitSelector.jsx` - 25+ IDs added

#### Phase 6: Log & Dice ✓ COMPLETED
- [x] `Log.jsx` - 30+ IDs added (desktop & mobile layouts)
- [x] `Dice.jsx` - 8+ IDs added

#### Phase 7: Navigation & Menus ✓ COMPLETED
- [x] `MobileNavigation.jsx` - 15+ IDs added (nav tabs, icons, labels)
- [x] `RadialMenu.jsx` - 8+ IDs added (menu, options, close button)

#### Phase 8: Forms & Settings ✓ COMPLETED
- [x] `SettingsModal.jsx` - 50+ IDs added (theme, dice, log, stats)
- [x] `OnboardingScreen.jsx` - 25+ IDs added (campaign, heroes, shop)

#### Phase 9: Documentation
- [ ] `SEMANTIC_DOM_REFERENCE.md` created
- [ ] `SEMANTIC_DOM_CHECKLIST.md` created
- [ ] `CONTRIBUTING.md` updated
- [ ] All testing completed

---

## 💡 Examples

### How to Reference Elements

**Before (unclear):**
"Fix the styling of the fourth hero's HP increase button in the party panel"

**After (clear):**
"Fix the styling of `#party_card_3_hp_increase_button`"

---

**Before (unclear):**
"The grid cells in the dungeon aren't displaying the monster icon correctly"

**After (clear):**
"The content in `.grid_cell` with class `.grid_cell_monster` isn't displaying the icon"
Or: "The content in `#grid_cell_Y_X` with class `.grid_cell_monster` isn't displaying the icon"

---

**Before (unclear):**
"Make the combat action buttons for each hero turn red when they've acted"

**After (clear):**
"Make `#combat_action_N_button.is-acted` red"

---

## 🚀 Starting Implementation

1. **Read this document** and understand the naming convention
2. **Start with Phase 1** - Set up root structure
3. **Work through phases sequentially** - Build on previous work
4. **Test after each phase** - Verify IDs are unique and working
5. **Update checklists** - Track progress
6. **Commit frequently** - "Add semantic DOM structure to Party component" etc.
7. **Reference this document** when unsure of a naming pattern

---

## 📝 Notes

- These IDs/classes are **additive** - they don't replace existing Tailwind classes
- The existing CSS helpers (p-2, bg-gray-200, etc.) remain unchanged
- Only add IDs/classes that have semantic meaning
- Don't add IDs to every single element, just ones that need to be targeted/referenced
- Grid cells use **Y_X format** (row first, column second) for consistency with array indexing

---

**Last Updated:** 2026-01-16
**Ready to begin?** Start with Phase 1 in your implementation
