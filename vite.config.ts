import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '/',
  plugins: [react(), viteTsconfigPaths()],
  server: {
    proxy: {
      '/graphql': {
        target: 'https://api.thegraph.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/graphql/, '/index-node/graphql')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      stream: 'rollup-plugin-node-polyfills/polyfills/stream', // add stream
      querystring: 'rollup-plugin-node-polyfills/polyfills/qs', // add querystring polyfill
      url: 'rollup-plugin-node-polyfills/polyfills/url', // add url polyfill
      util: 'rollup-plugin-node-polyfills/polyfills/util', // add util polyfill
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6', // add buffer polyfill
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {
      VENLY_ID: '"Testaccount"',
    }
  }
})
