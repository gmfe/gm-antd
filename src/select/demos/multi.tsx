import React, { useState } from 'react';
import { Select } from 'gm-antd';

/**
 * GM 增强能力:多选模式下,下拉底部自动渲染「全选」+「过滤已删除」开关。
 * - isShowCheckedAll(默认 true):展示全选
 * - isShowDeletedSwitch:展示「过滤已删除」开关,过滤带 isDeleted/deleted 的选项
 * - 选项的 disabled/isDeleted 字段会被「过滤已删除」识别
 *
 * 注:GmSelect 强制 showSearch=true,不支持 children 写法,请用 options。
 */
const options = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄', isDeleted: true },
  { value: 'pear', label: '梨', deleted: true },
];

export default () => {
  const [value, setValue] = useState<string[]>([]);
  return (
    <>
      <Select
        mode="multiple"
        options={options}
        value={value}
        onChange={setValue}
        placeholder="多选(下拉底部有全选 / 过滤已删除)"
        isShowCheckedAll
        isShowDeletedSwitch
        style={{ width: 320 }}
      />
      {/* 回归用例:窄触发器(<250px)时下拉不应被裁剪,gm-select-dropdown 兜底 min-width 250 */}
      <div style={{ marginTop: 16 }}>
        <Select
          mode="multiple"
          options={options}
          value={value}
          onChange={setValue}
          placeholder="窄触发器(下拉仍应 ≥250px)"
          style={{ width: 120 }}
        />
      </div>
    </>
  );
};
