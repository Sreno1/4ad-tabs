import React, { useState } from 'react';
import { d6, r2d6, d66 } from '../utils/dice.js';
import Button from './ui/Button.jsx';

export default function Dice() {
  const [result, setResult] = useState(null);

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
        <Button
          key={type}
          variant="info"
          size="sm"
          onClick={() => handleRoll(type)}
          dataAction={`roll-${type}`}
          aria-label={`Roll ${type}`}
        >
          {type}
        </Button>
      ))}
      {result && (
        <span
          className="ml-auto text-amber-400 font-bold text-xl"
          role="status"
          aria-live="polite"
          aria-label={`Roll result: ${result.value}`}
        >
          {result.value}
          <span className="text-xs text-slate-400 ml-1">({result.type})</span>
        </span>
      )}
    </div>
  );
}
