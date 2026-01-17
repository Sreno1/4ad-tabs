import React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { HIDE_MODAL } from '../state/actions.js';

export default function ResultModal({ state, dispatch }) {
  const modal = state.modalMessage;
  useEffect(() => {
    if (!modal) return;
    if (modal.autoClose) {
      const t = setTimeout(() => dispatch({ type: HIDE_MODAL }), modal.autoClose === true ? 3000 : modal.autoClose);
      return () => clearTimeout(t);
    }
  }, [modal, dispatch]);

  if (!modal) return null;

  return (
    <div id="result_modal_overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div id="result_modal" className="bg-slate-800 rounded-lg p-4 max-w-md w-full mx-4 border-2 border-amber-400">
        <div className="flex justify-between items-start mb-2">
          <div className="font-bold text-lg text-amber-300">{modal.type === 'success' ? '✅ Success' : modal.type === 'failure' ? '❌ Result' : 'ℹ️ Result'}</div>
          <button onClick={() => dispatch({ type: HIDE_MODAL })} className="text-slate-400 hover:text-white">
            <X />
          </button>
        </div>
        <div className="text-white text-sm">
          {modal.message}
        </div>
        <div className="mt-3">
          <button onClick={() => dispatch({ type: HIDE_MODAL })} className="bg-amber-600 px-3 py-1 rounded">Close</button>
        </div>
      </div>
    </div>
  );
}
