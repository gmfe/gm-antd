import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps as AntPopconfirmProps } from 'antd';
import { withCompat } from './withCompat';

export type PopconfirmProps = AntPopconfirmProps;

export default withCompat(AntPopconfirm as React.ComponentType<PopconfirmProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
