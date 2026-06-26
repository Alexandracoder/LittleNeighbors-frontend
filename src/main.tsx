if (typeof (window as any).global === 'undefined') {
  ;(window as any).global = window
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'

const container = document.getElementById('root')

if (container) {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
