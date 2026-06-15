import { FC, HTMLAttributes, useMemo } from 'react';
import React, { useContext, useState } from 'react';
import { restoreFieldItemsForSetting, stashFieldItems } from '../utils';
import TableFilterContext from '../context';
import Divider from '../../divider';
import Button from '../../button';
import Checkbox, { CheckboxChangeEvent } from '../../checkbox';
import Sortable from '../../sortable/sortable';
import type { CachedSetting } from '../types';
import type { SortableDataItem } from '../../sortable/types';
import { keyBy } from 'lodash';
import { useLocaleReceiver } from '../../locale-provider/LocaleReceiver';

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
    restoreFieldItemsForSetting(store.id, store.fields),
  );
  const [TableLocale] = useLocaleReceiver('Table');

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
    setCachedSetting(restoreFieldItemsForSetting(store.id, store.fields));
    afterSave && afterSave();
  };

  const handleCheckAllFilterChange = (e: CheckboxChangeEvent) => {
    const keyByKeyInFields = keyBy(store.fields, 'key');
    const checked = e.target.checked;
    const keys = Object.keys(keyByKeyInFields);
    /** 勾选 */
    if (checked) {
      const newCachedSetting = keys.reduce(
        (prev, current) => {
          return {
            ...prev,
            [current]: {
              ...(cachedSetting[current] || {}),
              visible: true,
            },
          };
        },
        {} as Record<
          string,
          {
            visible: boolean;
          }
        >,
      );
      setCachedSetting(newCachedSetting);
      return;
    }

    /** 取消勾选，如果当前为alwaysUsed 那么不取消勾选 */
    const newCachedSetting = keys.reduce(
      (prev, current) => {
        return {
          ...prev,
          [current]: {
            ...(cachedSetting[current] || {}),
            visible: keyByKeyInFields[current].alwaysUsed ? true : false,
          },
        };
      },
      {} as Record<
        string,
        {
          visible: boolean;
        }
      >,
    );
    setCachedSetting(newCachedSetting);
  };

  const isCheckAllOrIsIndeterminate = useMemo(() => {
    const keys = Object.keys(cachedSetting);
    const visibleKeys = keys.filter(key => cachedSetting[key].visible);
    if (visibleKeys.length === store.fields?.length) {
      return {
        isCheckAll: true,
        isIndeterminate: false,
      };
    }
    return {
      isCheckAll: false,
      isIndeterminate: visibleKeys.length > 0,
    };
  }, [cachedSetting]);

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
        <div style={{ padding: 8 }}>
          <Checkbox
            indeterminate={isCheckAllOrIsIndeterminate.isIndeterminate}
            checked={isCheckAllOrIsIndeterminate.isCheckAll}
            onChange={handleCheckAllFilterChange}
          >
            {TableLocale?.allFilteringCriteria}
          </Checkbox>
        </div>
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
        style={{ maxHeight: '50vh', flexGrow: 1, overflowY: 'scroll' }}
      >
        <Sortable
          data={store.fields.map(field => ({
            value: field.key,
            text: field.label!,
            disabled: field.alwaysUsed,
          }))}
          onChange={_onSort}
          options={{
            filter: '.selector',
            direction: 'horizontal',
            handle: '.sortable',
            chosenClass: 'sortable-active',
            onMove: event => {
              return event.related.dataset.disabled !== 'true';
            },
          }}
          renderItem={(_, index) => {
            const field = store.fields[index];
            const used = cachedSetting[field.key]?.visible;
            return (
              <div
                className={field.alwaysUsed ? 'selector' : ''}
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
                  className="sortable"
                  style={{
                    marginRight: 5,
                    cursor: 'move',
                  }}
                />
                <Checkbox
                  // className="tw-w-full tw-text-black tw-py-1.5"
                  style={{
                    width: '100%',
                    color: 'black',
                    padding: '4px 0',
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
          {TableLocale?.filterReset}
        </Button>
        <Button size="small" type="second" onClick={() => _onCancel()}>
          {TableLocale?.cancel}
        </Button>
        <Button size="small" type="primary" onClick={() => _onSave()}>
          {TableLocale?.saveSettings}
        </Button>
      </div>
    </div>
  );
};
export default Setting;
