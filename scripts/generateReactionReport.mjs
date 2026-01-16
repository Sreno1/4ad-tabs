import fs from 'fs';
import path from 'path';
import { MONSTER_TABLE, DEFAULT_REACTION_TABLE } from '../src/data/monsters.js';

const tablesTxt = fs.readFileSync(path.resolve('./public/tables.txt'), 'utf8');

// Heuristic: find lines that contain "Reactions (d6):" and capture species name and the remainder
const lines = tablesTxt.split('\n');

const reactionLines = [];
for (let i=0;i<lines.length;i++){
  const line = lines[i].trim();
  if (line.match(/Reactions \(d6\):/i)){
    // The species name is earlier on the same line; capture text up to 'Reactions'
    const before = lines[i].split('Reactions')[0].trim();
    // Extract species name by taking the last phrase before a period or comma
    const m = before.match(/(?:^|\.)\s*([^.,]+)\s*$/);
    const possibleName = m ? m[1].trim() : before;
    reactionLines.push({line: lines[i], speciesText: possibleName});
  }
}

// Build a simple name->key map from MONSTER_TABLE by lowercasing
const nameToKey = {};
Object.entries(MONSTER_TABLE).forEach(([key, tpl]) => {
  nameToKey[tpl.name.toLowerCase()] = key;
});

const report = [];
reactionLines.forEach(r => {
  // Normalize the speciesText
  const name = r.speciesText.toLowerCase();
  // Try exact match first
  let key = nameToKey[name];
  if (!key) {
    // try trimming counts and descriptors, e.g., 'd6 Hobgoblins, HCL+3 Minions.' -> 'hobgoblins'
    const words = name.split(/[, ]+/).filter(Boolean);
    for (const w of words.reverse()){
      if (nameToKey[w]){ key = nameToKey[w]; break; }
      // try capitalized
      const cap = w.charAt(0).toUpperCase() + w.slice(1);
      if (nameToKey[cap.toLowerCase()]){ key = nameToKey[cap.toLowerCase()]; break; }
    }
  }
  report.push({ raw: r.line.trim(), speciesText: r.speciesText, key: key || null });
});

// Now compare parsed entries to MONSTER_TABLE
const diffs = [];
report.forEach(entry => {
  if (!entry.key) {
    diffs.push({ status: 'no-match', entry });
    return;
  }
  const key = entry.key;
  const tpl = MONSTER_TABLE[key];
  // Parse the reaction phrase after the colon
  const m = entry.raw.match(/Reactions \(d6\):\s*(.*)$/i);
  const canonical = m ? m[1].trim() : null;
  const codeTable = tpl.reactionTable || DEFAULT_REACTION_TABLE;
  // build phrase from codeTable for comparison
  const phrase = [];
  for (let i=1;i<=6;i++){
    const k = codeTable[i];
    phrase.push(`${i}: ${k}`);
  }
  const codePhrase = phrase.join(', ');
  const matches = canonical ? canonical.toLowerCase().includes(tpl.name.toLowerCase().split(' ')[0]) || true : false; // conservative
  diffs.push({ key, name: tpl.name, canonical, codePhrase });
});

// Write human readable report
let out = 'Reaction comparison report\n\n';
report.forEach(r => {
  if (!r.key) {
    out += `UNMATCHED LINE: ${r.raw} (could not map species)\n`;
  } else {
    const tpl = MONSTER_TABLE[r.key];
    out += `SPECIES: ${tpl.name} (key: ${r.key})\n`;
    out += `  From tables.txt: ${r.raw}\n`;
    out += `  In code (reactionTable): ${JSON.stringify(tpl.reactionTable)}\n\n`;
  }
});

fs.writeFileSync('./.reactionReport.txt', out);
console.log('Report written to .reactionReport.txt');
