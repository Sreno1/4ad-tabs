# 🎯 Master Refactoring Plan: Four Against Darkness
**Complete Codebase Transformation Roadmap**

**Date:** 2026-01-15
**Timeline:** 6-8 weeks (40-55 hours total)
**Approach:** Incremental, test-as-you-go, production-safe

---

## 📊 Executive Summary

This plan combines architectural improvements, CSS refactoring, and critical fixes into a cohesive roadmap. Each week builds on the previous, maintaining a working application throughout.

**Current State Health Scores:**
- JavaScript Architecture: 6/10
- CSS Architecture: 4/10
- Code Quality: 5/10
- **Overall: 5/10**

**Target State Health Scores:**
- JavaScript Architecture: 9/10
- CSS Architecture: 9/10
- Code Quality: 9/10
- **Overall: 9/10**

---

## 🗓️ Week-by-Week Timeline

```
Week 1: Foundation & Critical Fixes (8-10 hours)
  ├─ Critical fixes (gitignore, error boundaries, localStorage)
  ├─ UI component library (Button, Card)
  └─ First component migrations

Week 2: CSS Architecture Refactoring (8-10 hours)
  ├─ Add semantic data attributes
  ├─ Migrate buttons and cards across all components
  └─ Remove theme !important flags

Week 3: Component Decomposition (8-10 hours)
  ├─ Split ActionPane into subcomponents
  ├─ Start Combat.jsx decomposition
  ├─ Deduplicate code
  └─ Create onboarding/start screen for new users

Week 4: State & Utilities Refactoring (8-10 hours)
  ├─ Split gameActions.js by domain
  ├─ Compose reducer into domain reducers
  └─ Create selector functions

Week 5: Performance & Accessibility (6-8 hours)
  ├─ Add React.memo and useCallback
  ├─ Implement ARIA labels
  └─ Fix keyboard navigation

Week 6: Testing & Polish (6-8 hours)
  ├─ Set up testing infrastructure
  ├─ Write tests for critical paths
  └─ Documentation and cleanup
```

---

## 📋 Detailed Task Breakdown

---

### Week 3

### Day 3 (2-3 hours): Code Deduplication

#### Task 3.4: Extract Shared Card Patterns (1.5 hours)
**Priority:** 🟡 MEDIUM

Create `src/components/ui/StatCard.jsx`:

```jsx
export function StatCard({ label, value, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-800',
    highlight: 'bg-blue-900/30 ring-1 ring-blue-400',
    danger: 'bg-red-900/30 ring-1 ring-red-400'
  };

  return (
    <div className={`${variants[variant]} rounded p-2`} data-card="stat">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
    </div>
  );
}
```

Use in Party, Combat, Analytics components.

---

#### Task 3.5: Campaign Manager System (3-4 hours)
**Priority:** 🟠 HIGH

**Problem:**
- No way to manage multiple campaigns
- Users can only play one adventure at a time
- No way to switch between different party adventures
- Missing save/load/delete functionality

**Solution:** Implement a Campaign Manager with 3 save slots and campaign switching.

**Architecture:**

LocalStorage structure:
```javascript
'4ad-active-campaign': 'campaign-1737123456789'  // Currently loaded campaign

'4ad-campaign-1737123456789': {
  id: 'campaign-1737123456789',
  name: 'Dragon Quest',
  createdAt: '2026-01-15T10:30:00Z',
  lastPlayedAt: '2026-01-15T12:45:00Z',
  heroNames: ['Aragorn', 'Gandalf', 'Legolas', 'Gimli'],
  party: [...],
  gold: 185,
  clues: 3,
  grid: [...],
  doors: [...],
  monsters: [...],
  log: [...]
  // ... all game state
}
```

Create `src/components/CampaignManager.jsx`:

```jsx
import React from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Trash2, Copy, RotateCcw } from 'lucide-react';

/**
 * CampaignManager - Select, create, load, delete campaigns
 * Shows up to 3 save slots
 */
export default function CampaignManager({ onLoadCampaign, onNewCampaign }) {
  const campaigns = getAllCampaigns();
  const MAX_SLOTS = 3;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <Card variant="surface1" className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-amber-400 mb-2">
          Four Against Darkness
        </h1>
        <p className="text-slate-400 mb-6">Campaign Manager</p>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-300 mb-6">
              No campaigns yet. Create your first adventure!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={onNewCampaign}
              dataAction="new-campaign"
            >
              + New Campaign
            </Button>
          </div>
        ) : (
          <>
            {/* Campaign Slots (3 total) */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: MAX_SLOTS }).map((_, idx) => {
                const campaign = campaigns[idx];

                if (!campaign) {
                  return (
                    <Card key={idx} variant="surface2" className="p-4">
                      <div className="text-slate-400 text-center py-8">
                        <p className="mb-4">Empty Slot {idx + 1}</p>
                        <Button
                          variant="info"
                          size="sm"
                          fullWidth
                          onClick={onNewCampaign}
                          dataAction="new-campaign-in-slot"
                        >
                          Create Campaign
                        </Button>
                      </div>
                    </Card>
                  );
                }

                return (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onLoad={() => onLoadCampaign(campaign.id)}
                    onDelete={() => deleteCampaign(campaign.id)}
                    onExport={() => exportCampaign(campaign)}
                  />
                );
              })}
            </div>

            {/* Import/Export Section */}
            {campaigns.length > 0 && (
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-amber-400 font-bold mb-3">Advanced Options</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => importCampaign()}
                    dataAction="import-campaign"
                  >
                    Import Campaign
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

/**
 * CampaignCard - Shows campaign info and controls
 */
function CampaignCard({ campaign, onLoad, onDelete, onExport }) {
  const lastPlayed = new Date(campaign.lastPlayedAt);
  const daysAgo = Math.floor(
    (Date.now() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card variant="surface2" className="p-4 flex flex-col">
      <h3 className="text-lg font-bold text-amber-400 mb-2">{campaign.name}</h3>

      {/* Hero Names */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Party:</p>
        <p className="text-sm text-slate-300">
          {campaign.heroNames?.join(', ') || 'No party'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-slate-700 rounded p-2">
          <p className="text-slate-400">Rooms</p>
          <p className="text-amber-400 font-bold">{campaign.roomsExplored || 0}</p>
        </div>
        <div className="bg-slate-700 rounded p-2">
          <p className="text-slate-400">Gold</p>
          <p className="text-amber-400 font-bold">{campaign.gold || 0}</p>
        </div>
      </div>

      {/* Last Played */}
      <p className="text-xs text-slate-500 mb-3">
        Last played: {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          variant="success"
          size="sm"
          fullWidth
          onClick={onLoad}
          dataAction="load-campaign"
        >
          Load Campaign
        </Button>
        <div className="flex gap-2">
          <Button
            variant="info"
            size="sm"
            className="flex-1"
            onClick={onExport}
            dataAction="export-campaign"
          >
            Export
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => {
              if (confirm(`Delete "${campaign.name}"?`)) {
                onDelete();
              }
            }}
            dataAction="delete-campaign"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

Create `src/components/OnboardingScreen.jsx`:

```jsx
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { CLASSES } from '../data/classes';
import { d6 } from '../utils/dice';

