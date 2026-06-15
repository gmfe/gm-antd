# gm-antd antd5 无损升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **🚫 全局硬性约束(来自用户 CLAUDE.md,优先级最高,覆盖 skill 模板):**
> 1. **禁止自动 `git commit` / `git push`。** 本计划中**不包含任何自动提交步骤**。每个 Task 结尾的「Checkpoint」只允许 `git add`(可选),随后**提醒用户**使用 `/my-commit` 自行提交。绝不替用户执行 commit。
> 2. **禁止使用 `useCallback`。** 所有新写的垫片/工具一律用普通函数声明(`const fn = () => {}`)或 `React.memo` 包裹子组件,不得出现 `useCallback`。`GmSelect.tsx` 现有 `useCallback` 在合并时移除。
> 3. 计划全部完成后,提醒用户 `/my-commit` 提交,并询问是否执行 `/fe-feature` 生成开发文档。

**Goal:** 让 gm-antd 真正跑在 antd 5 上,并通过对业务侧零改动的方式全吸收 antd 4→5 breaking changes。

**Architecture:** 三层执行 —— Layer 0 解阻塞(强制 antd 5 提升到顶层 + 移除污染的旧 rc-*),Layer 1 加 `src/compat/` 垫片层 + 修复残留 v5 问题,Layer 2 退役 `components/` antd4 fork 与 bisheng 工具链。垫片 = 薄 `forwardRef` 包装,接收 v4 props 并翻译为 v5,从 `src/index.ts` 同名覆盖 `export * from 'antd'`(显式 export 覆盖值导出,显式 `export type` 覆盖类型导出)。

**Tech Stack:** React 17, TypeScript, antd 5.12+, dayjs(utc/timezone/customParseFormat 插件), moment + moment-timezone(边界转换), tsup(构建), dumi(文档), ts-jest(垫片单测)。

**关联设计 spec:** `docs/superpowers/specs/2026-06-12-antd5-lossless-upgrade-design.md`

---

## 关键设计决策(本计划对 spec 的落定)

- **spec §1A 类型导出**:采用 **显式 export 覆盖**。TS 规则:`export * from 'antd'` 与同名显式 `export`(值或 `export type`)冲突时,**显式 export 胜出**,`export *` 的同名项被忽略。因此 `src/index.ts` 先 `export * from 'antd'`,再对垫片组件显式导出**值**与**加宽后的 props 类型**(V4 ∪ V5),业务侧 `import { Select, SelectProps } from 'gm-antd'` 拿到的类型与运行时都接受 v4 旧 API。**不再需要** spec 设想的 `src/compat/antd-reexport.ts` 过滤式再导出文件(YAGNI)。若编译器对个别名字报 duplicate(不应发生),备选是模块增强 `declare module 'gm-antd'`。
- **DatePicker(决策 B1+)**:加载 dayjs `utc`/`timezone`/`customParseFormat` 插件;`moment.tz` 需要 `moment-timezone` 包(base `moment` 无 `.tz`),故新增 `moment-timezone` 依赖。转换函数对 epoch ms 取值,`tz` 仅决定显示,保证绝对时刻不丢。
- **Tabs/Menu(children→items)**:仅当未传 `items` 且 children 中检测到 `TabPane`/`Menu.Item`/`Menu.SubMenu` 类型时才转换,否则原样透传给 antd 5(antd 5 仍渲染旧 children,仅警告),避免误伤自定义 children。
- **CSS**:token 优先 + `cssVar: true`,仅极少量注入式全局 CSS(token 表达不了的)。

## 文件结构(新建/修改总览)

```
src/compat/
├── withCompat.ts                 # 通用 v4→v5 prop 改名工具 + applyCompatProps
├── withBaseSelectCompat.ts       # Select 系通用垫片(dropdownClassName→popupClassName 等)
├── dateUtils.ts                  # moment↔dayjs 时区感知互转 + RangePicker null-aware 元组
├── childrenToItems.ts            # Tabs.TabPane / Menu.Item children → items[] 转换
├── Modal.tsx  Drawer.tsx  Tooltip.tsx  Popover.tsx  Dropdown.tsx  Popconfirm.tsx  # visible→open 系
├── Input.tsx  InputNumber.tsx    # bordered→variant 系
├── Cascader.tsx  TreeSelect.tsx  AutoComplete.tsx  Mentions.tsx  # BaseSelect 系
├── Select.tsx                    # BaseSelect 兼容 + GmSelect 增强(合并 src/select)
├── message.ts                    # message.warn 别名
├── Tabs.tsx  Menu.tsx            # children→items 系
├── DatePicker.tsx                # moment 边界转换(含 .RangePicker)
├── index.ts                      # compat 内部桶导出
└── __tests__/
    ├── withCompat.test.ts
    ├── dateUtils.test.ts
    └── childrenToItems.test.ts
```

修改的既有文件:`package.json`、`src/index.ts`、`src/styles/theme.ts`、`src/styles/global.ts`、`src/table/hooks/useTableDIY/index.tsx`、`src/table/hooks/useTableTheme/index.tsx`、`src/table/hooks/useTableVirtual/index.tsx`、`src/table/hooks/useTableVirtual/TableContainer.tsx`、`src/table/hooks/useTableSelection/index.tsx`、`src/table/interface.ts`、`src/select/GmSelect.tsx`、`src/select/index.ts`、`src/locale/zh_CN.ts`、`src/locale-adapter/useGMLocale.ts`、`src/table-filter/components/Setting.tsx`、根 `tsconfig.json`、`.dumirc.ts`、新增 `jest.config.compat.ts`、`tsconfig.build.json`(微调)。

---

## Layer 0 — 解阻塞

### Task 1: package.json 加 resolutions + 移除污染的旧 rc-* 直接依赖

**Files:**
- Modify: `package.json`(dependencies 块 lines 103-135;顶层新增 `resolutions`)

- [ ] **Step 1: 在 `package.json` 顶层(`"scripts"` 之后、`"dependencies"` 之前)新增 `resolutions` 字段**

在 `"dependencies": {` 上一行插入:

```json
  "resolutions": {
    "antd": "^5.12.0"
  },
```

作用:强制 yarn classic 把**全树** antd 统一到 5.x,消除「antd 4 被引用次数更多 → 提升到顶层」的歧义(spec R1)。

- [ ] **Step 2: 从 `dependencies` 移除 antd 5 已自带的 30 个 rc-* 直接依赖**

删除 `package.json` dependencies 块中以下行(antd 5 内部已自带,顶层旧版会污染其 `require('rc-*')`):

```
"rc-cascader": "~3.7.0",
"rc-checkbox": "~2.3.0",
"rc-collapse": "~3.4.2",
"rc-dialog": "~9.0.2",
"rc-drawer": "~6.0.0",
"rc-dropdown": "~4.0.0",
"rc-field-form": "~1.27.0",
"rc-image": "~5.9.0",
"rc-input": "~0.1.4",
"rc-input-number": "~7.3.9",
"rc-mentions": "~1.10.0",
"rc-menu": "~9.6.3",
"rc-motion": "^2.6.1",
"rc-notification": "~4.6.0",
"rc-pagination": "~3.1.17",
"rc-picker": "~2.6.11",
"rc-progress": "~3.4.1",
"rc-rate": "~2.9.0",
"rc-segmented": "~2.1.0",
"rc-select": "~14.1.13",
"rc-slider": "~10.0.0",
"rc-steps": "~5.0.0-alpha.0",
"rc-switch": "~3.2.0",
"rc-table": "~7.26.0",
"rc-tabs": "~12.2.0",
"rc-textarea": "~0.4.5",
"rc-tooltip": "~5.2.0",
"rc-tree": "~5.7.0",
"rc-tree-select": "~5.5.0",
"rc-trigger": "^5.2.10",
"rc-upload": "~4.3.0",
"rc-util": "^5.22.5",
```

**保留**(gm-antd 直接 import,非 antd 自带):`rc-resize-observer`、`react-resizable`、`react-window`、`sortablejs`、`moment`。

> 注:`@ant-design/colors ^6`、`@ant-design/cssinjs`、`@ant-design/react-slick`、`@ctrl/tinycolor`、`copy-to-clipboard`、`scroll-into-view-if-needed` 这些是 antd 4 fork 残留的非 rc 依赖,归属 Layer 2 一并评估移除;本层不动。

- [ ] **Step 3: 校验 package.json 仍是合法 JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package.json OK')"`
Expected: `package.json OK`

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。提醒用户:`package.json 已修改(resolutions + 移除 rc-*),请使用 /my-commit 提交。`

---

### Task 2: 重装依赖并验证 antd 5 提升到顶层

**Files:** 无源码改动(仅依赖刷新)

- [ ] **Step 1: 删除陈旧 node_modules 与 yarn.lock,重新安装**

Run: `rm -rf node_modules yarn.lock && yarn install`
Expected: 安装完成,无错误。新 `yarn.lock` 生成。

> 作用:Task 1 的 `resolutions` 与 rc-* 移除只有在重新解析依赖后才生效;陈旧 `node_modules` 是 antd 4 停留顶层的直接原因。

- [ ] **Step 2: 验证顶层 antd 已是 5.x**

Run: `node -e "console.log('antd version:', require('antd/package.json').version)"`
Expected: 打印 `5.x`(如 `5.29.3`)。

- [ ] **Step 3: 确认全树无顶层 antd 4(若有嵌套属正常)**

Run: `npm ls antd 2>&1 | head -40`
Expected: 顶层为 `antd@5.x`;若出现 `antd@4` 仅在 bisheng-plugin 嵌套子树中(Layer 2 退役 bisheng 后彻底消除)。

- [ ] **Step 4: 确认 tsup 已随重装存在**

Run: `ls node_modules/.bin/tsup && echo "tsup OK"`
Expected: 打印路径 + `tsup OK`(tsup 已在 devDeps line 288,之前缺失仅因未重装)。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。`yarn.lock` 与 `node_modules` 不入库(本仓库 `.gitignore` 已忽略 node_modules;yarn.lock 是否入库由用户在 /my-commit 时决定)。

---

### Task 3: 捕获 antd 5 下 tsc 基线错误清单

> 本 Task 不修代码,只**测量**。后续 Task 16-20 按类别消化这份清单。spec 估算「约 12 个真实 src bug + 7 处 demo」,本步用真实编译器确认。

**Files:**
- Create: `docs/superpowers/notes/tsc-baseline-layer0.txt`(临时测量产物,Layer 2 清理时删除)

- [ ] **Step 1: 运行包装层类型检查,捕获全部错误**

Run: `npx tsc -p tsconfig.build.json > docs/superpowers/notes/tsc-baseline-layer0.txt 2>&1; echo "exit=$?"; wc -l docs/superpowers/notes/tsc-baseline-layer0.txt`
Expected: 退出码非 0;文件含错误清单。`wc -l` 给出错误行数。

