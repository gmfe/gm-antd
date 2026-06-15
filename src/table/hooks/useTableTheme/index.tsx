import type { TableProps } from 'antd';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { cloneDeep, merge } from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';

const Wrapper = ({ className, children, ...rest }: PropsWithChildren<any>) => (
  <thead
    className={classNames(className, 'use-table-theme')}
    style={{ backgroundColor: '#fafafa' }}
    {...rest}
  >
    {children}
  </thead>
);

const Cell = ({ className, children, ...rest }: PropsWithChildren<any>) => {
  const content = children?.[1];
  const isString = typeof content === 'string';
  return (
    <td
      className={classNames(className, 'use-table-theme')}
      style={{ overflow: 'hidden' }}
      {...rest}
    >
      {(() => {
        if (
          ![undefined, null].includes(rest.colSpan) ||
          ![undefined, null].includes(rest.rowSpan)
        ) {
          return children;
        }
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '100%',
            }}
          >
            {(() => {
              const isSelectionOrPlaceholder =
                ['ant-table-selection-column', 'placeholder'].some(name =>
                  typeof className === 'string' && className.includes(name),
                ) ||
                (rest as any)['data-placeholder'] === true ||
                (rest as any).colSpan === 0;
              if (isSelectionOrPlaceholder) {
                return children;
              }
              if (isString) {
                return (
                  <>
                    {children?.[0]}
                    <div
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        width: 'inherit',
                        textOverflow: 'ellipsis',
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
              if (content) {
                return (
                  <div
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
