---
order: 0
title:
  zh-CN: 抽屉
  en-US: Basic
gm: true
---

## zh-CN

样式实现参考

## en-US

Basic drawer.

```tsx
import { Button, Drawer, Divider } from 'antd';
import React, { useState } from 'react';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

const App: React.FC = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        Open
      </Button>
      <Drawer
        onClose={onClose}
        open={open}
        title={
          <div className="flex items-center font-bold">
            <span className="ml-3 text-base">凭证详情</span>
            <span className="flex-grow" />
            <Button
              className="mr-2"
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={onClose}
            />
          </div>
        }
        maskClosable
        destroyOnClose
        closeIcon={false}
        maskStyle={{ opacity: 0 }}
        className="top-3 right-3 bottom-3"
        headerStyle={{ padding: '10px 0' }}
        bodyStyle={{
          paddingTop: 0,
          paddingBottom: 0,
          overflow: 'auto',
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button type="primary">保存</Button>
            <Button>取消</Button>
          </div>
        }
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default App;
```

<style>
[data-theme='compact'] .ant-drawer-body p {
  margin-bottom: 0;
}
</style>
