import React, { useState } from 'react';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import type { ExpandableConfig } from '../../interface';

export interface UseTableExpandableOptions<DataType extends { [key: string]: any } = any>
  extends Omit<ExpandableConfig<DataType>, 'defaultExpandAllRows' | 'expandedRowKeys'> {
  rowKey: string;
  /** @deprecated 使用`defaultExpandedRowKeys` */
  defaultExpandAllRows?: ExpandableConfig<DataType>['defaultExpandAllRows'];
}

/** 表格展开/收起 */
function useTableExpandable<DataType extends { [key: string]: any }>(
  options: UseTableExpandableOptions<DataType>,
) {
  const { rowKey, defaultExpandedRowKeys } = options;
  const [expanded, setExpanded] = useState(defaultExpandedRowKeys || []);

  const controller = {
    toggle(record: DataType) {
      setExpanded(expanded => {
        if (expanded.includes(record[rowKey])) {
          return expanded.filter(item => item !== record[rowKey]);
        }
        return [...expanded, record[rowKey]];
      });
    },
  };

  const newExpandable: ExpandableConfig<DataType> = {
    ...options,
    expandedRowKeys: expanded,
    expandIcon({ expandable, expanded, onExpand, record }) {
      if (!expandable) return null;
      return expanded ? (
        <CaretDownOutlined
          style={{ marginRight: 5, verticalAlign: 'text-bottom' }}
          onClick={e => {
            onExpand(record, e);
            controller.toggle(record);
          }}
        />
      ) : (
        <CaretRightOutlined
          style={{ marginRight: 5, verticalAlign: 'text-bottom' }}
          onClick={e => {
            onExpand(record, e);
            controller.toggle(record);
          }}
        />
      );
    },
  };

  return [controller, newExpandable] as [typeof controller, typeof newExpandable];
}

export default useTableExpandable;
