import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { Tooltip } from './RulesReference.jsx';
import { addStoryBeat, deleteStoryBeat, updateStoryBeat } from '../state/actionCreators.js';

export default function StoryLog({ state, dispatch }) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const beats = (state.storyBeats || []).slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // newest first

  const handleAdd = (source = 'player') => {
    if (!text || text.trim().length === 0) return;
    dispatch(addStoryBeat(text.trim(), source));
    setText('');
  };

  const handleDelete = (id) => {
    dispatch(deleteStoryBeat(id));
  };

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditingText(b.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id) => {
    if (!editingText || editingText.trim().length === 0) return;
    dispatch(updateStoryBeat(id, editingText.trim()));
    cancelEdit();
  };

  // Auto-generation removed - Story beats are player-written only for now

  return (
    <div className="space-y-3" data-component="story-log">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-400">Story Beats</h3>
  <div />
      </div>

      <div className="bg-slate-800 rounded p-2 max-h-[60vh] h-full overflow-y-auto text-xs space-y-2 flex flex-col" style={{minHeight: 0}}>
        {beats.length === 0 && (
          <div className="text-slate-500">No story beats yet. Add a note about this adventure or downtime.</div>
        )}

        {beats.map((b) => (
          <div key={`beat-${b.id}`} className="flex items-start justify-between gap-2 cursor-pointer hover:bg-slate-700 hover:text-slate-100 transition-colors p-2 rounded" onContextMenu={(e) => { e.preventDefault(); startEdit(b); }}>
            <div className="flex-1">
              <div className="text-slate-500 text-xs">{new Date(b.timestamp).toLocaleString()}</div>
              {editingId === b.id ? (
                <div className="flex gap-2 mt-1">
                  <input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 bg-slate-700 px-2 py-1 rounded text-xs border border-slate-600"
                  />
                  <button onClick={() => saveEdit(b.id)} className="bg-amber-400 text-slate-900 px-2 py-1 rounded text-xs">Save</button>
                  <button onClick={cancelEdit} className="text-slate-400 px-2 py-1 rounded text-xs">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="text-slate-200 mt-1">{b.text}</div>
                  <div className="text-slate-400 text-xs">{b.source}</div>
                </>
              )}
            </div>
              <div className="flex items-start gap-1">
              <Tooltip text="Edit beat">
                <button
                  onClick={() => startEdit(b)}
                  className="text-slate-400 hover:text-amber-300 ml-2"
                >
                  <Edit2 size={14} />
                </button>
              </Tooltip>
              <Tooltip text="Delete beat">
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-slate-400 hover:text-red-400 ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note about this adventure or downtime..."
          className="flex-1 bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700"
        />
        <Tooltip text="Add story beat">
          <button
            onClick={() => handleAdd('player')}
            className="bg-amber-400 text-slate-900 px-3 py-1 rounded text-xs flex items-center gap-1"
          >
            <PlusCircle size={14} /> Add
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
