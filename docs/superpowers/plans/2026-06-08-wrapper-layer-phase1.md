# Phase 1: Wrapper Layer Skeleton + Simple Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new wrapper package that re-exports antd 5 and provides migrated simple components (Icon, Sortable, ContentWrapper), locale infrastructure, and global styles. Business projects can compile and run with antd 5 after this phase.

**Architecture:** The new `src/` directory replaces the old `components/` fork. The entry point re-exports all of antd 5, then overrides specific components and adds custom ones. Build uses `tsup` for ESM+CJS+dts output. Styles migrate from Less to CSS-in-JS (inline styles for simple components, `@ant-design/cssinj` for complex ones). Global theming uses ConfigProvider Design Token.

**Tech Stack:** antd 5, @ant-design/icons 5, @ant-design/cssinjs, tsup, TypeScript, React 17, sortablejs, rc-resize-observer, lodash

---

## File Structure

```
gm-antd/
├── src/                                # NEW - wrapper source
│   ├── index.ts                        # Re-export antd 5 + custom exports
│   ├── icon/
│   │   └── index.tsx                   # createFromIconfontCN wrapper
│   ├── sortable/
│   │   ├── types.ts                    # Type definitions (copy)
│   │   ├── sortable_base.tsx           # SortableJS wrapper class (copy)
│   │   ├── sortable.tsx                # Sortable component (copy)
│   │   ├── sortable_group.tsx          # GroupSortable (copy + bug fix)
│   │   └── index.ts                    # Barrel export
│   ├── content-wrapper/
│   │   ├── context.ts                  # Context (copy)
│   │   ├── index.tsx                   # Component (copy, imports → antd)
│   │   ├── styles.ts                   # Less → CSSProperties
│   │   └── index.ts                    # Barrel export
│   ├── locale/
│   │   └── zh_CN.ts                    # antd 5 zhCN + GM custom fields
│   ├── locale-adapter/
│   │   └── useGMLocale.ts              # Replaces useLocaleReceiver
│   └── styles/
│       ├── theme.ts                    # Design Token config (#0363ff primary)
│       └── global.ts                   # Global CSS overrides component
├── tsup.config.ts                      # NEW - build config
├── tsconfig.build.json                 # NEW - build tsconfig
├── package.json                        # MODIFIED - new deps + scripts
└── docs/
    └── superpowers/
        └── specs/2026-06-05-wrapper-layer-migration-design.md
```

**Old code kept for reference:** `components/` directory stays untouched until all 5 phases complete.

---

### Task 1: Set up build infrastructure

**Files:**
- Create: `tsup.config.ts`
- Create: `tsconfig.build.json`
- Modify: `package.json`

- [ ] **Step 1: Create tsup.config.ts**

```ts
// tsup.config.ts
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
```

- [ ] **Step 2: Create tsconfig.build.json**

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "esnext",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": false,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "gm-antd": ["src/index.ts"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create src/ directory and placeholder entry**

```bash
mkdir -p src
```

Create `src/index.ts`:

```ts
// Phase 1 placeholder - will be completed in Task 2
export {};
```

- [ ] **Step 4: Update package.json**

Replace the relevant fields in `package.json`. Key changes:
- `main` → `dist/index.cjs`
- `module` → `dist/index.mjs`
- `types` → `dist/index.d.ts`
- `files` → `["dist"]`
- Add new scripts
- Replace dependencies

Add these scripts:

```json
{
  "scripts": {
    "build:wrapper": "tsup",
    "build:wrapper:watch": "tsup --watch",
    "prepublishOnly": "npm run build:wrapper"
  }
}
```

Update these fields:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": false
}
```

- [ ] **Step 5: Install new dependencies**

```bash
npm install --save antd@^5.12.0 @ant-design/icons@^5.0.0 @ant-design/cssinjs@^1.21.0 classnames@^2.3.0 lodash@^4.17.0 sortablejs@^1.15.0 rc-resize-observer@^1.3.0
npm install --save-dev tsup@^8.0.0 typescript@^4.9.0 @types/sortablejs@^1.15.0 @types/lodash@^4.14.0
```

Peer dependencies (should already exist or be installed by consumer):

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "@gm-common/hooks": "^2.x"
  }
}
```

- [ ] **Step 6: Verify build works**

```bash
npm run build:wrapper
```

