import React, { useContext, useMemo, useState } from 'react';
import { Divider, Checkbox, Button } from 'antd';
import type { CheckboxChangeEvent } from 'antd';
import { keyBy } from 'lodash';
import Sortable from '../../sortable';
import type { SortableDataItem } from '../../sortable/types';
import { restoreFieldItemsForSetting, stashFieldItems } from '../utils';
import TableFilterContext from '../context';
import type { CachedSetting } from '../types';
import useGMLocale from '../../locale-adapter/useGMLocale';

interface SettingProps extends React.HTMLAttributes<HTMLDivElement> {
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

const Setting: React.FC<SettingProps> = ({ afterCancel, afterReset, afterSave }) => {
  const store = useContext(TableFilterContext);
  const [cachedSetting, setCachedSetting] = useState<CachedSetting>(
    restoreFieldItemsForSetting(store.id, store.fields),
  );
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const _onSort = (data: SortableDataItem[]): void => {
    store.fields = data.map(item => store.fields.find(field => field.key === item.value)!);
  };

  const _onCancel = () => afterCancel?.();
  const _onReset = () => {
    setCachedSetting({});
    afterReset?.();
  };
  const _onSave = () => {
    stashFieldItems(store.id, store.fields, cachedSetting);
    setCachedSetting(restoreFieldItemsForSetting(store.id, store.fields));
    afterSave?.();
  };

  const handleCheckAllFilterChange = (e: CheckboxChangeEvent) => {
    const keyByKeyInFields = keyBy(store.fields, 'key');
    const checked = e.target.checked;
    const keys = Object.keys(keyByKeyInFields);
    if (checked) {
      const newCachedSetting = keys.reduce(
        (prev, current) => ({
          ...prev,
          [current]: {
            ...(cachedSetting[current] || {}),
            visible: true,
          },
        }),
        {} as Record<string, { visible: boolean }>,
      );
      setCachedSetting(newCachedSetting);
      return;
    }
    const newCachedSetting = keys.reduce(
      (prev, current) => ({
        ...prev,
        [current]: {
          ...(cachedSetting[current] || {}),
          visible: keyByKeyInFields[current].alwaysUsed ? true : false,
        },
      }),
      {} as Record<string, { visible: boolean }>,
    );
    setCachedSetting(newCachedSetting);
  };

  const isCheckAllOrIsIndeterminate = useMemo(() => {
    const keys = Object.keys(cachedSetting);
    const visibleKeys = keys.filter(key => cachedSetting[key].visible);
    if (visibleKeys.length === store.fields?.length) {
      return { isCheckAll: true, isIndeterminate: false };
    }
    return { isCheckAll: false, isIndeterminate: visibleKeys.length > 0 };
  }, [cachedSetting]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
      <div style={{ color: '#1f1f1f', fontWeight: 'bold' }}>
        <div style={{ padding: 8 }}>
          <Checkbox
            indeterminate={isCheckAllOrIsIndeterminate.isIndeterminate}
            checked={isCheckAllOrIsIndeterminate.isCheckAll}
            onChange={handleCheckAllFilterChange}
          >
            {tableLocale?.allFilteringCriteria}
          </Checkbox>
        </div>
        <Divider style={{ margin: 0 }} />
      </div>
      <div style={{ maxHeight: '50vh', flexGrow: 1, overflowY: 'scroll' }}>
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
            onMove: event => event.related.dataset.disabled !== 'true',
          }}
          renderItem={(_, index) => {
            const field = store.fields[index];
            const used = cachedSetting[field.key]?.visible;
            return (
              <div
                className={field.alwaysUsed ? 'selector' : ''}
                key={field.key}
                style={{
                  paddingLeft: 10,
                  paddingRight: 10,
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  userSelect: 'none',
                }}
              >
                <SVGDragableIcon className="sortable" style={{ marginRight: 5, cursor: 'move' }} />
                <Checkbox
                  style={{ width: '100%', color: 'black', padding: '4px 0' }}
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
      <div style={{ flexGrow: 1 }} />
      <Divider style={{ margin: 0, marginTop: 8 }} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 10px',
        }}
      >
        <Button size="small" type="link" onClick={() => _onReset()}>
          {tableLocale?.filterReset}
        </Button>
        <Button size="small" type="default" onClick={() => _onCancel()}>
          {tableLocale?.cancel}
        </Button>
        <Button size="small" type="primary" onClick={() => _onSave()}>
          {tableLocale?.saveSettings}
        </Button>
      </div>
    </div>
  );
};

export default Setting;
