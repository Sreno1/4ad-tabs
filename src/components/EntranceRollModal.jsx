import React from 'react';

export default function EntranceRollModal({ isOpen, onClose, roll }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-slate-900 rounded-lg w-full max-w-md p-4 border-2 border-amber-500">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-bold text-amber-300">Dungeon Entrance Roll</div>
            <div className="text-sm text-slate-300 mt-1">A D6 was rolled to determine the entrance tile shape.</div>
          </div>
          <button onClick={onClose} className="text-white">✕</button>
        </div>

        <div className="mt-4 text-center">
          <div className="text-6xl font-mono text-amber-300">{roll}</div>
          <div className="text-sm text-slate-400 mt-2">Entrance tile shape: {roll}</div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500">Continue</button>
        </div>
      </div>
    </div>
  );
}
