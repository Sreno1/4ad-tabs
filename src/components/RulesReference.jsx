import React, { useState } from 'react';
import { Book, X, ChevronDown, ChevronRight, Sword, Shield, Users, Sparkles, Skull, Heart, Map, Dice6 } from 'lucide-react';
import Tooltip from './Tooltip.jsx';
export { Tooltip };

// Quick reference data
const RULES_SECTIONS = {
  combat: {
    title: 'Combat Rules',
    icon: Sword,
    content: [
      { label: 'Attack Roll', text: 'Roll d6 + Attack modifier. Hit if result ≥ foe level.' },
      { label: 'Defense Roll', text: 'Roll d6 + Defense modifier. Block if result ≥ foe level.' },
      { label: 'Exploding 6s', text: 'Rolling a 6 lets you roll again and add the result.' },
      { label: 'Multiple Foes', text: 'Each hero can only attack once per round, but may be attacked by multiple foes.' },
      { label: 'Damage', text: 'Failed defense = 1 HP damage (unless special ability).' },
      { label: 'Reactions', text: 'Some monsters may negotiate, flee, or have special behaviors.' }
    ]
  },
  classes: {
    title: 'Class Abilities',
    icon: Users,
    content: [
      { label: 'Warrior', text: 'ATK +Level. Can use all weapons and armor.' },
      { label: 'Cleric', text: 'ATK +½Level (+Level vs undead). Heal×3, Bless×3 per adventure.' },
      { label: 'Rogue', text: 'ATK +Level when outnumbered. DEF +Level. +Level to trap disarm.' },
      { label: 'Wizard', text: 'Level+2 spell slots per adventure. Various powerful spells.' },
      { label: 'Barbarian', text: 'ATK +Level. Rage: +2 ATK, -1 DEF for encounter. Cannot use magic items.' },
      { label: 'Halfling', text: 'ATK +Level with sling. DEF +Level vs large. Level+1 Luck points.' },
      { label: 'Dwarf', text: 'ATK +Level melee. DEF +1 vs large. Can sense gold direction.' },
      { label: 'Elf', text: 'ATK +Level (no 2H weapons). Level spell slots per adventure.' }
    ]
  },
  saves: {
    title: 'Save Rolls',
    icon: Shield,
    content: [
      { label: 'When to Save', text: 'Roll when taking lethal damage (HP would reach 0).' },
      { label: 'Save Roll', text: 'Roll d6. Success threshold depends on damage source.' },
      { label: 'Traps', text: 'Save on 5+ (pit), 4+ (darts), 3+ (poison gas).' },
      { label: 'Monsters', text: 'Save on (7 - monster level)+. Level 6+ always need 1+.' },
      { label: 'Success', text: 'Character survives with 1 HP and "wounded" status.' },
      { label: 'Shield Bonus', text: '+1 to save rolls when equipped with a shield.' },
      { label: 'Re-rolls', text: 'Cleric Blessing or Halfling Luck can re-roll failed saves.' }
    ]
  },
  magic: {
    title: 'Magic System',
    icon: Sparkles,
    content: [
      { label: 'Spell Slots', text: 'Wizard: Level+2 slots. Elf: Level slots per adventure.' },
      { label: 'Casting', text: 'Choose a spell and target. Effect resolves immediately.' },
      { label: 'Fireball', text: 'Deals 1d6 damage to ALL enemies in encounter.' },
      { label: 'Lightning', text: 'Deals 2d6 damage to ONE enemy.' },
      { label: 'Sleep', text: 'Enemies up to L3 skip their turn (not undead).' },
      { label: 'Shield', text: '+2 defense for caster this encounter.' },
      { label: 'Escape', text: 'Party automatically escapes combat.' },
      { label: 'Healing', text: 'Restore 1d6 HP to one ally.' }
    ]
  },
  monsters: {
    title: 'Monster Types',
    icon: Skull,
    content: [
      { label: 'Minions (L1-2)', text: 'Vermin like rats, goblins. 1-2 HP each.' },
      { label: 'Standard (L3-4)', text: 'Orcs, skeletons, lizardmen. 3-4 HP each.' },
      { label: 'Major Foes (L5)', text: 'Trolls, ogres. Equal to party HCL. 5+ HP.' },
      { label: 'Bosses (L6+)', text: 'Dragons, demons. HCL+1. Special abilities.' },
      { label: 'Undead', text: 'Immune to Sleep. Clerics deal +Level damage.' },
      { label: 'Regenerate', text: 'Recovers 1 HP at start of each round.' },
      { label: 'Boss Ability', text: 'Attacks twice per round.' }
    ]
  },
  exploration: {
    title: 'Exploration',
    icon: Map,
    content: [
      { label: 'Room Types', text: 'Roll d66 for room contents (empty, monsters, treasure, special).' },
      { label: 'Doors', text: 'Normal (auto-open), Stuck (STR check), Locked (pick/break), Trapped.' },
      { label: 'Traps', text: 'Rogue gets +Level to detect. Disarm or risk triggering.' },
      { label: 'Search', text: 'Roll d6 in empty rooms. 1-2: wandering monster, 3-6: possible treasure.' },
      { label: 'Wandering', text: 'On failed search or specific events, roll d6 for random monster.' },
      { label: 'Clues', text: 'Collect clues to unlock the boss room. Need 3+ for final battle.' },
      { label: 'Boss Room', text: 'Final encounter. Defeat boss to complete the dungeon.' }
    ]
  },
  dice: {
    title: 'Dice Mechanics',
    icon: Dice6,
    content: [
      { label: 'd6', text: 'Standard six-sided die. Most common roll.' },
      { label: '2d6', text: 'Roll two d6 and sum. Used for damage, treasure.' },
      { label: 'd66', text: 'Roll two d6: first is tens, second is ones (11-66).' },
      { label: 'Modifiers', text: 'Add level, class bonuses, or equipment to rolls.' },
      { label: 'Exploding', text: 'On max roll, roll again and add. Can chain.' },
      { label: 'Advantage', text: 'Roll twice, take better result (some abilities).' }
    ]
  },
  healing: {
    title: 'Healing & Recovery',
    icon: Heart,
    content: [
      { label: 'Cleric Heal', text: 'Restore 1d6+Level HP to one ally. 3 uses per adventure.' },
      { label: 'Healing Spell', text: 'Wizard/Elf spell: restore 1d6 HP (costs spell slot).' },
      { label: 'Potions', text: 'Healing potions restore HP when consumed.' },
      { label: 'Level Up', text: 'Gain +1 HP when leveling up.' },
      { label: 'Rest', text: 'No rest mechanic in standard rules (optional house rule).' },
      { label: 'Death', text: 'At 0 HP, attempt save roll. Fail = permanent death.' }
    ]
  }
};

