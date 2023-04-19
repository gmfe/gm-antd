---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic
gm: true
---

## zh-CN

配合 Table、Table Hooks、TablePagination 使用，顶部、底部浮动

## en-US

todo

```tsx
import {
  Layout,
  ContentWrapper,
  TableFilter,
  Table,
  useTable,
  Button,
  TablePagination,
} from 'antd';
import { usePagination } from '@gm-common/hooks';
import React, { useState, useEffect } from 'react';

const { Sider } = Layout;

const FIELDS: FieldItem[] = [
  {
    key: 'subject_type_id',
    type: 'select',
    alwaysUsed: true,
    label: '科目类别',
    minWidth: 250,
    async options() {
      return new Promise((resolve, reject) => {
        setTimeout(
          () =>
            resolve([
              {
                value: 1,
                text: '类别1',
              },
              {
                value: 2,
                text: '类别2',
              },
            ]),
          1000,
        );
      });
    },
  },
];

const columns: ColumnsType<DataType> = [
  {
    title: '科目代码',
    dataIndex: 'subject_code',
    width: 150,
    fixed: 'left',
    render: text => <a>{text}</a>,
  },
  {
    title: '科目名称',
    width: 150,
    dataIndex: 'name',
  },
  {
    dataIndex: 'W',
    title: '宽度拖拽需要设置初始宽度',
    width: 200,
  },
  {
    title: 'Address 2',
    width: 150,
    dataIndex: 'address2',
  },
];

const data: DataType[] = [
  {
    subject_code: '1233211211',
    name: 'name',
    W: '32',
    children: [
      {
        subject_code: 'asdfs.1',
        name: 'name.1',
        W: '32.1',
      },
      {
        subject_code: '1233211211.2',
        name: 'name.2',
        W: '32.2',
      },
    ],
  },
  {
    subject_code: '123321232221',
    name: 'Jim Green',
    W: '42',
  },
  {
    subject_code: '123321233332',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233333',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233334',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233335',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233336',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233337',
    name: 'Joe Black',
    W: '32',
  },
  {
    subject_code: '123321233338',
    name: 'Joe Black',
    W: '32',
  },
];

const App: React.FC = () => {
  const paginationResult = usePagination(console.log, {
    defaultPaging: {
      limit: 999,
    },
  });

  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    setTimeout(() => {
      setDataSource(data);
    }, 1000);
  }, []);

  const [{ selectedRowKeys, BatchActions }, props] = useTable({
    dataSource,
    columns,
  });
  return (
    <>
      <Layout>
        <Sider />
        <Layout>
          
            <ContentWrapper>
              <TableFilter paginationResult={paginationResult} fields={FIELDS} />
              <ContentWrapper.Gap />
              <BatchActions stickyTop={0}>
                <BatchActions.Button
                  disabled={!selectedRowKeys.length}
                  onClick={() => alert(`删除：${selectedRowKeys.join(',')}`)}
                >
                  删除
                </BatchActions.Button>
                <div className="flex-grow" />
                <Button type="primary">新增</Button>
              </BatchActions>
              <Table {...props} pagination={false} loading={dataSource.length === 0} />
              <TablePagination paginationResult={paginationResult} showSizeChanger />
            </ContentWrapper>
            
        </Layout>
      </Layout>
    </>
  );
};

export default App;
```

<style>
.content-wrapper{
  height:384px!important;
}
</style>
