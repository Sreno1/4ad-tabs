import React, { useState } from 'react';
import { d6, r2d6, d66 } from '../utils/dice.js';
import { RpguiButton } from './RpguiComponents.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Dice() {
  const [result, setResult] = useState(null);
  const { isRpgui } = useTheme();
  
  const handleRoll = (type) => {
    let value;
    switch (type) {
      case 'd66':
        value = d66();
        break;
      case '2d6':
        value = r2d6();
        break;
      default:
        value = d6();
    }
    setResult({ value, type });
  };
  
  return (
    <div className="bg-slate-800 rounded p-2 flex gap-2 items-center">
      {['d6', '2d6', 'd66'].map(type => (
        <RpguiButton
          key={type} 
          onClick={() => handleRoll(type)} 
          className={isRpgui ? 'text-sm' : 'px-3 py-1 text-sm'}
        >
          {type}
        </RpguiButton>
      ))}
      {result && (
        <span className="ml-auto text-amber-400 font-bold text-xl">
          {result.value}
          <span className="text-xs text-slate-400 ml-1">({result.type})</span>
        </span>
      )}
    </div>
  );
}
