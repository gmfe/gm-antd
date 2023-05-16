---
order: 1
title:
  zh-CN: 可视化配置
  en-US: TODO
---

## zh-CN

可视化配置

## en-US

TODO

```tsx
import { Select } from 'antd';
// import type { FieldItem } from 'antd';
import React from 'react';
// import { usePagination } from '@gm-common/hooks';
import { GetUserInfo } from 'gm_api/src/oauth';

const r = require.context('gm_api/src', true, /.*\/(index|methods)\.ts$/);
const api: {
  [key: string]: { [key: string]: (params: any, code?: any) => Promise<any> };
} = {};
r.keys().forEach((key: string) => {
  const module = key.split('/')[2];
  api[module] = Object.assign(api[module] || {}, r(key));
});

// const FIELDS: FieldItem[] = [
//   {
//     key: 'subject_type_id',
//     type: 'select',
//     alwaysUsed: true,
//     label: '科目类别',
//     minWidth: 250,
//     async options() {
//       return new Promise((resolve, reject) => {
//         setTimeout(
//           () =>
//             resolve([
//               {
//                 value: 1,
//                 text: '类别1',
//               },
//               {
//                 value: 2,
//                 text: '类别2',
//               },
//             ]),
//           1000,
//         );
//       });
//     },
//   },
// ];

const App: React.FC = () => {
  // const paginationResult = usePagination(
  //   async params => alert(JSON.stringify(params, undefined, 2)),
  //   {
  //     defaultPaging: {
  //       limit: 999,
  //     },
  //   },
  // );

  React.useEffect(() => {
    console.log(api);
    GetUserInfo().then(console.log).catch(console.error);
  }, []);

  return (
    <>
      <Select
        showSearch
        placeholder="选择接口"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={Object.keys(api['methods.ts']).map(name => {
          console.log(name)
          return {
            value: name,
            text: name,
          };
        })}
        onChange={console.log}
      />
      <div className="bg-orange text-white">TODO:</div>
    </>
  );
};

export default App;
```
