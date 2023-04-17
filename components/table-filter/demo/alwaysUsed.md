---
order: 2
title:
  zh-CN: alwaysUsed
  en-US: TODO
---

## zh-CN

alwaysUsed 为 false 的默认不显示，且会出现设置功能

## en-US

TODO

```tsx
import { TableFilter } from 'antd';
import type { FieldItem } from 'antd';
import React from 'react';

const FIELDS: FieldItem[] = [
  {
    key: 'subject_type_id',
    type: 'select',
    alwaysUsed: true,
    label: '科目类别',
    minWidth: 250,
    async options() {
      return new Promise((resolve, reject) => {
        setTimeout(
          () =>
            resolve([
              {
                value: 1,
                text: '类别1',
              },
              {
                value: 2,
                text: '类别2',
              },
            ]),
          1000,
        );
      });
    },
  },
  {
    key: 'subject_code_or_name',
    type: 'input',
    alwaysUsed: false,
    label: '科目代码/名称',
  },
  {
    key: 'date',
    type: 'date',
    alwaysUsed: false,
    label: '日期',
  },
  {
    key: 'time',
    type: 'date',
    showTime: true,
    alwaysUsed: false,
    label: '时间',
  },
  {
    key: 'month',
    type: 'date',
    picker: 'month',
    alwaysUsed: false,
    label: '月份',
  },
  {
    key: 'range',
    type: 'date',
    range: true,
    alwaysUsed: false,
    label: '时间范围',
    toParam(values) {
      return {
        begin_time: values?.[0],
        end_time: values?.[1],
      };
    },
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
      <TableFilter paginationResult={paginationResult} fields={FIELDS} />
    </>
  );
};

export default App;
```
