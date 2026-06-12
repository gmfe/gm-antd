import React, { useState } from 'react';
import { Table, useTableSelection, Button, Space, message } from 'gm-antd';

interface DataItem {
  id: number;
  name: string;
  age: number;
  address: string;
  key: number;
}

const mockData: DataItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  key: i + 1,
  name: `用户${i + 1}`,
  age: 20 + (i % 10),
  address: `北京市朝阳区${i + 1}号`,
}));

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 150 },
  { title: '年龄', dataIndex: 'age', key: 'age', width: 80 },
  { title: '地址', dataIndex: 'address', key: 'address' },
];

export default () => {
  const [data, setData] = useState(mockData);

  const { rowSelection, rowKey, components, selectedRowKeys, controller, BatchActions } =
    useTableSelection<DataItem>({
      dataSource: data,
      keyName: 'id',
      totalCount: 100,
    });

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => controller.selectAll()}>全选</Button>
        <Button onClick={() => controller.unselectAll()}>取消全选</Button>
        <Button onClick={() => message.info(`已选 ${selectedRowKeys.length} 项`)}>
          查看选中数量
        </Button>
      </Space>
      {selectedRowKeys.length > 0 && (
        <BatchActions
          dataSource={data}
          selectedRowKeys={selectedRowKeys}
        >
          已选中 {selectedRowKeys.length} 项
        </BatchActions>
      )}
      <Table
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        rowSelection={rowSelection}
        components={components}
        pagination={false}
        bordered
      />
    </div>
  );
};
