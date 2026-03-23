import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <Suspense
      fallback={
        <div className="h-screen w-full bg-brand-dark flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <App />
    </Suspense>
  </StrictMode>,
)
