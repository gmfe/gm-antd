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
  // forwardRef 包装默认会丢, 这里 Object.assign 拷回(运行时) + as typeof Component 保留类型。
  Object.assign(Wrapped, Component);
  (Wrapped as any).displayName = `withCompat(${(Component as any).displayName || (Component as any).name || 'Component'})`;
  return Wrapped as unknown as typeof Component;
}
