import React from 'react';
import { Table, useTableDIY } from 'gm-antd';

const allColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 200 },
  { title: '电话', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
];

const data = Array.from({ length: 10 }, (_, i) => ({
  key: i + 1,
  id: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 10),
  address: `北京市${i + 1}号`,
  phone: `138${String(i).padStart(8, '0')}`,
  email: `user${i + 1}@example.com`,
}));

const config = {
  id: { name: 'ID', defaultShow: true, disable: true },
  name: { name: '姓名', defaultShow: true },
  age: { name: '年龄', defaultShow: true },
  address: { name: '地址', defaultShow: true },
  phone: { name: '电话', defaultShow: false },
  email: { name: '邮箱', defaultShow: false },
};

export default () => {
  const { columns, rowSelection } = useTableDIY({
    columns: allColumns,
    config,
    cacheID: 'demo-table-diy',
  });

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowSelection={rowSelection}
      rowKey="id"
      pagination={false}
      bordered
      size="small"
    />
  );
};
