import React, { useState } from 'react';
import dayjs from 'dayjs';
import { TableFilter } from 'gm-antd';
import type { FieldItem } from 'gm-antd';

// 字段配置：覆盖 input / select(多选) / cascader / date 单选 / RangePicker 五类
const FIELDS: FieldItem[] = [
  {
    type: 'input',
    key: 'name',
    label: '姓名',
    placeholder: '请输入姓名',
  },
  {
    type: 'select',
    key: 'status',
    label: '状态',
    multiple: true,
    options: [
      { text: '启用', value: 'active' },
      { text: '停用', value: 'inactive' },
    ],
  },
  {
    type: 'cascader',
    key: 'category',
    label: '类目',
    options: [
      {
        value: 'digital',
        label: '数码',
        children: [
          { value: 'phone', label: '手机' },
          { value: 'laptop', label: '笔记本' },
        ],
      },
      {
        value: 'home',
        label: '家居',
        children: [{ value: 'furniture', label: '家具' }],
      },
    ],
  },
  {
    type: 'date',
    key: 'date',
    label: '日期',
    range: false,
  },
  {
    type: 'date',
    key: 'range',
    label: '范围',
    range: true,
    ranges: {
      今天: [dayjs(), dayjs()],
      近7天: [dayjs().subtract(6, 'day'), dayjs()],
    },
    // toParam：把 [startDayjs, endDayjs] 转为 { begin_time, end_time }(epoch ms)
    toParam: (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      if (!value || !value[0] || !value[1]) return {};
      return {
        begin_time: +value[0].toDate(),
        end_time: +value[1].endOf('day').toDate(),
      };
    },
  },
];

export default () => {
  const [params, setParams] = useState<Record<string, any>>({});

  return (
    <div>
      <TableFilter
        fields={FIELDS}
        trigger="both"
        onSearch={(p) => {
          setParams(p);
          return Promise.resolve();
        }}
      />
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>
          最近一次 onSearch 收到的 params（date 类字段应为 epoch ms）：
        </div>
        <pre
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            padding: 12,
            margin: 0,
            fontSize: 12,
          }}
        >
          {JSON.stringify(params, null, 2)}
        </pre>
      </div>
    </div>
  );
};
