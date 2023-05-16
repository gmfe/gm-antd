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
// import { TableFilter } from 'antd';
// import type { FieldItem } from 'antd';
import React from 'react';
// import { usePagination } from '@gm-common/hooks';
import { GetUserInfo } from 'gm_api/src/oauth';

const r = require.context('gm_api/src', true, /.*\/index\.ts$/);
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
    GetUserInfo().then(console.log).catch(console.error);
  }, []);

  return <div className='bg-orange text-white'>TODO:</div>;
};

export default App;
```
