import React from 'react';
import { Menu } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 <Menu.Item> / <Menu.SubMenu> children 写法,
 * 垫片运行时转 items,渲染正常、无 v4 弃用警告。
 */
export default () => (
  <Menu style={{ width: 256 }} mode="inline">
    <Menu.Item key="1">菜单项一</Menu.Item>
    <Menu.Item key="2">菜单项二</Menu.Item>
    <Menu.SubMenu key="sub1" title="子菜单">
      <Menu.Item key="3">子项一</Menu.Item>
      <Menu.Item key="4">子项二</Menu.Item>
    </Menu.SubMenu>
    <Menu.Item key="5">菜单项三</Menu.Item>
  </Menu>
);
