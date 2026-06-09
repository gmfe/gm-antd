import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  // Externalize all non-relative imports (node_modules)
  external: [/^[^./]/],
  outDir: 'dist',
  treeshake: true,
});
