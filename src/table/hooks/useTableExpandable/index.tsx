import React, { useState } from 'react';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import type { ExpandableConfig } from '../../interface';

export interface UseTableExpandableOptions<DataType extends { [key: string]: any } = any>
  extends Omit<ExpandableConfig<DataType>, 'defaultExpandAllRows' | 'expandedRowKeys'> {
  rowKey: string;
  /** @deprecated 使用`defaultExpandedRowKeys` */
  defaultExpandAllRows?: ExpandableConfig<DataType>['defaultExpandAllRows'];
}

function useTableExpandable<DataType extends { [key: string]: any }>(
  options: UseTableExpandableOptions<DataType>,
) {
  const { rowKey, defaultExpandedRowKeys } = options;
  const [expanded, setExpanded] = useState<(string | number)[]>(() => (defaultExpandedRowKeys || []) as (string | number)[]);

  const controller = {
    toggle(record: DataType) {
      setExpanded((prev: (string | number)[]) => {
        if (prev.includes(record[rowKey])) {
          return prev.filter((item: string | number) => item !== record[rowKey]);
        }
        return [...prev, record[rowKey]];
      });
    },
  };

  const newExpandable: ExpandableConfig<DataType> = {
    ...options,
    expandedRowKeys: expanded,
    expandIcon({ expandable, expanded, onExpand, record }: any) {
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
