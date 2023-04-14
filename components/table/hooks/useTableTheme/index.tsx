import type { TableProps } from 'antd';
import classNames from 'classnames';
import { cloneDeep, merge } from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import Tooltip from '../../../tooltip/index';
import './index.less';

const Wrapper = ({ className, children, ...rest }: PropsWithChildren<any>) => (
  <thead className={classNames(className, 'use-table-theme')} {...rest}>
    {children}
  </thead>
);
const Cell = ({ className, children, ...rest }: PropsWithChildren<any>) => {
  const content = children?.[1]; // children0是折叠、多选之类的, children1是内容
  const isString = typeof content === 'string';
  return (
    <td className={classNames(className, 'use-table-theme')} {...rest}>
      {(() => {
        // 单元格合并场景
        if (
          ![undefined, null].includes(rest.colSpan) ||
          ![undefined, null].includes(rest.rowSpan)
        ) {
          return children;
        }
        return (
          <div
            // className="tw-inline-flex tw-items-center tw-w-full"
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '100%',
            }}
          >
            {(() => {
              // 机动类
              if (
                ['ant-table-selection-column', 'placeholder'].find(name =>
                  className?.includes(name),
                )
              ) {
                return children;
              }
              // 字符串类
              if (isString) {
                return (
                  <>
                    {children?.[0]}
                    <div
                      // className="tw-truncate"
                      style={{
                        maxWidth: 'inherit',
                        maxHeight: 'inherit',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Tooltip
                        title={content.length > 4 ? content : undefined}
                        placement="topLeft"
                        mouseEnterDelay={0.6}
                      >
                        {content}
                      </Tooltip>
                    </div>
                  </>
                );
              }
              // 组件类
              if (content) {
                return (
                  <div
                    // className={classNames('tw-whitespace-nowrap')}
                    // tw-truncate tw-full
                    style={{
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {children}
                  </div>
                );
              }
              return children;
            })()}
          </div>
        );
      })()}
    </td>
  );
};

/**
 * 表格主题支持,
 *
 * @param components Table的components
 */
const useTableTheme = (
  components?: TableProps<any>['components'],
): {
  components: TableProps<any>['components'];
} => {
  const newComponents: TableProps<any>['components'] = {
    header: {
      wrapper: Wrapper,
    },
    body: {
      cell: Cell,
    },
  };
  return useMemo(
    () => ({
      components: merge(cloneDeep(components), newComponents),
    }),
    [components],
  );
};

export default useTableTheme;
