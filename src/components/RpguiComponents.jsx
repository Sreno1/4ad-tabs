// filepath: src/components/RpguiComponents.jsx
// Wrapper components for RPGUI elements that work with our theme system
import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

/**
 * RPGUI-styled button that falls back to Tailwind in Modern theme
 * Also supports DoodleCSS theme
 */
export function RpguiButton({ 
  children, 
  variant = 'default', // 'default' | 'golden'
  onClick, 
  disabled,
  className = '',
  ...props 
}) {
  const { isRpgui, isDoodle } = useTheme();
  
  if (isRpgui) {
    const rpguiClass = variant === 'golden' ? 'rpgui-button golden' : 'rpgui-button';
    return (
      <button 
        className={`${rpguiClass} ${className}`}
        onClick={onClick}
        disabled={disabled}
        data-golden={variant === 'golden' ? 'true' : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  if (isDoodle) {
    return (
      <button 
        className={className}
        onClick={onClick}
        disabled={disabled}
        data-golden={variant === 'golden' ? 'true' : undefined}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  // Fallback to Tailwind styling for Modern theme
  const variantClasses = {
    default: 'bg-amber-600 hover:bg-amber-700',
    golden: 'bg-yellow-600 hover:bg-yellow-700 font-bold'
  };
  
  return (
    <button
      className={`px-4 py-2 ${variantClasses[variant]} text-white rounded disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * RPGUI-styled container with frame border
 * Also supports DoodleCSS theme
 */
export function RpguiContainer({ 
  children, 
  variant = 'framed', // 'framed' | 'framed-golden' | 'framed-golden-2' | 'framed-grey'
  className = '',
  ...props 
}) {
  const { isRpgui, isDoodle } = useTheme();
  
  if (isRpgui) {
    return (
      <div className={`rpgui-container ${variant} ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  if (isDoodle) {
    // DoodleCSS applies borders via the .doodle class and our overrides
    return (
      <div className={`border ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  // Fallback to Tailwind styling
  const variantClasses = {
    framed: 'bg-slate-800 border-2 border-slate-600',
    'framed-golden': 'bg-amber-900 border-2 border-amber-600',
    'framed-golden-2': 'bg-yellow-900 border-2 border-yellow-600',
    'framed-grey': 'bg-slate-700 border-2 border-slate-500'
  };
  
  return (
    <div className={`p-4 ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * RPGUI-styled checkbox
 */
export function RpguiCheckbox({ 
  id,
  checked, 
  onChange, 
  label,
  golden = false,
  className = ''
}) {
  const { isRpgui } = useTheme();
  
  if (isRpgui) {
    const checkboxClass = golden ? 'rpgui-checkbox golden' : 'rpgui-checkbox';
    return (
      <div className={className}>
        <input
          type="checkbox"
          id={id}
          className={checkboxClass}
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }
  
  // Fallback to Tailwind styling
  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}

/**
 * RPGUI progress bar
 */
export function RpguiProgressBar({ 
  value, 
  max = 100,
  golden = false,
  className = ''
}) {
  const { isRpgui } = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  if (isRpgui) {
    const barClass = golden ? 'rpgui-progress golden' : 'rpgui-progress';
    return (
      <div className={`${barClass} ${className}`}>
        <div className="rpgui-progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  }
  
  // Fallback to Tailwind styling
  return (
    <div className={`w-full bg-slate-700 rounded-full h-4 ${className}`}>
      <div
        className={`h-4 rounded-full ${golden ? 'bg-yellow-500' : 'bg-green-500'}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

/**
 * Helper to add RPGUI cursor classes
 */
export function useCursor(type = 'default') {
  const { isRpgui } = useTheme();
  if (!isRpgui) return '';
  
  const cursorClasses = {
    default: 'rpgui-cursor-default',
    point: 'rpgui-cursor-point',
    select: 'rpgui-cursor-select',
    'grab-open': 'rpgui-cursor-grab-open',
    'grab-close': 'rpgui-cursor-grab-close'
  };
  
  return cursorClasses[type] || '';
}
