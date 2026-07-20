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

// antd5 移除了 Menu.Item/SubMenu/ItemGroup(改 items API), AntMenu.Item 是 undefined。
// 用 marker 组件代替: <Menu.Item> 创建元素不崩(render null), menuChildrenToItems 按 displayName 识别转 items。
// displayName 必须对齐 childrenToItems 的识别名(MenuItem/SubMenu/MenuGroup/MenuDivider)。
const _menuItemMarker = (name: string) => {
  const fn = ((props: any) => null) as any;
  fn.displayName = name;
  return fn;
};
(CompatMenu as any).Item = _menuItemMarker('MenuItem');
(CompatMenu as any).SubMenu = _menuItemMarker('SubMenu');
(CompatMenu as any).ItemGroup = _menuItemMarker('MenuGroup');
(CompatMenu as any).Divider = _menuItemMarker('MenuDivider');
(CompatMenu as any).displayName = 'GmMenu';

export default CompatMenu as any;
