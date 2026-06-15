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

// 业务可能用 Tabs.TabPane 做类型/引用,保留静态成员(antd5 仍导出,仅渲染时警告,但我们已转换)
(CompatTabs as any).TabPane = AntTabs.TabPane;
(CompatTabs as any).displayName = 'GmTabs';

export default CompatTabs as typeof CompatTabs & {
  TabPane: typeof AntTabs.TabPane;
};
