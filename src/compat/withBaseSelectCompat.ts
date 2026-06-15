import React from 'react';
import { applyCompatProps } from './withCompat';

/** Select/Cascader/TreeSelect/AutoComplete/Mentions 共用的 v4→v5 改名表。 */
export const BASE_SELECT_RENAME = {
  dropdownClassName: 'popupClassName',
  dropdownMatchSelectWidth: 'popupMatchSelectWidth',
  dropdownRender: 'popupRender',
  onDropdownVisibleChange: 'onOpenChange',
} as const;

/** bordered={false} → variant="borderless"(antd3 仍接受 bordered 但会警告,转换以消警告)。 */
export const transformBordered = (p: Record<string, any>): Record<string, any> => {
  const out = { ...p };
  if (out.bordered === false && out.variant === undefined) {
    out.variant = 'borderless';
  }
  delete out.bordered;
  return out;
};

/**
 * 包裹一个 antd 5 的 BaseSelect 类组件,使其仍接受 v4 的 dropdown* 系列 props + bordered。
 */
export function withBaseSelectCompat<P extends object>(
  Component: React.ComponentType<P>,
) {
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
