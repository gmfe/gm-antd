import React from 'react';
import { Dropdown as AntDropdown } from 'antd';
import type { DropdownProps as AntDropdownProps } from 'antd';
import { withCompat } from './withCompat';

export type DropdownProps = AntDropdownProps;

export default withCompat(AntDropdown as React.ComponentType<DropdownProps>, {
  rename: {
    visible: 'open',
    onVisibleChange: 'onOpenChange',
  },
});
