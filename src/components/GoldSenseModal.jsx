import React from 'react';

export default function GoldSenseModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const { dwarf, saveRoll, total, preview } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
      <div className="bg-slate-900 rounded-lg w-full max-w-lg p-4 border-2 border-amber-500">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="text-lg font-bold text-amber-300">Gold Sense</div>
            <div className="text-sm text-slate-300">{dwarf.name} made a Save: <span className="font-mono">{saveRoll}</span> + <span className="font-mono">{dwarf.lvl}</span> = <span className="font-mono">{total}</span></div>
          </div>
          <button onClick={onClose} className="text-white">✕</button>
        </div>

        <div className="mt-4 text-sm text-slate-200">
          <div className="mb-2">Preview:</div>
          <div className="p-3 bg-slate-800 rounded">
            {preview ? (
              preview.type === 'gold' ? (
                <div className="text-amber-300 font-semibold">{preview.amount} gold</div>
              ) : (
                <div className="text-slate-100 font-medium">{preview.type}</div>
              )
            ) : (
              <div className="text-slate-400">No treasure detected.</div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500">Close</button>
        </div>
      </div>
    </div>
  );
}
