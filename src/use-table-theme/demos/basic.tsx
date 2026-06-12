import React from 'react';
import { Table, useTableTheme } from 'gm-antd';

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name', width: 200 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 100 },
  { title: '地址', dataIndex: 'address', key: 'address' },
];

const data = [
  { key: '1', name: '张三', age: 32, address: '北京市朝阳区' },
  { key: '2', name: '李四', age: 42, address: '上海市浦东新区' },
];

export default () => {
  const { columns: themedColumns } = useTableTheme(columns);

  return (
    <Table
      columns={themedColumns}
      dataSource={data}
      pagination={false}
      bordered
    />
  );
};
