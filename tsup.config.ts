import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // dts 不由 tsup 生成, 改由 `tsc --emitDeclarationOnly` 单独产出(见 package.json build:wrapper)。
  // 原因: tsup 内置的 rollup-plugin-dts 对 antd5 的复杂泛型/继承/forwardRef ref 类型有系统性解析
  // bug(CascaderProps 多泛型 TS2314、MentionsProps 深继承 TS2724、Tabs ref TS2322 等),
  // 标准 tsc 全部通过 0 错误。tsc 生成的声明更可靠。
  splitting: false,
  sourcemap: true,
  clean: true,
  // Externalize all non-relative imports (node_modules)
  external: [/^[^./]/],
  outDir: 'dist',
  treeshake: true,
});