- [ ] **Step 2: 人工将错误归类到下面三类,在 txt 顶部用注释标注**

打开 `docs/superpowers/notes/tsc-baseline-layer0.txt`,在顶部追加注释,把每个错误归入:
- `[DEEP]` 深路径 import(`antd/es/*`、`rc-table/lib/*`)→ Task 17
- `[PORTAL/CSS]` portal / cssVar / 滚动锁 / global CSS → Task 16、18
- `[REAL]` 其余真实类型/逻辑 bug(demo 签名、SortableDataItem、useTableTheme 等)→ Task 19、20

- [ ] **Step 3: 确认清单中无 module-not-found 错误**

Run: `grep -c "Cannot find module" docs/superpowers/notes/tsc-baseline-layer0.txt`
Expected: `0`(若有,说明 Task 1/2 未彻底解决 rc-*/antd 解析,回到 Task 1 排查)。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。基线文件是临时产物,可不入库。

---

## Layer 1A — 兼容垫片层

### Task 4: 搭建 compat 层独立 jest 配置

> 现有 `.jest.js` 依赖 `@ant-design/tools/lib/jest/codePreprocessor`(antd4 fork 工具,Layer 2 删除),不适合跑 `src/compat`。建一套轻量 ts-jest 配置,只跑垫片的**纯函数**单测。

**Files:**
- Modify: `package.json`(devDependencies 加 `ts-jest`)
- Create: `jest.config.compat.ts`

- [ ] **Step 1: 安装 ts-jest**

Run: `yarn add -D ts-jest@^29`
Expected: 安装成功,`package.json` devDeps 出现 `ts-jest`。

- [ ] **Step 2: 创建 `jest.config.compat.ts`**

```ts
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/compat'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  transform: {
    '\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.build.json' }],
  },
};

export default config;
```

- [ ] **Step 3: 验证空配置可跑(尚无测试,应报 no tests 但退出 0)**

Run: `npx jest --config jest.config.compat.ts --passWithNoTests; echo "exit=$?"`
Expected: `No tests found` 且 `exit=0`。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。提醒用户:`jest.config.compat.ts + ts-jest 已加,请使用 /my-commit 提交。`

---

### Task 5: withCompat 通用改名工具(含单测)

**Files:**
- Create: `src/compat/withCompat.ts`
- Create: `src/compat/__tests__/withCompat.test.ts`

- [ ] **Step 1: 写失败测试**

`src/compat/__tests__/withCompat.test.ts`:

```ts
import { applyCompatProps } from '../withCompat';

describe('applyCompatProps', () => {
  it('把 v4 别名改名为 v5(当 v5 缺席时)', () => {
    expect(applyCompatProps({ visible: true }, { rename: { visible: 'open' } })).toEqual({ open: true });
  });

  it('v4 与 v5 同时存在时 v5 胜出,并删除 v4 别名', () => {
    expect(applyCompatProps({ visible: false, open: true }, { rename: { visible: 'open' } })).toEqual({ open: true });
  });

  it('保留无关 props', () => {
    expect(applyCompatProps({ title: 'x', visible: true }, { rename: { visible: 'open' } })).toEqual({ title: 'x', open: true });
  });

  it('rename 后再执行 transform', () => {
    const out = applyCompatProps({ bordered: false }, {
      rename: {},
      transform: (p) => {
        if (p.bordered === false && p.variant === undefined) p.variant = 'borderless';
        delete p.bordered;
        return p;
      },
    });
    expect(out).toEqual({ variant: 'borderless' });
  });

  it('无 rename/transform 时原样返回(浅拷贝)', () => {
    const src = { a: 1 };
    const out = applyCompatProps(src, {});
    expect(out).toEqual({ a: 1 });
    expect(out).not.toBe(src);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/withCompat.test.ts`
Expected: FAIL(`Cannot find module '../withCompat'`)。

- [ ] **Step 3: 实现 `src/compat/withCompat.ts`**

```ts
import React from 'react';

export type CompatRenameMap = Record<string, string>;

export interface WithCompatOptions {
  /** v4 prop 名 → v5 prop 名,例如 { visible: 'open' } */
  rename?: CompatRenameMap;
  /** rename 之后的额外变换(例如 bordered→variant,需要删原 key),返回处理后的 props */
  transform?: (props: Record<string, any>) => Record<string, any>;
}

/**
 * 把 v4 prop 别名翻译为 v5。v5 prop 显式传入时优先,并删除 v4 别名。
 * 纯函数,无副作用,便于单测。
 */
export function applyCompatProps<P extends Record<string, any>>(
  props: P,
  options: WithCompatOptions,
): Record<string, any> {
  const { rename = {}, transform } = options;
  const out: Record<string, any> = { ...props };
  for (const [from, to] of Object.entries(rename)) {
    if (from in out) {
      if (!(to in out)) {
        out[to] = out[from];
      }
      delete out[from];
    }
  }
  return transform ? transform(out) : out;
}

/**
 * 用薄 forwardRef 包裹 antd 5 组件,使其仍接受 v4 prop 别名。
 * 仅做改名,不做 children 结构转换(Tabs/Menu 另用 childrenToItems)。
 */
export function withCompat<P extends object>(
  Component: React.ComponentType<P>,
  options: WithCompatOptions,
): React.ForwardRefExoticComponent<P & React.RefAttributes<any>> {
  const Wrapped = React.forwardRef<any, P>((props, ref) => {
    const compatProps = applyCompatProps(props as Record<string, any>, options) as P;
    return React.createElement(Component, { ...compatProps, ref });
  });
  (Wrapped as any).displayName = `withCompat(${(Component as any).displayName || (Component as any).name || 'Component'})`;
  return Wrapped;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/withCompat.test.ts`
Expected: PASS(5 passed)。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。提醒用户使用 /my-commit。

---

### Task 6: withBaseSelectCompat — Select 系通用垫片

**Files:**
- Create: `src/compat/withBaseSelectCompat.ts`
- Modify: `src/compat/__tests__/withCompat.test.ts`(追加用例)

- [ ] **Step 1: 追加失败测试到 `src/compat/__tests__/withCompat.test.ts` 末尾**

```ts
import { BASE_SELECT_RENAME } from '../withBaseSelectCompat';
import { applyCompatProps as apply } from '../withCompat';

describe('BaseSelect 系改名', () => {
  it('dropdownClassName → popupClassName', () => {
    expect(apply({ dropdownClassName: 'x' }, { rename: BASE_SELECT_RENAME })).toEqual({ popupClassName: 'x' });
  });
  it('dropdownMatchSelectWidth → popupMatchSelectWidth', () => {
    expect(apply({ dropdownMatchSelectWidth: 200 }, { rename: BASE_SELECT_RENAME })).toEqual({ popupMatchSelectWidth: 200 });
  });
  it('dropdownRender → popupRender', () => {
    const fn = () => null;
    expect(apply({ dropdownRender: fn }, { rename: BASE_SELECT_RENAME })).toEqual({ popupRender: fn });
  });
  it('onDropdownVisibleChange → onOpenChange', () => {
    const fn = () => null;
    expect(apply({ onDropdownVisibleChange: fn }, { rename: BASE_SELECT_RENAME })).toEqual({ onOpenChange: fn });
  });
  it('四项同时存在时全部转换', () => {
    expect(
      apply(
        {
          dropdownClassName: 'x',
          dropdownMatchSelectWidth: true,
          dropdownRender: () => null,
          onDropdownVisibleChange: () => null,
          placeholder: 'p',
        },
        { rename: BASE_SELECT_RENAME },
      ),
    ).toMatchObject({
      popupClassName: 'x',
      popupMatchSelectWidth: true,
      popupRender: expect.any(Function),
      onOpenChange: expect.any(Function),
      placeholder: 'p',
    });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/withCompat.test.ts`
Expected: FAIL(`Cannot find module '../withBaseSelectCompat'`)。

- [ ] **Step 3: 实现 `src/compat/withBaseSelectCompat.ts`**

```ts
import React from 'react';
import { applyCompatProps } from './withCompat';

/** Select/Cascader/TreeSelect/AutoComplete/Mentions 共用的 v4→v5 改名表。 */
export const BASE_SELECT_RENAME = {
  dropdownClassName: 'popupClassName',
  dropdownMatchSelectWidth: 'popupMatchSelectWidth',
  dropdownRender: 'popupRender',
  onDropdownVisibleChange: 'onOpenChange',
} as const;

/** bordered={false} → variant="borderless"(antd5 仍接受 bordered 但会警告,转换以消警告)。 */
export const transformBordered = (p: Record<string, any>): Record<string, any> => {
  if (p.bordered === false && p.variant === undefined) {
    p.variant = 'borderless';
  }
  delete p.bordered;
  return p;
};

/**
 * 包裹一个 antd 5 的 BaseSelect 类组件,使其仍接受 v4 的 dropdown* 系列 props + bordered。
 */
export function withBaseSelectCompat<P extends object>(
  Component: React.ComponentType<P>,
): React.ForwardRefExoticComponent<P & React.RefAttributes<any>> {
  const Wrapped = React.forwardRef<any, P>((props, ref) => {
    const compatProps = applyCompatProps(props as Record<string, any>, {
      rename: BASE_SELECT_RENAME,
      transform: transformBordered,
    }) as P;
    return React.createElement(Component, { ...compatProps, ref });
  });
  (Wrapped as any).displayName = `withBaseSelectCompat(${(Component as any).displayName || (Component as any).name || 'Component'})`;
  return Wrapped;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/withCompat.test.ts`
Expected: PASS(全部用例)。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。

---

### Task 7: visible→open 系垫片(Modal/Drawer/Tooltip/Popover/Dropdown/Popconfirm)

> 同一模式,6 个组件,各自完整代码(不互相引用占位)。

**Files:**
- Create: `src/compat/Modal.tsx`、`src/compat/Drawer.tsx`、`src/compat/Tooltip.tsx`、`src/compat/Popover.tsx`、`src/compat/Dropdown.tsx`、`src/compat/Popconfirm.tsx`

> 说明:antd 5 `Modal` 用 `open` 替代 `visible`、`destroyOnHidden` 替代 `destroyOnClose`;`onVisibleChange` 在 v5 改为 `afterOpenChange`(签名变化,但常见用法 `afterOpenChange(open: boolean)` 兼容旧 `onVisibleChange(open)` 的单参调用)。若业务依赖旧签名双参,运行时不受影响(多出的第二参被忽略)。

- [ ] **Step 1: 创建 `src/compat/Modal.tsx`**

