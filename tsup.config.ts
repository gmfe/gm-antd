import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  // 临时只产 CJS 验证 ERP 接入: ESM bundle 的 external import(dayjs/plugin/*, antd/es/locale/*)
  // 无扩展名会撞 webpack5 的 .mjs fullySpecified 严格解析。后续优化 ESM(exports 字段 + bundle 策略)。
  format: ['cjs'],
  // dts 不由 tsup 生成, 改由 `tsc --emitDeclarationOnly` 单独产出(见 package.json build:wrapper)。
  // 原因: tsup 内置的 rollup-plugin-dts 对 antd5 的复杂泛型/继承/forwardRef ref 类型有系统性解析
  // bug(CascaderProps 多泛型 TS2314、MentionsProps 深继承 TS2724、Tabs ref TS2322 等),
  // 标准 tsc 全部通过 0 错误。tsc 生成的声明更可靠。
  splitting: false,
  sourcemap: true,
  // watch 模式不 clean: 重建时不擦 dist,避免 dist/index.js 短暂缺失导致 link 消费方(如 erp)
  // 解析 antd 失败并污染 webpack 持久化缓存。正式构建仍 clean,清理过期声明产物。
  clean: !options.watch,
  // Externalize all non-relative imports (node_modules)
  external: [/^[^./]/],
  outDir: 'dist',
  treeshake: true,
}));
