---
order: -1
title:
  zh-CN: 函数式调用
  en-US: TODO
gm: true
---

## zh-CN

便捷的函数式调用实现选择文件、上传文件。

上传请求无法封装进来，需要传入`uploadQiniuFile`给`uploadFn`。

## en-US

todo

```tsx
import { Button, Upload } from 'antd';
import React from 'react';

const App: React.FC = () => (
  <Button
    onClick={() => {
      Upload.open({
        title: '科目导入',
        accept: '.xlsx, .xls',
        extra: (
          <a
            target="_blank"
            href="https://frontend-static-1251112841.cos.ap-guangzhou.myqcloud.com/download/erp/%E4%B8%9A%E8%B4%A2-%E7%A7%91%E7%9B%AE%E7%AE%A1%E7%90%86-%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx"
            rel="noreferrer"
          >
            下载模板
          </a>
        ),
        // uploadFn: file => uploadQiniuFile(FileType.FILE_TYPE_ENTERPRISE_COMPANY_WEBSITE, file),
        uploadFn(file: File) {
          /** MOCK上传逻辑 */
          return Promise.resolve({
            data: {
              url: 'https://frontend-static-1251112841.cos.ap-guangzhou.myqcloud.com/download/erp/%E4%B8%9A%E8%B4%A2-%E7%A7%91%E7%9B%AE%E7%AE%A1%E7%90%86-%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx',
            },
          });
        },
      }).then(files => {
        alert('上传成功: ' + files[0].url);
      });
    }}
  >
    导入
  </Button>
);

export default App;
```
