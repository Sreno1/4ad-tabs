/**
 * UI Reducer - handles transient UI state like modal messages
 */
import * as A from '../actions.js';

export function uiReducer(state, action) {
  switch (action.type) {
    case A.SHOW_MODAL:
      return {
        ...state,
        modalMessage: {
          message: action.message,
          type: action.msgType || 'info',
          autoClose: action.autoClose || false,
          timestamp: Date.now()
        }
      };

    case A.HIDE_MODAL:
      return { ...state, modalMessage: null };

    default:
      return state;
  }
}
