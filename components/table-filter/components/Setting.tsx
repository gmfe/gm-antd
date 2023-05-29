import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { restoreFieldItemsForSetting, stashFieldItems } from '../utils';
import TableFilterContext from '../context';
import Divider from '../../divider';
import Button from '../../button';
import Checkbox from '../../checkbox';
import Sortable from '../../sortable/sortable';
import type { CachedSetting } from '../types';
import type { SortableDataItem } from '../../sortable/types';

export interface SettingProps extends HTMLAttributes<HTMLDivElement> {
  afterCancel?: () => void;
  afterReset?: () => void;
  afterSave?: () => void;
}

const SVGDragableIcon: React.FC<any> = props => (
  <svg {...props} viewBox="0 0 1024 1024" width="14" height="14">
    <path
      d="M634.311111 0c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733333-59.733334 2.844444-34.133333-25.6-59.733333-59.733333-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733333-59.733333 2.844444-34.133333-25.6-59.733333-59.733333-59.733334-31.288889 0 0 0 0 0zM372.622222 0C341.333333 0 312.888889 25.6 312.888889 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733333s28.444444 59.733333 59.733333 59.733334c34.133333 0 59.733333-25.6 59.733334-59.733334 2.844444-34.133333-25.6-59.733333-59.733334-59.733333z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334s28.444444 59.733333 59.733333 59.733333c34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z m0 301.511111c-34.133333 0-59.733333 25.6-59.733333 59.733334 0 34.133333 28.444444 59.733333 59.733333 59.733333 34.133333 0 59.733333-25.6 59.733334-59.733333 2.844444-34.133333-25.6-59.733333-59.733334-59.733334z"
      fill="#a0a0a0"
    />
  </svg>
);

const Setting: FC<SettingProps> = ({ afterCancel, afterReset, afterSave }) => {
  const store = useContext(TableFilterContext);
  const [cachedSetting, setCachedSetting] = useState<CachedSetting>(
    restoreFieldItemsForSetting(store.id),
  );

  const _onSort = (data: SortableDataItem[]): void => {
    store.fields = data.map(item => store.fields.find(field => field.key === item.value)!);
  };

  const _onCancel = () => {
    // ...
    afterCancel && afterCancel();
  };
  const _onReset = () => {
    setCachedSetting({});
    afterReset && afterReset();
  };
  const _onSave = () => {
    stashFieldItems(store.id, store.fields, cachedSetting);
    setCachedSetting(restoreFieldItemsForSetting(store.id));

    afterSave && afterSave();
  };

  return (
    <div
      className="setting-panel"
      // tw-flex tw-flex-col tw-text-sm
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: 14,
      }}
    >
      <div
        // className="tw-mt-2.5 tw-mx-2 tw-text-gray tw-font-bold"
        style={{
          color: '#1f1f1f',
          fontWeight: 'bold',
        }}
      >
        <div style={{padding: 8}}>全部筛选条件</div>
        <Divider
          // className="tw-m-0 tw-mt-1.5"
          style={{
            margin: 0,
            // marginTop: 8,
          }}
        />
      </div>
      <div
        // className="tw-flex-grow tw-overflow-scroll"
        style={{ maxHeight: '50vh', flexGrow: 1, overflow: 'scroll' }}
      >
        <Sortable
          data={store.fields.map(field => ({ value: field.key, text: field.label! }))}
          onChange={_onSort}
          options={{
            direction: 'horizontal',
            handle: '.sortable',
            chosenClass: 'sortable-active',
          }}
          renderItem={(_, index) => {
            const field = store.fields[index];
            const used = cachedSetting[field.key]?.visible;
            return (
              <div
                key={field.key}
                // className="tw-px-2 tw-text-black hover:tw-bg-blue-light"
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                <SVGDragableIcon
                  // 第一列不允许移动、不允许删除, 使其始终靠近多选框、展开/收起按钮
                  className={classNames({
                    sortable: index !== 0,
                  })}
                  style={{
                    marginRight: 5,
                    cursor: index !== 0 ? 'move' : 'not-allowed',
                  }}
                />
                <Checkbox
                  // className="tw-w-full tw-text-black tw-py-1.5"
                  style={{
                    width: '100%',
                    color: 'black',
                    padding: '4px 0'
                  }}
                  disabled={field.alwaysUsed}
                  checked={field.alwaysUsed || (used ?? field.defaultUsed)}
                  onChange={({ target }) => {
                    setCachedSetting({
                      ...cachedSetting,
                      [field.key]: {
                        ...(cachedSetting[field.key] || {}),
                        visible: target.checked,
                      },
                    });
                  }}
                >
                  {field.label}
                </Checkbox>
              </div>
            );
          }}
        />
      </div>

      <div
        // className="tw-flex-grow"
        style={{ flexGrow: 1 }}
      />
      <Divider
        // className="tw-m-0 tw-mt-1.5"
        style={{ margin: 0, marginTop: 8 }}
      />
      <div
        // className="tw-flex tw-justify-between tw-items-center tw-py-1.5 tw-px-2"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 10px',
        }}
      >
        <Button size="small" type="link" onClick={() => _onReset()}>
          重置
        </Button>
        <Button size="small" type="second" onClick={() => _onCancel()}>
          取消
        </Button>
        <Button size="small" type="primary" onClick={() => _onSave()}>
          保存设置
        </Button>
      </div>
    </div>
  );
};
export default Setting;
