import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Dices } from 'lucide-react';
import DiceBox from '@3d-dice/dice-box';
import { useDiceTheme } from '../contexts/DiceContext.jsx';

const DICE_OPTIONS = [
  { type: 'd6', label: 'D6', notation: '1d6' },
  { type: '2d6', label: '2D6', notation: '2d6' },
  { type: 'd66', label: 'D66', notation: '2d6', special: 'd66' },
  { type: 'd3', label: 'D3', notation: '1d6' }, // Roll d6, divide by 2 round up
  { type: 'd8', label: 'D8', notation: '1d8' },
  { type: 'd10', label: 'D10', notation: '1d10' },
];

export default function FloatingDice({ onLogRoll = null, inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [diceBox, setDiceBox] = useState(null);
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const initRef = useRef(false);
  const { diceColorHex, diceTheme } = useDiceTheme();
  const btnRef = useRef(null);

  // Initialize dice-box
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initDiceBox = async () => {
      try {
        // Assets are served from public folder
        // In dev: Vite serves public at root, so /assets/dice-box/assets/
        // In production: base is /4ad-tabs/, so /4ad-tabs/assets/dice-box/assets/
        const assetPath = import.meta.env.DEV ? '/assets/dice-box/assets/' : '/4ad-tabs/assets/dice-box/assets/';

        // v1.1.0 API: single config object with container property
        const box = new DiceBox({
          container: '#dice-canvas',
          assetPath,
          theme: diceTheme,
          themeColor: diceColorHex,
          scale: 6,
          gravity: 1,
          mass: 1,
          friction: 0.8,
          restitution: 0.5,
          linearDamping: 0.5,
          angularDamping: 0.4,
          spinForce: 4,
          throwForce: 5,
          startingHeight: 8,
          settleTimeout: 5000,
        });

        await box.init();
        setDiceBox(box);
        console.log('DiceBox initialized successfully');
      } catch (err) {
        console.error('DiceBox init error:', err);
        // Fallback to simple dice rolls if 3D dice fails to load
        console.warn('3D dice unavailable, using fallback rolls');
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initDiceBox, 100);
  }, [diceTheme, diceColorHex]);

  // Update dice config when color/theme changes
  useEffect(() => {
    if (diceBox && diceBox.updateConfig) {
      diceBox.updateConfig({ themeColor: diceColorHex, theme: diceTheme });
    }
  }, [diceColorHex, diceTheme, diceBox]);

  const clearDice = () => {
    if (diceBox && typeof diceBox.clear === 'function') {
      try {
        diceBox.clear();
      } catch (e) {
        // Ignore clear errors
      }
    }
  };

  useEffect(() => {
    if (inline && isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      // position menu slightly below the button center
      setMenuPos({ left: rect.left + rect.width / 2, top: rect.bottom + 8 });
    }
  }, [inline, isOpen]);

  const handleRoll = async (option) => {
    if (isRolling) return;

    setIsRolling(true);
    setIsOpen(false);

    try {
  if (diceBox) {
        // Use 3D dice
        const results = await diceBox.roll(option.notation);
        let total;
        
        if (option.special === 'd66') {
          // D66: first die is tens, second is ones
          total = results[0].value * 10 + results[1].value;
        } else if (option.type === 'd3') {
          // D3: roll d6, divide by 2 round up
          total = Math.ceil(results[0].value / 2);
        } else {
          total = results.reduce((sum, die) => sum + die.value, 0);
        }
        
        setResult({ total, type: option.type, dice: results });
        if (onLogRoll) {
          const values = results.map(r => r.value).join(',');
          const desc = option.special === 'd66'
            ? `Rolled d66=${total}`
            : `Rolled ${option.notation} = ${total} (${values})`;
          try { onLogRoll(desc); } catch (e) {}
        }
      } else {
        // Fallback to simple random
        let total;
        if (option.special === 'd66') {
          const tens = Math.floor(Math.random() * 6) + 1;
          const ones = Math.floor(Math.random() * 6) + 1;
          total = tens * 10 + ones;
        } else if (option.type === 'd3') {
          total = Math.floor(Math.random() * 3) + 1;
        } else {
          const match = option.notation.match(/(\d+)d(\d+)/);
          const count = parseInt(match[1]);
          const sides = parseInt(match[2]);
          total = 0;
          for (let i = 0; i < count; i++) {
            total += Math.floor(Math.random() * sides) + 1;
          }
        }
        setResult({ total, type: option.type, dice: [] });
        if (onLogRoll) {
          const desc = option.special === 'd66'
            ? `Rolled d66=${total}`
            : `Rolled ${option.notation} = ${total}`;
          try { onLogRoll(desc); } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Dice roll error:', err);
      setIsRolling(false);
    }

  };

  // Auto-clear effect
  useEffect(() => {
    if (!result) return;
    
    const timer = setTimeout(() => {
      clearDice();
      setResult(null);
      setIsRolling(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [result]);

  // Calculate positions in a radial pattern
  const getPosition = (index, total) => {
  const startAngle = -90;
  const spreadAngle = 150;
  // Rotate the whole radial menu by ~20 degrees clockwise to keep
  // some items from flying off the top of the viewport when used in the header.
  const rotationOffset = -70; // degrees, negative = clockwise
  const angle = startAngle + rotationOffset - (spreadAngle / (total - 1)) * index;
    const radius = 120;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <>
      {/* 3D Dice Canvas - full screen overlay when rolling */}
      {createPortal(
        <div
          id="dice-canvas"
          className={`fixed inset-0 transition-opacity duration-300 ${
            isRolling ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ 
            background: isRolling ? 'rgba(0,0,0,0.8)' : 'transparent',
            zIndex: 2147483646,
          }}
          onClick={() => {
            if (isRolling) {
              clearDice();
              setResult(null);
              setIsRolling(false);
            }
          }}
        />,
        document.body
      )}

      {/* Result display */}
      {result && createPortal(
        <div style={{ position: 'fixed', bottom: '8rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2147483647, pointerEvents: 'none' }}>
          <div className="text-6xl font-bold text-amber-400 bg-slate-900/90 px-8 py-4 rounded-xl shadow-2xl border-2 border-amber-500/50">
            {result.total}
            <span className="text-2xl text-slate-400 ml-3">({result.type})</span>
          </div>
        </div>,
        document.body
      )}

  {/* Floating button - desktop only. If `inline` is true we render inline (for header). */}
  <div className={inline ? 'relative inline-block' : 'hidden md:block fixed bottom-8 right-8 z-40'}>
        {/* Hidden 2d6 roll button for double-spacebar shortcut */}
        <button
          data-dice-roll="2d6"
          style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => handleRoll(DICE_OPTIONS[1])}
        />
        {/* Hidden d6 roll button for keyboard shortcut */}
        <button
          data-dice-roll="d6"
          style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }}
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => handleRoll(DICE_OPTIONS[0])}
        />
        {/* Radial options */}
        {isOpen && (
          inline ? (
            // For inline/header mode, render radial options into body positioned near button
            createPortal(
              <div style={{ position: 'fixed', left: `${menuPos?.left || 0}px`, top: `${menuPos?.top || 0}px`, transform: 'translate(-50%, 0)', zIndex: 2147483646 }} className="pointer-events-auto">
                {DICE_OPTIONS.map((option, index) => {
                  const pos = getPosition(index, DICE_OPTIONS.length);
                  return (
                    <button
                      key={option.type}
                      onClick={() => handleRoll(option)}
                      disabled={isRolling}
                      className="absolute w-14 h-14 rounded-full bg-slate-700 hover:bg-amber-500 
                               text-amber-400 hover:text-slate-900 font-bold text-sm
                               shadow-lg transition-all duration-200 flex items-center justify-center
                               border-2 border-slate-600 hover:border-amber-400
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        transform: `translate(${pos.x - 28}px, ${pos.y - 28}px)`,
                        animation: `fadeIn 0.2s ease-out ${index * 0.05}s both`,
                      }}
                      {...(option.type === 'd6' ? { 'data-dice-roll': 'd6' } : {})}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>,
              document.body
            )
          ) : (
            <div className={`absolute bottom-0 right-0 z-[10000]`}>
              {DICE_OPTIONS.map((option, index) => {
                const pos = getPosition(index, DICE_OPTIONS.length);
                return (
                  <button
                    key={option.type}
                    onClick={() => handleRoll(option)}
                    disabled={isRolling}
                    className="absolute w-14 h-14 rounded-full bg-slate-700 hover:bg-amber-500 
                             text-amber-400 hover:text-slate-900 font-bold text-sm
                             shadow-lg transition-all duration-200 flex items-center justify-center
                             border-2 border-slate-600 hover:border-amber-400
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      transform: `translate(${pos.x - 28}px, ${pos.y - 28}px)`,
                      animation: `fadeIn 0.2s ease-out ${index * 0.05}s both`,
                    }}
                    {...(option.type === 'd6' ? { 'data-dice-roll': 'd6' } : {})}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )
        )}

  {/* Main button */}
  <button
    ref={btnRef}
    onClick={() => setIsOpen(!isOpen)}
          disabled={isRolling}
          className={`
            w-16 h-16 rounded-full shadow-xl flex items-center justify-center
            transition-all duration-300 border-2
            ${isOpen 
              ? 'bg-amber-500 text-slate-900 border-amber-400 rotate-45' 
              : 'bg-slate-800 text-amber-400 border-slate-600 hover:border-amber-400 hover:bg-slate-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
  >
          <Dices size={28} />
        </button>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(0, 0) scale(0.5);
          }
          to {
            opacity: 1;
          }
        }
        #dice-canvas canvas {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </>
  );
}
