import React from 'react';
import { Table } from 'gm-antd';

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 200 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 120 },
  { title: '地址', dataIndex: 'address', key: 'address', width: 300 },
  { title: '操作', key: 'action', width: 150, render: () => <a>编辑</a> },
];

const data = [
  { key: '1', name: '张三', age: 32, address: '北京市朝阳区' },
  { key: '2', name: '李四', age: 42, address: '上海市浦东新区' },
  { key: '3', name: '王五', age: 28, address: '广州市天河区' },
];

export default () => (
  <Table
    columns={columns}
    dataSource={data}
    isResizable
    pagination={false}
    bordered
  />
);