Expected: `dist/` directory created with `index.cjs`, `index.mjs`, `index.d.ts`, and source maps. No errors.

- [ ] **Step 7: Commit**

```bash
git add tsup.config.ts tsconfig.build.json src/index.ts package.json package-lock.json
git commit -m "feat(wrapper): set up build infrastructure with tsup"
```

---

### Task 2: Create re-export entry point

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Write the full re-export entry point**

Replace `src/index.ts` with:

```ts
// gm-antd — antd 5 wrapper layer
// 1. Re-export all of antd 5 (business code import path unchanged)
export * from 'antd';

// 6. Version
export const version = '2.0.0';
```

Note: `export * from 'antd'` already re-exports antd's `theme`, `ConfigProvider`, all components, types, etc. Custom components will override specific named exports in later tasks.

- [ ] **Step 2: Build and verify**

```bash
npm run build:wrapper
```

Verify `dist/index.d.ts` contains antd type references. Check no "duplicate export" errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat(wrapper): add antd 5 re-export entry point"
```

---

### Task 3: Migrate Icon component

**Files:**
- Create: `src/icon/index.tsx`
- Modify: `src/index.ts`

The Icon component is 5 lines — wraps `@ant-design/icons`'s `createFromIconfontCN` with a custom iconfont URL. In `@ant-design/icons` v5, this API still exists and works identically.

- [ ] **Step 1: Create src/icon/index.tsx**

```tsx
import { createFromIconfontCN } from '@ant-design/icons';

const Icon = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/c/font_4079364_omop55e0gd.js',
});

export default Icon;
```

- [ ] **Step 2: Add Icon export to src/index.ts**

Add after the `export * from 'antd'` line:

```ts
// 4. Custom components
export { default as Icon } from './icon';
```

- [ ] **Step 3: Build and verify**

```bash
npm run build:wrapper
```

Expected: builds without errors.

- [ ] **Step 4: Commit**

```bash
git add src/icon/ src/index.ts
git commit -m "feat(wrapper): migrate Icon component"
```

---

### Task 4: Migrate Sortable types

**Files:**
- Create: `src/sortable/types.ts`

Copy from `components/sortable/types.ts` — no changes needed. This file has zero antd dependencies (only `sortablejs` and React types).

- [ ] **Step 1: Create src/sortable/types.ts**

Copy the content of `components/sortable/types.ts` verbatim:

```ts
import type { Options, SortableEvent } from 'sortablejs';
import type Sortable from 'sortablejs';
import type { ElementType, HTMLAttributes, ReactElement, ReactNode } from 'react';

type Value = any;

interface SortableBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  options: Options;
  onChange?(remoteItems: string[], sortable: Sortable, event: SortableEvent): void;
  tag: ElementType;
  disabled?: boolean;
}

interface SortableDataItem {
  value: Value;
  text: string;
  [key: string]: any;
}

interface SortableCommonProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  groupValues?: Value[];
  renderItem?(value: SortableDataItem, index: number): ReactNode;
  itemProps?: HTMLAttributes<HTMLDivElement>;
  tag?: ElementType;
  options?: Options;
  disabled?: boolean;
}

interface SortableProps extends SortableCommonProps {
  data: SortableDataItem[];
  onChange(data: SortableDataItem[]): void;
}

interface GroupSortableProps extends Omit<SortableCommonProps, 'children'> {
  data: SortableDataItem[][];
  onChange(data: SortableDataItem[][]): void;
  children: (items: ReactElement<SortableProps>[]) => ReactElement;
}

