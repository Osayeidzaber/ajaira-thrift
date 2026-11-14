import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: { islands: resolve(__dirname, 'src/mount.ts') },
      output: {
        entryFileNames: 'islands.js',
        chunkFileNames: 'island-[name].js',
        assetFileNames: 'islands.[ext]',
      },
    },
  },
})