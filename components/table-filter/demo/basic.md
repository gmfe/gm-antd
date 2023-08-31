---
order: 0
title:
  zh-CN: 基本使用
  en-US: TODO
gm: true
---

## zh-CN

配置`fields`即可，无需手动控制任何状态

## en-US

TODO

```tsx
import { TableFilter } from 'antd';
import type { FieldItem } from 'antd';
import React from 'react';
import { usePagination } from '@gm-common/hooks';

const FIELDS: FieldItem[] = [
  {
    key: 'subject_type_id',
    type: 'select',
    alwaysUsed: true,
    label: '科目类别',
    minWidth: 250,
    remote: true,
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
    alwaysUsed: true,
    label: '科目代码/名称',
  },
  {
    key: 'date',
    type: 'date',
    alwaysUsed: true,
    label: '日期',
    allowClear: false,
  },
  {
    key: 'time',
    type: 'date',
    showTime: true,
    alwaysUsed: true,
    label: '时间',
  },
  {
    key: 'month',
    type: 'date',
    picker: 'month',
    alwaysUsed: true,
    label: '月份',
  },
  {
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
  {
    key: 'disable-range',
    type: 'input',
    label: '禁用',
    alwaysUsed: true,
    disabled: true,
  },
];

const App: React.FC = () => {
  const paginationResult = usePagination(
    async params => alert(JSON.stringify(params, undefined, 2)),
    {
      defaultPaging: {
        limit: 999,
      },
    },
  );
  return (
    <>
      <TableFilter paginationResult={paginationResult} fields={FIELDS} />
    </>
  );
};

export default App;
```
