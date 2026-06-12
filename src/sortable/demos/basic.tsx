import React, { useState } from 'react';
import { Sortable, SortableDataItem } from 'gm-antd';

const initialData: SortableDataItem[] = [
  { value: 1, text: '苹果' },
  { value: 2, text: '香蕉' },
  { value: 3, text: '橙子' },
  { value: 4, text: '葡萄' },
  { value: 5, text: '西瓜' },
];

export default () => {
  const [data, setData] = useState(initialData);

  return (
    <Sortable
      data={data}
      onChange={setData}
      renderItem={(item) => (
        <div
          style={{
            padding: '8px 12px',
            margin: '4px 0',
            background: '#fafafa',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            cursor: 'grab',
          }}
        >
          {item.text}
        </div>
      )}
    />
  );
};
