import React from 'react';
import { Input, Select } from 'antd';

/**
 * TableFilter 依赖 @gm-common/hooks 和 mobx，
 * 此 demo 仅展示字段配置结构，实际用法请参考项目文档。
 */
export default () => {
  const fields = [
    { type: 'input', key: 'name', label: '姓名' },
    {
      type: 'select',
      key: 'status',
      label: '状态',
      options: [
        { value: 'active', label: '启用' },
        { value: 'inactive', label: '停用' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {fields.map((field) => (
        <div key={field.key} style={{ minWidth: 200 }}>
          <div style={{ marginBottom: 4, color: '#666', fontSize: 12 }}>{field.label}</div>
          {field.type === 'input' ? (
            <Input placeholder={`请输入${field.label}`} />
          ) : (
            <Select
              options={(field as any).options}
              placeholder={`请选择${field.label}`}
              style={{ width: '100%' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
