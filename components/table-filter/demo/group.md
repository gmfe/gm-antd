---
order: 1
title:
  zh-CN: 分组
  en-US: TODO
---

## zh-CN

group 相同的会合并为同一个

## en-US

TODO

```tsx
import { TableFilter } from 'antd';
import type { FieldItem } from 'antd';
import React from 'react';
import { usePagination } from '@gm-common/hooks'

const FIELDS: FieldItem[] = [
  {
    key: 'subject_code_or_name',
    type: 'input',
    alwaysUsed: true,
    label: '科目代码/名称',
  },
  {
    group: '时间类型',
    key: 'date',
    type: 'date',
    alwaysUsed: true,
    label: '日期',
  },
  {
    group: '时间类型',
    key: 'time',
    type: 'date',
    showTime: true,
    alwaysUsed: true,
    label: '时间',
  },
  {
    group: '时间类型',
    key: 'month',
    type: 'date',
    picker: 'month',
    alwaysUsed: true,
    label: '月份',
  },
  {
    group: '时间类型',
    key: 'range',
    type: 'date',
    range: true,
    alwaysUsed: true,
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
  const paginationResult = usePagination(alert, {
    defaultPaging: {
      limit: 999,
    },
  })
  return (
    <>
      <TableFilter paginationResult={paginationResult} fields={FIELDS} />
    </>
  );
};

export default App;
```
