import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Freeze the real viewport height before any browser chrome animation can change it.
// CSS viewport units (dvh/svh/lvh) all update as the address bar moves; this does not.
document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