```tsx
import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';
import { withCompat } from './withCompat';

export type ModalProps = AntModalProps;

export default withCompat(AntModal as React.ComponentType<ModalProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'afterOpenChange',
    destroyOnClose: 'destroyOnHidden',
  },
});
```

- [ ] **Step 2: 创建 `src/compat/Drawer.tsx`**

```tsx
import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps as AntDrawerProps } from 'antd';
import { withCompat } from './withCompat';

export type DrawerProps = AntDrawerProps;

export default withCompat(AntDrawer as React.ComponentType<DrawerProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'afterOpenChange',
    destroyOnClose: 'destroyOnHidden',
  },
});
```

- [ ] **Step 3: 创建 `src/compat/Tooltip.tsx`**

```tsx
import React from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps as AntTooltipProps } from 'antd';
import { withCompat } from './withCompat';

export type TooltipProps = AntTooltipProps;

export default withCompat(AntTooltip as React.ComponentType<TooltipProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
```

> 注:Tooltip v5 用 `onOpenChange`,与 Drawer/Modal 的 `afterOpenChange` 不同,故分别指定。

- [ ] **Step 4: 创建 `src/compat/Popover.tsx`**

```tsx
import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { PopoverProps as AntPopoverProps } from 'antd';
import { withCompat } from './withCompat';

export type PopoverProps = AntPopoverProps;

export default withCompat(AntPopover as React.ComponentType<PopoverProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
```

- [ ] **Step 5: 创建 `src/compat/Dropdown.tsx`**

```tsx
import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps as AntDropdownProps } from 'antd';
import { withCompat } from './withCompat';

export type DropdownProps = AntDropdownProps;

export default withCompat(AntDropdown as React.ComponentType<DropdownProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
```

- [ ] **Step 6: 创建 `src/compat/Popconfirm.tsx`**

```tsx
import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps as AntPopconfirmProps } from 'antd';
import { withCompat } from './withCompat';

export type PopconfirmProps = AntPopconfirmProps;

export default withCompat(AntPopconfirm as React.ComponentType<PopconfirmProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
```

- [ ] **Step 7: 类型检查这 6 个垫片编译通过**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "src/compat/" || echo "compat OK"`
Expected: `compat OK`(或仅剩尚未在 index 引入导致的 unused 警告,无类型错误)。

- [ ] **Step 8: Checkpoint**

🚫 不要自动 commit。

---

### Task 8: bordered→variant 系垫片(Input/InputNumber)

**Files:**
- Create: `src/compat/Input.tsx`、`src/compat/InputNumber.tsx`

- [ ] **Step 1: 创建 `src/compat/Input.tsx`**

```tsx
import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import { applyCompatProps } from './withCompat';

export type InputProps = AntInputProps;

const transformBordered = (p: Record<string, any>): Record<string, any> => {
  if (p.bordered === false && p.variant === undefined) {
    p.variant = 'borderless';
  }
  // antd 5 仍接受 bordered(仅警告),这里删除以消警告;true/undefined 时无 variant 副作用
  delete p.bordered;
  return p;
};

const Input = React.forwardRef<any, InputProps>((props, ref) => {
  const compatProps = applyCompatProps(props as Record<string, any>, {
    rename: {},
    transform: transformBordered,
  });
  const { TextArea, Search, Password, Group } = AntInput;
  // 注意:forwardRef 不携带 AntInput 的静态属性,这里用对象合并补回
  const Forwarded = React.forwardRef<any, InputProps>((p, r) => (
    <AntInput ref={r} {...applyCompatProps(p as Record<string, any>, { transform: transformBordered })} />
  ));
  // 本组件即重新生成的带静态属性的 Input
  return <AntInput ref={ref} {...compatProps} />;
});
(Input as any).displayName = 'GmInput';
(Input as any).TextArea = AntInput.TextArea;
(Input as any).Search = AntInput.Search;
(Input as any).Password = AntInput.Password;
(Input as any).Group = AntInput.Group;

export default Input as typeof Input & {
  TextArea: typeof AntInput.TextArea;
  Search: typeof AntInput.Search;
  Password: typeof AntInput.Password;
  Group: typeof AntInput.Group;
};
```

> 说明:保留 `TextArea/Search/Password/Group` 静态挂载,业务 `Input.TextArea` 用法零改动。

- [ ] **Step 2: 创建 `src/compat/InputNumber.tsx`**

```tsx
import React from 'react';
import { InputNumber as AntInputNumber } from 'antd';
import type { InputNumberProps as AntInputNumberProps } from 'antd';
import { applyCompatProps } from './withCompat';

export type InputNumberProps = AntInputNumberProps;

const transformBordered = (p: Record<string, any>): Record<string, any> => {
  if (p.bordered === false && p.variant === undefined) {
    p.variant = 'borderless';
  }
  delete p.bordered;
  return p;
};

