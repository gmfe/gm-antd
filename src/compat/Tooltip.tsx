import React from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps as AntTooltipProps } from 'antd';
import { withCompat } from './withCompat';

export type TooltipProps = AntTooltipProps;

export default withCompat(AntTooltip as React.ComponentType<TooltipProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
