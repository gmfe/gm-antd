import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps as AntDrawerProps } from 'antd';
import { withCompat } from './withCompat';

export type DrawerProps = AntDrawerProps;

export default withCompat(AntDrawer as React.ComponentType<DrawerProps>, {
  // 注: onVisibleChange → afterOpenChange 是改名 + 时机变化。antd5 完全移除了 onVisibleChange,
  // 只剩 afterOpenChange(动画完成后触发, 比 v4 的即时 onVisibleChange 晚约 300ms)。
  // 这是 antd5 inherent breaking, 垫片只能改名让业务代码不用改, 无法消除时机差异。
  // 业务若依赖 onVisibleChange 的即时副作用(如关闭即重置表单), 需自行评估延迟影响或改用其他机制。
  rename: {
    visible: 'open',
    onVisibleChange: 'afterOpenChange',
    destroyOnClose: 'destroyOnHidden',
  },
});
