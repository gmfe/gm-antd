---
order: 0
title:
  zh-CN: 基本使用
  en-US: TODO
gm: true
---

## zh-CN

此组件继承自antd的Pagination组件，做了和`usePagination`以及样式的封装。

## en-US

TODO

```tsx
import { TablePagination } from 'antd';
import React from 'react';

const App: React.FC = () => {
  // const paginationResult = usePagination(store.fetch, {
  //   defaultPaging: {
  //     limit: 999,
  //   },
  // })
  /** 这是mok的paginationResult，实际项目中配合usePagination使用 */
  const paginationResult = {
    paging: {
      offset: 0,
      limit: 50,
      need_count: true,
      has_more: false,
    },
    async run(params) {
      alert(JSON.stringify(params, undefined, 2));
    },
  };
  return (
    <>
      <TablePagination paginationResult={paginationResult} showSizeChanger />
    </>
  );
};

export default App;
```
