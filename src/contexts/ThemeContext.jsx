import React, { createContext, useContext, useState, useEffect } from 'react';
// Note: rpgui-overrides.css is imported in main.jsx to ensure proper load order after Tailwind

const THEME_STORAGE_KEY = '4ad-theme';

// Available themes
export const THEMES = {
  modern: {
    id: 'modern',
    name: 'Modern Dark',
    description: 'Clean, modern dark theme with Tailwind styling'
  },
  rpgui: {
    id: 'rpgui',
    name: 'RPGUI Classic',
    description: 'Retro 8-bit RPG style UI'
  },
  doodle: {
    id: 'doodle',
    name: 'Doodle Sketch',
    description: 'Hand-drawn sketchy style with playful borders'
  },
  roguelike: {
    id: 'roguelike',
    name: 'Roguelike CRT',
    description: 'Retro terminal look with CRT scanlines and DungeonMode font'
  }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved && THEMES[saved] ? saved : 'modern';
    } catch {
      return 'modern';
    }
  });
  // Load/unload theme-specific styles
  useEffect(() => {
    const rpguiCssId = 'rpgui-css';
    const rpguiJsId = 'rpgui-js';
    const doodleCssId = 'doodle-css';
    const roguelikeCssId = 'roguelike-css';
    const basePath = import.meta.env.BASE_URL || '/';
    
    // Remove all theme classes first
    document.body.classList.remove('rpgui-content', 'doodle', 'roguelike');
    
    if (theme === 'rpgui') {
      // Load RPGUI CSS if not already loaded
      if (!document.getElementById(rpguiCssId)) {
        const link = document.createElement('link');
        link.id = rpguiCssId;
        link.rel = 'stylesheet';
        link.href = `${basePath}rpgui/rpgui.css`;
        document.head.appendChild(link);
      }
      
      // Load RPGUI JS if not already loaded
      if (!document.getElementById(rpguiJsId)) {
        const script = document.createElement('script');
        script.id = rpguiJsId;
        script.src = `${basePath}rpgui/rpgui.js`;
        document.head.appendChild(script);
      }
      
      // Add rpgui-content class to body
      document.body.classList.add('rpgui-content');
      
      // Remove other theme CSS
      const doodleCss = document.getElementById(doodleCssId);
      if (doodleCss) doodleCss.remove();
      const roguelikeCss = document.getElementById(roguelikeCssId);
      if (roguelikeCss) roguelikeCss.remove();
      
    } else if (theme === 'doodle') {
      // Load DoodleCSS if not already loaded
      if (!document.getElementById(doodleCssId)) {
        const link = document.createElement('link');
        link.id = doodleCssId;
        link.rel = 'stylesheet';
        link.href = `${basePath}doodlecss/doodle.css`;
        document.head.appendChild(link);
      }
      
      // Add doodle class to body
      document.body.classList.add('doodle');
      
      // Remove roguelike CSS
      const roguelikeCss = document.getElementById(roguelikeCssId);
      if (roguelikeCss) roguelikeCss.remove();
      
    } else if (theme === 'roguelike') {
      // Add roguelike class to body (CSS is imported in main.jsx)
      document.body.classList.add('roguelike');
      
      // Remove other theme CSS
      const doodleCss = document.getElementById(doodleCssId);
      if (doodleCss) doodleCss.remove();
      
    } else {
      // Modern theme - remove all theme-specific styles
      const doodleCss = document.getElementById(doodleCssId);
      if (doodleCss) doodleCss.remove();
      const roguelikeCss = document.getElementById(roguelikeCssId);
      if (roguelikeCss) roguelikeCss.remove();
    }
    
    // Save theme preference
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  }, [theme]);
  const value = {
    theme,
    setTheme,
    isRpgui: theme === 'rpgui',
    isDoodle: theme === 'doodle',
    isRoguelike: theme === 'roguelike',
    themes: THEMES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Styled components that adapt to theme
export function ThemedButton({ children, variant = 'default', className = '', ...props }) {
  const { isRpgui } = useTheme();
  
  if (isRpgui) {
    const goldenClass = variant === 'primary' ? ' golden' : '';
    return (
      <button className={`rpgui-button${goldenClass}`} {...props}>
        <p>{children}</p>
      </button>
    );
  }
  
  // Modern theme classes
  const variantClasses = {
    default: 'bg-slate-700 hover:bg-slate-600 text-white',
    primary: 'bg-amber-600 hover:bg-amber-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white'
  };
  
  return (
    <button 
      className={`px-3 py-2 rounded text-sm ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ThemedContainer({ children, framed = true, className = '', ...props }) {
  const { isRpgui } = useTheme();
  
  if (isRpgui) {
    const frameClass = framed ? ' framed' : '';
    return (
      <div className={`rpgui-container${frameClass} ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={`bg-slate-800 rounded p-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ThemedHr({ golden = false }) {
  const { isRpgui } = useTheme();
  
  if (isRpgui) {
    return <hr className={golden ? 'golden' : ''} />;
  }
  
  return <hr className="border-slate-700 my-2" />;
}

export default ThemeContext;
