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
) {
  const Wrapped = React.forwardRef<any, P>((props, ref) => {
    const compatProps = applyCompatProps(props as Record<string, any>, options) as P;
    return React.createElement(Component, { ...compatProps, ref });
  });
  // 保留原组件静态成员(Dropdown.Button / Input.TextArea / Cascader.SHOW_ALL / TreeSelect.SHOW_ALL 等)。
  // 注意:不能用 Object.assign 整体拷贝 —— antd 组件多为 forwardRef 对象, `render`/`$$typeof`
  // 是 React 内部字段,整体拷贝会把 Wrapped.render 覆盖成原组件的 render,导致本包装层
  // (改名/transform)在运行时完全失效(此前 Popover 的 fresh 补丁因此不生效)。
  // 这里拷贝静态成员时排除这两个内部字段。
  for (const key of Object.keys(Component)) {
    if (key !== '$$typeof' && key !== 'render') {
      (Wrapped as any)[key] = (Component as any)[key];
    }
  }
  (Wrapped as any).displayName = `withCompat(${(Component as any).displayName || (Component as any).name || 'Component'})`;
  return Wrapped as unknown as typeof Component;
}
