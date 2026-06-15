---
order: -2
title:
  zh-CN: 新风格
  en-US: TODO
gm: true
---

## zh-CN

新的灰底蓝字风格的按钮, `type`为`second`

## en-US

TODO:

```tsx
import { Button } from 'antd';
import React from 'react';

const App: React.FC = () => (
  <div className="tw-flex gap-2">
    <Button type="second">second</Button>
    <Button type="second" block>
      second
    </Button>
    <Button type="second" loading>
      second
    </Button>
    <Button type="second" size="small">
      second
    </Button>
    <Button type="second" size="large">
      second
    </Button>
  </div>
);

export default App;
```
