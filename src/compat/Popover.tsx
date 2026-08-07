import React from 'react';
import { Popover as AntPopover } from 'antd';
import type { PopoverProps as AntPopoverProps } from 'antd';
import { withCompat } from './withCompat';

export type PopoverProps = AntPopoverProps;

export default withCompat(AntPopover as React.ComponentType<PopoverProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
  transform: (props) => {
    // antd5 rc-trigger 在弹层关闭时缓存内容（PopupContent cache = !open && !fresh），
    // 关闭期间 content 子树不会用新 props 重渲染，v4 无此行为。
    // 默认补 fresh: true 恢复 v4 语义（关闭时也持续重渲染 content），
    // 否则 content 内依赖 open prop 变化的逻辑（如「取消后重开还原」）会失效。
    if (props.fresh === undefined) {
      props.fresh = true;
    }
    return props;
  },
});
