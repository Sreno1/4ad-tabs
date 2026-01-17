// Simple SFX engine: load Audio objects lazily and expose play(name, opts)
const SFX_PATH = '/sfx'; // fallback: served from public root in dev/build

const SOUND_MAP = {
  step: 'jump2.wav', // movement
  door: 'turnoff3.wav',
  attack: 'shoot3.wav',
  defend: 'powerup2.wav',
  hit: 'hurt3.wav',
  miss: 'error3.wav',
  crit: 'explosion2.wav',
  fumble: 'error5.wav',
  pickup: 'pickup2.wav',
  treasure: 'powerup3.wav',
  spell: 'laser3.wav',
  hurt4: 'hurt4.wav',
  jump4: 'jump4.wav',
  jump5: 'jump5.wav',
  flee: 'turnoff2.wav',
  select: 'select2.wav',
  select3: 'select3.wav',
  upgrade4: 'upgrade4.wav'
};

// If a mapped file doesn't exist in the sfx directory, callers will get errors in console.
const audioCache = new Map();

function resolveFilename(name) {
  const f = SOUND_MAP[name];
  if (!f) return null;
  // Prefer bundler-resolved URL (so files under project `sfx/` are included by Vite/Rollup)
  try {
    return new URL(`../../sfx/${f}`, import.meta.url).href;
  } catch (e) {
    // Fallback to public path
    return `${SFX_PATH}/${f}`;
  }
}

export function playSfx(name, { volume = 0.9, loop = false } = {}) {
  const url = resolveFilename(name);
  if (!url) {
    // no matching sound; silently ignore
    // console.debug(`SFX: no mapping for ${name}`);
    return null;
  }

  try {
    // create new audio each time to allow overlapping playback for short sfx
    const audio = new Audio(url);
    audio.volume = volume;
    audio.loop = loop;
    // Play and return the instance
    audio.play().catch((e) => { /* autoplay/interaction may block in some browsers */ });
    return audio;
  } catch (e) {
    // ignore
    return null;
  }
}

// Convenience aliases
export default {
  play: playSfx
};
