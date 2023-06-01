---
order: 7
title:
  zh-CN: isExpand
  en-US: TODO
gm: true
---

## zh-CN

`fields` 中的 `Item`  设置 `collapsed = true` 

## en-US

TODO

```tsx
import { TableFilter, message } from 'antd';
import type { FieldItem } from 'antd';
import React from 'react';
import { usePagination } from '@gm-common/hooks';
import moment from 'moment'

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
    alwaysUsed: true,
    defaultValue: '默认值',
    label: '科目代码/名称',
  },
  {
    key: 'date',
    type: 'date',
    alwaysUsed: false,
    collapsed: true,
    defaultUsed: true,
    label: '日期',
    defaultValue: moment(),
  },
  {
    key: 'time',
    type: 'date',
    showTime: true,
    alwaysUsed: false,
    collapsed: true,
    label: '时间',
  },
  {
    key: 'month',
    type: 'date',
    picker: 'month',
    alwaysUsed: false,
    collapsed: true,
    label: '月份',
  },
  {
    key: 'range',
    type: 'date',
    range: true,
    alwaysUsed: false,
    collapsed: true,
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
    alwaysUsed: false,
    disabled: true,
    collapsed: true,
  },
];

const App: React.FC = () => {
  const paginationResult = usePagination(async params => alert(JSON.stringify(params, undefined, 2)), {
    defaultPaging: {
      limit: 999,
    },
  });

  const onCustomSave = () => {
    message.success('保存成功， 重新执行搜索接口',)
    const handler = TableFilter.get('expand-tableFilter')
    handler.search()
    // paginationResult.run()
  }

  return (
    <>
      <TableFilter 
        id='expand-tableFilter'
        paginationResult={paginationResult}
        fields={FIELDS}
        isExpanded
        isAlwaysShowCustom
        skipInitialValues={['date']}
        onCustomSave={onCustomSave}
      />
    </>
  );
};

export default App;
```