export type { Value, SortableBaseProps, SortableDataItem, SortableProps, GroupSortableProps };
```

- [ ] **Step 2: Commit**

```bash
git add src/sortable/types.ts
git commit -m "feat(wrapper): migrate Sortable types"
```

---

### Task 5: Migrate SortableBase component

**Files:**
- Create: `src/sortable/sortable_base.tsx`

Copy from `components/sortable/sortable_base.tsx` — no changes needed. Only depends on `sortablejs` and React (no antd imports).

- [ ] **Step 1: Create src/sortable/sortable_base.tsx**

Copy the content of `components/sortable/sortable_base.tsx` verbatim (128 lines). The file imports only `sortablejs` and React — zero antd dependency.

- [ ] **Step 2: Commit**

```bash
git add src/sortable/sortable_base.tsx
git commit -m "feat(wrapper): migrate SortableBase component"
```

---

### Task 6: Migrate Sortable component

**Files:**
- Create: `src/sortable/sortable.tsx`

Copy from `components/sortable/sortable.tsx` — no changes needed. Only depends on `classnames`, `lodash` (unused), and the local `sortable_base`.

- [ ] **Step 1: Create src/sortable/sortable.tsx**

Copy the content of `components/sortable/sortable.tsx` verbatim (66 lines). Update import path for `SortableBase`:

```ts
import SortableBase from './sortable_base';
```

(rest stays the same)

- [ ] **Step 2: Commit**

```bash
git add src/sortable/sortable.tsx
git commit -m "feat(wrapper): migrate Sortable component"
```

---

### Task 7: Migrate GroupSortable component (with bug fix)

**Files:**
- Create: `src/sortable/sortable_group.tsx`
- Create: `src/sortable/index.ts`
- Modify: `src/index.ts`

Copy from `components/sortable/sortable_group.tsx` with one bug fix: replace `_.uniqueId()` with a stable key using `index`.

**Bug fixed:** `_.uniqueId()` generates a new unique ID on every render, causing React to unmount and remount list items. Fix: use `index` as the key since sub-lists are positional.

- [ ] **Step 1: Create src/sortable/sortable_group.tsx**

Copy content from `components/sortable/sortable_group.tsx` with this fix:

Change line 48:
```tsx
// Before (bug):
key={_.uniqueId()}

// After (fix):
key={index}
```

Full file:

```tsx
import React, { useMemo, useRef } from 'react';
import _ from 'lodash';
import type { GroupSortableProps, SortableDataItem } from './types';
import Sortable from './sortable';

const GroupSortable = ({
  data,
  onChange,
  renderItem,
  itemProps,
  tag,
  options,
  children,
}: GroupSortableProps) => {
  const dataRef = useRef<SortableDataItem[][]>([]);
  const flatData = useMemo(() => _.flatten(data), [data]);
  const items = data.map((subData, index) => {
    const handleChange = (newSubData: SortableDataItem[]): void => {
      if (newSubData.length === data[index].length) {
        const newData = data.slice();
        newData[index] = newSubData;
        onChange(newData);
      } else {
        if (dataRef.current.length === 0) {
          dataRef.current = data.slice();
          dataRef.current[index] = newSubData;
        } else {
          dataRef.current[index] = newSubData;
          const newData = dataRef.current.slice();
          dataRef.current = [];
          onChange(newData);
        }
      }
    };

    return (
      <Sortable
        key={index}
        data={flatData}
        groupValues={subData.map(val => val.value)}
        onChange={handleChange}
        renderItem={renderItem}
        itemProps={itemProps}
        tag={tag}
        options={{ group: 'group', ...options }}
      />
    );
  });
  return children(items);
};

export default GroupSortable;
```

- [ ] **Step 2: Create src/sortable/index.ts barrel export**

```ts
export { default as Sortable } from './sortable';
export { default as GroupSortable } from './sortable_group';
export { default as SortableBase } from './sortable_base';
export type {
  SortableDataItem,
  SortableProps,
  GroupSortableProps,
  SortableBaseProps,
} from './types';

// Default export is Sortable
export { default } from './sortable';
```

- [ ] **Step 3: Add Sortable export to src/index.ts**

Add to the custom components section:

```ts
export { default as Sortable } from './sortable';
```

- [ ] **Step 4: Build and verify**

```bash
npm run build:wrapper
```

Expected: builds without errors.

- [ ] **Step 5: Commit**

```bash
git add src/sortable/
git commit -m "feat(wrapper): migrate Sortable components with key bug fix"
```

---

### Task 8: Migrate ContentWrapper context

**Files:**
- Create: `src/content-wrapper/context.ts`

Copy from `components/content-wrapper/context.ts` verbatim — no changes needed. Only uses React's `createContext`.

- [ ] **Step 1: Create src/content-wrapper/context.ts**

```ts
import { createContext } from 'react';

export interface ContentWrapperContextProps {
  container: HTMLElement;
  width: number;
  height: number;
  scrollbar: boolean;
  showScrollBar: () => void;
  hideScrollBar: () => void;
  scrollTop: number;
  scrollBottom: number;
  atBottom?: boolean;
}

const ContentWrapperContext = createContext<ContentWrapperContextProps>(
  {} as any,
);

