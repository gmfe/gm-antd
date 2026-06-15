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
