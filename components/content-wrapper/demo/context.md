---
order: 02
title:
  zh-CN: context
  en-US: todo
---

## zh-CN

使用bottom插槽

使用 useContext(ContentWrapperContext)

## en-US

todo

```tsx
import { Layout, ContentWrapper, ContentWrapperContext, TableFilter, Button } from 'antd';
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
              bottom={
                <>
                  <Button type="second">取消</Button>
                  <Button type="primary">保存</Button>
                </>
              }
            >
              <TableFilter paginationResult={paginationResult} fields={FIELDS} trigger="onChange" />
              <ContentWrapper.Gap />
              <ContentWrapperContext.Consumer>
                {({ width, container, height }) => {
                  return (
                    <div>
                      <div>{width}</div>
                      <div>{height}</div>
                      <div>{container?.className}</div>
                    </div>
                  );
                }}
              </ContentWrapperContext.Consumer>
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