export default ContentWrapperContext;
```

- [ ] **Step 2: Commit**

```bash
git add src/content-wrapper/context.ts
git commit -m "feat(wrapper): migrate ContentWrapper context"
```

---

### Task 9: Migrate ContentWrapper styles (Less → CSSProperties)

**Files:**
- Create: `src/content-wrapper/styles.ts`

Convert `components/content-wrapper/index.less` (37 lines) to TypeScript style objects. The Less file uses class selectors like `.content-wrapper`, `.content-wrapper-viewbox`, etc. These become named style objects.

Key conversions:
- `height: calc(100vh - var(--gm-framework-size-top-right-height))` — keep as-is (CSS variable from `gm-framework`)
- `background-color: #f5f5f5` — keep as hardcoded color (will be tokenized in future)
- Scrollbar styles — webkit pseudo-elements can't be inline, need `insertCSS` or a `<style>` tag

- [ ] **Step 1: Create src/content-wrapper/styles.ts**

```ts
import type { CSSProperties } from 'react';

export const wrapperStyle: CSSProperties = {
  position: 'relative',
  height: 'calc(100vh - var(--gm-framework-size-top-right-height))',
  padding: 15,
  fontWeight: 'normal',
  fontSize: 14,
  lineHeight: 'normal',
  backgroundColor: '#f5f5f5',
};

export const leftStyle = (leftWidth: string): CSSProperties => ({
  width: leftWidth,
  position: 'absolute',
  top: 0,
  left: 0,
  padding: 15,
  paddingRight: 0,
  height: '100%',
  backgroundColor: '#f5f5f5',
});

/** Webkit scrollbar styles - must be injected as global CSS */
export const scrollbarCSS = `
.content-wrapper-viewbox::-webkit-scrollbar {
  width: 8px;
  padding-right: 2px;
}
.content-wrapper-viewbox::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}
.content-wrapper-viewbox::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 4px;
}
.hide-scrollbar::-webkit-scrollbar-thumb,
.hide-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.075);
}
`;
```

- [ ] **Step 2: Commit**

```bash
git add src/content-wrapper/styles.ts
git commit -m "feat(wrapper): migrate ContentWrapper styles from Less to CSSProperties"
```

---

### Task 10: Migrate ContentWrapper component

**Files:**
- Create: `src/content-wrapper/index.tsx`
- Create: `src/content-wrapper/index.ts`
- Modify: `src/index.ts`

Copy from `components/content-wrapper/index.tsx` with these changes:
1. `import { Divider } from '../index'` → `import { Divider } from 'antd'`
2. Remove `import './index.less'`
3. Import styles from `./styles`
4. Apply `wrapperStyle` to root div
5. Inject scrollbar CSS on mount

- [ ] **Step 1: Create src/content-wrapper/index.tsx**

