import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import path from 'path';

export default defineConfig({
  plugins: [vue(), VueDevTools()],
  root: path.resolve(__dirname),
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      vue: 'vue/dist/vue.esm-bundler.js',
      'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.esm.js',
      'balm-ui-css': 'balm-ui/dist/balm-ui.css'
    }
  },
  build: {
    target: 'esnext',
    outDir: '../../dist-only-vue/app',
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
});
