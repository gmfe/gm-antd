---
order: -2
title:
  zh-CN: 表格Hook
  en-US: TODO
gm: true
---

## zh-CN

useTable Hook 是以下 Table Hook 的整合：

- useTableDIY, 用于支持自定义表头
- useTableSelection, 用于批量操作
- useTableTheme，用于设置主题
- useTableExpandable，用于展开/收起的
- useTableVirtual，用于虚拟表格支持此 Hook 和 antd 自带的多选、展开/收起配置不能共用。

useTable 接收一个对象参数：

```
  /** UseTableDIY的参数，默认启用，传false不使用 */
  diy?: Omit<UseTableDIYOptions<DataType>, 'columns' | 'rowSelection'> | false;
  /** UseTableSelection的参数, 不传则不启用 */
  selection?: Omit<UseTableSelectionOptions<DataType>, 'dataSource' | 'rowSelection'>;
  /** 是否使用useTableResizable，默认为false */
  resizable?: boolean;
  /** UseTableVirtual，不传则不启用 */
  virtual?: Omit<UseTableVirtualProps, 'columns' | 'rowSelection' | 'components'>;
  /** 是否使用useTableTheme，默认true */
  theme?: boolean;
  /** 默认table的expandable属性，不传则不启用useTableExpandable */
  expandable?: UseTableExpandableOptions<DataType>;

  columns: ColumnType<DataType>[];
  dataSource: TableProps<DataType>['dataSource'];

  rowSelection?: TableProps<DataType>['rowSelection'];
  components?: TableProps<DataType>['components'];
```

返回一个数组`[feature, props]`:

```
const [{
    /** 批量操作的组件，通常放在表格上方。启用selection后有效 */
    BatchActions,
    /** 批量操作的控制器。启用selection后有效 */
    controller,
    /** 是否已全选。启用selection后有效 */
    isSelectedAll,
    /** 选中的keys。启用selection后有效 */
    selectedRowKeys,
    /** 选中的data。启用selection后有效 */
    selectedRows,
    /** 展开/收起的控制器。启用expandable后有效 */
    expandableController,
}, props] = useTable(...)
```

## en-US

TODO:

Simple table with actions.

```tsx
import { Table, useTable, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

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
  const [state, setState] = useState({
    disableDIY: false,
    disableSelection: false,
    resizable: false,
    theme: true,
    virtual: false,
    allPage: false,
    mode: 'all' as 'parent' | 'child' | 'all',
  });
  const [{ selectedRowKeys, BatchActions, controller }, props] = useTable({
    dataSource: data,
    columns,
    diy: state.disableDIY
      ? false
      : {
          config: {
            subject_code: {
              name: '😄约定第一列不允许动',
            },
            name: {
              group: '分组',
            },
          },
        },
    selection: state.disableSelection
      ? undefined
      : {
          keyName: 'subject_code',
          mode: state.mode,
          totalCount: state.allPage ? 999 : undefined,
          onSelect(record, selected) {
            // 自动选中/取消children
            const cb = (record: AccountingSubject) => {
              if (selected && !controller.isChecked(record)) controller.toggle(record);
              if (!selected && controller.isChecked(record)) controller.toggle(record);
              if (record.children) record.children.forEach(cb);
            };
            record?.children?.forEach(cb);
          },
        },
    resizable: state.resizable,
    theme: state.theme,
    virtual: state.virtual
      ? {
          scroll: {
            y: 300,
            x: 600,
          },
          onScroll({ atBottom }) {
            if (atBottom && data.length) {
              // 加载更多
            }
          },
        }
      : undefined,
    expandable: {
      rowKey: 'subject_code',
      defaultExpandedRowKeys: data.map(item => item.subject_code),
    },
  });
  return (
    <div>
      <Button onClick={() => setState({ ...state, disableDIY: !state.disableDIY })}>
        表头自定义(DIY)：{state.disableDIY ? '禁用' : '启用'}
      </Button>
      <Button onClick={() => setState({ ...state, disableSelection: !state.disableSelection })}>
        批量操作(selection)：{state.disableSelection ? '禁用' : '启用'}
      </Button>
      <Button
        onClick={() => {
          setState(state => {
            let mode = 'parent';
            if (state.mode === 'parent') mode = 'child';
            if (state.mode === 'child') mode = 'all';
            if (state.mode === 'all') mode = 'parent';
            return {
              ...state,
              mode,
            };
          });
        }}
      >
        批量操作(模式)：{state.mode}
      </Button>
      <Button onClick={() => setState({ ...state, resizable: !state.resizable })}>
        拖拽宽度(resizable)：{!state.resizable ? '禁用' : '启用'}
      </Button>
      <Button onClick={() => setState({ ...state, theme: !state.theme })}>
        主题(theme)：{!state.theme ? '禁用' : '启用'}
      </Button>
      <Button onClick={() => setState({ ...state, virtual: !state.virtual })}>
        虚拟列表(virtual)：{!state.virtual ? '禁用' : '启用'}
      </Button>
      <Button onClick={() => setState({ ...state, allPage: !state.allPage })}>
        全选所有页(selection)：{!state.allPage ? '禁用' : '启用'}
      </Button>
      <div className="mb-2" />

      <BatchActions>
        <BatchActions.Button
          disabled={!selectedRowKeys.length}
          onClick={() => alert(`删除：${selectedRowKeys.join(',')}`)}
        >
          删除
        </BatchActions.Button>
        <div className="flex-grow" />
        <Button type="primary">新增</Button>
      </BatchActions>
      <Table {...props} pagination={false} />
    </div>
  );
};

export default App;
```