```tsx
import classNames from 'classnames';
import type { FC, HTMLAttributes, ReactNode } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ResizeObserver from 'rc-resize-observer';
import { Divider } from 'antd';
import ContentWrapperContext from './context';
import type { ContentWrapperContextProps } from './context';
import { wrapperStyle, scrollbarCSS } from './styles';

export interface ContentWrapperProps extends HTMLAttributes<HTMLDivElement> {
  hideScrollbarAtBottom?: boolean;
  left?: ReactNode;
  leftWidth?: string;
  top?: ReactNode;
  bottom?: ReactNode;
  smooth?: boolean;
}

let scrollbarCSSInjected = false;

const injectScrollbarCSS = () => {
  if (scrollbarCSSInjected) return;
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = scrollbarCSS;
  document.head.appendChild(style);
  scrollbarCSSInjected = true;
};

const Gap = () => (
  <div
    className="content-wrapper-gap"
    style={{
      height: 16,
      width: 'calc(100% + 40px)',
      marginLeft: -15,
      backgroundColor: '#f5f5f5',
    }}
  />
);

const Component: FC<ContentWrapperProps> = ({
  className,
  style,
  children,
  left,
  leftWidth = '25%',
  top,
  bottom,
  hideScrollbarAtBottom,
  smooth,
}) => {
  useEffect(() => {
    injectScrollbarCSS();
  }, []);

  const ref = useRef(document.createElement('div'));
  const bottomFlagRef = useRef(document.createElement('div'));
  const [state, setState] = useState<ContentWrapperContextProps>({
    width: 0,
    height: 0,
    container: undefined as any as HTMLElement,
    scrollTop: 0,
    scrollBottom: -1,
    scrollbar: true,
    atBottom: false,
    showScrollBar() {
      setState(state => ({ ...state, scrollbar: true }));
    },
    hideScrollBar() {
      setState(state => ({ ...state, scrollbar: false }));
    },
  });
  const context = useContext(ContentWrapperContext);
  const hasContext = !!Object.keys(context).length;

  useEffect(() => {
    setState(state => ({ ...state, container: ref.current! }));
    const observer = new IntersectionObserver(
      entries => {
        setState(state => ({ ...state, atBottom: entries[0].isIntersecting }));
      },
      {
        root: ref.current,
        threshold: 1.0,
      },
    );
    observer.observe(bottomFlagRef.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hideScrollbarAtBottom) return;
    if (state.scrollTop && !state.scrollBottom) {
      state.hideScrollBar();
    } else {
      state.showScrollBar();
    }
  }, [state.scrollTop, state.scrollBottom]);

  useEffect(() => {
    if (smooth) return;
    let id = -1;
    const onScroll = () => {
      const el = ref.current;
      if (!el) {
        id = requestAnimationFrame(onScroll);
        return;
      }
      setState(state => {
        const { height } = el.getBoundingClientRect();
        let scrollBottom = el.scrollHeight - (el.scrollTop + height);
        scrollBottom = scrollBottom <= 1.5 ? 0 : scrollBottom;
        const { scrollTop } = el;
        if (scrollTop === state.scrollTop && scrollBottom === state.scrollBottom) {
          return state;
        }
        return {
          ...state,
          scrollTop: el.scrollTop,
          scrollBottom,
        };
      });
      id = requestAnimationFrame(onScroll);
    };
    id = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(id);
    };
  }, [smooth]);

  if (hasContext) {
    return <>{children}</>;
  }

  return (
    <ContentWrapperContext.Provider value={state}>
      <div className={classNames('content-wrapper', className)} style={{ ...wrapperStyle, ...style }}>
        {left && (
          <div
            className="content-wrapper-left"
            style={{
              width: leftWidth,
              position: 'absolute',
              top: 0,
              left: 0,
              padding: 15,
              paddingRight: 0,
              height: '100%',
              backgroundColor: '#f5f5f5',
            }}
          >
            <div
              style={{
                borderRadius: 4,
                backgroundColor: '#fff',
                padding: 10,
                height: '100%',
                overflowY: 'auto',
              }}
            >
              {left}
            </div>
          </div>
        )}
        <div
          ref={ref}
          className={classNames('content-wrapper-viewbox', { 'hide-scrollbar': !state.scrollbar })}
          style={{
            marginLeft: left ? `calc(${leftWidth} + 8px)` : 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100%',
            borderRadius: 4,
            position: 'relative',
          }}
        >
          <ResizeObserver
            onResize={({ height }) =>
              setState(state => ({ ...state, height: height * 2 }))
            }
          >
            <div
              style={{
                position: 'absolute',
                zIndex: 0,
                height: '50%',
                pointerEvents: 'none',
                opacity: 0,
              }}
            />
          </ResizeObserver>
          {top && (
            <>
              <div
                className="content-wrapper-viewbox-top"
                style={{
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  padding: '0 15px',
                  position: 'sticky',
                  top: 0,
                  zIndex: 500,
                }}
              >
                {top}
              </div>
              <Gap />
            </>
          )}
          {children && (
            <>
              <div
                className="content-wrapper-viewbox-children"
                style={{
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  padding: '0 15px',
                  minHeight: '100%',
                }}
              >
                {children}
                <div
                  style={{
                    position: 'relative',
                  }}
                >
                  <ResizeObserver
                    onResize={({ width }) =>
                      setState(state => {
                        width *= 2;
                        return { ...state, width };
                      })
                    }
                  >
                    <div
                      style={{
                        position: 'absolute',
                        zIndex: 0,
                        width: '50%',
                        pointerEvents: 'none',
                        opacity: 0,
                      }}
                    />
                  </ResizeObserver>
                </div>
              </div>
            </>
          )}

          {bottom && (
            <div
              className="content-wrapper-viewbox-bottom"
              style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                width: '100%',
                zIndex: 10,
              }}
            >
              <Divider
                style={{
                  width: '100%',
                  margin: 0,
                }}
              />
              <div
                style={{
                  height: 64,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 15,
                  backgroundColor: '#fff',
                }}
              >
                {bottom}
              </div>
            </div>
          )}
          <div ref={bottomFlagRef} />
        </div>
      </div>
    </ContentWrapperContext.Provider>
  );
};

const ContentWrapper = Object.assign(Component, { Gap });
export default ContentWrapper;
```

