import React from 'react';
import { Tabs } from 'gm-antd';

/**
 * 兼容验证:沿用 v4 的 <Tabs.TabPane> children 写法,垫片运行时转 items,渲染正常、无 v4 弃用警告。
 */
export default () => (
  <Tabs defaultActiveKey="1">
    <Tabs.TabPane tab="标签一" key="1">
      标签一内容(v4 TabPane children 写法)
    </Tabs.TabPane>
    <Tabs.TabPane tab="标签二" key="2">
      标签二内容
    </Tabs.TabPane>
    <Tabs.TabPane tab="标签三" key="3">
      标签三内容
    </Tabs.TabPane>
  </Tabs>
);