/**
 * OnboardingScreen - Campaign creation and party setup
 * Steps: campaign name → welcome → create party → roll gold → equipment → start
 */
export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState('campaign-name'); // campaign-name | welcome | create-party | confirm-gold | buy-equipment
  const [campaignName, setCampaignName] = useState('');
  const [heroes, setHeroes] = useState([null, null, null, null]);
  const [gold, setGold] = useState(0);

  // Step 0: Campaign Name
  if (step === 'campaign-name') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card variant="surface1" className="max-w-2xl">
          <h1 className="text-3xl font-bold text-amber-400 mb-4">New Campaign</h1>
          <p className="text-slate-300 mb-6">
            Give your adventure a name (e.g., "Dragon Quest", "Tomb Raiding", "The Lost Temple")
          </p>
          <input
            type="text"
            placeholder="Campaign Name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full bg-slate-700 rounded px-3 py-2 mb-4 text-white"
            aria-label="Campaign name"
          />
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!campaignName.trim()}
            onClick={() => setStep('welcome')}
            dataAction="confirm-campaign-name"
          >
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  // Step 1: Welcome screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card variant="surface1" className="max-w-2xl">
          <h1 className="text-4xl font-bold text-amber-400 mb-2">
            {campaignName}
          </h1>
          <p className="text-slate-400 mb-6">Campaign Setup</p>
          <p className="text-slate-300 mb-6">
            Welcome, adventurer! You're about to embark on a solo dungeon-crawling
            adventure. Let's create your party of 4 heroes.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setStep('create-party')}
            dataAction="start-party-creation"
          >
            Create Party
          </Button>
        </Card>
      </div>
    );
  }

  // Step 2: Create party (4 heroes with names, classes, traits)
  if (step === 'create-party') {
    const createdCount = heroes.filter(h => h !== null).length;
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Card variant="surface1" className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            Create Your Party ({createdCount}/4)
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Choose name, class, and trait for each hero. Gold is rolled per class and pooled.
          </p>

          {/* Hero creation form - 4 slots */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[0, 1, 2, 3].map(idx => (
              <HeroCreationCard
                key={idx}
                heroNumber={idx + 1}
                hero={heroes[idx]}
                onSave={(hero) => {
                  const newHeroes = [...heroes];
                  newHeroes[idx] = hero;
                  setHeroes(newHeroes);
                }}
                onRemove={() => {
                  const newHeroes = [...heroes];
                  newHeroes[idx] = null;
                  setHeroes(newHeroes);
                }}
              />
            ))}
          </div>

          {createdCount === 4 && (
            <Button
              variant="success"
              size="lg"
              fullWidth
              onClick={() => {
                // Roll starting gold per class, then pool it
                const totalGold = heroes.reduce((sum, hero) => {
                  const classData = CLASSES[hero.key];
                  const goldRoll = rollGold(classData.startingWealth);
                  return sum + goldRoll;
                }, 0);
                setGold(totalGold);
                setStep('confirm-gold');
              }}
              dataAction="confirm-party"
            >
              Roll Starting Gold
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Step 3: Review starting gold
  if (step === 'confirm-gold') {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Card variant="surface1" className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Starting Gold</h2>

          <div className="bg-slate-800 rounded p-6 mb-6 text-center">
            <p className="text-slate-400 text-sm mb-2">Party Gold Pool</p>
            <p className="text-5xl font-bold text-amber-400">{gold}</p>
            <p className="text-slate-400 text-sm">gold pieces</p>
          </div>

          <p className="text-slate-300 mb-6">
            Each hero's class has a different starting wealth. These have been
            rolled and pooled for your party.
          </p>

          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={() => setStep('buy-equipment')}
            dataAction="confirm-gold"
          >
            Continue to Adventure
          </Button>
        </Card>
      </div>
    );
  }

  // Step 4: Start adventure (simplified equipment step)
  if (step === 'buy-equipment') {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <Card variant="surface1" className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">
            Ready to Explore
          </h2>
          <p className="text-slate-300 mb-6">
            Your party of {heroes.length} heroes is ready, with {gold} gold pieces.
          </p>

          <div className="bg-slate-800 rounded p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">Your Heroes:</p>
            <ul className="text-slate-300">
              {heroes.map((hero, idx) => (
                <li key={idx}>
                  {idx + 1}. {hero.name} the {CLASSES[hero.key].name}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-slate-400 text-sm mb-6">
            Equipment can be purchased when you find it in the dungeon.
            Ready to begin your adventure?
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() =>
              onComplete({
                campaignName,
                party: heroes,
                gold
              })
            }
            dataAction="start-adventure"
          >
            Begin Adventure
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}

/**
 * HeroCreationCard - Individual hero creation form
 */
function HeroCreationCard({ heroNumber, hero, onSave, onRemove }) {
  const [name, setName] = useState(hero?.name || '');
  const [selectedClass, setSelectedClass] = useState(hero?.key || '');
  const [selectedTrait, setSelectedTrait] = useState(hero?.trait || null);

  const handleSave = () => {
    if (!name || !selectedClass) return;

    const classData = CLASSES[selectedClass];
    onSave({
      id: Date.now() + Math.random(),
      name,
      key: selectedClass,
      lvl: 1,
      xp: 0,
      hp: classData.life + 1,
      maxHp: classData.life + 1,
      trait: selectedTrait || null,
      equipment: [],
      gold: 0
    });
  };

  return (
    <Card variant="hero" className="p-4">
      <h4 className="text-amber-400 font-bold mb-2">Hero {heroNumber}</h4>

      <input
        type="text"
        placeholder="Hero Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3 text-white"
        aria-label={`Hero ${heroNumber} name`}
      />

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3 text-white"
        aria-label={`Hero ${heroNumber} class`}
      >
        <option value="">Select Class</option>
        {Object.entries(CLASSES).map(([key, cls]) => (
          <option key={key} value={key}>{cls.name}</option>
        ))}
      </select>

      {selectedClass && CLASSES[selectedClass].traits && (
        <select
          value={selectedTrait || ''}
          onChange={(e) => setSelectedTrait(e.target.value || null)}
          className="w-full bg-slate-700 rounded px-3 py-2 mb-3 text-white"
          aria-label={`Hero ${heroNumber} trait`}
        >
          <option value="">Select Trait (Optional)</option>
          {CLASSES[selectedClass].traits.map(trait => (
            <option key={trait} value={trait}>{trait}</option>
          ))}
        </select>
      )}

      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={!name || !selectedClass}
          dataAction="save-hero"
        >
          {hero ? 'Update' : 'Create'}
        </Button>
        {hero && (
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={onRemove}
            dataAction="remove-hero"
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}
```

**Campaign Utility Functions** (`src/utils/campaignStorage.js`):

```javascript
// Campaign management utilities
const ACTIVE_CAMPAIGN_KEY = '4ad-active-campaign';
const CAMPAIGN_PREFIX = '4ad-campaign-';

export function getAllCampaigns() {
  const keys = Object.keys(localStorage);
  return keys
    .filter(k => k.startsWith(CAMPAIGN_PREFIX))
    .map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        console.error(`Failed to load campaign ${key}:`, e);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.lastPlayedAt) - new Date(a.lastPlayedAt));
}

export function loadCampaign(campaignId) {
  const key = `${CAMPAIGN_PREFIX}${campaignId}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Failed to load campaign ${campaignId}:`, e);
    return null;
  }
}

export function saveCampaign(campaign) {
  const key = `${CAMPAIGN_PREFIX}${campaign.id}`;
  localStorage.setItem(key, JSON.stringify(campaign));
  localStorage.setItem(ACTIVE_CAMPAIGN_KEY, campaign.id);
}

export function createCampaign(name, initialData) {
  const campaignId = Date.now().toString();
  const newCampaign = {
    id: campaignId,
    name,
    createdAt: new Date().toISOString(),
    lastPlayedAt: new Date().toISOString(),
    heroNames: initialData.party.map(h => h.name),
    ...initialData
  };
  saveCampaign(newCampaign);
  return campaignId;
}

export function deleteCampaign(campaignId) {
  const key = `${CAMPAIGN_PREFIX}${campaignId}`;
  localStorage.removeItem(key);

  // Clear active if this was active
  if (localStorage.getItem(ACTIVE_CAMPAIGN_KEY) === campaignId) {
    localStorage.removeItem(ACTIVE_CAMPAIGN_KEY);
  }
}

export function getActiveCampaignId() {
  return localStorage.getItem(ACTIVE_CAMPAIGN_KEY);
}

export function exportCampaign(campaign) {
  const dataStr = JSON.stringify(campaign, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `4ad-${campaign.name}-${campaign.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function importCampaign() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const campaign = JSON.parse(event.target.result);
        // Regenerate ID to avoid conflicts
        campaign.id = Date.now().toString();
        saveCampaign(campaign);
        window.location.reload(); // Refresh to show new campaign
      } catch (err) {
        alert('Failed to import campaign: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function rollGold(formula) {
  // Parse formulas like "d6", "2d6", "3d6", "4d6", "5d6"
  const match = formula.match(/(\d*)d6/);
  if (!match) return 0;
  const num = match[1] ? parseInt(match[1]) : 1;
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += Math.floor(Math.random() * 6) + 1;
  }
  return total;
}
```

**Updated useGameState.js**:

Modify `useGameState()` hook to accept and persist per-campaign state:

```javascript
export function useGameState() {
  const activeCampaignId = getActiveCampaignId();
  const [currentCampaignId, setCurrentCampaignId] = useState(activeCampaignId);

  const initialCampaign = currentCampaignId
    ? loadCampaign(currentCampaignId)
    : null;

  const [state, dispatch] = useReducer(reducer, initialCampaign || initialState);
  const saveTimeoutRef = useRef(null);

  // Auto-save campaign after tile generation
  useEffect(() => {
    if (!state || !currentCampaignId) return;

    // Save campaign with updated state
    const updatedCampaign = {
      ...state,
      id: currentCampaignId,
      lastPlayedAt: new Date().toISOString()
    };
    saveCampaign(updatedCampaign);
  }, [state, currentCampaignId]);

  return [state, dispatch, { currentCampaignId, setCurrentCampaignId }];
}
```

**Integration with App.jsx**:

```jsx
import CampaignManager from './components/CampaignManager';
import OnboardingScreen from './components/OnboardingScreen';

function App() {
  const [state, dispatch, { currentCampaignId, setCurrentCampaignId }] = useGameState();
  const [showCampaignManager, setShowCampaignManager] = useState(!currentCampaignId);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // No active campaign → show campaign manager
  if (showCampaignManager) {
    return (
      <CampaignManager
        onLoadCampaign={(id) => {
          setCurrentCampaignId(id);
          setShowCampaignManager(false);
        }}
        onNewCampaign={() => {
          setShowOnboarding(true);
          setShowCampaignManager(false);
        }}
      />
    );
  }

  // Creating new campaign → show onboarding
  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={({ campaignName, party, gold }) => {
          const newCampaignId = createCampaign(campaignName, {
            party,
            gold,
            ...initialState
          });
          setCurrentCampaignId(newCampaignId);
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Campaign loaded → show main app
  return (
    <div className="app">
      <AppHeader
        campaignName={state?.name}
        onBackToCampaigns={() => setShowCampaignManager(true)}
      />
      {/* ... rest of main app */}
    </div>
  );
}
```

**Features:**
- Campaign manager with 3 save slots
- Campaign names and hero names displayed
- Campaign statistics (rooms explored, gold)
- Load/Delete/Export/Import campaigns
- Per-character starting gold (rolled per class, pooled for party)
- Campaign metadata (created, last played)
- Automatic save after each tile generation
- "Back to Campaigns" button in main app

**Files to create:**
- `src/components/CampaignManager.jsx`
- `src/components/OnboardingScreen.jsx`
- `src/utils/campaignStorage.js`

**Files to modify:**
- `src/data/classes.js` (add `startingWealth` to each class definition)
- `src/hooks/useGameState.js` (update for multi-campaign support)
- `src/App.jsx` (add campaign manager flow)
- `src/components/layout/AppHeader.jsx` (add back to campaigns button)

**Success Criteria:**
- [ ] Campaign Manager shows 3 save slots
- [ ] Can create new campaign with name
- [ ] OnboardingScreen walks through party creation
- [ ] Per-character gold is rolled based on class
- [ ] Gold is pooled correctly
- [ ] Campaign list shows hero names
- [ ] Load/Delete/Export/Import all work
- [ ] Auto-save happens after tile generation
- [ ] Switch between campaigns seamlessly
- [ ] All components are accessible (ARIA labels)
- [ ] No functionality broken from Week 2

---

#### Task 3.6: Week 3 Review (1 hour)

Update CHANGELOG:

```markdown
## Week 3 - Component Decomposition (Date: YYYY-MM-DD)

### Changed
- Split ActionPane into subcomponents (~700 lines → ~250 lines)
- Extracted combat phases from Combat.jsx (~1043 lines → ~760 lines)
- Created StatCard component for reuse

### Added
- PartyTurnPhase, MonsterTurnPhase components
- AbilityButtons component
- Combat phase components (Reaction, Initiative, Victory)
- StatCard reusable component
- OnboardingScreen for first-time user experience

### Improved
- New user onboarding flow with guided party creation
- Step-by-step hero creation (name, class, trait)
- Starting gold roll and equipment setup

### Metrics
- ActionPane: 700 → 250 lines (-64%)
- Combat: 1043 → 760 lines (-27%)
- New components: 9 (including OnboardingScreen)
- Code duplication reduced: ~300 lines
- UX improvement: First load experience now has clear guidance
```

**Week 3 Completion Checklist:**
- [ ] ActionPane < 300 lines
- [ ] Combat.jsx started decomposition
- [ ] No functionality broken
- [ ] All tests passing

---

## WEEK 4: State & Utilities Refactoring
**Focus:** Split god utilities, compose reducer
**Effort:** 8-10 hours
**Risk:** Medium-High

### Day 1 (3-4 hours): Split gameActions.js

#### Task 4.1: Create Domain Action Files (3 hours)
**Priority:** 🔴 CRITICAL

**Strategy:** Split 1766-line file into 6 domain files

Create directory: `src/gameActions/`

**File 1:** `src/gameActions/monsterActions.js` (~300 lines)
```javascript
// Move all monster-related functions:
// - spawnMonster()
// - createMonster()
// - rollMonsterReaction()
// - applyMonsterAbility()

export const spawnMonster = (dispatch, type, level) => {
  // ... implementation
};
```

**File 2:** `src/gameActions/combatActions.js` (~300 lines)
```javascript
// Move all combat-related functions:
// - performAttack()
// - performDefense()
// - calculateDamage()
// - resolveCombat()

export const performAttack = (dispatch, attacker, target) => {
  // ... implementation
};
```

**File 3:** `src/gameActions/dungeonActions.js` (~400 lines)
```javascript
// Move all dungeon-related functions:
// - generateRoom()
// - rollDoor()
// - rollTrap()
// - rollSpecialFeature()

export const generateRoom = (dispatch) => {
  // ... implementation
};
```

**File 4:** `src/gameActions/treasureActions.js` (~200 lines)
```javascript
// Move all treasure-related functions:
// - rollTreasure()
// - rollGold()
// - rollEquipment()

export const rollTreasure = (dispatch) => {
  // ... implementation
};
```

**File 5:** `src/gameActions/spellActions.js` (~200 lines)
```javascript
// Move all spell-related functions:
// - castSpell()
// - performCastSpell()
// - rollSpellDamage()

export const performCastSpell = (dispatch, caster, spellKey, context) => {
  // ... implementation
};
```

**File 6:** `src/gameActions/abilityActions.js` (~200 lines)
```javascript
// Move all ability-related functions:
// - useClericHeal()
// - useBarbarianRage()
// - useHalflingLuck()

export const useClericHeal = (dispatch, clericIdx, targetIdx) => {
  // ... implementation
};
```

**File 7:** `src/gameActions/index.js`
```javascript
// Re-export all functions
export * from './monsterActions';
export * from './combatActions';
export * from './dungeonActions';
export * from './treasureActions';
export * from './spellActions';
export * from './abilityActions';
```

**Migration Strategy:**
1. Create new files one at a time
2. Copy functions to new files
3. Update imports in one component at a time
4. Test after each component
5. Delete old gameActions.js only when all imports updated

**Files to create:**
- `src/gameActions/monsterActions.js`
- `src/gameActions/combatActions.js`
- `src/gameActions/dungeonActions.js`
- `src/gameActions/treasureActions.js`
- `src/gameActions/spellActions.js`
- `src/gameActions/abilityActions.js`
- `src/gameActions/index.js`

**Files to update:** 20+ component files

**Success Criteria:**
- [ ] gameActions.js deleted
- [ ] All imports updated to new structure
- [ ] No functionality broken
- [ ] Each domain file < 400 lines

---

### Day 2 (3-4 hours): Compose Reducer

#### Task 4.2: Create Domain Reducers (3 hours)
**Priority:** 🟠 HIGH

Create directory: `src/state/reducers/`

**File 1:** `src/state/reducers/partyReducer.js` (~150 lines)
```javascript
export function partyReducer(state, action) {
  switch (action.type) {
    case 'ADD_HERO':
      if (state.party.length >= 4) return state;
      return { ...state, party: [...state.party, action.h] };

    case 'DEL_HERO':
      return {
        ...state,
        party: state.party.filter((_, i) => i !== action.i)
      };

    case 'UPD_HERO':
      return {
        ...state,
        party: state.party.map((h, i) =>
          i === action.i ? { ...h, ...action.u } : h
        )
      };

    default:
      return state;
  }
}
```

**File 2:** `src/state/reducers/combatReducer.js` (~200 lines)
```javascript
export function combatReducer(state, action) {
  switch (action.type) {
    case 'ADD_MONSTER':
      return { ...state, monsters: [...state.monsters, action.m] };

    case 'UPD_MONSTER':
      return {
        ...state,
        monsters: state.monsters.map((m, i) =>
          i === action.i ? { ...m, ...action.u } : m
        )
      };

    case 'CLEAR_MONSTERS':
      return { ...state, monsters: [] };

    default:
      return state;
  }
}
```

**File 3:** `src/state/reducers/dungeonReducer.js` (~150 lines)
Handle grid, doors, traps.

**File 4:** `src/state/reducers/inventoryReducer.js` (~100 lines)
Handle equipment, gold.

**File 5:** `src/state/reducers/logReducer.js` (~50 lines)
Handle log messages.

**File 6:** `src/state/reducers/combineReducers.js`
```javascript
export const combineReducers = (reducers) => {
  return (state = {}, action) => {
    // Try each reducer
    let nextState = state;
    for (const [key, reducer] of Object.entries(reducers)) {
      const previousStateForKey = nextState[key] || nextState;
      const nextStateForKey = reducer(previousStateForKey, action);
      if (nextStateForKey !== previousStateForKey) {
        nextState = { ...nextState, ...nextStateForKey };
      }
    }
    return nextState;
  };
};
```

**Update main reducer:**
```javascript
// src/state/reducer.js
import { combineReducers } from './reducers/combineReducers';
import { partyReducer } from './reducers/partyReducer';
import { combatReducer } from './reducers/combatReducer';
import { dungeonReducer } from './reducers/dungeonReducer';
import { inventoryReducer } from './reducers/inventoryReducer';
import { logReducer } from './reducers/logReducer';

export const reducer = combineReducers({
  party: partyReducer,
  combat: combatReducer,
  dungeon: dungeonReducer,
  inventory: inventoryReducer,
  log: logReducer
});
```

**Files to create:**
- `src/state/reducers/partyReducer.js`
- `src/state/reducers/combatReducer.js`
- `src/state/reducers/dungeonReducer.js`
- `src/state/reducers/inventoryReducer.js`
- `src/state/reducers/logReducer.js`
- `src/state/reducers/combineReducers.js`

**Files to update:**
- `src/state/reducer.js` (becomes ~50 lines)

**Success Criteria:**
- [ ] Reducer split into domain files
- [ ] Each domain reducer < 200 lines
- [ ] All actions still work
- [ ] State shape unchanged

---

### Day 3 (2 hours): Selectors & Action Creators

#### Task 4.3: Create Selector Functions (1 hour)
**Priority:** 🟡 MEDIUM

Create `src/state/selectors.js`:

```javascript
// Party selectors
export const selectParty = (state) => state.party;
export const selectActiveHeroes = (state) => state.party.filter(h => h.hp > 0);
export const selectHCL = (state) =>
  state.party.length > 0 ? Math.max(...state.party.map(h => h.lvl)) : 1;

// Combat selectors
export const selectMonsters = (state) => state.monsters || [];
export const selectActiveMonsters = (state) =>
  selectMonsters(state).filter(m =>
    m.hp > 0 && (m.count === undefined || m.count > 0)
  );
export const selectCombatWon = (state) =>
  selectMonsters(state).length > 0 && selectActiveMonsters(state).length === 0;

// Dungeon selectors
export const selectGrid = (state) => state.grid;
export const selectDoors = (state) => state.doors;

// Gold/Inventory selectors
export const selectGold = (state) => state.gold;
export const selectClues = (state) => state.clues;
```

Update 5-10 components to use selectors instead of direct state access.

---

#### Task 4.4: Create Action Creators (1 hour)
**Priority:** 🟡 MEDIUM

Create `src/actions/actionCreators.js`:

```javascript
// Party actions
export const addHero = (hero) => ({ type: 'ADD_HERO', h: hero });
export const deleteHero = (index) => ({ type: 'DEL_HERO', i: index });
export const updateHero = (index, updates) => ({ type: 'UPD_HERO', i: index, u: updates });

// Monster actions
export const addMonster = (monster) => ({ type: 'ADD_MONSTER', m: monster });
export const updateMonster = (index, updates) => ({ type: 'UPD_MONSTER', i: index, u: updates });
export const clearMonsters = () => ({ type: 'CLEAR_MONSTERS' });

// Log actions
export const logMessage = (message) => ({ type: 'LOG', t: message });

// Hero status
export const setHeroStatus = (heroIdx, statusKey, value) => ({
  type: 'SET_HERO_STATUS',
  heroIdx,
  statusKey,
  value
});
```

Update 3-5 components to use action creators.

---

#### Task 4.5: Week 4 Review (30 minutes)

Update CHANGELOG:

```markdown
## Week 4 - State & Utilities Refactoring (Date: YYYY-MM-DD)

### Changed
- Split gameActions.js into 6 domain files (1766 lines → 6 × ~250 lines)
- Composed reducer into domain reducers (688 lines → 6 × ~100 lines)
- Created selector functions for common state access patterns
- Created action creator functions for type safety

### Added
- Domain-specific action files (monsterActions, combatActions, etc.)
- Domain-specific reducers (partyReducer, combatReducer, etc.)
- Selector functions (selectors.js)
- Action creators (actionCreators.js)

### Metrics
- gameActions.js: 1766 → 0 lines (split into 6 files)
- reducer.js: 688 → 50 lines (domain reducers handle logic)
- Selectors created: 15+
- Action creators: 20+
```

**Week 4 Completion Checklist:**
- [ ] gameActions.js deleted
- [ ] Reducer composed into domains
- [ ] Selectors created
- [ ] Action creators created
- [ ] No functionality broken

---

## WEEK 5: Performance & Accessibility
**Focus:** Optimize renders, add a11y
**Effort:** 6-8 hours
**Risk:** Low

### Day 1 (3 hours): Performance Optimization

#### Task 5.1: Add React.memo to Components (1.5 hours)
**Priority:** 🟡 MEDIUM

**Target components for memoization:**

```jsx
// src/components/actionPane/EventCard.jsx
import React, { memo } from 'react';

const EventCard = memo(function EventCard({ event, index }) {
  // ... component code
});

export default EventCard;
```

**Components to memoize:**
- EventCard
- ActiveMonsters
- CombatInitiative
- HeroCard
- MonsterCard
- DoorEdge (in Dungeon.jsx)
- All combat phase components

**Files to edit:** 10-15 component files

**Success Criteria:**
- [ ] 10+ components memoized
- [ ] Re-render count reduced (check React DevTools)

---

#### Task 5.2: Add useCallback to Event Handlers (1.5 hours)
**Priority:** 🟡 MEDIUM

**Pattern:**

```jsx
// BEFORE
const handleAttack = (heroIdx) => {
  // ... logic
};

// AFTER
const handleAttack = useCallback((heroIdx) => {
  // ... logic
}, [dispatch, state.monsters]); // Dependencies
```

**Target locations:**
- ActionPane.jsx (10+ handlers)
- Combat.jsx (15+ handlers)
- Party.jsx (8+ handlers)
- Dungeon.jsx (5+ handlers)

**Files to edit:** 5-10 component files

---

### Day 2 (2-3 hours): Accessibility Implementation

#### Task 5.3: Add ARIA Labels Everywhere (2 hours)
**Priority:** 🟠 HIGH

**Comprehensive ARIA audit:**

**Interactive elements without labels:**
```jsx
// Header dice buttons
<Button onClick={...} aria-label="Roll d6">
  <Dices size={18} />
</Button>

// HP adjustment buttons
<Button
  onClick={...}
  aria-label={`Decrease ${hero.name} HP`}
  aria-describedby={`${hero.name}-hp-current`}
>
  -
</Button>

// Combat attack buttons
<Button
  onClick={...}
  aria-label={`${hero.name} attacks ${monster.name}`}
  aria-disabled={hero.hp <= 0}
>
  {hero.name}
</Button>

// Modal close buttons
<button
  onClick={onClose}
  aria-label="Close dialog"
>
  ✕
</button>
```

**Add ARIA live regions:**
```jsx
// Log component
<div
  role="log"
  aria-live="polite"
  aria-atomic="false"
>
  {state.log.map(...)}
</div>

// Combat results
<div
  role="status"
  aria-live="assertive"
  aria-atomic="true"
>
  {combatResult}
</div>
```

**Add dialog roles:**
```jsx
// All modals
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Settings</h2>
  {/* ... */}
</div>
```

**Files to edit:** 15-20 component files

**Success Criteria:**
- [ ] All interactive elements have labels
- [ ] All modals have dialog role
- [ ] Log has aria-live
- [ ] Screen reader can navigate entire app

---

#### Task 5.4: Keyboard Navigation (1 hour)
**Priority:** 🟡 MEDIUM

**Add keyboard shortcuts:**

```jsx
// src/App.jsx
useEffect(() => {
  const handleKeyboard = (e) => {
    // Escape closes modals
    if (e.key === 'Escape') {
      setShowSettings(false);
      setShowRules(false);
      // ... close all modals
    }

    // Ctrl/Cmd + D for dice
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      // Focus dice roller
    }

    // Tab through combat actions
    // Space/Enter to activate
  };

  window.addEventListener('keydown', handleKeyboard);
  return () => window.removeEventListener('keydown', handleKeyboard);
}, []);
```

**Add focus management:**
```jsx
// When modal opens, focus first element
useEffect(() => {
  if (isOpen) {
    const firstInput = modalRef.current?.querySelector('input, button');
    firstInput?.focus();
  }
}, [isOpen]);
```

---

### Day 3 (2 hours): Final Performance Tweaks

#### Task 5.5: Fix Key Props (1 hour)
**Priority:** 🟡 MEDIUM

**Problem:** Using index as key

```jsx
// BEFORE - Bad
{state.log.map((entry, index) => (
  <div key={index}>...</div>
))}

// AFTER - Good (if entries have IDs)
{state.log.map((entry, index) => (
  <div key={entry.id || `log-${index}-${entry.timestamp}`}>...</div>
))}

// OR add unique IDs when logging:
dispatch({
  type: 'LOG',
  t: message,
  id: `log-${Date.now()}-${Math.random()}`
});
```

**Files to audit:** Log.jsx, ActionPane.jsx, Party.jsx

---

#### Task 5.6: Week 5 Review (1 hour)

Update CHANGELOG:

```markdown
## Week 5 - Performance & Accessibility (Date: YYYY-MM-DD)

### Added
- React.memo to 15+ components
- useCallback to 40+ event handlers
- ARIA labels to all interactive elements
- ARIA live regions for dynamic content
- Dialog roles for all modals
- Keyboard navigation (Escape, shortcuts)
- Focus management for modals

### Changed
- Fixed key props (index → unique IDs)
- Optimized re-renders in list components

### Metrics
- Components memoized: 15
- Event handlers with useCallback: 40+
- ARIA labels added: 100+
- Keyboard shortcuts: 5
```

**Week 5 Completion Checklist:**
- [ ] Performance optimizations complete
- [ ] ARIA labels everywhere
- [ ] Keyboard navigation working
- [ ] Passes accessibility audit (Lighthouse/axe)

---

## WEEK 6: Testing & Polish
**Focus:** Set up tests, documentation, final cleanup
**Effort:** 6-8 hours
**Risk:** Low

### Day 1 (3 hours): Testing Infrastructure

#### Task 6.1: Set Up Vitest (1 hour)
**Priority:** 🟡 MEDIUM

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Create `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ],
    },
  },
});
```

Create `src/test/setup.js`:

```javascript
import '@testing-library/jest-dom';
```

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

#### Task 6.2: Write Core Tests (2 hours)
**Priority:** 🟡 MEDIUM

**Test 1:** Reducer tests
```javascript
// src/state/reducers/__tests__/partyReducer.test.js
import { describe, test, expect } from 'vitest';
import { partyReducer } from '../partyReducer';

describe('partyReducer', () => {
  test('ADD_HERO adds hero to party', () => {
    const state = { party: [] };
    const action = {
      type: 'ADD_HERO',
      h: { id: 1, name: 'Test', key: 'warrior' }
    };

    const newState = partyReducer(state, action);
    expect(newState.party).toHaveLength(1);
    expect(newState.party[0].name).toBe('Test');
  });

  test('ADD_HERO fails when party is full', () => {
    const state = {
      party: [
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }
      ]
    };
    const action = { type: 'ADD_HERO', h: { id: 5 } };

    const newState = partyReducer(state, action);
    expect(newState.party).toHaveLength(4);
  });
});
```

**Test 2:** Selector tests
```javascript
// src/state/__tests__/selectors.test.js
import { describe, test, expect } from 'vitest';
import { selectActiveMonsters, selectCombatWon } from '../selectors';

describe('selectors', () => {
  test('selectActiveMonsters filters dead monsters', () => {
    const state = {
      monsters: [
        { id: 1, hp: 5 },
        { id: 2, hp: 0 },
        { id: 3, hp: 3 }
      ]
    };

    const active = selectActiveMonsters(state);
    expect(active).toHaveLength(2);
    expect(active[0].id).toBe(1);
    expect(active[1].id).toBe(3);
  });
});
```

**Test 3:** Component tests
```javascript
// src/components/ui/__tests__/Button.test.jsx
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  test('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('data-button', 'primary');
  });

  test('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

**Files to create:**
- `vitest.config.js`
- `src/test/setup.js`
- `src/state/reducers/__tests__/partyReducer.test.js`
- `src/state/__tests__/selectors.test.js`
- `src/components/ui/__tests__/Button.test.jsx`

**Success Criteria:**
- [ ] Test infrastructure working
- [ ] 10+ tests written and passing
- [ ] Coverage report generated

---

### Day 2 (2 hours): Documentation

#### Task 6.3: Update README.md (1 hour)
**Priority:** 🟡 MEDIUM

Update `README.md`:

```markdown
# Four Against Darkness - Digital Companion

A React-based companion app for the solo tabletop RPG "Four Against Darkness".

## Features

- 🎲 Party management with 12 character classes
- 🗺️ Interactive dungeon mapping
- ⚔️ Streamlined combat system
- 📊 Campaign mode with persistence
- 🎨 3 theme options (Default, RPGUI, Doodle)
- ♿ Full accessibility support
- 📱 Mobile responsive

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Testing

\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Project Structure

\`\`\`
src/
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   ├── layout/      # Layout components
│   └── ...          # Feature components
├── gameActions/      # Game logic by domain
├── state/           # State management
│   ├── reducers/    # Domain reducers
│   ├── selectors.js # State selectors
│   └── actions.js   # Action types
├── hooks/           # Custom React hooks
├── data/            # Game data & tables
├── utils/           # Utility functions
└── styles/          # Global styles & themes
\`\`\`

## Technologies

- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **localStorage** - Persistence

## License

MIT

## Credits

Based on "Four Against Darkness" by Andrea Sfiligoi
```

---

#### Task 6.4: Create CONTRIBUTING.md (1 hour)
**Priority:** 🟡 MEDIUM

Create `CONTRIBUTING.md`:

```markdown
# Contributing Guide

## Development Setup

1. Clone repository
2. Run `npm install`
3. Run `npm run dev`

## Code Style

### Components
- Use functional components with hooks
- Memoize expensive components with `React.memo`
- Use `useCallback` for event handlers passed to children
- Add PropTypes or TypeScript for type safety

### Naming Conventions
- Components: PascalCase (`Button.jsx`)
- Hooks: camelCase with `use` prefix (`useCombatFlow.js`)
- Utils: camelCase (`gameActions.js`)
- Constants: UPPER_SNAKE_CASE (`COMBAT_PHASES`)

### File Organization
- Group by feature/domain when possible
- UI primitives in `components/ui/`
- Layout components in `components/layout/`
- Feature components in `components/[feature]/`

### Accessibility
- All interactive elements must have ARIA labels
- Use semantic HTML
- Test with keyboard navigation
- Run accessibility audits (Lighthouse/axe)

### Testing
- Write tests for new features
- Test reducers, selectors, and utilities at 100%
- Test components at 60%+
- Run `npm test` before committing

## Submitting Changes

1. Create feature branch from `main`
2. Make changes
3. Write/update tests
4. Run `npm test`
5. Update CHANGELOG.md
6. Submit pull request

## Component Patterns

### Button Usage
\`\`\`jsx
import { Button } from './ui/Button';

<Button
  variant="primary"
  size="md"
  dataAction="unique-id"
  onClick={handleClick}
>
  Click Me
</Button>
\`\`\`

### Card Usage
\`\`\`jsx
import { Card, HeroCard } from './ui/Card';

<HeroCard hero={hero}>
  {/* Hero content */}
</HeroCard>
\`\`\`

### Action Creators
\`\`\`jsx
import { addHero } from '../actions/actionCreators';

dispatch(addHero(newHero));
\`\`\`

### Selectors
\`\`\`jsx
import { selectActiveHeroes } from '../state/selectors';

const activeHeroes = selectActiveHeroes(state);
\`\`\`

## Questions?

Open an issue or discussion on GitHub.
```

---

### Day 3 (2 hours): Final Cleanup

#### Task 6.5: Remove Dead Code (1 hour)
**Priority:** 🟡 MEDIUM

**Actions:**
1. Search for commented code: `//` and `/* */`
2. Remove old files if any (App_ending.jsx mentioned in git status)
3. Remove unused imports (use ESLint or editor)
4. Remove console.log statements

```bash
# Find commented code
grep -r "\/\/" src/ | wc -l

# Remove old files
rm src/App_ending.jsx

# Clean up console logs (but keep console.error in catch blocks)
```

---

#### Task 6.6: Optimize Build Config (30 minutes)
**Priority:** 🟡 MEDIUM

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/4ad-tabs/',
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui': [
            './src/components/ui/Button.jsx',
            './src/components/ui/Card.jsx'
          ]
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});
```

---

#### Task 6.7: Final Review & CHANGELOG (30 minutes)
**Priority:** 🟠 HIGH

Update CHANGELOG:

```markdown
## Week 6 - Testing & Polish (Date: YYYY-MM-DD)

### Added
- Vitest testing infrastructure
- 20+ unit tests (reducers, selectors, components)
- CONTRIBUTING.md guide
- Updated README.md with architecture info
- Build optimizations (code splitting)

### Removed
- Dead code and commented sections
- Unused imports
- Old temporary files

### Metrics
- Test coverage: 70%+
- Build size: Optimized with code splitting
- Documentation: Complete
```

**Final Project Review:**
```markdown
## Refactoring Summary - Complete

### JavaScript Architecture: 6/10 → 9/10
- Split god components (Combat 1043→500 lines, ActionPane 700→250 lines)
- Split god utilities (gameActions 1766→6×250 lines)
- Composed reducer (688→50 lines main + domains)
- Added selectors and action creators

### CSS Architecture: 4/10 → 9/10
- Created UI component library (Button, Card)
- Added semantic data attributes everywhere
- Removed 90% of !important flags
- Consolidated themes

### Code Quality: 5/10 → 9/10
- Added error boundaries
- Fixed localStorage safety
- Added 70%+ test coverage
- Implemented full accessibility
- Performance optimizations (memo, useCallback)

### Total Effort: 46 hours over 6 weeks

### Lines of Code Impact:
- Reduced: ~1500 lines (through deduplication)
- Added: ~800 lines (tests, new components)
- Net: -700 lines with better organization

### Key Wins:
✅ No file > 500 lines
✅ All buttons/cards use components
✅ Semantic data attributes everywhere
✅ Error handling implemented
✅ Accessibility complete
✅ Testing infrastructure ready
✅ Documentation complete
```

**Week 6 Completion Checklist:**
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Dead code removed
- [ ] Build optimized
- [ ] CHANGELOG.md final update

---

## 🎯 Post-Refactoring Maintenance

### Monthly Checklist
- [ ] Review test coverage
- [ ] Update dependencies
- [ ] Check bundle size
- [ ] Run accessibility audit
- [ ] Review error logs

### Before Adding Features
- [ ] Ensure it fits current architecture
- [ ] Write tests first
- [ ] Update documentation
- [ ] Consider performance impact

### Code Review Checklist
- [ ] No files > 500 lines
- [ ] Components use UI library
- [ ] Data attributes present
- [ ] ARIA labels on interactivity
- [ ] Tests written
- [ ] CHANGELOG updated

---

## 📚 Reference Documents

Throughout this plan, refer to:
- `ARCHITECTURE_AUDIT.md` - Full architectural analysis
- `CSS_ARCHITECTURE_AUDIT.md` - CSS-specific issues
- `REFACTORING_ROADMAP.md` - Original phase-based plan
- This document - Master timeline

---

## 🚀 Getting Started

**To begin Week 1:**

1. Review this entire document
2. Understand the week-by-week flow
3. Start with Day 1, Task 1.1
4. Work through tasks in order
5. Update CHANGELOG.md as you go
6. Test after each task
7. Commit frequently with descriptive messages

**Commit Message Format:**
```
type(scope): description

Examples:
feat(ui): add Button component
fix(storage): add localStorage quota handling
refactor(combat): extract PartyTurnPhase component
test(reducer): add partyReducer tests
docs(readme): update architecture section
```

**When You Get Stuck:**
- Refer back to audit documents
- Check existing patterns in codebase
- Test in isolation
- Ask Claude for specific help

**Remember:**
- Progress > Perfection
- Test frequently
- Commit often
- One task at a time
- Take breaks!

---

## 📊 Success Metrics

At the end of 6 weeks, you should have:

### Code Quality
✅ No file > 500 lines
✅ No function > 50 lines
✅ 70%+ test coverage
✅ Zero console errors
✅ Passes accessibility audit

### Performance
✅ Initial load < 2s
✅ Component renders < 30ms
✅ localStorage saves < 500ms

### Developer Experience
✅ Find code in < 30s
✅ Add feature in < 4 hours
✅ New dev productive in < 1 day
✅ Can target any element in DevTools
✅ Can write reliable tests

### Maintainability
✅ Clear separation of concerns
✅ Consistent patterns throughout
✅ Comprehensive documentation
✅ Easy to extend with new features

---

**Good luck! 🎲⚔️🗺️**
