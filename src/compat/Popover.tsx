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
});
