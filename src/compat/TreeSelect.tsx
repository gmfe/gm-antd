import React from 'react';
import { TreeSelect as AntTreeSelect } from 'antd';
import type { TreeSelectProps as AntTreeSelectProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type TreeSelectProps = AntTreeSelectProps;

const Compat = withBaseSelectCompat(AntTreeSelect as React.ComponentType<TreeSelectProps>);
// TreeSelect 静态成员补回: TreeNode + SHOW_ALL/SHOW_PARENT/SHOW_CHILD(全大写, 与 antd4/5 一致)
(Compat as any).TreeNode = AntTreeSelect.TreeNode;
(Compat as any).SHOW_ALL = AntTreeSelect.SHOW_ALL;
(Compat as any).SHOW_PARENT = AntTreeSelect.SHOW_PARENT;
(Compat as any).SHOW_CHILD = AntTreeSelect.SHOW_CHILD;

export default Compat as typeof Compat & {
  TreeNode: typeof AntTreeSelect.TreeNode;
  SHOW_ALL: typeof AntTreeSelect.SHOW_ALL;
  SHOW_PARENT: typeof AntTreeSelect.SHOW_PARENT;
  SHOW_CHILD: typeof AntTreeSelect.SHOW_CHILD;
};
