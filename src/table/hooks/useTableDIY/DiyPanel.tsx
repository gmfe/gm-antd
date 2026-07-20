import React from 'react';
import type { FC, HTMLAttributes } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { clone, flatten } from 'lodash';
import classNames from 'classnames';
import { getColumnKey } from './util';
import { getSortedColumns, getStorageColumns } from './util';
import type { ConfigItem } from '.';
import { Checkbox } from 'antd';
import GmButton from '../../../button';
import type { ColumnType } from '../../interface';
import Sortable from '../../../sortable';
import type { SortableDataItem } from '../../../sortable/types';
import useGMLocale from '../../../locale-adapter/useGMLocale';

export type GroupItem = {
  column: ColumnType<any>;
  cfg?: ConfigItem;
  state: {
    checked: boolean;
    sequence: number;
  };
};

export type Groups = {
  name?: string;
  list: Array<GroupItem>;
}[];

export interface DiyPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  cacheID: string;
  groups: Groups;
  onChange: (groups: Groups) => void;
  onCancel: () => void;
  onReset: () => void;
  onFinish: (columns: Array<ColumnType<any>>) => void;
  maxHeight: number;
}

const SVGDragableIcon: React.FC<any> = props => (
  <svg {...props} viewBox="0 0 1024 1024" width="14" height="14">
    <path
      d="M634.311111 0c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0zM372.622222 0C341.333333 0 312.888889 25.6 312.888889 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z"
      fill="#a0a0a0"
    />
  </svg>
);

const SVGRemoveIcon: React.FC<any> = props => (
  <svg {...props} viewBox="0 0 1024 1024" width="14" height="14" fill="#a0a0a0">
    <path d="M591.71679688 511.91210937l238.79882812-238.79882812c21.88476563-21.88476563 21.88476563-57.56835938 0-79.453125-21.88476563-21.88476563-57.56835938-21.88476563-79.453125 0L512.26367188 432.45898437 273.46484375 193.66015625c-21.88476563-21.88476563-57.56835938-21.88476563-79.453125 0-21.88476563 21.88476563-21.88476563 57.56835938 0 79.453125l238.79882813 238.79882813-238.79882813 238.79882812c-21.88476563 21.88476563-21.88476563 57.56835938 0 79.453125 21.88476563 21.88476563 57.56835938 21.88476563 79.453125 0l238.79882813-238.79882813L751.15039063 830.1640625c21.88476563 21.88476563 57.56835938 21.88476563 79.45312499 0 21.88476563-21.88476563 21.88476563-57.56835938 0-79.453125L591.71679688 511.91210937z" />
  </svg>
);

