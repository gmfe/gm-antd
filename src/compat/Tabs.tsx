import React from 'react';
import { Tabs as AntTabs } from 'antd';
import type { TabsProps as AntTabsProps } from 'antd';
import { tabChildrenToItems } from './childrenToItems';

export type TabsProps = AntTabsProps;

const CompatTabs = React.forwardRef<any, TabsProps>((props, ref) => {
  const { items, children, ...rest } = props;
  // items(v5 API)优先;否则尝试把 TabPane children 转 items;都无法转换时透传 children(antd5 仍渲染,仅警告)
  const resolvedItems = items ?? tabChildrenToItems(children);
  if (resolvedItems) {
    return <AntTabs ref={ref} {...rest} items={resolvedItems} />;
  }
  return (
    <AntTabs ref={ref} {...rest}>
      {children as any}
    </AntTabs>
  );
});

// antd5 移除 TabPane(改 items API), AntTabs.TabPane 是 undefined。用 marker(displayName 'TabPane'),
// tabChildrenToItems 按 displayName 识别转 items(治本, ERP 149 处 TabPane 零改动)。
const _tabPaneMarker = (() => null) as any;
_tabPaneMarker.displayName = 'TabPane';
(CompatTabs as any).TabPane = _tabPaneMarker;
(CompatTabs as any).displayName = 'GmTabs';

export default CompatTabs as any;
