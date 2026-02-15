import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

// En desarrollo, usar StrictMode; en producción, no
if (import.meta.env.DEV) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  root.render(<App />)
}
