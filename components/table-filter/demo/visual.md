---
order: 1
title:
  zh-CN: 生成配置
  en-US: TODO
---

## zh-CN

生成配置

## en-US

TODO

```tsx
import { TableFilter, Divider, Form, message } from 'antd';
import React from 'react';
import { usePagination } from '@gm-common/hooks';
import ConfigPanel from './ConfigPanel';

const App: React.FC = () => {
  const [form] = Form.useForm();
  const fields = Form.useWatch('fields', form);

  const paginationResult = usePagination(
    async params => {
      const apiMethod = form.getFieldValue('apiMethod');
      if (!apiMethod) return;
      return apiMethod(params).catch(err => {
        message.error(JSON.stringify(err.message || err, undefined, 2));
      });
    },
    {
      defaultPaging: {
        limit: 999,
      },
    },
  );

  return (
    <>
      <ConfigPanel form={form} />
      <Divider />
      <TableFilter
        id={JSON.stringify(fields)}
        paginationResult={paginationResult}
        fields={fields}
      />
      <Divider />
      <code>{JSON.stringify(fields, undefined, 2)}</code>
    </>
  );
};

export default App;
```
