import React from 'react';
import type { FC, HTMLAttributes } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { clone, flatten } from 'lodash';
import classNames from 'classnames';
import { getColumnKey } from '../util';
import { getSortedColumns, getStorageColumns } from './util';
import type { ConfigItem } from '.';
import Checkbox from '../../../checkbox';
import Button from '../../../button';
import type { ColumnType } from '../../interface';
import Sortable from '../../../sortable/sortable';
import type { SortableDataItem } from '../../../sortable/types';
import { useLocaleReceiver } from '../../../locale-provider/LocaleReceiver';

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
  // eslint-disable-next-line compat/compat
  const allColumns = flatten(Object.values(groups.map(item => item.list)));
  const checkedColumns = allColumns.filter(col => col.state.checked);
  const sortedColumns = getSortedColumns(checkedColumns);
  const [TableLocale] = useLocaleReceiver('Table');

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
      <div
        // className="tw-flex tw-items-center tw-p-2.5"
        style={{ display: 'flex', alignItems: 'center', padding: 12 }}
      >
        <span
          // className="tw-inline-block tw-w-0.5 tw-bg-blue tw-h-3.5 tw-mr-1"
          style={{
            display: 'inline-block',
            width: 3,
            background: `var(--ant-primary-color)`,
            height: 18,
            marginRight: 5,
          }}
        />
        <span
          // className="tw-text-base"
          style={{ fontSize: 16 }}
        >
          {TableLocale?.headerSettings}
        </span>
        <span
          // className="tw-flex-grow"
          style={{ flexGrow: 1 }}
        />
        <span
          // className="tw-cursor-pointer"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            onCancel();
          }}
        >
          <CloseOutlined />
        </span>
      </div>
      <div
        // className="tw-flex"
        style={{ display: 'flex' }}
      >
        <div className="diy-panel-left">
          <div className="diy-panel-left-head">{TableLocale?.optionalField}</div>
          <div className="diy-panel-left-content">
            {groups.map(({ name, list }, groupIndex) => (
              <div key={name || groupIndex}>
                {groups.length > 1 && (
                  <div
                    // className="tw-mb-2"
                    style={{ marginBottom: 10 }}
                  >
                    {name || TableLocale?.defaultGrouping}
                  </div>
                )}
                <div
                  // className="tw-flex tw-flex-wrap"
                  style={{ display: 'flex', flexWrap: 'wrap' }}
                >
                  {list.map(({ column, cfg = {}, state }) => {
                    const key = getColumnKey(column);
                    return (
                      <Checkbox
                        key={key}
                        // className="tw-ml-0 tw-mb-2"
                        style={{ minWidth: 120, marginLeft: 0, marginBottom: 10 }}
                        disabled={cfg.disable}
                        checked={state.checked}
                        onChange={() => {
                          if (state.checked) {
                            setColumn(column, {
                              ...state,
                              checked: false,
                            });
                          } else {
                            setColumn(column, {
                              ...state,
                              checked: true,
                            });
                          }
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
        <div className="diy-panel-right" style={{ width: '40%', maxWidth: 280, minWidth: 140 }}>
          <div className="diy-panel-right-head">{TableLocale?.theCurrentlySelectedField}</div>
          <div
            className="diy-panel-right-content"
            style={{
              padding: 15,
              flexGrow: 1,
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
                // 第一列不允许移动、不允许删除, 使其始终靠近多选框、展开/收起按钮
                return (
                  <div
                    // className="tw-flex tw-items-center tw-cursor-default tw-select-none tw-mb-1"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      userSelect: 'none',
                      marginBottom: 5,
                    }}
                  >
                    <SVGDragableIcon
                      // 第一列不允许移动、不允许删除, 使其始终靠近多选框、展开/收起按钮
                      className={classNames({
                        sortable: !column.fixed && index !== 0,
                      })}
                      style={{
                        marginRight: 5,
                        cursor: !column.fixed && index !== 0 ? 'move' : 'not-allowed',
                      }}
                    />
                    <span
                      // className="tw-flex-grow"
                      style={{
                        flexGrow: 1,
                      }}
                    >
                      {text as React.ReactNode}
                    </span>
                    {!cfg.disable && index !== 0 && (
                      <SVGRemoveIcon
                        // className="tw-cursor-pointer tw-text-gray"
                        style={{
                          cursor: 'pointer',
                        }}
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
      <div className="diy-panel-bottom">
        <div
          // className="tw-flex-grow"
          style={{
            flexGrow: 1,
          }}
        />
        <div
          // className="tw-flex tw-gap-2.5"
          style={{ display: 'flex', gap: 12 }}
        >
          {/* TODO: */}
          <Button type="second" onClick={() => onReset()}>
            {TableLocale?.filterReset}
          </Button>
          <Button type="second" onClick={() => onCancel()}>
            {TableLocale?.cancel}
          </Button>
          <Button type="primary" onClick={() => _onSave()}>
            {TableLocale?.save}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default DiyPanel;
