---
order: 4
title:
  zh-CN: 函数式
  en-US: TODO
---

## zh-CN

函数式操作。

通过`TableFilter.get(id)`方法可以获取到当前实例，并进行函数式操作，比如`set`、`get`、`search`、`toPrams`、`reset`等。

## en-US

TODO

```tsx
import { TableFilter, Button } from 'antd';
import React from 'react';
import { observer } from 'mobx-react';

const FIELDS: FieldItem[] = [
  {
    key: 'subject_code_or_name',
    type: 'input',
    alwaysUsed: true,
    label: '科目代码/名称',
  },
  {
    key: 'date',
    type: 'date',
    alwaysUsed: true,
    label: '日期',
  },
];

const App: React.FC = () => {
  // const paginationResult = usePagination(store.fetch, {
  //   defaultPaging: {
  //     limit: 999,
  //   },
  // })
  /** 这是mok的paginationResult，实际项目中通常配合usePagination使用 */
  const paginationResult = {
    async run(params) {
      alert(JSON.stringify(params, undefined, 2));
    },
  };
  return (
    <>
      <Button
        onClick={() => {
          const filter = TableFilter.get()
          filter.set('subject_code_or_name', '更新后的值');
        }}
      >
        更新科目代码/名称
      </Button>
      <div className="mb-2" />
      <TableFilter paginationResult={paginationResult} fields={FIELDS} />
    </>
  );
};

export default observer(App);
```
