---
order: 3
title:
  zh-CN: 级联
  en-US: TODO
---

## zh-CN

级联选择

## en-US

TODO

```tsx
import { TableFilter } from 'antd';
import type { FieldItem } from 'antd';
import React from 'react';

const FIELDS: FieldItem[] = [
  {
    key: 'category',
    type: 'cascader',
    label: '商品分类',
    placeholder: '选择商品分类',
    alwaysUsed: true,
    async options() {
      // const { categoryTreeData } = await fetchTreeData()
      // return formatCascaderData(categoryTreeData)
      return [
        {
          value: 0,
          label: '一级菜单A',
          children: [
            {
              value: 0,
              label: '二级菜单A',
              children: [],
            },
            {
              value: 1,
              label: '二级菜单B',
              children: [],
            },
          ],
        },
        {
          value: 1,
          label: '一级菜单B',
          children: [],
        },
      ];
    },
    toParam(value) {
      if (!value) return {};
      const categories: Record<string, string> = {};
      value.forEach((item, index) => {
        switch (index) {
          case 0: {
            categories.category_id_1 = item;
            break;
          }
          case 1: {
            categories.category_id_2 = item;
            break;
          }
          case 2: {
            categories.category_id_3 = item;
            break;
          }
          default: {
            // Tip.danger(t('商品分类不应超过三级'))
            throw new Error('SPU CATEGORY ERROR');
          }
        }
      });
      return categories;
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
