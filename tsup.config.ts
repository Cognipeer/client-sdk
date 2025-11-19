import { defineConfig } from 'tsup';

export default defineConfig([
  // Main SDK bundle (TypeScript)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: false,
    target: 'es2020',
    outDir: 'dist',
    treeshake: true,
    platform: 'neutral',
    esbuildOptions(options) {
      options.banner = {
        js: '// Cognipeer AI SDK - https://cognipeer.com',
      };
    },
  },
  // Standalone browser webchat bundle
  {
    entry: ['src/webchat-browser.js'],
    format: ['iife'],
    globalName: 'CognipeerWebchat',
    dts: false,
    splitting: false,
    sourcemap: true,
    clean: false,
    minify: true,
    target: 'es2015',
    outDir: 'dist',
    platform: 'browser',
    outExtension: () => ({ js: '.min.js' }),
    esbuildOptions(options) {
      options.banner = {
        js: '// Cognipeer Webchat - https://cognipeer.com',
      };
    },
  },
]);