- [ ] **Step 2: Create src/content-wrapper/index.ts barrel export**

```ts
export { default, default as ContentWrapper } from './index';
export { default as ContentWrapperContext } from './context';
export type { ContentWrapperProps } from './index';
export type { ContentWrapperContextProps } from './context';
```

- [ ] **Step 3: Add ContentWrapper exports to src/index.ts**

```ts
export { default as ContentWrapper } from './content-wrapper';
export { ContentWrapperContext } from './content-wrapper/context';
```

- [ ] **Step 4: Build and verify**

```bash
npm run build:wrapper
```

Expected: builds without errors. `ContentWrapper` and `ContentWrapperContext` appear in `dist/index.d.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/content-wrapper/ src/index.ts
git commit -m "feat(wrapper): migrate ContentWrapper component with CSS-in-JS styles"
```

---

### Task 11: Create locale adapter (useGMLocale)

**Files:**
- Create: `src/locale-adapter/useGMLocale.ts`

This hook replaces `useLocaleReceiver` from antd 4. In antd 5, locale is accessed via `ConfigProvider` context. The hook provides a simple API: `const [locale] = useGMLocale()`.

The 10 files that currently use `useLocaleReceiver` all follow the same pattern:
```ts
const [locale] = useLocaleReceiver('TableFilter');
// use locale.someString
```

Our replacement hook reads from ConfigProvider's locale context and falls back to our GM zh_CN locale.

- [ ] **Step 1: Create src/locale-adapter/useGMLocale.ts**

```ts
import { useContext } from 'react';
import { ConfigProvider } from 'antd';
import type { Locale } from 'antd/es/locale';
import zhCN from '../locale/zh_CN';

/**
 * Replaces antd 4's useLocaleReceiver.
 * Returns the current locale from ConfigProvider context,
 * falling back to GM's zh_CN locale.
 *
 * Usage: const locale = useGMLocale()
 * Then access: locale.Table?.headerSettings, locale.TableFilter?.today, etc.
 */
function useGMLocale(): Locale {
  const { locale } = useContext(ConfigProvider.ConfigContext);
  // locale from context is the antd locale object set via ConfigProvider
  // Merge with our GM custom fields
  if (locale?.locale === 'zh-cn' || locale?.locale === 'zh_CN') {
    return { ...zhCN, ...locale } as Locale;
  }
  // For non-Chinese locales, still provide GM custom fields as fallback
  return locale ? { ...zhCN, ...locale } as Locale : zhCN;
}

export default useGMLocale;
```

- [ ] **Step 2: Commit**

```bash
git add src/locale-adapter/
git commit -m "feat(wrapper): add useGMLocale hook replacing useLocaleReceiver"
```

---

### Task 12: Create GM locale

**Files:**
- Create: `src/locale/zh_CN.ts`
- Modify: `src/index.ts`

Merge antd 5's `zhCN` locale with GM's custom fields. The GM custom fields live in `Table` (20 keys) and `TableFilter` (4 keys).

- [ ] **Step 1: Create src/locale/zh_CN.ts**

```ts
import zhCN from 'antd/es/locale/zh_CN';
import type { Locale } from 'antd/es/locale';

const gmLocale: Locale = {
  ...zhCN,
  Table: {
    ...zhCN.Table,
    // GM custom fields
    filterCheckall: '全选',
    selectAll: '全选当页',
    selectionAll: '全选所有',
    selectAllPages: '全选所有页',
    headerSettings: '表头设置',
    optionalField: '可选字段',
    defaultGrouping: '默认分组',
    theCurrentlySelectedField: '当前选定字段',
    cancel: '取消',
    save: '保存',
    selected: '已选',
    project: '项目',
    open: '展开',
    close: '收起',
    search: '查询',
    pleaseSelect: '请选择',
    pleaseEnter: '请输入',
    allFilteringCriteria: '全部筛选条件',
    saveSettings: '保存设置',
    items: '个条目',
  },
  TableFilter: {
    today: '今天',
    yesterday: '昨天',
    last7days: '近7天',
    last30Days: '近30天',
  },
  Upload: {
    ...zhCN.Upload,
    uploadLocalFile: '上传本地文件',
    noFilesUploaded: '未上传任何文件',
    theFileCannotBeLargerThan10MB: '文件不能大于10MB',
    uploadSuccessful: '上传成功',
    submit: '提交',
    clickOrDragTheFileHereToUpload: '点击或将文件拖拽到这里上传',
    supportExtensions: '支持扩展名: ',
  },
};

export default gmLocale;
```