// Tooltips for common game elements
export const TOOLTIPS = {
  // Combat tooltips
  attackRoll: 'Roll d6 + Attack modifier. Hit if ≥ foe level. 6s explode!',
  defenseRoll: 'Roll d6 + Defense modifier. Block if ≥ foe level.',
  foeLevel: 'Target number to hit. Higher level = harder to hit.',
  damage: 'HP lost when defense fails. Usually 1 unless special.',
  
  // Class ability tooltips
  heal: 'Cleric: Restore 1d6+Level HP. 3 uses per adventure.',
  bless: 'Cleric: Grant +1 to next roll OR re-roll a failed save.',
  rage: 'Barbarian: +2 ATK, -1 DEF for this encounter.',
  luck: 'Halfling: Re-roll any die OR re-roll a failed save.',
  spell: 'Cast a spell, consuming one spell slot.',
  
  // Resource tooltips
  gold: 'Currency for equipment and supplies between adventures.',
  clues: 'Collect 3+ clues to unlock the boss room.',
  minorEnc: 'Vermin and minion encounters. At 10, spawn wandering monster.',
  majorFoes: 'Stronger monsters (L5+). Track for campaign scoring.',
  
  // Status tooltips
  wounded: 'Survived a save roll. Still at 1 HP.',
  blessed: '+1 to next roll (from Cleric Bless).',
  poisoned: 'Take 1 damage at end of each round until cured.',
  
  // Exploration tooltips
  room: 'Click to cycle: empty → room → corridor → empty',
  door: 'Click edge to place door. Types: normal, stuck, locked, trapped.',
  search: 'Roll d6 to search. 1-2: danger, 3+: possible treasure.',
  
  // Dice tooltips
  d6: 'Roll one six-sided die (1-6).',
  d66: 'Roll two d6: first×10 + second (11-66).',
  exploding: 'On a 6, roll again and add to total!'
};

// PDF links - using Vite's automatic base path
const PDF_LINKS = [
  { name: 'Base Rules', file: 'base rules.pdf' },
  { name: 'Characters', file: 'characters.pdf' },
  { name: 'Combat', file: 'combat.pdf' },
  { name: 'Equipment', file: 'equipment.pdf' },
  { name: 'Exploration', file: 'exploration.pdf' },
  { name: 'Magic', file: 'magic.pdf' },
  { name: 'Saves', file: 'saves.pdf' },
  { name: 'Tables', file: 'tables.pdf' },
  { name: 'Full Rules', file: 'rules.pdf' }
];

