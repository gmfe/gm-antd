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
 * 收集 children 为扁平数组。
 * 注意:不能用 React.Children.toArray —— 它会给 key 加前缀(如 '0' -> '.$0'),
 * 导致转出的 item.key 与外部受控的 activeKey/selectedKeys 严格相等判断失败
 * (表现为 Tabs 初始不高亮、Menu 默认不选中,点击后才恢复)。forEach 不改写 key。
 */
function collectChildren(children: React.ReactNode): React.ReactNode[] {
  const arr: React.ReactNode[] = [];
  React.Children.forEach(children, child => {
    arr.push(child);
  });
  return arr;
}

/**
 * 把 <Tabs.TabPane> children 转成 antd 5 Tabs 的 items[]。
 * 仅当存在 TabPane 元素时转换;否则返回 undefined(交还 antd 5 处理,可能仅警告)。
 */
export function tabChildrenToItems(children: React.ReactNode): any[] | undefined {
  if (children == null) return undefined;
  const arr = collectChildren(children).filter(Boolean);
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
  const arr = collectChildren(children).filter(Boolean);
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
