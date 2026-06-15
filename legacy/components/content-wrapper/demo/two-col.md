---
order: 01
title:
  zh-CN: 双栏
  en-US: todo
---

## zh-CN

双栏布局

## en-US

todo

```tsx
import {
  Layout,
  ContentWrapper,
  TableFilter,
} from 'antd';
import { usePagination } from '@gm-common/hooks';
import React from 'react';

const { Sider } = Layout;

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
];

const App: React.FC = () => {
  const paginationResult = usePagination(console.log, {
    defaultPaging: {
      limit: 999,
    },
  });

  return (
    <>
      <Layout>
        <Sider />
        <Layout>
            
            <ContentWrapper
              left={
                <div className='bg-white'>
                  {Array(100).fill(null).map((_,i)=><div key={i}>{i}</div>)}
                </div>
              }
            >
              <TableFilter paginationResult={paginationResult} fields={FIELDS} />
              <ContentWrapper.Gap />
              <div className='h-screen'>body</div>
            </ContentWrapper>

        </Layout>
      </Layout>
    </>
  );
};

export default App;
```

<style>
.content-wrapper{
  height:384px!important;
}
</style>
