import React, { useState } from 'react';
import Select from '../index';
import { Space, Card, Divider } from '../../';

const SelectFeaturesDemo: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [filterDeleted, setFilterDeleted] = useState(true);

  // 模拟选项数据，包含已删除的商品
  const options = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉', isDeleted: true },
    { value: 'orange', label: '橙子' },
    { 
      label: '水果类',
      children: [
        { value: 'grape', label: '葡萄' },
        { value: 'watermelon', label: '西瓜', deleted: true },
      ]
    },
    { value: 'pear', label: '梨' },
  ];

  const handleChange = (values: string[]) => {
    setSelectedValues(values);
    console.log('选中的值:', values);
  };

  const handleSelectAllChange = (checked: boolean) => {
    console.log('全选状态:', checked);
  };

  const handleFilterDeletedChange = (checked: boolean) => {
    setFilterDeleted(checked);
    console.log('过滤已删除商品状态:', checked);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="Select 全选和过滤功能演示" style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <strong>当前选中值:</strong> {selectedValues.join(', ') || '无'}
          </div>
          
          <Divider />
          
          <Select
            mode="multiple"
            placeholder="请选择商品"
            style={{ width: '100%' }}
            value={selectedValues}
            onChange={handleChange}
            onSelectAllChange={handleSelectAllChange}
            onFilterDeletedChange={handleFilterDeletedChange}
            options={options}
          />
          
          <Divider />
          
          <div>
            <strong>功能说明:</strong>
            <ul>
              <li>全选功能：可以选择所有未删除的商品</li>
              <li>过滤已删除商品：可以切换是否显示已删除的商品</li>
              <li>已删除商品：香蕉、西瓜（默认被过滤）</li>
              <li>支持分组选项（OptGroup）</li>
            </ul>
          </div>
        </Space>
      </Card>
    </Space>
  );
};

export default SelectFeaturesDemo;