export default function RulesReference({ isOpen, onClose }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [pdfViewer, setPdfViewer] = useState(null); // { name, url }
  
  if (!isOpen) return null;
  
  const toggleSection = (key) => {
    setExpandedSection(expandedSection === key ? null : key);
  };
  
  const openPdf = (pdf) => {
    // Use Vite's BASE_URL which is automatically set based on environment
    setPdfViewer({ name: pdf.name, url: `${import.meta.env.BASE_URL}${pdf.file}` });
  };
  
  const closePdf = () => {
    setPdfViewer(null);
  };
  
  // PDF Viewer Modal
  if (pdfViewer) {
    return (
      <div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-title"
      >
        <div className="bg-slate-800 rounded-lg w-full h-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-slate-700 flex-shrink-0">
            <h2 id="pdf-title" className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Book size={20} aria-hidden="true" />
              {pdfViewer.name}
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={pdfViewer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-amber-400 text-xs px-2 py-1 border border-slate-600 rounded"
                aria-label="Open PDF in new tab"
              >
                Open in New Tab
              </a>
              <button
                onClick={closePdf}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close PDF viewer"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* PDF Embed */}
          <div className="flex-1 overflow-hidden">
            <iframe
              src={pdfViewer.url}
              className="w-full h-full border-0"
              title={pdfViewer.name}
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
    >
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 id="rules-title" className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Book size={20} aria-hidden="true" />
              <span className="sr-only">Rules Reference</span>
            </h2>
            <label htmlFor="rules-modal-select" className="sr-only">Select Rules PDF</label>
            <select
              id="rules-modal-select"
              onChange={(e) => {
                const pdf = PDF_LINKS.find((p) => p.file === e.target.value);
                if (pdf) openPdf(pdf);
              }}
              defaultValue="rules.pdf"
              className="bg-slate-800 text-amber-400 hover:text-amber-300 px-3 py-1.5 text-sm rounded"
              aria-label="Select rules PDF to open"
            >
              {PDF_LINKS.map((pdf) => (
                <option key={pdf.file} value={pdf.file} className="bg-slate-800 text-slate-100">
                  {pdf.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close rules reference"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Quick Reference Sections */}
          {Object.entries(RULES_SECTIONS).map(([key, section]) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === key;
            
            return (
              <div key={key} className="bg-slate-900 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors"
                >
                  <Icon size={18} className="text-amber-400" />
                  <span className="font-medium flex-1 text-left">{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={18} className="text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="bg-slate-800 rounded p-2">
                        <span className="text-amber-300 font-medium text-sm">{item.label}: </span>
                        <span className="text-slate-300 text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* PDF Links Section */}
          <div className="bg-slate-900 rounded-lg p-3 mt-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Book size={14} />
              Rules PDFs
            </h3>
            <div className="flex items-center gap-2">
              <label htmlFor="rules-modal-select" className="sr-only">Select Rules PDF</label>
              <select
                id="rules-modal-select"
                onChange={(e) => {
                  const pdf = PDF_LINKS.find((p) => p.file === e.target.value);
                  if (pdf) openPdf(pdf);
                }}
                defaultValue="rules.pdf"
                className="bg-slate-800 text-amber-400 hover:text-amber-300 px-3 py-1.5 text-sm rounded w-full"
                aria-label="Select rules PDF to open"
              >
                {PDF_LINKS.map((pdf) => (
                  <option key={pdf.file} value={pdf.file} className="bg-slate-800 text-slate-100">
                    {pdf.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Quick Tips */}
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3 mt-4">
            <h3 className="text-sm font-bold text-amber-400 mb-2">💡 Quick Tips</h3>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Hover over buttons and labels for tooltips</li>
              <li>Combat: attack modifiers are automatically calculated</li>
              <li>Explore tab: click "Generate Room" to roll for room contents</li>
              <li>Save rolls trigger automatically on lethal damage</li>
              <li>Use class abilities before they're gone!</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-slate-700 text-center text-xs text-slate-500">
          Four Against Darkness © Andrea Sfiligoi. This is a digital companion app.
        </div>
      </div>
    </div>
  );
}

// Tooltip is provided by src/components/Tooltip.jsx (using Floating UI)
