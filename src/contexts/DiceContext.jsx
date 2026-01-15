import React, { createContext, useContext, useState, useEffect } from 'react';

// Dice themes - these match the folder names in assets/themes/
// Note: genesys and diceOfRolling-fate are excluded as they use non-standard dice
export const DICE_THEMES = {
  default: { id: 'default', name: 'Default', description: 'Classic dice' },
  smooth: { id: 'smooth', name: 'Smooth', description: 'Polished smooth dice' },
  'smooth-pip': { id: 'smooth-pip', name: 'Smooth Pip', description: 'Smooth dice with pips' },
  rock: { id: 'rock', name: 'Rock', description: 'Stone textured dice' },
  rust: { id: 'rust', name: 'Rust', description: 'Weathered metal dice' },
  wooden: { id: 'wooden', name: 'Wooden', description: 'Carved wood dice' },
  gemstone: { id: 'gemstone', name: 'Gemstone', description: 'Crystal gem dice' },
  gemstoneMarble: { id: 'gemstoneMarble', name: 'Gemstone Marble', description: 'Marbled gem dice' },
  blueGreenMetal: { id: 'blueGreenMetal', name: 'Blue Green Metal', description: 'Metallic blue-green dice' },
  diceOfRolling: { id: 'diceOfRolling', name: 'Dice of Rolling', description: 'Fantasy style dice' },
};

// Dice color presets
export const DICE_COLORS = {
  amber: { id: 'amber', name: 'Amber Gold', color: '#f59e0b' },
  crimson: { id: 'crimson', name: 'Crimson', color: '#dc2626' },
  emerald: { id: 'emerald', name: 'Emerald', color: '#10b981' },
  sapphire: { id: 'sapphire', name: 'Sapphire', color: '#3b82f6' },
  amethyst: { id: 'amethyst', name: 'Amethyst', color: '#8b5cf6' },
  obsidian: { id: 'obsidian', name: 'Obsidian', color: '#374151' },
  ivory: { id: 'ivory', name: 'Ivory', color: '#f5f5f4' },
  copper: { id: 'copper', name: 'Copper', color: '#ea580c' },
};

const DiceContext = createContext();

export function DiceProvider({ children }) {
  const [diceTheme, setDiceTheme] = useState(() => {
    return localStorage.getItem('diceTheme') || 'default';
  });
  
  const [diceColor, setDiceColor] = useState(() => {
    return localStorage.getItem('diceColor') || 'amber';
  });

  useEffect(() => {
    localStorage.setItem('diceTheme', diceTheme);
  }, [diceTheme]);

  useEffect(() => {
    localStorage.setItem('diceColor', diceColor);
  }, [diceColor]);

  const value = {
    diceTheme,
    setDiceTheme,
    diceColor,
    setDiceColor,
    diceColorHex: DICE_COLORS[diceColor]?.color || DICE_COLORS.amber.color,
  };

  return (
    <DiceContext.Provider value={value}>
      {children}
    </DiceContext.Provider>
  );
}

export function useDiceTheme() {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDiceTheme must be used within a DiceProvider');
  }
  return context;
}
