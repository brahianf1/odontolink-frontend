import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Schedule-X v4 calls `Temporal.X` against globalThis without importing the
// polyfill itself. Modern browsers (Chrome 126+) ship Temporal natively, so
// `instanceof` checks fail when we pass polyfill-built ZonedDateTime instances
// against the native constructor. Installing temporal-polyfill globally pins
// `globalThis.Temporal` to the same module our mapper uses, so the identity
// check inside schedule-x's validateEvents passes.
import 'temporal-polyfill/global'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
