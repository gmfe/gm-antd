---
order: 0
title:
  zh-CN: 基本使用
  en-US: TODO
gm: true
---

## zh-CN

此组件继承自 antd 的 Pagination 组件，做了和`usePagination`以及样式的封装。

## en-US

TODO

```tsx
import { TablePagination } from 'antd';
import React from 'react';
import { usePagination } from '@gm-common/hooks'

const App: React.FC = () => {
  const paginationResult = usePagination(console.log, {
    defaultPaging: {
      limit: 999,
    },
  });
  return (
    <>
      <TablePagination paginationResult={paginationResult} showSizeChanger />
    </>
  );
};

export default App;
```
