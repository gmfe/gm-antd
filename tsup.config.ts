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
  external: [
    'react',
    'react-dom',
    'antd',
    '@ant-design/icons',
    '@ant-design/cssinjs',
    'mobx',
    'mobx-react',
    '@gm-common/hooks',
    'sortablejs',
    'rc-resize-observer',
    'react-resizable',
    'react-window',
    'lodash',
  ],
  outDir: 'dist',
  treeshake: true,
});
