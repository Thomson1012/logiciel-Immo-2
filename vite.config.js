import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: './',
    base: './',
    build: {
        // CSS optimization - single CSS file
        cssCodeSplit: false,
        cssMinify: 'esbuild',

        // Chunk size warnings
        chunkSizeWarningLimit: 3000,

        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                impots: resolve(__dirname, 'impots.html'),
                aides: resolve(__dirname, 'aides.html'),
                travaux: resolve(__dirname, 'travaux.html'),
                comparateur: resolve(__dirname, 'comparateur.html'),
                glossaire: resolve(__dirname, 'glossaire.html'),
                guide: resolve(__dirname, 'guide.html')
            },

            output: {
                // Asset file naming
                assetFileNames: 'assets/[name]-[hash][extname]',

                // Entry file naming  
                entryFileNames: 'assets/js/[name]-[hash].js',
                chunkFileNames: 'assets/js/[name]-[hash].js'
            }
        },
        minify: 'esbuild',
        sourcemap: false
    },
    css: {
        postcss: {
            plugins: [
                require('autoprefixer'),
                require('cssnano')({
                    preset: 'default'
                })
            ]
        }
    },
    server: {
        port: 3000,
        open: true
    },
    preview: {
        port: 4173,
        open: true
    }
});

