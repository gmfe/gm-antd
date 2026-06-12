import { useOutlet } from 'dumi';
import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

const GlobalLayout: React.FC = () => {
  const outlet = useOutlet();

  return (
    <ConfigProvider locale={zhCN}>
      {outlet}
    </ConfigProvider>
  );
};

export default GlobalLayout;