export default React.forwardRef<any, InputNumberProps>((props, ref) => (
  <AntInputNumber ref={ref} {...applyCompatProps(props as Record<string, any>, { transform: transformBordered })} />
));
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "src/compat/Input" || echo "Input OK"`
Expected: `Input OK`。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。

---

### Task 9: BaseSelect 系垫片(Cascader/TreeSelect/AutoComplete/Mentions)

**Files:**
- Create: `src/compat/Cascader.tsx`、`src/compat/TreeSelect.tsx`、`src/compat/AutoComplete.tsx`、`src/compat/Mentions.tsx`

- [ ] **Step 1: 创建 `src/compat/Cascader.tsx`**

```tsx
import React from 'react';
import { Cascader as AntCascader } from 'antd';
import type { CascaderProps as AntCascaderProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type CascaderProps = AntCascaderProps;

export default withBaseSelectCompat(AntCascader as React.ComponentType<CascaderProps>);
```

- [ ] **Step 2: 创建 `src/compat/TreeSelect.tsx`**

```tsx
import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps as AntTreeSelectProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type TreeSelectProps = AntTreeSelectProps;

const Compat = withBaseSelectCompat(AntTreeSelect as React.ComponentType<TreeSelectProps>);
// TreeSelect 携带静态节点构造器 TreeNode,需补回
(Compat as any).TreeNode = AntTreeSelect.TreeNode;
(Compat as any).ShowAll = AntTreeSelect.ShowAll;
(Compat as any).ShowParent = AntTreeSelect.ShowParent;
(Compat as any).ShowChild = AntTreeSelect.ShowChild;

export default Compat as typeof Compat & {
  TreeNode: typeof AntTreeSelect.TreeNode;
  ShowAll: typeof AntTreeSelect.ShowAll;
  ShowParent: typeof AntTreeSelect.ShowParent;
  ShowChild: typeof AntTreeSelect.ShowChild;
};
```

- [ ] **Step 3: 创建 `src/compat/AutoComplete.tsx`**

```tsx
import React from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import type { AutoCompleteProps as AntAutoCompleteProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type AutoCompleteProps = AntAutoCompleteProps;

const Compat = withBaseSelectCompat(AntAutoComplete as React.ComponentType<AutoCompleteProps>);
(Compat as any).Option = AntAutoComplete.Option;

export default Compat as typeof Compat & { Option: typeof AntAutoComplete.Option };
```

- [ ] **Step 4: 创建 `src/compat/Mentions.tsx`**

```tsx
import React from 'react';
import { Mentions as AntMentions } from 'antd';
import type { MentionsProps as AntMentionsProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type MentionsProps = AntMentionsProps;

const Compat = withBaseSelectCompat(AntMentions as React.ComponentType<MentionsProps>);
(Compat as any).Option = AntMentions.Option;
(Compat as any).getMentions = AntMentions.getMentions;

export default Compat as typeof Compat & {
  Option: typeof AntMentions.Option;
  getMentions: typeof AntMentions.getMentions;
};
```

- [ ] **Step 5: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -E "src/compat/(Cascader|TreeSelect|AutoComplete|Mentions)" || echo "BaseSelect OK"`
Expected: `BaseSelect OK`。

- [ ] **Step 6: Checkpoint**

🚫 不要自动 commit。

---

### Task 10: Select 垫片(BaseSelect 兼容 + GmSelect 增强,移除 useCallback)

> 把 `src/select/GmSelect.tsx` 的全选/筛选删除增强并入 BaseSelect 兼容垫片,并**移除其 `useCallback`/`useMemo`**(全局禁用 useCallback;`useMemo` 此处无稳定引用消费者,改为内联计算)。

**Files:**
- Create: `src/compat/Select.tsx`
- Modify(移除): `src/select/GmSelect.tsx`(改为从垫片再导出,或直接删除并入)

- [ ] **Step 1: 创建 `src/compat/Select.tsx`**

```tsx
import React from 'react';
import { Select as AntSelect } from 'antd';
import type {
  SelectProps as AntSelectProps,
  RefSelectProps,
  BaseOptionType,
  DefaultOptionType,
} from 'antd';
import { applyCompatProps, type WithCompatOptions } from './withCompat';
import { BASE_SELECT_RENAME } from './withBaseSelectCompat';
import { transformBordered } from './withBaseSelectCompat';
import DropdownRender from '../select/DropdownRender';

export interface GmSelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends AntSelectProps<ValueType, OptionType> {
  /** 是否展示全选 & 展示过滤已删除 */
  isRenderDefaultBottom?: boolean;
  /** 是否展示过滤已删除的数据 */
  isShowDeletedSwitch?: boolean;
  /** 是否展示全选按钮 */
  isShowCheckedAll?: boolean;
}

function GmSelectInner<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(props: GmSelectProps<ValueType, OptionType>, ref: React.Ref<RefSelectProps>) {
  // 1) 先做 BaseSelect v4→v5 改名(dropdownClassName → popupClassName 等)+ bordered→variant
  const renamed = applyCompatProps(props as Record<string, any>, {
    rename: BASE_SELECT_RENAME,
    transform: transformBordered,
  });

  const {
    isRenderDefaultBottom = true,
    isShowCheckedAll = true,
    isShowDeletedSwitch = false,
    options,
    mode,
    value,
    onChange,
    fieldNames,
    popupRender: customPopupRender, // 注意:rename 后已从 dropdownRender 变为 popupRender
    children,
    onSearch,
    optionFilterProp,
    filterOption,
    ...rest
  } = renamed as GmSelectProps<ValueType, OptionType> & { popupRender?: any };

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const useCustomRender =
    isMultiple &&
    isRenderDefaultBottom &&
    !(React.Children.count(children) > 0 || optionFilterProp === 'label');

  // 普通函数替代 useCallback(useSearch)
  const handleSearch = (val: string) => {
    onSearch?.(val);
  };

  // 直接计算 mergedPopupRender,不使用 useMemo(无外部消费者需要稳定引用)
  const mergedPopupRender = (menu: React.ReactElement) => {
    if (!useCustomRender) {
      return customPopupRender ? customPopupRender(menu) : menu;
    }
    return (
      <DropdownRender
        menu={menu}
        value={value}
        onChange={onChange}
        options={options as any[]}
        mode={mode}
        fieldNames={fieldNames}
        isRenderDefaultBottom={isRenderDefaultBottom}
        isShowCheckedAll={isShowCheckedAll}
        isShowDeletedSwitch={isShowDeletedSwitch}
      />
    );
  };

  return (
    <AntSelect<ValueType, OptionType>
      ref={ref}
      {...rest}
      value={value}
      onChange={onChange}
      mode={mode}
      options={options}
      fieldNames={fieldNames}
      popupRender={mergedPopupRender}
      showSearch
      onSearch={handleSearch}
      filterOption={useCustomRender ? false : filterOption}
    />
  );
}

const ForwardedSelect = React.forwardRef(GmSelectInner) as unknown as <
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: React.PropsWithChildren<GmSelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<RefSelectProps>;
  },
) => React.ReactElement;

// 补回 antd Select 静态成员
(ForwardedSelect as any).Option = AntSelect.Option;
(ForwardedSelect as any).OptGroup = AntSelect.OptGroup;
(ForwardedSelect as any).displayName = 'GmSelect';

export default ForwardedSelect as typeof ForwardedSelect & {
  Option: typeof AntSelect.Option;
  OptGroup: typeof AntSelect.OptGroup;
};
```

- [ ] **Step 2: 删除旧的 `src/select/GmSelect.tsx` 的实现,改为从垫片再导出**

用以下内容**整体替换** `src/select/GmSelect.tsx`:

```tsx
// 兼容垫片已承载 BaseSelect 兼容 + GM 增强,这里仅做向后兼容再导出。
export { default } from '../compat/Select';
export type { GmSelectProps } from '../compat/Select';
```

> 这样 `src/select/index.ts` 的 `export { default } from './GmSelect'` 与 `export type { GmSelectProps }` 无需改动,内部指向不变。

- [ ] **Step 3: 确认无 useCallback 残留**

Run: `grep -rn "useCallback" src/select src/compat || echo "no useCallback"`
Expected: `no useCallback`。

- [ ] **Step 4: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -E "src/compat/Select|src/select" || echo "Select OK"`
Expected: `Select OK`。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。

---

### Task 11: message 垫片(warn 别名)

**Files:**
- Create: `src/compat/message.ts`

- [ ] **Step 1: 创建 `src/compat/message.ts`**

```ts
import { message } from 'antd';

// antd 5 移除了 message.warn,业务遗留调用需保留别名。
// 注意:message 是方法集合(success/error/info/warning/loading...),整体再赋 warn。
const compatMessage = message as unknown as typeof message & {
  warn: (typeof message)['warning'];
};

// v4 message.warn === v5 message.warning
compatMessage.warn = message.warning;

export { compatMessage as message };
export default compatMessage;
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "src/compat/message" || echo "message OK"`
Expected: `message OK`。

- [ ] **Step 3: Checkpoint**

🚫 不要自动 commit。

---

### Task 12: childrenToItems 转换工具(Tabs/Menu 共用)+ 单测

**Files:**
- Create: `src/compat/childrenToItems.ts`
- Create: `src/compat/__tests__/childrenToItems.test.ts`

- [ ] **Step 1: 写失败测试**

`src/compat/__tests__/childrenToItems.test.ts`:

```tsx
import React from 'react';
import { tabChildrenToItems, menuChildrenToItems } from '../childrenToItems';

describe('tabChildrenToItems', () => {
  it('把 TabPane children 转成 items(tab→label, children→children)', () => {
    // 模拟 antd 5 仍导出的 TabPane(displayName 为 'TabPane')
    const items = tabChildrenToItems([
      // @ts-ignore 模拟 <Tabs.TabPane key="a" tab="A">a-content</Tabs.TabPane>
      { type: { displayName: 'TabPane' }, key: 'a', props: { tab: 'A', children: 'a-content' } },
    ]);
    expect(items).toEqual([{ key: 'a', label: 'A', children: 'a-content' }]);
  });

  it('已是 items 数组(无 TabPane 元素)时返回 undefined,交还 antd 处理', () => {
    // 普通元素(非 TabPane)→ 返回 undefined,避免误伤
    const items = tabChildrenToItems([React.createElement('div', null, 'x')]);
    expect(items).toBeUndefined();
  });

  it('null/空 children 返回 undefined', () => {
    expect(tabChildrenToItems(null)).toBeUndefined();
    expect(tabChildrenToItems([])).toBeUndefined();
  });
});

describe('menuChildrenToItems', () => {
  it('Menu.Item(key+children)→ leaf {key,label}', () => {
    const items = menuChildrenToItems([
      { type: { displayName: 'MenuItem' }, key: '1', props: { children: 'One' } } as any,
    ]);
    expect(items).toEqual([{ key: '1', label: 'One' }]);
  });

  it('Menu.SubMenu(title+children)→ {key,label,children:[...]}', () => {
    const items = menuChildrenToItems([
      {
        type: { displayName: 'SubMenu' },
        key: 'g1',
        props: {
          title: 'Group',
          children: [{ type: { displayName: 'MenuItem' }, key: '1', props: { children: 'One' } } as any],
        },
      } as any,
    ]);
    expect(items).toEqual([{ key: 'g1', label: 'Group', children: [{ key: '1', label: 'One' }] }]);
  });

  it('普通元素(非 Menu 系列)返回 undefined', () => {
    expect(menuChildrenToItems([React.createElement('div', null, 'x')])).toBeUndefined();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/childrenToItems.test.ts`
Expected: FAIL(`Cannot find module '../childrenToItems'`)。

- [ ] **Step 3: 实现 `src/compat/childrenToItems.ts`**

```ts
import React from 'react';

const TAB_PANE_NAMES = new Set(['TabPane']);
const MENU_ITEM_NAMES = new Set(['MenuItem', 'MenuDivider', 'MenuGroup']);
const MENU_SUBMENU_NAMES = new Set(['SubMenu']);

function elemTypeName(node: React.ReactNode): string | undefined {
  if (!React.isValidElement(node)) return undefined;
  const t = node.type as any;
  return t?.displayName ?? t?.__ANT_TABS_TAB ?? t?.__ANT_MENU_ITEM ?? t?.__ANT_MENU_SUBMENU ?? (typeof t === 'string' ? t : undefined);
}

function isTabPane(node: React.ReactNode): boolean {
  return TAB_PANE_NAMES.has(elemTypeName(node) || '');
}
function isMenuItem(node: React.ReactNode): boolean {
  return MENU_ITEM_NAMES.has(elemTypeName(node) || '');
}
function isMenuSubMenu(node: React.ReactNode): boolean {
  return MENU_SUBMENU_NAMES.has(elemTypeName(node) || '');
}
function isAnyMenu(node: React.ReactNode): boolean {
  const n = elemTypeName(node) || '';
  return MENU_ITEM_NAMES.has(n) || MENU_SUBMENU_NAMES.has(n);
}

/**
 * 把 <Tabs.TabPane> children 转成 antd 5 Tabs 的 items[]。
 * 仅当存在 TabPane 元素时转换;否则返回 undefined(交还 antd 5 处理,可能仅警告)。
 */
export function tabChildrenToItems(children: React.ReactNode): any[] | undefined {
  if (children == null) return undefined;
  const arr = React.Children.toArray(children).filter(Boolean);
  if (!arr.length) return undefined;
  if (!arr.some(isTabPane)) return undefined;
  return arr.map(node => {
    if (!React.isValidElement(node)) return { children: node };
    const { key, props } = node;
    const { tab, children: c, label, ...rest } = props as any;
    return { key, label: label ?? tab, children: c, ...rest };
  });
}

/**
 * 把 <Menu.Item>/<Menu.SubMenu> children 转成 antd 5 Menu 的 items[]。
 * 仅当存在 Menu 系列元素时转换;否则返回 undefined。
 */
export function menuChildrenToItems(children: React.ReactNode): any[] | undefined {
  if (children == null) return undefined;
  const arr = React.Children.toArray(children).filter(Boolean);
  if (!arr.length) return undefined;
  if (!arr.some(isAnyMenu)) return undefined;
  return arr.map(node => {
    if (!React.isValidElement(node)) return { label: node };
    const { key, props } = node;
    const { children: c, title, label, ...rest } = props as any;
    if (isMenuSubMenu(node)) {
      return { key, label: label ?? title, children: menuChildrenToItems(c), ...rest };
    }
    return { key, label: label ?? title ?? c, ...rest };
  });
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/childrenToItems.test.ts`
Expected: PASS。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。

---

### Task 13: Tabs / Menu 垫片(用 childrenToItems)

**Files:**
- Create: `src/compat/Tabs.tsx`、`src/compat/Menu.tsx`

- [ ] **Step 1: 创建 `src/compat/Tabs.tsx`**

```tsx
import React from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps as AntTabsProps } from 'antd';
import { tabChildrenToItems } from './childrenToItems';

export type TabsProps = AntTabsProps;

const CompatTabs = React.forwardRef<any, TabsProps>((props, ref) => {
  const { items, children, ...rest } = props;
  // items(v5 API)优先;否则尝试把 TabPane children 转 items;都无法转换时透传 children(antd5 仍渲染,仅警告)
  const resolvedItems = items ?? tabChildrenToItems(children);
  if (resolvedItems) {
    return <AntTabs ref={ref} {...rest} items={resolvedItems} />;
  }
  return (
    <AntTabs ref={ref} {...rest}>
      {children as any}
    </AntTabs>
  );
});

// 业务可能用 Tabs.TabPane 做类型/引用,保留静态成员(antd5 仍导出,仅渲染时警告,但我们已转换)
(CompatTabs as any).TabPane = AntTabs.TabPane;
(CompatTabs as any).displayName = 'GmTabs';

export default CompatTabs as typeof CompatTabs & {
  TabPane: typeof AntTabs.TabPane;
};
```

- [ ] **Step 2: 创建 `src/compat/Menu.tsx`**

```tsx
import React from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
import { menuChildrenToItems } from './childrenToItems';

export type MenuProps = AntMenuProps;

const CompatMenu = React.forwardRef<any, MenuProps>((props, ref) => {
  const { items, children, ...rest } = props;
  const resolvedItems = items ?? menuChildrenToItems(children);
  if (resolvedItems) {
    return <AntMenu ref={ref} {...rest} items={resolvedItems} />;
  }
  return <AntMenu ref={ref} {...rest} />;
});

// 业务常用 <Menu.Item>/<Menu.SubMenu> 作为类型/构造器引用,保留
(CompatMenu as any).Item = AntMenu.Item;
(CompatMenu as any).SubMenu = AntMenu.SubMenu;
(CompatMenu as any).ItemGroup = AntMenu.ItemGroup;
(CompatMenu as any).Divider = AntMenu.Divider;
(CompatMenu as any).displayName = 'GmMenu';

export default CompatMenu as typeof CompatMenu & {
  Item: typeof AntMenu.Item;
  SubMenu: typeof AntMenu.SubMenu;
  ItemGroup: typeof AntMenu.ItemGroup;
  Divider: typeof AntMenu.Divider;
};
```

- [ ] **Step 3: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -E "src/compat/(Tabs|Menu)" || echo "Tabs/Menu OK"`
Expected: `Tabs/Menu OK`。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。

---

### Task 14: DatePicker 垫片(moment.tz 时区感知边界转换)+ 单测

> 核心任务。新增 `moment-timezone` 依赖(base `moment` 无 `.tz`)。覆盖 spec §5.1 全部入口点:value/defaultValue/defaultPickerValue/pickerValue/onChange/onOk/disabledDate/showTime.defaultValue。RangePicker null-aware 元组转换。

**Files:**
- Modify: `package.json`(dependencies 加 `moment-timezone`)
- Create: `src/compat/dateUtils.ts`
- Create: `src/compat/__tests__/dateUtils.test.ts`
- Create: `src/compat/DatePicker.tsx`

- [ ] **Step 1: 安装 moment-timezone**

Run: `yarn add moment-timezone@^0.5.45`
Expected: `package.json` dependencies 出现 `moment-timezone`。

- [ ] **Step 2: 写失败测试 `src/compat/__tests__/dateUtils.test.ts`**

```ts
import dayjs from 'dayjs';
import moment from 'moment-timezone';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from '../dateUtils';

describe('momentToDayjs / dayjsToMoment', () => {
  it('round-trip 保持绝对时刻(epoch ms)', () => {
    const m = moment('2026-06-12T10:00:00Z');
    const d = momentToDayjs(m)!;
    expect(d.valueOf()).toBe(m.valueOf());
    const back = dayjsToMoment(d)!;
    expect(back.valueOf()).toBe(m.valueOf());
  });

  it('时区感知:moment.tz → dayjs.tz round-trip 保持显示时区名', () => {
    const m = moment.tz('2026-06-12 10:00:00', 'Asia/Tokyo');
    const d = momentToDayjs(m)!;
    expect((d as any).$x?.$timezone).toBe('Asia/Tokyo');
    const back = dayjsToMoment(d)!;
    expect(back.tz()).toBe('Asia/Tokyo');
    expect(back.valueOf()).toBe(m.valueOf());
  });

  it('null/undefined 原样返回', () => {
    expect(momentToDayjs(null)).toBeNull();
    expect(momentToDayjs(undefined)).toBeUndefined();
    expect(dayjsToMoment(null)).toBeNull();
  });
});

describe('RangePicker 元组(null-aware)', () => {
  it('moment 元组 → dayjs 元组', () => {
    const t = [moment('2026-01-01'), moment('2026-02-01')] as [moment.Moment, moment.Moment];
    const d = momentTupleToDayjs(t)!;
    expect(d[0].valueOf()).toBe(t[0].valueOf());
    expect(d[1].valueOf()).toBe(t[1].valueOf());
  });

  it('dayjs 元组(含 null 中途值)→ moment 元组,null 保留', () => {
    const t: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [dayjs('2026-01-01'), null];
    const m = dayjsTupleToMoment(t)!;
    expect(m[0].valueOf()).toBe(dayjs('2026-01-01').valueOf());
    expect(m[1]).toBeNull();
  });

  it('null 输入返回 null', () => {
    expect(momentTupleToDayjs(null)).toBeNull();
    expect(dayjsTupleToMoment(null)).toBeNull();
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/dateUtils.test.ts`
Expected: FAIL(`Cannot find module '../dateUtils'`)。

- [ ] **Step 4: 实现 `src/compat/dateUtils.ts`**

```ts
import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment-timezone';
import type { Moment } from 'moment';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/** 从 moment 实例取 IANA 时区名(moment-timezone 存于 _z)。 */
function tzOfMoment(m: Moment): string | undefined {
  const z = (m as any)._z;
  return z?.name ?? (m as any)?.$x?.$timezone;
}

/** 从 dayjs 实例取时区名(dayjs.tz 存于 $x.$timezone)。 */
function tzOfDayjs(d: Dayjs): string | undefined {
  return (d as any)?.$x?.$timezone;
}

/** moment → dayjs,时区感知。null/undefined 原样返回。 */
export function momentToDayjs(m: Moment | null | undefined): Dayjs | null | undefined {
  if (m == null) return m as null | undefined;
  const tz = tzOfMoment(m);
  return tz ? dayjs.tz(m.valueOf(), tz) : dayjs(m.valueOf());
}

/** dayjs → moment,时区感知。null/undefined 原样返回。 */
export function dayjsToMoment(d: Dayjs | null | undefined): Moment | null | undefined {
  if (d == null) return d as null | undefined;
  const tz = tzOfDayjs(d);
  return tz ? moment.tz(d.valueOf(), tz) : moment(d.valueOf());
}

/** [Moment,Moment] → [Dayjs,Dayjs];null 输入返回 null。 */
export function momentTupleToDayjs(
  t: [Moment, Moment] | null | undefined,
): [Dayjs, Dayjs] | null {
  if (!t) return null;
  return [momentToDayjs(t[0]) as Dayjs, momentToDayjs(t[1]) as Dayjs];
}

/**
 * [Dayjs,Dayjs] (或选择中途的 [Dayjs|null, Dayjs|null]) → moment 元组。
 * null 元素保留为 null(RangePicker 选择中途值)。
 */
export function dayjsTupleToMoment(
  t: [Dayjs | null, Dayjs | null] | null | undefined,
): [Moment | null, Moment | null] | null {
  if (!t) return null;
  return [dayjsToMoment(t[0]) ?? null, dayjsToMoment(t[1]) ?? null];
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `npx jest --config jest.config.compat.ts src/compat/__tests__/dateUtils.test.ts`
Expected: PASS。

- [ ] **Step 6: 创建 `src/compat/DatePicker.tsx`(单选 + RangePicker)**

```tsx
import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type {
  DatePickerProps as AntDatePickerProps,
  RangePickerProps as AntRangePickerProps,
} from 'antd';
import type { Moment } from 'moment';
import type { Dayjs } from 'dayjs';
import { momentToDayjs, dayjsToMoment, momentTupleToDayjs, dayjsTupleToMoment } from './dateUtils';
import { transformBordered } from './withBaseSelectCompat';

/** v4 兼容:value/defaultValue 等接受 Moment;onChange 回调返回 Moment。 */
export interface CompatDatePickerProps
  extends Omit<
    AntDatePickerProps,
    'value' | 'defaultValue' | 'defaultPickerValue' | 'pickerValue' | 'onChange' | 'onOk' | 'disabledDate' | 'disabledTime'
  > {
  value?: Moment;
  defaultValue?: Moment;
  defaultPickerValue?: Moment;
  pickerValue?: Moment;
  onChange?: (value: Moment | null, dateString: string) => void;
  onOk?: (value: Moment | null) => void;
  disabledDate?: (current: Moment) => boolean;
  disabledTime?: AntDatePickerProps['disabledTime'];
}

function CompatSingle(props: CompatDatePickerProps, ref: React.Ref<any>) {
  const {
    value,
    defaultValue,
    defaultPickerValue,
    pickerValue,
    onChange,
    onOk,
    disabledDate,
    showTime,
    ...rest
  } = props;

  // showTime 若为对象且含 moment defaultValue,转 dayjs
  let compatShowTime: any = showTime;
  if (showTime && typeof showTime === 'object') {
    const st = showTime as any;
    compatShowTime = {
      ...st,
      ...(st.defaultValue ? { defaultValue: momentToDayjs(st.defaultValue) ?? undefined } : {}),
    };
  }

  return (
    <AntDatePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntDatePickerProps)}
      value={value ? (momentToDayjs(value) ?? undefined) : undefined}
      defaultValue={defaultValue ? (momentToDayjs(defaultValue) ?? undefined) : undefined}
      defaultPickerValue={defaultPickerValue ? (momentToDayjs(defaultPickerValue) ?? undefined) : undefined}
      pickerValue={pickerValue ? (momentToDayjs(pickerValue) ?? undefined) : undefined}
      showTime={compatShowTime}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) => onChange?.(d ? dayjsToMoment(d) ?? null : null, ds as string)}
      onOk={onOk ? (d: Dayjs) => onOk(d ? dayjsToMoment(d) ?? null : null) : undefined}
    />
  );
}

export interface CompatRangePickerProps
  extends Omit<
    AntRangePickerProps,
    'value' | 'defaultValue' | 'defaultPickerValue' | 'onChange' | 'disabledDate'
  > {
  value?: [Moment, Moment] | null;
  defaultValue?: [Moment, Moment] | null;
  defaultPickerValue?: [Moment, Moment] | null;
  onChange?: (value: [Moment | null, Moment | null] | null, dateString: [string, string]) => void;
  disabledDate?: (current: Moment) => boolean;
}

function CompatRange(props: CompatRangePickerProps, ref: React.Ref<any>) {
  const { value, defaultValue, defaultPickerValue, onChange, disabledDate, ...rest } = props;
  return (
    <AntDatePicker.RangePicker
      ref={ref}
      {...(transformBordered(rest as any) as AntRangePickerProps)}
      value={momentTupleToDayjs(value as any) ?? undefined}
      defaultValue={momentTupleToDayjs(defaultValue as any) ?? undefined}
      defaultPickerValue={momentTupleToDayjs(defaultPickerValue as any) ?? undefined}
      disabledDate={disabledDate ? (d: Dayjs) => disabledDate(dayjsToMoment(d)!) : undefined}
      onChange={(d, ds) =>
        onChange?.(d ? (dayjsTupleToMoment(d as any) as any) : null, ds as [string, string])
      }
    />
  );
}

const ForwardedSingle = React.forwardRef(CompatSingle);

type CompatDatePicker = typeof ForwardedSingle & {
  RangePicker: React.ForwardRefExoticComponent<CompatRangePickerProps & React.RefAttributes<any>>;
};

const DatePicker = ForwardedSingle as CompatDatePicker;
DatePicker.RangePicker = React.forwardRef(CompatRange);
(DatePicker as any).displayName = 'GmDatePicker';

export default DatePicker;
```

- [ ] **Step 7: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "src/compat/DatePicker" || echo "DatePicker OK"`
Expected: `DatePicker OK`。

> **R3 时区保真度兜底(B2)**:本垫片用 epoch ms 互转 + dayjs.tz 还原显示时区,绝对时刻不丢。但 antd 5 DatePicker 对 dayjs.tz 的**显示**支持有限,部分场景(`disabledDate` 跨时区判定、`showTime` 时区下拉、`presets`)可能漂移。若 Task 24 Step 9 业务冒烟发现 tz 显示失真,回退**决策 B2**:基于 `rc-picker` + `momentGenerateConfig` 的原生 moment DatePicker(保留 moment 为运行时唯一真相)。届时新增 `src/compat/DatePickerB2.tsx` 替换本实现,接口不变。

- [ ] **Step 8: Checkpoint**

🚫 不要自动 commit。提醒用户:`DatePicker moment.tz 垫片 + moment-timezone 依赖已加,请使用 /my-commit 提交。`

---

### Task 15: compat 桶导出 + 接入 src/index.ts(显式值+类型覆盖)

> 利用 TS「显式 export 覆盖 `export *`」规则:垫片组件的**值**与**加宽后的 props 类型**同名显式导出,覆盖 `export * from 'antd'`。业务侧类型与运行时都接受 v4 旧 API。

**Files:**
- Create: `src/compat/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: 创建 `src/compat/index.ts`**

```ts
// 兼容垫片桶导出(供 src/index.ts 同名覆盖 antd)
export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';
export { default as Drawer } from './Drawer';
export type { DrawerProps } from './Drawer';
export { default as Tooltip } from './Tooltip';
export type { TooltipProps } from './Tooltip';
export { default as Popover } from './Popover';
export type { PopoverProps } from './Popover';
export { default as Dropdown } from './Dropdown';
export type { DropdownProps } from './Dropdown';
export { default as Popconfirm } from './Popconfirm';
export type { PopconfirmProps } from './Popconfirm';
export { default as Input } from './Input';
export type { InputProps } from './Input';
export { default as InputNumber } from './InputNumber';
export type { InputNumberProps } from './InputNumber';
export { default as Cascader } from './Cascader';
export type { CascaderProps } from './Cascader';
export { default as TreeSelect } from './TreeSelect';
export type { TreeSelectProps } from './TreeSelect';
export { default as AutoComplete } from './AutoComplete';
export type { AutoCompleteProps } from './AutoComplete';
export { default as Mentions } from './Mentions';
export type { MentionsProps } from './Mentions';
export { default as Select } from './Select';
// 同时以 SelectProps 之名暴露加宽后的类型(GmSelectProps),供 index 同名覆盖 antd 的 SelectProps
export type { GmSelectProps } from './Select';
export type { GmSelectProps as SelectProps } from './Select';
export { message } from './message';
export { default as Tabs } from './Tabs';
export type { TabsProps } from './Tabs';
export { default as Menu } from './Menu';
export type { MenuProps } from './Menu';
export { default as DatePicker } from './DatePicker';
export type { CompatDatePickerProps } from './DatePicker';
```

- [ ] **Step 2: 用以下内容整体替换 `src/index.ts`**

```ts
// gm-antd — antd 5 wrapper layer
// 1. re-export antd 5。垫片组件随后用「显式 export 同名覆盖」(TS 规则:显式 export 胜出)。
export * from 'antd';

// 2. 兼容垫片(同名覆盖 antd 值导出,全吸收 v4→v5 breaking changes)
export {
  Modal,
  Drawer,
  Tooltip,
  Popover,
  Dropdown,
  Popconfirm,
  Input,
  InputNumber,
  Cascader,
  TreeSelect,
  AutoComplete,
  Mentions,
  Select,
  message,
  Tabs,
  Menu,
  DatePicker,
} from './compat';
// 2b. 加宽后的 props 类型(同名 export type 覆盖 export * 的 antd 类型)
export type { ModalProps, DrawerProps, TooltipProps, PopoverProps, DropdownProps, PopconfirmProps } from './compat';
export type { InputProps, InputNumberProps } from './compat';
export type { CascaderProps, TreeSelectProps, AutoCompleteProps, MentionsProps } from './compat';
export type { GmSelectProps } from './compat';
export type { GmSelectProps as SelectProps } from './compat'; // 加宽版 SelectProps 覆盖 antd
export type { TabsProps, MenuProps } from './compat';
export type { CompatDatePickerProps as DatePickerProps } from './compat';

// 3. GM 增强组件
export { default as Button } from './button';
export { default as Table } from './table';

// 4. 自定义组件
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export type { SortableDataItem } from './sortable/types'; // 修复:原先未导出,table-filter 内部相对引用但消费侧缺失
export { default as ContentWrapper, ContentWrapperContext } from './content-wrapper';
export { default as TableFilter, TableFilterContext, SearchBarContext } from './table-filter';
export type { FieldItem, TableFilterProps } from './table-filter';
export { default as TablePagination, TABLE_PAGINATION_HEIGHT } from './table-pagination';

// 5. Table hooks
export { default as useTableExpandable } from './table/hooks/useTableExpandable';
export { default as useTableResizable } from './table/hooks/useTableResizable';
export { default as useTableTheme } from './table/hooks/useTableTheme';
export { default as useTableDIY } from './table/hooks/useTableDIY';
export { default as useTableSelection } from './table/hooks/useTableSelection';
export { default as useTableVirtual } from './table/hooks/useTableVirtual';

// 6. Table styles(全局 CSS for ::before overrides)
import './table/styles/table-hooks.css';

// 7. Locale / 样式
export { default as gmZhCN } from './locale/zh_CN';
export { default as useGMLocale } from './locale-adapter/useGMLocale';
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

export const version = '2.0.0';
```

> 注:`ContentWrapperContext` 的导入路径 `./content-wrapper` 与原 index 的 `./content-wrapper/context` 可能不同 —— 执行时若 `./content-wrapper` 未再导出 `ContentWrapperContext`,保持原 `export { default as ContentWrapperContext } from './content-wrapper/context';` 分行写法。见 Step 3 校验。

- [ ] **Step 3: 校验 ContentWrapperContext 导出路径**

Run: `grep -rn "ContentWrapperContext" src/content-wrapper/index.tsx src/content-wrapper/context.ts 2>/dev/null | head`
若 `src/content-wrapper/index.tsx` 已 re-export `ContentWrapperContext`,则 Step 2 写法成立;否则把该行改为:
`export { default as ContentWrapperContext } from './content-wrapper/context';`
保持与原 index 一致。

- [ ] **Step 4: 全量类型检查(Layer 1A 完成性标志)**

Run: `npx tsc -p tsconfig.build.json --noEmit`
Expected:错误数显著低于 Task 3 基线;剩余错误应仅属 Layer 1B 范畴(深路径 import / portal / CSS / 真实 src bug)。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。提醒用户:`兼容垫片层(src/compat)完成并接入 src/index.ts,请使用 /my-commit 提交。`

---

## Layer 1B — 残留 v5 问题修复

### Task 16: useTableDIY portal 包 ConfigProvider + 移除手动滚动锁

> spec R5:portal-rewrap 与 cssVar 必须同批落地。portal 内容包 `<ConfigProvider>` 后,cssVar(待 Task 18 开启)才对 portal 生效。同时移除与 antd5 冲突的手动 `document.body.style.overflow`。

**Files:**
- Modify: `src/table/hooks/useTableDIY/index.tsx`(lines 1-10 imports;lines 66-76 overflow;lines 91-146 portal)

- [ ] **Step 1: 在 import 区追加 ConfigProvider**

把 `src/table/hooks/useTableDIY/index.tsx` 第 2 行:
```ts
import type { TableProps } from 'antd';
```
改为:
```ts
import { ConfigProvider, type TableProps } from 'antd';
```

- [ ] **Step 2: 删除手动 body.overflow 的 useEffect(lines 66-76)**

把这段:
```ts
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setGroups(initGroups({ columns, config, cacheID }));
    } else {
      document.body.style.overflow = 'initial';
    }
    return () => {
      document.body.style.overflow = 'initial';
    };
  }, [open]);
