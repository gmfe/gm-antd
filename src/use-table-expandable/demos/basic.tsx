import React from 'react';
import { Table, useTableExpandable } from 'gm-antd';

interface DataItem {
  id: number;
  name: string;
  age: number;
  description: string;
}

const data: DataItem[] = [
  { id: 1, name: '张三', age: 32, description: '张三是一名前端工程师' },
  { id: 2, name: '李四', age: 42, description: '李四是一名后端工程师' },
  { id: 3, name: '王五', age: 28, description: '王五是一名设计师' },
];

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
];

export default () => {
  const [, expandable] = useTableExpandable<DataItem>({
    rowKey: 'id',
    expandedRowRender: (record) => (
      <p style={{ margin: 0, padding: '12px 0' }}>{record.description}</p>
    ),
  });

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      expandable={expandable}
      pagination={false}
      bordered
    />
  );
};
