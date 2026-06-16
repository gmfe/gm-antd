import React from 'react';
import { Dropdown, Button, Space, Menu } from 'gm-antd';
import type { MenuProps } from 'gm-antd';

/**
 * 兼容验证:Dropdown 沿用 v4 风格(此 demo 用 items,visible/onVisibleChange 见翻译表)。
 * 同时验证 compat Menu:用 v4 Menu.Item children 写法,垫片运行时转 items。
 */
const items: MenuProps['items'] = [
  { key: '1', label: '菜单项一' },
  { key: '2', label: '菜单项二' },
  { key: '3', label: '菜单项三' },
];

export default () => (
  <Space>
    <Dropdown menu={{ items }}>
      <Button>Hover 下拉(items)</Button>
    </Dropdown>
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button>右下下拉</Button>
    </Dropdown>
  </Space>
);
