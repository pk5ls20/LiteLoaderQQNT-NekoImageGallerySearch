// reference https://github.com/LLOneBot/LLOneBot/blob/main/electron.vite.config.ts
import cp from 'vite-plugin-cp';
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

const config = {
  main: {
    build: {
      outDir: 'LiteLoaderQQNT-NekoImage/main',
      minify: 'terser',
      emptyOutDir: true,
      lib: {
        formats: ['cjs'],
        entry: { main: 'src/main/main.ts' }
      },
      rollupOptions: {
        input: 'src/main/main.ts'
      }
    },
    plugins: [
      cp({
        targets: [
          { src: './manifest.json', dest: 'LiteLoaderQQNT-NekoImage' },
          { src: './icon.png', dest: 'LiteLoaderQQNT-NekoImage' },
          { src: 'src/renderer/settings.html', dest: 'LiteLoaderQQNT-NekoImage' }
        ]
      })
    ],
    cssCodeSplit: true
  },
  preload: {
    build: {
      outDir: 'LiteLoaderQQNT-NekoImage/preload',
      minify: 'terser',
      emptyOutDir: true,
      lib: {
        formats: ['cjs'],
        entry: { preload: 'src/preload/preload.ts' }
      },
      rollupOptions: {
        input: 'src/preload/preload.ts'
      }
    },
    resolve: {},
    cssCodeSplit: true
  },
  renderer: {
    // vite config options
    build: {
      outDir: 'LiteLoaderQQNT-NekoImage/renderer',
      minify: 'terser',
      emptyOutDir: true,
      lib: {
        formats: ['es'],
        entry: { renderer: 'src/renderer/renderer.ts' }
      },
      rollupOptions: {
        input: 'src/renderer/renderer.ts'
      }
    },
    plugins: [
      cp({
        targets: [{ src: 'src/renderer/injectIframe.css', dest: 'LiteLoaderQQNT-NekoImage/renderer/' }]
      }),
      vue(),
      svgLoader(),
      viteSingleFile()
    ],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.esm-bundler.js',
        'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.esm.js',
        'balm-ui-css': 'balm-ui/dist/balm-ui.css'
      }
    },
    define: {
      'process.env': {}
    }
  },
  cssCodeSplit: true
};

export default config;
