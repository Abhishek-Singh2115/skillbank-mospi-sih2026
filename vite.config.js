import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// NOTE: index.html is now the Vite React app (previously index-new.html).
// The old standalone CDN app is preserved as index-legacy.html.
export default defineConfig({
  plugins: [react()],
})