- [ ] **Step 2: Add locale export to src/index.ts**

```ts
// 5. Custom locale
export { default as gmZhCN } from './locale/zh_CN';
```

- [ ] **Step 3: Build and verify**

```bash
npm run build:wrapper
```

- [ ] **Step 4: Commit**

```bash
git add src/locale/ src/index.ts
git commit -m "feat(wrapper): add GM locale with custom Table and TableFilter fields"
```

---

### Task 13: Create global styles — Design Token theme config

**Files:**
- Create: `src/styles/theme.ts`

Convert `reset_theme.less` (custom primary color `#0363ff`, custom success/warning/error colors) to an antd 5 `ThemeConfig` object. This replaces Less variable overrides with Design Token.

- [ ] **Step 1: Create src/styles/theme.ts**

```ts
import type { ThemeConfig } from 'antd';

/**
 * GM theme configuration for antd 5 ConfigProvider.
 * Replaces reset_theme.less.
 *
 * Usage:
 *   import { gmTheme } from 'gm-antd';
 *   <ConfigProvider theme={gmTheme}>...</ConfigProvider>
 */
const gmTheme: ThemeConfig = {
  token: {
    colorPrimary: '#0363ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#0363ff',
  },
};

export default gmTheme;
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/theme.ts
git commit -m "feat(wrapper): add GM Design Token theme config"
```

---

### Task 14: Create global styles — Component overrides

**Files:**
- Create: `src/styles/global.ts`

Convert `reset_component.less` (145 lines) to an antd 5 compatible format. Two approaches:
1. **Component tokens** for supported overrides (via `gmTheme.components`)
2. **Global CSS injection** for unsupported overrides (`.gm-modal-footer`, `.gm-drawer-footer`, scrollbar, etc.)

The component tokens go into the theme config. The global CSS is provided as a `<style>` injection component.

- [ ] **Step 1: Create src/styles/global.ts**

```ts
import React, { useEffect } from 'react';

/**
 * Global CSS overrides that can't be achieved via Design Token.
 * Replaces reset_component.less.
 *
 * Usage:
 *   import { GMGlobalStyle } from 'gm-antd';
 *   // Add <GMGlobalStyle /> once at app root
 *
 * Design Token-based overrides are in theme.ts (gmTheme).
 * Use both together:
 *   <ConfigProvider theme={gmTheme}>
 *     <GMGlobalStyle />
 *     <App />
 *   </ConfigProvider>
 */

const globalCSS = `
/* GM global component overrides */

/* Modal/Drawer footer absolute positioning */
.gm-modal-footer,
.gm-drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  padding: 10px 16px;
  text-align: right;
  background-color: #fff;
  border-top: 1px solid #e9e9e9;
}

/* Table row height 48px, selected row background */
.ant-table-tbody > tr > td {
  padding: 0 16px;
}
.ant-table-thead > tr > th {
  padding: 0 16px;
}

/* Card body padding */
.ant-card-body {
  padding: 16px 24px;
}

/* Input number full width in forms */
.ant-input-number-group-wrapper {
  width: 100%;
}

/* Custom lightgrey button variant */
.ant-btn.lightgrey {
  color: var(--ant-color-primary);
  background-color: #f2f3f4;
  border-style: none;
}
.ant-btn.lightgrey:hover {
  background-color: rgba(220, 233, 255);
}
.ant-btn.lightgrey[disabled] {
  color: rgba(0, 0, 0, 0.25);
  background-color: #f5f5f5;
}
`;

let injected = false;

/**
 * Inject GM global styles into document head.
 * Renders nothing. Add once at app root.
 */
const GMGlobalStyle: React.FC = () => {
  useEffect(() => {
    if (injected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-gm-antd', 'global');
    style.textContent = globalCSS;
    document.head.appendChild(style);
    injected = true;
  }, []);

  return null;
};

export { GMGlobalStyle, globalCSS };
export default GMGlobalStyle;
```

