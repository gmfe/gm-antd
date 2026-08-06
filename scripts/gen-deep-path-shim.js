#!/usr/bin/env node
/**
 * gen-deep-path-shim.js — 为 gm-antd 生成 antd4 深路径转发层
 *
 * 背景:
 *   gm-antd 由 antd4 fork 升级到 antd5 wrapper(tsup 单文件打包 dist/)。
 *   tsup 只产 dist/index.js, 丢失了 antd4 时代的 lib/ es/ 目录结构。
 *   消费方(ERP)有 ~558 处 antd4 深路径 import(antd/lib/* antd/es/*), npm 包里
 *   无 lib/es → webpack Module not found → 启动崩。
 *
 *   其中 ~440 处是类型 import({ ColumnType } 等), babel strip 后 dev server 不解析、不报。
 *   剩余 ~40 处值 import(组件 member/hook/locale, 作值用) dev server 报。
 *   本脚本只为这些「值 import 深路径」生成 lib/ es/ 转发文件, 指向 dist/index.js(wrapper
 *   顶层导出, 含 compat 垫片), 让消费方零改动解析。
 *
 * 产物:
 *   lib/<path>.js  (CJS)   — webpack 解析 antd/lib/<path>
 *   es/<path>.js   (ESM)   — webpack 解析 antd/es/<path>
 *   lib/<path>.d.ts / es/<path>.d.ts — tsc 类型解析(尽力转发)
 *
 * 用法: node scripts/gen-deep-path-shim.js  (已接入 build:wrapper)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIB_DIR = path.join(ROOT, 'lib');
const ES_DIR = path.join(ROOT, 'es');

/**
 * 深路径 → wrapper 顶层导出表达式
 * - type 'default': antd4 该深路径是 default export (组件 member / locale)
 * - type 'named':   antd4 该深路径是 named export (hook)
 * - expr: wrapper 顶层访问链, 如 'Typography.Paragraph' / 'useTableResizable'
 */
