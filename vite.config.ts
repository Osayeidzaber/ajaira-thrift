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
        // Single self-contained bundle: Shopify's asset_url loads the entry as
        // islands.js?v=…, while split chunks would import Vue from bare
        // ./islands.js — two module instances with separate rendering contexts,
        // which breaks template refs (null owner). Inlining keeps one Vue copy.
        inlineDynamicImports: true,
        entryFileNames: 'islands.js',
        assetFileNames: 'islands.[ext]',
      },
    },
  },
})