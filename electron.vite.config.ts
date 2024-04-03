import cp from 'vite-plugin-cp';
import svgLoader from 'vite-svg-loader'
import vue from '@vitejs/plugin-vue';

let config = {
    main: {
        build: {
            outDir: "dist/main",
            emptyOutDir: true,
            lib: {
                formats: ["cjs"],
                entry: {"main": "src/main.ts"},
            },
            rollupOptions: {
                input: "src/main.ts",
            }
        },
        plugins: [cp({
            targets: [
                {src: './manifest.json', dest: 'dist'},
                {src: './icon.png', dest: 'dist'},
                {src: 'src/ui/settings.html', dest: 'dist/ui/'},
            ]
        })]
        // , cssCodeSplit: false
    },
    preload: {
        build: {
            outDir: "dist/preload",
            emptyOutDir: true,
            lib: {
                formats: ["cjs"],
                entry: {"preload": "src/preload.ts"},
            },
            rollupOptions: {
                // external: externalAll,
                input: "src/preload.ts",
            }
        },
        resolve: {}
        // , cssCodeSplit: false
    },
    renderer: {
        // vite config options
        build: {
            outDir: "dist/renderer",
            emptyOutDir: true,
            lib: {
                formats: ["es"],
                entry: {"renderer": "src/renderer.ts"},
            },
            rollupOptions: {
                // external: externalAll,
                input: "src/renderer.ts",
            }
        },
        plugins: [
            // vue({customElement: true})
            vue(),
            svgLoader()
        ],
        resolve: {
            alias: {
                'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.esm.js',
                'balm-ui-css': 'balm-ui/dist/balm-ui.css'
            }
        },
        define: {
            'process.env': {}
        },
    }
    // cssCodeSplit: false
}

export default config;