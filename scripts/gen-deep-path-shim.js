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
  { path: 'layout/layout', expr: 'Layout', type: 'default' },
  // Table
  { path: 'table/Table', expr: 'Table', type: 'default' },
  // locale (antd4 default export, 转发到 wrapper gmZhCN)
  { path: 'locale/zh_CN', expr: 'gmZhCN', type: 'default' },
  // hooks (antd4 named export)
  { path: 'form/hooks/useFormInstance', expr: 'Form.useFormInstance', type: 'named', name: 'useFormInstance' },
  { path: 'table/hooks/useTableResizable', expr: 'useTableResizable', type: 'named', name: 'useTableResizable' },
  { path: 'table/hooks/useTableVirtual', expr: 'useTableVirtual', type: 'named', name: 'useTableVirtual' },
  { path: 'table/hooks/useTableSelection', expr: 'useTableSelection', type: 'named', name: 'useTableSelection' },
  { path: 'table/hooks/useTableDIY', expr: 'useTableDIY', type: 'named', name: 'useTableDIY' },
  { path: 'table/hooks/useTableTheme', expr: 'useTableTheme', type: 'named', name: 'useTableTheme' },
  { path: 'table/hooks/useTableExpandable', expr: 'useTableExpandable', type: 'named', name: 'useTableExpandable' },
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

// 表达式链 + optional chaining 安全访问: 'Typography.Paragraph' → '_m.Typography?.Paragraph'
function accessChain(expr, v) {
  return expr.split('.').map((seg, i) => (i === 0 ? `${v}.${seg}` : seg)).join('?.');
}

function genCJS(shim) {
  const rel = relToDist(shim.path);
  const chain = accessChain(shim.expr, '_m');
  if (shim.type === 'default') {
    return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// auto-generated deep-path shim → wrapper top-level export
var _m = require(${JSON.stringify(rel)});
var _v = ${chain};
exports.default = _v;
module.exports = _v;
`;
  }
  // named
  return `"use strict";
// auto-generated deep-path shim → wrapper top-level export
var _m = require(${JSON.stringify(rel)});
exports.${shim.name} = ${chain};
`;
}

function genESM(shim) {
  const rel = relToDist(shim.path);
  const chain = accessChain(shim.expr, '_m');
  if (shim.type === 'default') {
    return `// auto-generated deep-path shim → wrapper top-level export
import * as _m from ${JSON.stringify(rel)};
var _v = ${chain};
export { _v as default };
`;
  }
  return `// auto-generated deep-path shim → wrapper top-level export
import * as _m from ${JSON.stringify(rel)};
export var ${shim.name} = ${chain};
`;
}

function genDTS(shim) {
  const rel = relToDist(shim.path);
  const chain = accessChain(shim.expr, '_m');
  if (shim.type === 'default') {
    return `// auto-generated deep-path shim types
import * as _m from ${JSON.stringify(rel)};
declare const _v: typeof ${chain};
export { _v as default };
`;
  }
  return `// auto-generated deep-path shim types
import * as _m from ${JSON.stringify(rel)};
export declare const ${shim.name}: typeof ${chain};
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

function main() {
  rmkdir(LIB_DIR);
  rmkdir(ES_DIR);
  let n = 0;
  for (const shim of SHIMS) {
    writeFile(LIB_DIR, shim, genCJS);
    writeFile(ES_DIR, shim, genESM);
    n++;
  }
  console.log(`[gen-deep-path-shim] generated ${n} shims × (lib + es + d.ts) = ${n * 4} files`);
  console.log(`[gen-deep-path-shim] lib/ → ${LIB_DIR}`);
  console.log(`[gen-deep-path-shim] es/  → ${ES_DIR}`);
}

main();
