import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Archive, Filter } from 'lucide-react';
import { selectLog, selectLogArchive } from '../state/selectors.js';
import { archiveLog, addStoryBeat } from '../state/actionCreators.js';
import audioPlayer from '../utils/audioPlayer.js';
import formatTrackTitle from '../utils/formatTrackTitle.js';

export default function Log({ state, dispatch, isBottomPanel = false }) {
  const log = selectLog(state);
  const logArchive = selectLogArchive(state);
  const [filterType, setFilterType] = useState('all');
  
  // --- Music player setup -------------------------------------------------
  // Gather .m4a (AAC) files from the repository's /music directory using Vite's glob.
  // We use eager + as: 'url' so we get direct URLs to the assets at build time.
  // audioPlayer singleton is used to manage audio outside React lifecycle

  const trackModules = typeof import.meta !== 'undefined'
    ? import.meta.glob('/music/**/*.m4a', { as: 'url', eager: true })
    : {};

  const tracks = useMemo(() => {
    try {
      const t = Object.values(trackModules).filter(Boolean);
      // cache globally so other mounts reuse the same list
  return t;
    } catch (e) {
      return [];
    }
  }, [trackModules]);

  // Use shared formatter for track titles

  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndexState] = useState(0);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [volume, setVolumeState] = useState(0.5);

  // helper to update both shared and stateful track index
  const setCurrentTrackIndex = (updater) => {
  const prev = audioPlayer.getCurrentIndex();
  const next = typeof updater === 'function' ? updater(prev) : updater;
  audioPlayer.setIndex(next);
  setCurrentTrackIndexState(next);
  };

  // helper to update both shared and stateful playing flag
  const setIsPlaying = (next) => {
    if (typeof next === 'function') {
      const curr = audioPlayer.isPlaying();
      const n = next(curr);
      if (n) audioPlayer.play(); else audioPlayer.pause();
      setIsPlayingState(n);
    } else {
      if (next) audioPlayer.play(); else audioPlayer.pause();
      setIsPlayingState(next);
    }
  };

  const setVolume = (v) => {
  audioPlayer.setVolume(v);
  setVolumeState(Number.isFinite(Number(v)) ? Number(v) : 0);
  };

  // Initialize audioPlayer with discovered tracks and subscribe to events
  useEffect(() => {
    if (tracks && tracks.length > 0) audioPlayer.init(tracks);

    const onChange = (d) => { if (d && typeof d.currentIndex === 'number') setCurrentTrackIndexState(d.currentIndex); };
    const onPlayState = (d) => { if (d && typeof d.isPlaying === 'boolean') setIsPlayingState(d.isPlaying); };
    const onVol = (d) => { if (d && typeof d.volume === 'number') setVolumeState(d.volume); };

    audioPlayer.on('change', onChange);
    audioPlayer.on('playstate', onPlayState);
    audioPlayer.on('volume', onVol);

    // sync initial state
    setCurrentTrackIndexState(audioPlayer.getCurrentIndex());
    setIsPlayingState(audioPlayer.isPlaying());
    setVolumeState(audioPlayer.getVolume());

    return () => {
      audioPlayer.off('change', onChange);
      audioPlayer.off('playstate', onPlayState);
      audioPlayer.off('volume', onVol);
    };
  }, [tracks]);

  // (sync handled via audioPlayer subscriptions)

  // Listen for global audio events so multiple mounts stay in sync
  useEffect(() => {
    const onChanged = (e) => {
      const idx = e && e.detail && typeof e.detail.currentTrackIndex === 'number' ? e.detail.currentTrackIndex : null;
      if (typeof idx === 'number') setCurrentTrackIndexState(idx);
    };
    const onPlayState = (e) => {
      const p = e && e.detail && typeof e.detail.isPlaying === 'boolean' ? e.detail.isPlaying : null;
      if (typeof p === 'boolean') setIsPlayingState(p);
    };
    const onVolume = (e) => {
      const v = e && e.detail && typeof e.detail.volume === 'number' ? e.detail.volume : null;
      if (typeof v === 'number') setVolumeState(v);
    };

    try {
      window.addEventListener('4ad-audio-changed', onChanged);
      window.addEventListener('4ad-audio-playstate', onPlayState);
      window.addEventListener('4ad-audio-volume', onVolume);
    } catch (e) {
      // ignore environments without window
    }

    return () => {
      try {
        window.removeEventListener('4ad-audio-changed', onChanged);
        window.removeEventListener('4ad-audio-playstate', onPlayState);
        window.removeEventListener('4ad-audio-volume', onVolume);
      } catch (e) {}
    };
  }, []);

  // Play / pause when isPlaying changes
  useEffect(() => {
    // audioPlayer handles play/pause; keep UI in sync via events
  }, [isPlaying]);

  const togglePlay = () => {
    if (!tracks || tracks.length === 0) return;
  audioPlayer.toggle();
  };

  const nextTrack = () => {
    if (!tracks || tracks.length === 0) return;
  audioPlayer.next();
  setCurrentTrackIndexState(audioPlayer.getCurrentIndex());
  setIsPlayingState(audioPlayer.isPlaying());
  };

  const prevTrack = () => {
    if (!tracks || tracks.length === 0) return;
  audioPlayer.prev();
  setCurrentTrackIndexState(audioPlayer.getCurrentIndex());
  setIsPlayingState(audioPlayer.isPlaying());
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
  setVolume(Number.isFinite(v) ? v : 0.5);
  };
  // ------------------------------------------------------------------------
  
  const handleArchive = () => {
    if (log.length > 0) {
      dispatch(archiveLog());
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredLog = filterType === 'all' 
    ? log 
    : log.filter(entry => (typeof entry === 'object' ? entry.type === filterType : filterType === 'system'));

  const logTypes = ['all', ...new Set(log.map(entry => typeof entry === 'object' ? entry.type : 'system'))];

  // Bottom panel layout (desktop)
  if (isBottomPanel) {
    return (
      <div id="adventure_log_section" className="h-full flex flex-col bg-slate-900" data-component="log">
        {/* Log content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div id="adventure_log_controls" className="flex justify-between items-center px-3 py-2 border-b border-slate-700 bg-slate-800">
            <div id="adventure_log_actions" className="flex items-center gap-2">
              <button
                id="adventure_log_archive_button"
                onClick={handleArchive}
                disabled={log.length === 0}
                className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"
                title="Archive log and clear"
                aria-label="Archive current log and clear"
              >
                <Archive size={12} aria-hidden="true" /> Archive
              </button>

              <div id="adventure_log_filter_section" className="flex items-center gap-1">
                <Filter size={12} className="text-slate-400" />
                <select
                  id="adventure_log_filter_select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600"
                >
                  {logTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Music player controls (desktop bottom panel) */}
            {tracks && tracks.length > 0 && (
              <div id="adventure_log_player" className="flex items-center gap-2">
                <button
                  id="adventure_log_player_prev"
                  onClick={prevTrack}
                  className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs"
                  title="Previous track"
                  aria-label="Previous track"
                >
                  ◀
                </button>
                <button
                  id="adventure_log_player_toggle"
                  onClick={togglePlay}
                  className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs"
                  title={isPlaying ? 'Pause' : 'Play'}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸' : '⏵'}
                </button>
                <button
                  id="adventure_log_player_next"
                  onClick={nextTrack}
                  className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs"
                  title="Next track"
                  aria-label="Next track"
                >
                  ▶
                </button>

                <div id="adventure_log_player_track" className="text-slate-300 text-xs px-2">
                  {tracks[currentTrackIndex] ? formatTrackTitle(tracks[currentTrackIndex]) : 'Track'}
                </div>

                <input
                  id="adventure_log_player_volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                  aria-label="Music volume"
                />
              </div>
            )}

            {logArchive && logArchive.length > 0 && (
              <div id="adventure_log_archive_indicator" className="text-xs text-slate-500" aria-live="polite">
                📚 {logArchive.length} archived log(s)
              </div>
            )}
          </div>
          {/* bottom-right indicator removed; collapsed LogBar shows current track */}

          <div
            id="adventure_log_entries"
            className="flex-1 overflow-y-auto p-3 text-xs space-y-1 log-content"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Adventure log"
          >
            {filteredLog.map((entry, index) => {
              const isObject = typeof entry === 'object';
              const message = isObject ? entry.message : entry;
              const timestamp = isObject ? entry.timestamp : new Date().toISOString();
              const type = isObject ? entry.type : 'system';

              const handleContext = (e) => {
                e.preventDefault();
                if (!message || (typeof message === 'string' && message.trim().length === 0)) return;
                dispatch(addStoryBeat(String(message).trim(), 'log'));
              };

              return (
                <div
                  id={`adventure_log_entry_${index}`}
                  key={`log-${index}-${isObject ? entry.timestamp : entry.substring(0, 20)}`}
                  className="text-slate-400 border-b border-slate-800 pb-1 font-mono log-entry cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors"
                  onContextMenu={handleContext}
                  title="Right-click to add this entry to Story Beats"
                >
                  <span id={`adventure_log_entry_${index}_timestamp`} className="text-slate-500 text-xs mr-2">
                    [{formatTimestamp(timestamp)}]
                  </span>
                  <span id={`adventure_log_entry_${index}_type`} className={`inline-block px-1 py-0.5 rounded text-xs mr-2 ${
                    type === 'combat' ? 'bg-red-900 text-red-200' :
                    type === 'exploration' ? 'bg-blue-900 text-blue-200' :
                    type === 'equipment' ? 'bg-green-900 text-green-200' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {type}
                  </span>
                  <span id={`adventure_log_entry_${index}_message`}>{message}</span>
                </div>
              );
            })}
            {filteredLog.length === 0 && log.length > 0 && (
              <div id="adventure_log_filter_empty" className="text-slate-500">No entries match the current filter.</div>
            )}
            {log.length === 0 && (
              <div id="adventure_log_empty" className="text-slate-500">Adventure awaits...</div>
            )}
          </div>
        </div>
      </div>
    );
  }
    // Mobile/tablet layout (original)
  return (
    <div id="adventure_log_container" className="space-y-3" data-component="log">
      {/* Log Section */}
      <div id="adventure_log_mobile_section" className="space-y-2">
        <div id="adventure_log_mobile_header" className="flex justify-between items-center">
          <span id="adventure_log_mobile_title" className="font-bold text-amber-400">
            Log ({filteredLog.length})
          </span>
          <div id="adventure_log_mobile_actions" className="flex items-center gap-2">
            <div id="adventure_log_mobile_filter_section" className="flex items-center gap-1">
              <Filter size={12} className="text-slate-400" />
              <select
                id="adventure_log_mobile_filter_select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600"
              >
                {logTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              id="adventure_log_mobile_archive_button"
              onClick={handleArchive}
              disabled={state.log.length === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"
              title="Archive log and clear"
              aria-label="Archive current log and clear"
            >
              <Archive size={12} aria-hidden="true" /> Archive
            </button>
          </div>
        </div>
        {/* Mobile music player */}
        {tracks && tracks.length > 0 && (
          <div id="adventure_log_mobile_player" className="flex items-center gap-2 px-2">
            <button
              id="adventure_log_mobile_player_toggle"
              onClick={togglePlay}
              className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-xs"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '⏵'}
            </button>
            <div className="text-slate-300 text-xs">{tracks[currentTrackIndex] ? formatTrackTitle(tracks[currentTrackIndex]) : 'Track'}</div>
            <input
              id="adventure_log_mobile_player_volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-36"
              aria-label="Music volume"
            />
          </div>
        )}
          <div
            id="adventure_log_mobile_entries"
            className="bg-slate-800 rounded p-2 max-h-96 md:max-h-[400px] overflow-y-auto text-xs space-y-1 log-content"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Adventure log"
          >
          {filteredLog.map((entry, index) => {
            const isObject = typeof entry === 'object';
            const message = isObject ? entry.message : entry;
            const timestamp = isObject ? entry.timestamp : new Date().toISOString();
            const type = isObject ? entry.type : 'system';

            const handleContext = (e) => {
              e.preventDefault();
              if (!message || (typeof message === 'string' && message.trim().length === 0)) return;
              dispatch(addStoryBeat(String(message).trim(), 'log'));
            };

            return (
              <div
                id={`adventure_log_mobile_entry_${index}`}
                key={`log-${index}-${isObject ? entry.timestamp : entry.substring(0, 20)}`}
                className="text-slate-400 border-b border-slate-700 pb-1 log-entry cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors"
                onContextMenu={handleContext}
                title="Right-click to add this entry to Story Beats"
              >
                <span id={`adventure_log_mobile_entry_${index}_timestamp`} className="text-slate-500 text-xs mr-2">
                  [{formatTimestamp(timestamp)}]
                </span>
                <span id={`adventure_log_mobile_entry_${index}_type`} className={`inline-block px-1 py-0.5 rounded text-xs mr-2 ${
                  type === 'combat' ? 'bg-red-900 text-red-200' :
                  type === 'exploration' ? 'bg-blue-900 text-blue-200' :
                  type === 'equipment' ? 'bg-green-900 text-green-200' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {type}
                </span>
                <span id={`adventure_log_mobile_entry_${index}_message`}>{message}</span>
              </div>
            );
          })}
          {filteredLog.length === 0 && log.length > 0 && (
            <div id="adventure_log_mobile_filter_empty" className="text-slate-500">No entries match the current filter.</div>
          )}
          {log.length === 0 && (
            <div id="adventure_log_mobile_empty" className="text-slate-500">Adventure awaits...</div>
          )}
        </div>

        {/* Archive indicator */}
        {state.logArchive && state.logArchive.length > 0 && (
          <div id="adventure_log_mobile_archive_indicator" className="text-xs text-slate-500 text-center" aria-live="polite">
            📚 {state.logArchive.length} archived log(s) · View in Settings
          </div>
        )}
      </div>
    </div>
  );
}
