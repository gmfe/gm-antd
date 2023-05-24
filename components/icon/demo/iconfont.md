---
order: 3
title:
  zh-CN: 使用 iconfont.cn
  en-US: Use iconfont.cn
---

## zh-CN

对于使用 [iconfont.cn](http://iconfont.cn/) 的用户，通过设置 `createFromIconfontCN` 方法参数对象中的 `scriptUrl` 字段， 即可轻松地使用已有项目中的图标。

## en-US

If you are using [iconfont.cn](http://iconfont.cn/), you can use the icons in your project gracefully.

```tsx
import { createFromIconfontCN } from '@ant-design/icons';
import React from 'react';

const IconFont = createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/c/font_4079364_omop55e0gd.js',
});

const App: React.FC = () => (
  <div>
    <div className="text-red-500">
      在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。
    </div>
    <div>
      <IconFont type="icon-left-fill" className="text-3xl" />
      <IconFont type="icon-history-outlined" className="text-3xl" />
      <IconFont type="icon-exclamation-outlined" className="text-3xl" />
    </div>
  </div>
);

export default App;
```