```
改为(仅保留 groups 初始化,移除 overflow;滚动锁改由 DiyPanel 内 antd Modal/抽屉自带,或后续如需可挂 Modal):
```ts
  useEffect(() => {
    if (open) {
      setGroups(initGroups({ columns, config, cacheID }));
    }
  }, [open]);
```

> 若 DiyPanel 浮层本身不锁滚动导致体验问题,记录为后续优化(非阻塞);本步优先消除与 antd5 冲突的手动 overflow。

- [ ] **Step 3: portal 内容包 ConfigProvider**

把 `createPortal(...)` 的第一个参数(那个 `<div style={{position:'fixed',...}}>` )整体用 `<ConfigProvider>` 包裹。即把:
```tsx
      {createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            display: open ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}
        >
          <DiyPanel ... />
        </div>,
        document.body,
      )}
```
改为:
```tsx
      {createPortal(
        <ConfigProvider>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              display: open ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1000,
            }}
          >
            <DiyPanel ... />
          </div>
        </ConfigProvider>,
        document.body,
      )}
```
(DiyPanel 的 props 保持原样不动,只在外层加 `<ConfigProvider>`。)

- [ ] **Step 4: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "useTableDIY" || echo "useTableDIY OK"`
Expected: `useTableDIY OK`。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。