const DiyPanel: FC<DiyPanelProps> = ({
  cacheID,
  groups = [],
  onChange,
  onCancel,
  onReset,
  onFinish,
  style,
  className,
}) => {
  const allColumns = flatten(Object.values(groups.map(item => item.list)));
  const checkedColumns = allColumns.filter(col => col.state.checked);
  const sortedColumns = getSortedColumns(checkedColumns);
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const _onSave = () => {
    localStorage.setItem(cacheID, JSON.stringify(getStorageColumns(getSortedColumns(allColumns))));
    onFinish(sortedColumns.map(item => item.column));
  };

  const setColumn = (column: ColumnType<any>, state: Groups[0]['list'][0]['state']) => {
    const newGroups = clone(groups);
    newGroups.find(g =>
      g.list.find(({ column: c, state: s }) => {
        const match = getColumnKey(c) === getColumnKey(column);
        if (match) Object.assign(s, state);
        return match;
      }),
    );
    onChange(newGroups);
  };

  const _onSort = (data: SortableDataItem[]): void => {
    if (data[0].value !== getColumnKey(groups[0].list[0].column)) return;
    const newGroups = clone(groups);
    newGroups.forEach(item => {
      item.list.forEach(({ column, state }) => {
        state.sequence = data.findIndex(item => item.value === getColumnKey(column));
      });
    });
    onChange(newGroups);
  };

  return (
    <div className={classNames('diy-panel', className)} style={{ ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 12 }}>
        <span
          style={{
            display: 'inline-block',
            width: 3,
            background: 'var(--ant-color-primary, var(--gm-color-primary, #0363ff))',
            height: 18,
            marginRight: 5,
          }}
        />
        <span style={{ fontSize: 16 }}>
          {tableLocale?.headerSettings}
        </span>
        <span style={{ flexGrow: 1 }} />
        <span style={{ cursor: 'pointer' }} onClick={() => onCancel()}>
          <CloseOutlined />
        </span>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
          <div style={{ padding: '10px 15px', background: '#f7f8fa', borderTop: '1px solid rgba(216,222,231,0.5)', borderRight: '1px solid rgba(216,222,231,0.5)', borderBottom: '1px solid rgba(216,222,231,0.5)' }}>
            {tableLocale?.optionalField}
          </div>
          <div style={{ flexGrow: 1, height: '40vh', padding: 15, overflow: 'auto', borderRight: '1px solid rgba(216,222,231,0.5)' }}>
            {groups.map(({ name, list }, groupIndex) => (
              <div key={name || groupIndex}>
                {groups.length > 1 && (
                  <div style={{ marginBottom: 10 }}>
                    {name || tableLocale?.defaultGrouping}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {list.map(({ column, cfg = {}, state }) => {
                    const key = getColumnKey(column);
                    return (
                      <Checkbox
                        key={key}
                        style={{ minWidth: 120, marginLeft: 0, marginBottom: 10 }}
                        disabled={cfg.disable}
                        checked={state.checked}
                        onChange={() => {
                          setColumn(column, {
                            ...state,
                            checked: !state.checked,
                          });
                        }}
                      >
                        {cfg.name || (column.title as React.ReactNode)}
                      </Checkbox>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '40%', maxWidth: 280, minWidth: 140, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 15px', background: '#f7f8fa', borderTop: '1px solid rgba(216,222,231,0.5)', borderRight: '1px solid rgba(216,222,231,0.5)', borderBottom: '1px solid rgba(216,222,231,0.5)' }}>
            {tableLocale?.theCurrentlySelectedField}
          </div>
          <div
            style={{
              padding: 15,
              flexGrow: 1,
              height: '40vh',
              overflow: 'auto',
            }}
          >
            <Sortable
              data={sortedColumns.map(({ column, cfg = {} }) => ({
                text: cfg?.name || (column.title as any) || '-',
                value: getColumnKey(column),
              }))}
              onChange={_onSort}
              options={{
                direction: 'horizontal',
                handle: '.sortable',
                chosenClass: 'sortable-active',
              }}
              renderItem={(_, index) => {
                const { column, state, cfg = {} } = sortedColumns[index];
                const text = cfg?.name || column.title;
                return (
                  <div
                    key={getColumnKey(column)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      userSelect: 'none',
                      marginBottom: 5,
                    }}
                  >
                    <SVGDragableIcon
                      className={classNames({
                        sortable: !column.fixed && index !== 0,
                      })}
                      style={{
                        marginRight: 5,
                        cursor: !column.fixed && index !== 0 ? 'move' : 'not-allowed',
                      }}
                    />
                    <span style={{ flexGrow: 1 }}>
                      {text as React.ReactNode}
                    </span>
                    {!cfg.disable && index !== 0 && (
                      <SVGRemoveIcon
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setColumn(column, {
                            ...state,
                            checked: false,
                          });
                        }}
                      />
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', padding: 12, borderTop: '1px solid rgba(216,222,231,0.5)' }}>
        <div style={{ flexGrow: 1 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <GmButton type="second" onClick={() => onReset()}>
            {tableLocale?.filterReset}
          </GmButton>
          <GmButton type="second" onClick={() => onCancel()}>
            {tableLocale?.cancel}
          </GmButton>
          <GmButton type="primary" onClick={() => _onSave()}>
            {tableLocale?.save}
          </GmButton>
        </div>
      </div>
    </div>
  );
};
export default DiyPanel;
