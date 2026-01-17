// Simple singleton audio player to persist outside React lifecycle
const listeners = {
  change: new Set(),
  playstate: new Set(),
  volume: new Set()
};

let tracks = [];
let audio = null;
let currentIndex = 0;
let playing = false;
let vol = 0.5;

function emit(event, detail) {
  (listeners[event] || new Set()).forEach(fn => {
    try { fn(detail); } catch (e) {}
  });
}

function ensureAudio() {
  if (!audio && tracks.length > 0) {
    audio = new Audio(tracks[currentIndex]);
    audio.preload = 'auto';
    audio.volume = vol;
    audio.addEventListener('ended', () => {
      currentIndex = (currentIndex + 1) % tracks.length;
      if (audio) audio.src = tracks[currentIndex];
      emit('change', { currentIndex });
      if (playing) {
        audio.play().catch(() => {});
      }
    });
  }
}

import formatTrackTitle from './formatTrackTitle.js';

export default {
  init(trs = []) {
    // keep existing tracks if already set
    if (trs && trs.length > 0) tracks = trs;
    ensureAudio();
    emit('change', { currentIndex });
    emit('volume', { volume: vol });
    emit('playstate', { isPlaying: playing });
  },
  play() {
    ensureAudio();
    if (!audio) return;
    audio.play().catch(() => {});
    playing = true;
    emit('playstate', { isPlaying: playing });
  },
  pause() {
    if (audio) audio.pause();
    playing = false;
    emit('playstate', { isPlaying: playing });
  },
  toggle() {
    if (playing) this.pause(); else this.play();
  },
  next() {
    if (!tracks || tracks.length === 0) return;
    currentIndex = (currentIndex + 1) % tracks.length;
    if (audio) {
      audio.src = tracks[currentIndex];
      if (playing) audio.play().catch(() => {});
    }
    emit('change', { currentIndex });
  },
  prev() {
    if (!tracks || tracks.length === 0) return;
    currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    if (audio) {
      audio.src = tracks[currentIndex];
      if (playing) audio.play().catch(() => {});
    }
    emit('change', { currentIndex });
  },
  setVolume(v) {
    vol = Math.max(0, Math.min(1, Number(v) || 0));
    if (audio) audio.volume = vol;
    emit('volume', { volume: vol });
  },
  setIndex(i) {
    if (!tracks || tracks.length === 0) return;
    currentIndex = ((i % tracks.length) + tracks.length) % tracks.length;
    if (audio) {
      audio.src = tracks[currentIndex];
      if (playing) audio.play().catch(() => {});
    }
    emit('change', { currentIndex });
  },
  getTracks() { return tracks.slice(); },
  getCurrentIndex() { return currentIndex; },
  getCurrentTrack() {
    const url = tracks[currentIndex] || null;
  return url ? { url, title: formatTrackTitle(url) } : null;
  },
  isPlaying() { return playing; },
  getVolume() { return vol; },
  on(event, fn) { if (listeners[event]) listeners[event].add(fn); },
  off(event, fn) { if (listeners[event]) listeners[event].delete(fn); }
};