---

### Task 17: 深路径 import 全部改为 antd 公共入口

> 14 处深路径,按文件逐个改。`rc-resize-observer` 保留(已声明依赖)。

**Files:**
- Modify: `src/table/hooks/useTableVirtual/index.tsx:9`、`src/table/hooks/useTableVirtual/TableContainer.tsx:8`、`src/table/hooks/useTableSelection/index.tsx:7`、`src/locale/zh_CN.ts:1-2`、`src/locale-adapter/useGMLocale.ts:3`、`src/select/GmSelect.tsx`(已并入 compat/Select,若 Task 10 已改则跳过)、`src/table/interface.ts:14,21`、`src/table-filter/components/Setting.tsx:3`

- [ ] **Step 1: useToken 深路径 → theme.useToken(3 处)**

对 `src/table/hooks/useTableVirtual/index.tsx`、`src/table/hooks/useTableVirtual/TableContainer.tsx`、`src/table/hooks/useTableSelection/index.tsx`,删除:
```ts
import useToken from 'antd/es/theme/useToken';
```
并在各自文件顶部的 antd import 中加入 `theme`。例如若该行附近有 `import { ... } from 'antd'`,把它改为包含 `theme`;若无 antd import 则新增:
```ts
import { theme } from 'antd';
```
然后把所有 `useToken()` 调用替换为 `theme.useToken()`。

> 执行时用 `grep -n "useToken" <file>` 定位每处调用点逐一替换。

- [ ] **Step 2: antd/es/locale 深路径 → antd 公共入口(2 处)**

