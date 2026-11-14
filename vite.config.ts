import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: { islands: resolve(__dirname, 'src/mount.ts') },
      output: { entryFileNames: 'islands.js', assetFileNames: 'islands.[ext]' },
    },
  },
})