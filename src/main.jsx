import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { DiceProvider } from './contexts/DiceContext.jsx'
import './index.css'
import './styles/rpgui-overrides.css'
import './styles/doodle-overrides.css'
import './styles/roguelike-crt.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <DiceProvider>
          <App />
        </DiceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