`src/locale/zh_CN.ts:1-2`,把:
```ts
import zhCN from 'antd/es/locale/zh_CN';
import type { Locale } from 'antd/es/locale';
```
改为:
```ts
import zhCN from 'antd/es/locale/zh_CN';
import type { Locale } from 'antd';
```
> 说明:`antd/es/locale/zh_CN` 作为「具体语言包的具名文件」在 v5 仍存在且是 antd 文档推荐用法,保留;仅把 `antd/es/locale`(无 index 的类型入口)改为 `antd`。

`src/locale-adapter/useGMLocale.ts:3`,把:
```ts
import type { Locale } from 'antd/es/locale';
```
改为:
```ts
import type { Locale } from 'antd';
```

- [ ] **Step 3: antd/es/select 深路径 → antd(若 compat/Select 未覆盖)**

`src/select/GmSelect.tsx` 在 Task 10 已被替换为再导出垫片,深路径 `antd/es/select` 已随之移除。校验:
Run: `grep -rn "antd/es/select" src/`
Expected: 无输出。若有残留(例如别处),改为 `import type { SelectProps, RefSelectProps, BaseOptionType, DefaultOptionType } from 'antd';`。

- [ ] **Step 4: antd/es/table/interface 与 rc-table/lib/interface → antd(1 文件 2 处)**

`src/table/interface.ts`,把:
```ts
} from 'rc-table/lib/interface';
```
与
```ts
} from 'antd/es/table/interface';
```
统一改为从 `'antd'` 导入对应类型。打开该文件确认被导入的具体类型名(如 `ColumnType`、`ColumnsType`、`ColumnGroupType`、`RowSelectionType` 等),改为:
```ts
import type { ... } from 'antd';
```
> 执行前先 `sed -n '1,30p' src/table/interface.ts` 看清 import 语句完整范围再整体替换,避免截断。

- [ ] **Step 5: antd/es/checkbox 深路径 → antd(1 处)**

`src/table-filter/components/Setting.tsx:3`,把:
```ts
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
```
改为:
```ts
import type { CheckboxProps } from 'antd';
```
并把该文件内对 `CheckboxChangeEvent` 的使用改为 `CheckboxProps['onChange']`。即:
`grep -n "CheckboxChangeEvent" src/table-filter/components/Setting.tsx` 找到的类型注解处,替换为 `CheckboxProps['onChange']`。

- [ ] **Step 6: rc-resize-observer 确认为已声明依赖(保留,不改)**

Run: `grep '"rc-resize-observer"' package.json`
Expected: 命中 `"rc-resize-observer": "^1.2.0"`(在 dependencies 中,保留)。

- [ ] **Step 7: 全量校验无残留深路径(除允许项)**

Run: `grep -rnE "from 'antd/es/|from \"antd/es/|from 'rc-table/lib" src/ | grep -v "antd/es/locale/zh_CN"`
Expected: 无输出(`antd/es/locale/zh_CN` 为允许保留项)。

