import React from 'react';
import { Table, useTableVirtual } from 'gm-antd';

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 100 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 300 },
];

const data = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  key: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 30),
  address: `北京市朝阳区${i + 1}号`,
}));

export default () => {
  const virtualProps = useTableVirtual({
    columns,
    scroll: { x: 630, y: 400 },
  });

  return (
    <Table
      columns={virtualProps.columns}
      dataSource={data}
      scroll={virtualProps.scroll}
      components={virtualProps.components}
      pagination={false}
      bordered
    />
  );
};
