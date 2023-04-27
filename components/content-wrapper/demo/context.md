---
order: 02
title:
  zh-CN: context
  en-US: todo
---

## zh-CN

使用 bottom 插槽

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
            <ContentWrapperContext.Consumer>
              {({ width, container, height, scrollTop, scrollBottom }) => (
                <div>
                  <div className="h-20 sticky top-5">scrollTop: {scrollTop}</div>
                  <div className="h-20 sticky top-10">scrollBottom: {scrollBottom}</div>
                  <div className="h-20 sticky top-0">width: {width}</div>
                  <div className="h-20 sticky top-16">height: {height}</div>
                  <div className="h-20">/</div>
                  <div className="h-20">/</div>
                  <div className="h-20">/</div>
                  <div className="h-20">/</div>
                  <div>{container?.className}</div>
                </div>
              )}
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