const SHIMS = [
  // Typography 成员 (antd4: antd/lib/typography/X default export)
  { path: 'typography/Paragraph', expr: 'Typography.Paragraph', type: 'default' },
  { path: 'typography/Text', expr: 'Typography.Text', type: 'default' },
  { path: 'typography/Title', expr: 'Typography.Title', type: 'default' },
  { path: 'typography/Link', expr: 'Typography.Link', type: 'default' },
  // Input 成员
  { path: 'input/TextArea', expr: 'Input.TextArea', type: 'default' },
  { path: 'input/Password', expr: 'Input.Password', type: 'default' },
  { path: 'input/Search', expr: 'Input.Search', type: 'default' },
  // Upload 成员
  { path: 'upload/Dragger', expr: 'Upload.Dragger', type: 'default' },
  // Checkbox 成员
  { path: 'checkbox/Group', expr: 'Checkbox.Group', type: 'default' },
  // Collapse 成员 (antd4 CollapsePanel → antd5 Collapse.Panel)
  { path: 'collapse/CollapsePanel', expr: 'Collapse.Panel', type: 'default' },
  // Form 成员 (antd4 FormList/FormItem/FormProvider → antd5 Form.List/Item/Provider)
  { path: 'form/FormList', expr: 'Form.List', type: 'default' },
  { path: 'form/FormItem', expr: 'Form.Item', type: 'default' },
  { path: 'form/FormProvider', expr: 'Form.Provider', type: 'default' },
  // Layout
  { path: 'layout/layout', expr: 'Layout', type: 'default', members: ['Header', 'Footer', 'Sider', 'Content'] },
  // Table
  { path: 'table/Table', expr: 'Table', type: 'default' },
  // Table 深路径根 (antd/lib/table / antd/es/table): 消费方 ~130 处从这里导入
  // ColumnsType/ColumnType/TableProps 等类型(antd4 习惯写法)。代理到真实 antd5 对应模块,
  // 保持原深路径的命名类型导出可解析,业务零改动。
  { path: 'table', proxy: { cjs: 'node_modules/antd/lib/table', esm: 'node_modules/antd/es/table', types: 'node_modules/antd/lib/table' } },
  { path: 'table/interface', proxy: { cjs: 'node_modules/antd/lib/table/interface', esm: 'node_modules/antd/es/table/interface', types: 'node_modules/antd/lib/table/interface' } },
  // locale (antd4 default export, 转发到 wrapper gmZhCN)
  { path: 'locale/zh_CN', expr: 'gmZhCN', type: 'default' },
  // DatePicker locale 需要 picker locale(lang/timePickerLocale), 不能转发 ConfigProvider locale。
  {
    path: 'date-picker/locale/zh_CN',
    passthrough: {
      cjs: 'node_modules/antd/lib/date-picker/locale/zh_CN.js',
      esm: 'node_modules/antd/es/date-picker/locale/zh_CN.js',
      types: 'node_modules/antd/es/date-picker/locale/zh_CN',
    },
  },
  // hooks (antd4 named export)
  { path: 'form/hooks/useFormInstance', expr: 'Form.useFormInstance', type: 'named', name: 'useFormInstance' },
  { path: 'table/hooks/useTableResizable', expr: 'useTableResizable', type: 'named', name: 'useTableResizable' },
  { path: 'table/hooks/useTableVirtual', expr: 'useTableVirtual', type: 'named', name: 'useTableVirtual' },
  { path: 'table/hooks/useTableSelection', expr: 'useTableSelection', type: 'named', name: 'useTableSelection' },
  { path: 'table/hooks/useTableDIY', expr: 'useTableDIY', type: 'named', name: 'useTableDIY' },
  { path: 'table/hooks/useTableTheme', expr: 'useTableTheme', type: 'named', name: 'useTableTheme' },
  { path: 'table/hooks/useTableExpandable', expr: 'useTableExpandable', type: 'named', name: 'useTableExpandable' },
  // Modal 根 (ERP import modal from 'antd/lib/modal', 用 modal.confirm 等静态方法)
  { path: 'modal', expr: 'Modal', type: 'default' },
  // Form 深路径 (ERP import { useWatch } from 'antd/(lib|es)/form/Form', Form 静态成员)
  { path: 'form/Form', expr: 'Form', type: 'default', members: ['useWatch', 'useFormInstance', 'Item', 'List', 'Provider'] },
  // BatchActions (gm-antd src/index.ts 顶层补导出, useTableSelection 配套批量操作组件)
  { path: 'table/hooks/useTableSelection/BatchActions', expr: 'BatchActions', type: 'default' },
];

const LESS_SHIMS = [
  'style/reset_theme.less',
  'style/reset_component.less',
];

function rmkdir(d) {
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}

function depthOf(p) {
  return p.split('/').length;
}

// 从 lib|es/<path>.js 到包根 dist/index.js 的相对路径
function relToDist(p) {
  const depth = depthOf(p);
  return '../'.repeat(depth) + 'dist/index.js';
}

function relToPackagePath(p, target) {
  const depth = depthOf(p);
  return '../'.repeat(depth) + target;
}

// 表达式链 + optional chaining 安全访问: 'Typography.Paragraph' → '_m.Typography?.Paragraph'
function accessChain(expr, v) {
  return expr.split('.').map((seg, i) => (i === 0 ? `${v}.${seg}` : seg)).join('?.');
}

