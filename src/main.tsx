import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Schedule-X v4 calls `Temporal.X` against globalThis without importing the
// polyfill itself. Modern browsers (Chrome 126+) ship Temporal natively, so
// `instanceof` checks fail when we pass polyfill-built ZonedDateTime instances
// against the native constructor. Installing temporal-polyfill globally pins
// `globalThis.Temporal` to the same module our mapper uses, so the identity
// check inside schedule-x's validateEvents passes.
import 'temporal-polyfill/global'

// Font registry — variable fonts used by the 6 curated font pairs.
// Loaded eagerly; Vite tree-shakes any pair the build doesn't reach.
import '@fontsource-variable/inter'
import '@fontsource-variable/source-serif-4'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import '@fontsource-variable/outfit'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
