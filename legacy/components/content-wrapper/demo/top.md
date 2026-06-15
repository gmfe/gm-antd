---
order: 3
title:
  zh-CN: 顶部插槽
  en-US:
---

## zh-CN

顶部插槽,

## en-US

todo

```tsx
import {
  Layout,
  ContentWrapper,
} from 'antd';
import React from 'react';

const { Sider } = Layout;

const App: React.FC = () => {
  return (
    <>
      <Layout>
        <Sider />
        <Layout>

            <ContentWrapper top={'top'}>
              body
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