function genCJS(shim) {
  if (shim.proxy) {
    const rel = relToPackagePath(shim.path, shim.proxy.cjs);
    return `"use strict";
// auto-generated deep-path proxy → upstream antd module (full re-export)
module.exports = require(${JSON.stringify(rel)});
`;
  }
  if (shim.passthrough) {
    const rel = relToPackagePath(shim.path, shim.passthrough.cjs);
    return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto-generated deep-path shim → upstream antd locale
var _v = require(${JSON.stringify(rel)});
exports.default = _v.default || _v;
`;
  }

  const rel = relToDist(shim.path);
  const chain = accessChain(shim.expr, '_m');
  if (shim.type === 'default') {
    const members = (shim.members || []).map(mb => `exports.${mb} = _v && _v.${mb};`).join('\n');
    return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto-generated deep-path shim → wrapper top-level export${shim.members ? ' (default + namespace members)' : ''}
var _m = require(${JSON.stringify(rel)});
var _v = ${chain};
exports.default = _v;
${members}
`;
  }
  // named (同时 export default, 兼容 default import 写法: import useFormInstance from '...')
  return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto-generated deep-path shim → wrapper top-level export (default + named)
var _m = require(${JSON.stringify(rel)});
var _v = ${chain};
exports.default = _v;
exports.${shim.name} = _v;
`;
}

function genESM(shim) {
  if (shim.proxy) {
    const rel = relToPackagePath(shim.path, shim.proxy.esm);
    return `// auto-generated deep-path proxy → upstream antd module (full re-export)
export * from ${JSON.stringify(rel)};
export { default } from ${JSON.stringify(rel)};
`;
  }
  if (shim.passthrough) {
    const rel = relToPackagePath(shim.path, shim.passthrough.esm);
    return `// auto-generated deep-path shim → upstream antd locale
export { default } from ${JSON.stringify(rel)};
`;
  }

  const rel = relToDist(shim.path);
  const chain = accessChain(shim.expr, '_m');
  if (shim.type === 'default') {
    const members = (shim.members || []).map(mb => `export const ${mb} = _v && _v.${mb};`).join('\n');
    return `// auto-generated deep-path shim → wrapper top-level export${shim.members ? ' (default + namespace members)' : ''}
import * as _m from ${JSON.stringify(rel)};
var _v = ${chain};
export { _v as default };
${members}
`;
  }
  return `// auto-generated deep-path shim → wrapper top-level export (default + named)
import * as _m from ${JSON.stringify(rel)};
var _v = ${chain};
export { _v as default, _v as ${shim.name} };
`;
}

function genDTS(shim) {
  if (shim.proxy) {
    const rel = relToPackagePath(shim.path, shim.proxy.types);
    return `// auto-generated deep-path proxy types → upstream antd module (full re-export)
export * from ${JSON.stringify(rel)};
export { default } from ${JSON.stringify(rel)};
`;
  }
  if (shim.passthrough) {
    const rel = relToPackagePath(shim.path, shim.passthrough.types);
    return `// auto-generated deep-path shim types → upstream antd locale
export { default } from ${JSON.stringify(rel)};
`;
  }

  const rel = relToDist(shim.path);
  const chain = `_m.${shim.expr}`;
  if (shim.type === 'default') {
    const members = (shim.members || []).map(mb => `export declare const ${mb}: typeof _v.${mb};`).join('\n');
    return `// auto-generated deep-path shim types${shim.members ? ' (default + namespace members)' : ''}
import * as _m from ${JSON.stringify(rel)};
declare const _v: typeof ${chain};
export { _v as default };
${members}
`;
  }
  return `// auto-generated deep-path shim types (default + named)
import * as _m from ${JSON.stringify(rel)};
declare const _v: typeof ${chain};
export { _v as default };
export declare const ${shim.name}: typeof _v;
`;
}

function writeFile(baseDir, shim, gen) {
  const fp = path.join(baseDir, shim.path + '.js');
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, gen(shim));
  // d.ts
  const dp = path.join(baseDir, shim.path + '.d.ts');
  fs.writeFileSync(dp, genDTS(shim));
}

function writeLessShims(baseDir) {
  for (const lessPath of LESS_SHIMS) {
    const fp = path.join(baseDir, lessPath);
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(
      fp,
      `/* auto-generated compatibility shim: legacy antd4 reset less is replaced by GMGlobalStyle. */\n`,
    );
  }
}

function main() {
  rmkdir(LIB_DIR);
  rmkdir(ES_DIR);
  let n = 0;
  for (const shim of SHIMS) {
    writeFile(LIB_DIR, shim, genCJS);
    writeFile(ES_DIR, shim, genESM);
    n++;
  }
  writeLessShims(LIB_DIR);
  writeLessShims(ES_DIR);
  console.log(`[gen-deep-path-shim] generated ${n} shims × (lib + es + d.ts) = ${n * 4} files`);
  console.log(`[gen-deep-path-shim] generated ${LESS_SHIMS.length} less shims × (lib + es)`);
  console.log(`[gen-deep-path-shim] lib/ → ${LIB_DIR}`);
  console.log(`[gen-deep-path-shim] es/  → ${ES_DIR}`);
}

main();
