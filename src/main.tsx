// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AppProvider } from './context/AppContext.tsx'
import { ToastProvider } from './context/ToastContext.tsx'
import { BrowserRouter } from 'react-router-dom'

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
