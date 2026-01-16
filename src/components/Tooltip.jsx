import React, { useState, useRef, useId } from 'react';
import { useFloating, offset, flip, shift, arrow, autoUpdate } from '@floating-ui/react';

export default function Tooltip({ text, children, placement = 'top', delay = 100 }) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);
  const id = useId();

  const { x, y, strategy, refs, middlewareData } = useFloating({
    placement,
    middleware: [offset(6), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate
  });

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  // Render a wrapper so we can attach the reference ref without forcing callers to forward refs
  return (
    <span className="inline-block" ref={refs.setReference} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} aria-describedby={text ? `tooltip-${id}` : undefined}>
      {children}

      {open && text && (
        <span
          id={`tooltip-${id}`}
          role="tooltip"
          ref={refs.setFloating}
          style={{
            position: strategy,
            left: x ?? 0,
            top: y ?? 0,
            zIndex: 9999
          }}
        >
          <span className="px-2 py-1 text-xs bg-slate-900 border border-slate-600 rounded shadow-lg max-w-xs whitespace-normal text-slate-100">
            {text}
          </span>
          <span
            ref={arrowRef}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              left: middlewareData.arrow?.x != null ? `${middlewareData.arrow.x}px` : '',
              top: middlewareData.arrow?.y != null ? `${middlewareData.arrow.y}px` : '',
              transform: 'rotate(45deg)',
              background: 'transparent'
            }}
          >
            <span className="block w-2 h-2 bg-slate-900 border border-slate-600" />
          </span>
        </span>
      )}
    </span>
  );
}