- [ ] **Step 8: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -E "useToken|antd/es|rc-table|locale|checkbox|select" || echo "deep imports OK"`
Expected: `deep imports OK`。

- [ ] **Step 9: Checkpoint**

🚫 不要自动 commit。

---

### Task 18: gmTheme 开 cssVar + global.ts 选中行色改 token 变量

**Files:**
- Modify: `src/styles/theme.ts`、`src/styles/global.ts`

- [ ] **Step 1: gmTheme 加 cssVar**

`src/styles/theme.ts`,把:
```ts
const gmTheme = {
  token: {
    colorPrimary: '#0363ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#0363ff',
  },
} as const;
```
改为:
```ts
const gmTheme = {
  token: {
    colorPrimary: '#0363ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#0363ff',
  },
  // 开启 CSS 变量模式,使内联 var(--ant-color-primary) 等能解析;
  // portal 内容已包 ConfigProvider(Task 16),变量对 portal 同样生效。
  cssVar: true,
  hashed: true,
} as const;
```

- [ ] **Step 2: global.ts 选中行硬编码色改 token 变量**

`src/styles/global.ts:93-95`,把:
```css
.ant-table .ant-table-tbody > tr.ant-table-row-selected > td {
  background-color: #c3daff;
}
```
改为:
```css
.ant-table .ant-table-tbody > tr.ant-table-row-selected > td {
  background-color: var(--ant-color-primary-bg, #c3daff);
}
```
> `#c3daff` 作为 fallback,确保 cssVar 未就绪时不丢色;cssVar 就绪后跟随主题。

- [ ] **Step 3: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep -E "styles/theme|styles/global" || echo "theme/global OK"`
Expected: `theme/global OK`。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。

---

### Task 19: useTableTheme className.includes 脆弱判定加固

> `className?.includes('ant-table-selection-column')` 在 antd5 class 名变化时易失效。改为基于 data 属性 + props 的多重判定(若 className 含目标名或为 placeholder 列)。

**Files:**
- Modify: `src/table/hooks/useTableTheme/index.tsx`(Cell 组件内的 find 判定)

- [ ] **Step 1: 加固判定**

在 `src/table/hooks/useTableTheme/index.tsx` 的 `Cell` 内,把:
```tsx
              if (
                ['ant-table-selection-column', 'placeholder'].find(name =>
                  className?.includes(name),
                )
              ) {
                return children;
              }
```
改为:
```tsx
              const isSelectionOrPlaceholder =
                ['ant-table-selection-column', 'placeholder'].some(name =>
                  typeof className === 'string' && className.includes(name),
                ) ||
                (rest as any)['data-placeholder'] === true ||
                (rest as any).colSpan === 0;
              if (isSelectionOrPlaceholder) {
                return children;
              }
```
> 保留原 className 兜底,新增 data-placeholder / colSpan===0 兜底,降低对 class 名的单一依赖。

- [ ] **Step 2: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "useTableTheme" || echo "useTableTheme OK"`
Expected: `useTableTheme OK`。

- [ ] **Step 3: Checkpoint**

🚫 不要自动 commit。

---

### Task 20: 消化 Task 3 基线中剩余 `[REAL]` 错误(demo 签名 + 残留类型 bug)

> 本任务消化 Task 3 基线里 `[REAL]` 类、且未被 Task 16-19 覆盖的错误。以 Task 3 清单为唯一事实来源,逐条修复,**不得用 `// @ts-ignore` 或 `as any` 掩盖真实类型错误**(除非该处确为 antd 类型定义滞后,并加注释说明)。

**Files:** 按 Task 3 清单逐条定位(以下为已知高频点)。

- [ ] **Step 1: 重跑 tsc,导出当前 `[REAL]` 剩余清单**

Run: `npx tsc -p tsconfig.build.json --noEmit > docs/superpowers/notes/tsc-current.txt 2>&1; grep -nE "src/" docs/superpowers/notes/tsc-current.txt`
Expected: 剩余错误列表(应明显少于 Task 3 基线)。

- [ ] **Step 2: 修复 demo 签名漂移(use-table-* demos)**

逐个打开 `src/use-table-*/demos/basic.tsx`、`src/table/demos/basic.tsx` 中被 tsc 点名的 demo,按 hook 真实签名修正调用。常见点:
- `useTableDIY` 返回 `{ rowSelection, columns }`,demo 若解构为旧签名需对齐。
- `useTableResizable`/`useTableExpandable`/`useTableSelection`/`useTableVirtual` 的 options 字段名以 `src/table/hooks/<name>/index.tsx` 的 `UseTableXOptions` 接口为准。

每修一个 demo,立即:
Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "<该 demo 路径>" || echo "demo fixed"`
Expected: `demo fixed`。

- [ ] **Step 3: 修复 table-filter Setting.tsx 的 SortableDataItem 用法**

`src/table-filter/components/Setting.tsx:6` 的 `import type { SortableDataItem } from '../../sortable/types';` 保留;确认 `src/sortable/types.ts:14` 的 `interface SortableDataItem` 已 `export`(若未 export,改为 `export interface SortableDataItem`)。
Run: `grep -n "export interface SortableDataItem\|interface SortableDataItem" src/sortable/types.ts`
若非 `export`,加上 `export`。

- [ ] **Step 4: 逐条消化 tsc-current.txt 中其余 `[REAL]` 错误**

对 `docs/superpowers/notes/tsc-current.txt` 中每条尚未解决的 `src/` 错误,按「报告的 file:line → 最小类型正确修复」处理。已知候选(spec §1.4 提及,按实际报错为准):
- `useTableVirtual/TableContainer.tsx` 的 `Ref`/`ThHTMLAttributes` 空值 → 补非空断言或默认值。
- `CascaderFilter.tsx`/`DateFilter.tsx`/`InputFilter.tsx`/`SelectFilter.tsx` 的 `onBlurCapture` → 若 antd5 类型不再含该 prop,改用 wrapper `<div onBlurCapture>` 包裹,或改为 `onBlur`。

> **spec §1.4 列出的「顺手修」逻辑项 —— 已审阅,结论如下(非 breaking change,不阻塞无损升级,记录在案)**:
> - `src/table-filter/form.store.ts:185` 的 `pickBy(params, v => v !== undefined && v !== null)` —— 逻辑正确(null/undefined 过滤),不改。
> - `src/table-filter/form.store.ts:90` 的 `cachedFields.find(...) || {}` —— 现有「找不到给空对象」的既定行为,调用方依赖该形态,不改(改了反而破坏调用方)。
> - `src/sortable` 的 `uniqueId` key —— grep 全仓 `src/` 无 `uniqueId` 引用,该项不成立,不改。
> - `InfoField` 的 `fontFamily→fontWeight` —— `Setting.tsx:92` 已是 `fontWeight: 'bold'`,无需再改。
> 若后续业务冒烟发现真实逻辑缺陷,再单独立项;本计划不扩大范围。

每修一处:
Run: `npx tsc -p tsconfig.build.json --noEmit 2>&1 | grep "<file>" || echo "fixed"`
Expected: `fixed`。

- [ ] **Step 5: tsc 归零验证(Layer 1 完成标志)**

Run: `npx tsc -p tsconfig.build.json --noEmit; echo "exit=$?"`
Expected: `exit=0`(零错误)。

- [ ] **Step 6: tsup 构建验证**

Run: `npm run build:wrapper`
Expected: 产出 `dist/index.mjs`、`dist/index.cjs`、`dist/index.d.ts`,无错误。

- [ ] **Step 7: Checkpoint**

🚫 不要自动 commit。提醒用户:`Layer 1(垫片 + 残留修复)完成,tsc 0 错误 + tsup 构建通过,请使用 /my-commit 提交。`

---

## Layer 1B 收尾

### Task 21: Q3 审计 — 业务侧 v4 已移除组件/API 排查与兜底

> spec §11 Q3:业务用到其他 antd v4 已移除组件(如 `Comment`/`PageHeader`/`BackTop`)。本任务对**业务项目代码**(非本仓库)做一次 grep 审计,审计出的已移除组件用 `@ant-design/pro-components` 或 `@ant-design/compatible` 再导出兜底。

**Files:** 视审计结果新增 `src/compat/<Component>.tsx` 并在 `src/compat/index.ts` + `src/index.ts` 导出。

- [ ] **Step 1: 选定 1 个真实业务项目目录,grep 已移除组件**

(把 `<BIZ_PATH>` 替换为业务项目 src 路径)
Run: `grep -rnE "Comment|PageHeader|BackTop" <BIZ_PATH>/src 2>/dev/null | grep -iE "from ['\"]antd" | head -40`
Expected: 命中清单(可能为空)。

- [ ] **Step 2: 对每个被移除组件,新增 compat 兜底**

对命中的组件(以 `Comment` 为例),创建 `src/compat/Comment.tsx`:
```tsx
// antd v5 移除了 Comment,改用 @ant-design/pro-components 或本地实现兜底。
// 若已安装 @ant-design/pro-components:
import { Comment as ProComment } from '@ant-design/pro-components';
export default ProComment;
export type CommentProps = React.ComponentProps<typeof ProComment>;
```
> 若业务用的组件在 pro-components 无对应,改引 `@ant-design/compatible`(devDep),并在该垫片文件 re-export。

- [ ] **Step 3: 把兜底组件接入 compat 桶 + index**

`src/compat/index.ts` 追加:
```ts
export { default as Comment } from './Comment';
export type { CommentProps } from './Comment';
```
`src/index.ts` 在兼容垫片显式导出区追加:
```ts
export { Comment } from './compat';
export type { CommentProps } from './compat';
```

- [ ] **Step 4: 类型检查**

Run: `npx tsc -p tsconfig.build.json --noEmit; echo "exit=$?"`
Expected: `exit=0`。

- [ ] **Step 5: Checkpoint**

🚫 不要自动 commit。提醒用户:`业务 v4 已移除组件兜底已加,请使用 /my-commit 提交。`

> 若 Step 1 命中为空(业务未用这些组件),本 Task 跳过 Step 2-4,记录「审计无命中」。

---

## Layer 2 — 退役旧 antd 4 世界

### Task 22: 归档 components/ 到 legacy/ + 打 git tag

**Files:**
- Move: `components/` → `legacy/components/`

- [ ] **Step 1: 确认 components/ 当前不被 src/ 或构建引用**

Run: `grep -rn "from 'components/\|from \"components/" src/ tsconfig.build.json .dumirc.ts tsup.config.ts 2>/dev/null`
Expected: 无输出(若有,说明 src 仍依赖 fork,需先解除)。

- [ ] **Step 2: 归档 components/ → legacy/components/**

Run: `git mv components legacy/components`
Expected: `legacy/components/` 存在,`components/` 不再存在于工作树顶层。

- [ ] **Step 3: 打底 tag(仅本地,不自动 push)**

Run: `git tag legacy/antd4-fork -m "archive: antd 4 fork source moved to legacy/components"`
Expected: tag 创建成功。

> 🚫 **不要** `git push --tags`(全局禁自动推送)。tag 留本地,推送由用户在 /my-commit 或手动决定。

- [ ] **Step 4: Checkpoint**

🚫 不要自动 commit。提醒用户:`components/ 已归档到 legacy/ 并打 tag,请使用 /my-commit 提交(含 git mv 改动)。`

---

### Task 23: 移除 bisheng/antd-tools 旧依赖、脚本与配置

**Files:**
- Modify: `package.json`(移除 devDeps 旧工具 + 移除 bisheng 脚本)
- Delete: `.antd-tools.config.js`、`webpack.config.js`(若存在且仅 bisheng 用)

- [ ] **Step 1: 移除 devDeps 中的 bisheng / antd-tools 旧工具**

从 `package.json` devDependencies 删除:
```
"@ant-design/bisheng-plugin": "^3.3.0-alpha.4",
"@ant-design/tools": "...",
"bisheng": "^3.7.0-alpha.4",
"bisheng-plugin-description": "^0.1.4",
"bisheng-plugin-react": "^1.2.0",
"bisheng-plugin-toc": "^0.4.4",
"antd-img-crop": "...",
```
> 执行前先 `grep -nE "bisheng|antd-tools|antd-img-crop" package.json` 确认确切行与版本,再删。保留 `dumi`、`tsup`、`ts-jest`、`@testing-library/jest-dom` 等。

- [ ] **Step 2: 移除 scripts 中的 bisheng / antd-tools 脚本**

从 `package.json` scripts 删除:`start`、`compile`、`dist`、`pub`、`predeploy`、`deploy`、`site`、`site:theme-dark`、`site:theme-compact`、`site:test`、`clean`(若为 antd-tools clean)、`lint:deps`、`sort-api`、`api-collection` 等含 `bisheng`/`antd-tools` 的脚本。保留 `build:wrapper`、`build:wrapper:watch`、`doc:dev`、`doc:build`、`test`(改用 compat jest,见 Step 4)、`lint`。

- [ ] **Step 3: 删除 bisheng 专用根配置文件**

Run: `ls .antd-tools.config.js webpack.config.js site/ 2>/dev/null`
若存在且仅被已删脚本引用,删除:
Run: `git rm -f .antd-tools.config.js webpack.config.js 2>/dev/null; git rm -rf site 2>/dev/null; echo done`
> 删除前用 `grep -rn ".antd-tools.config\|webpack.config\|site/bisheng" .dumirc.ts tsup.config.ts package.json` 确认无残留引用。

- [ ] **Step 4: test 脚本指向 compat 配置(旧 .jest.js 依赖已删的 @ant-design/tools)**

`package.json` scripts 中 `test` 改为:
```json
"test": "jest --config jest.config.compat.ts --cache=false",
```
> 旧的 `.jest.js`/`.jest.node.js`/`.jest.site.js`/`.jest.image.js`/`jest-puppeteer.config.js` 依赖 `@ant-design/tools`,保留会报 transform 模块缺失;若确认无 fork 测试需要,可一并 `git rm`(本步可选,记录决定)。

- [ ] **Step 5: 重装依赖,确认无 bisheng 残留导致的 antd 4**

Run: `rm -rf node_modules yarn.lock && yarn install && npm ls antd 2>&1 | grep -E "antd@(4|5)" | head`
Expected: 全树不再有 `antd@4`(bisheng 消除后,嵌套 antd 4 应消失)。

- [ ] **Step 6: 校验 package.json 合法 + 构建**

Run: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'));console.log('OK')" && npm run build:wrapper`
Expected: `OK` + 构建产出 dist。

- [ ] **Step 7: Checkpoint**

🚫 不要自动 commit。提醒用户:`bisheng/antd-tools 旧依赖与脚本已移除,请使用 /my-commit 提交。`

---

### Task 24: tsconfig 别名清理 + .dumirc 临时别名移除 + 全量终验

**Files:**
- Modify: 根 `tsconfig.json`、`.dumirc.ts`、`tsconfig.build.json`(确认 rootDir)

- [ ] **Step 1: 根 tsconfig.json 删除 antd→components fork 别名**

根 `tsconfig.json` 的 `paths`,把:
```json
    "paths": {
      "antd": ["components/index.tsx"],
      "antd/es/*": ["components/*"],
      "antd/lib/*": ["components/*"]
    },
```
改为(移除别名,fork 已归档到 legacy):
```json
    "paths": {},
```

- [ ] **Step 2: .dumirc.ts 移除临时 antd alias**

`.dumirc.ts` 删除 `alias` 块:
```ts
  // Override tsconfig paths that alias antd → components/ (antd 4 fork)
  // Dumi's webpack must resolve antd to node_modules/antd (antd 5)
  alias: {
    antd: path.resolve(__dirname, 'node_modules/antd'),
    'antd/es': path.resolve(__dirname, 'node_modules/antd/es'),
  },
```
同时若 `import path from 'path'` 不再被使用,一并删除该 import(用 `grep -n "path" .dumirc.ts` 确认)。

- [ ] **Step 3: 确认 tsconfig.build.json rootDir=src 且 include=src(已正确)**

Run: `grep -nE "rootDir|include|src/index" tsconfig.build.json`
Expected: `"rootDir": "src"`、`"include": ["src"]`、`"paths": { "gm-antd": ["src/index.ts"] }`。

- [ ] **Step 4: 全量类型检查(零错误)**

Run: `npx tsc -p tsconfig.build.json --noEmit; echo "exit=$?"`
Expected: `exit=0`。

- [ ] **Step 5: tsup 构建**

Run: `npm run build:wrapper`
Expected: 产出 `dist/index.mjs`、`dist/index.cjs`、`dist/index.d.ts`,无错误。

- [ ] **Step 6: dumi 文档站构建**

Run: `npm run doc:dev`(若 package.json 有 `doc:dev`)或 `npx dumi dev`,浏览器打开后确认:Table / Select 全选 / TableFilter / DatePicker demo 渲染正常、控制台无 v4 弃用警告。
Expected: 各 demo 正常,无 `visible is deprecated` / `dropdownClassName is deprecated` 等警告。

- [ ] **Step 7: 垫片单测全绿**

Run: `npx jest --config jest.config.compat.ts`
Expected: 全部 PASS。

- [ ] **Step 8: 清理临时测量文件**

Run: `rm -f docs/superpowers/notes/tsc-baseline-layer0.txt docs/superpowers/notes/tsc-current.txt; rmdir docs/superpowers/notes 2>/dev/null; echo cleaned`
Expected: `cleaned`。

- [ ] **Step 9: 业务项目无损冒烟(选 1 个真实项目,零改动换包)**

在业务项目把 `gm-antd` 换为新构建版本(本仓库 dist 或私有 npm 发包),**不改一行业务代码**,冒烟:
- Modal/Drawer 用旧 `visible` 开关
- Select 全选 / 筛选删除 / `dropdownClassName`
- DatePicker 传 `moment`(含 `moment.tz`)
- Tabs `<Tabs.TabPane>` / Menu `<Menu.Item>` children 写法
- Table 各 hook(DIY/选择/虚拟/可调列宽/主题/展开)
- `message.warn` 调用
Expected: 全部行为与 antd 4 一致,控制台无 v5 breaking 报错。

- [ ] **Step 10: Checkpoint(计划终点)**

🚫 不要自动 commit。提醒用户:**`gm-antd antd5 无损升级全部完成(tsc 0 错误 + tsup 构建 + dumi 文档 + 业务零改动冒烟通过),请使用 /my-commit 提交。`**

---

## 完成后(全局规则)

计划全部任务完成并经用户 `/my-commit` 提交后:
- 主动询问:「是否需要执行 `/fe-feature` 生成开发文档?」
- 用户确认则调用 fe-feature skill;拒绝则不执行。