- [ ] **Step 2: Add styles exports to src/index.ts**

```ts
// 5. Custom styles
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';
```

- [ ] **Step 3: Build and verify**

```bash
npm run build:wrapper
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/ src/index.ts
git commit -m "feat(wrapper): add GM global styles and Design Token theme"
```

---

### Task 15: Finalize entry point and verify full build

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Review and finalize src/index.ts**

The complete `src/index.ts` should be:

```ts
// gm-antd — antd 5 wrapper layer
// 1. Re-export all of antd 5 (business code import path unchanged)
export * from 'antd';

// 4. Custom components
export { default as Icon } from './icon';
export { default as Sortable } from './sortable';
export { default as ContentWrapper } from './content-wrapper';
export { ContentWrapperContext } from './content-wrapper/context';

// 5. Custom locale
export { default as gmZhCN } from './locale/zh_CN';

// 5. Custom styles
export { default as gmTheme } from './styles/theme';
export { GMGlobalStyle } from './styles/global';

// 6. Version
export const version = '2.0.0';
```

- [ ] **Step 2: Run full build**

```bash
npm run build:wrapper
```

Expected: clean build with no errors. `dist/` contains:
- `index.mjs` (ESM)
- `index.cjs` (CJS)
- `index.d.ts` (types)
- Source maps

- [ ] **Step 3: Verify type declarations**

```bash
npx tsc --noEmit -p tsconfig.build.json
```

Expected: no type errors.

- [ ] **Step 4: Verify exports are correct**

Check that all expected exports appear:

```bash
node -e "const gm = require('./dist/index.cjs'); console.log(Object.keys(gm).filter(k => ['Icon','Sortable','ContentWrapper','ContentWrapperContext','gmZhCN','gmTheme','GMGlobalStyle','version'].includes(k)).join(', '))"
```

Expected output: `Icon, Sortable, ContentWrapper, ContentWrapperContext, gmZhCN, gmTheme, GMGlobalStyle, version`

Plus all antd 5 exports (Button, Select, Table, ConfigProvider, etc.) via `export * from 'antd'`.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat(wrapper): finalize Phase 1 entry point"
```

---

### Task 16: Publish and verify with business project

- [ ] **Step 1: Version and publish to private npm**

```bash
npm version 2.0.0-alpha.1
npm publish --tag next
```

- [ ] **Step 2: In a business project, install the new version**

```bash
npm install gm-antd@next
```

- [ ] **Step 3: Verify antd 5 components work**

In the business project, check that:
- `import { Button, Select, Table, ConfigProvider } from 'gm-antd'` resolves
- Basic antd 5 components render (Button, Input, Table)
- `import { Icon } from 'gm-antd'` renders custom icons
- `import { Sortable } from 'gm-antd'` works for drag-and-drop lists
- `import { ContentWrapper } from 'gm-antd'` renders layout correctly
- `import { gmTheme, GMGlobalStyle } from 'gm-antd'` provides theming
- Wrap with `<ConfigProvider theme={gmTheme}><GMGlobalStyle />...<ConfigProvider>` applies `#0363ff` primary color

- [ ] **Step 4: Note antd 4→5 breaking changes for business project**

Business project will need to address these antd 4→5 breaking changes separately:
- `visible` → `open` (Modal/Drawer/Tooltip/Popover)
- `dropdownClassName` → `popupClassName`
- `message.warn()` → `message.warning()`
- `moment` → `dayjs` (DatePicker)
- `bordered` → `variant`
- Less variable overrides → Design Token (now handled by `gmTheme`)

---

## Self-Review Checklist

- [x] **Spec coverage:** All Phase 1 items from the design spec are covered (Icon, Sortable, ContentWrapper, locale adapter, GM locale, global styles, build infrastructure)
- [x] **Placeholder scan:** No TBD/TODO placeholders — all code is complete
- [x] **Type consistency:** All exports match their types, import paths are consistent across tasks
- [x] **Bug fixes included:** Sortable `_.uniqueId()` key bug is fixed in Task 7
- [x] **Dependencies:** All required packages listed in Task 1 Step 5
- [x] **Backward compatibility:** `components/` directory kept for reference, not deleted
