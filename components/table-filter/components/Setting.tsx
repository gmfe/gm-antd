import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useState } from 'react';
import { restoreFieldItemsForSetting, stashFieldItems } from '../utils';
import type { CachedSetting } from '../types';
import TableFilterContext from '../context';
import Divider from '../../divider';
import Button from '../../button';
import Checkbox from '../../checkbox';

export interface SettingProps extends HTMLAttributes<HTMLDivElement> {
  afterCancel?: () => void;
  afterReset?: () => void;
  afterSave?: () => void;
}

const Setting: FC<SettingProps> = ({ afterCancel, afterReset, afterSave }) => {
  const store = useContext(TableFilterContext);
  const [cachedSetting, setCachedSetting] = useState<CachedSetting>(
    restoreFieldItemsForSetting(store.id),
  );

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
          marginTop: 12,
          marginLeft: 10,
          marginRight: 10,
          color: '#1f1f1f',
          fontWeight: 'bold',
        }}
      >
        <div>全部筛选条件</div>
        <Divider
          // className="tw-m-0 tw-mt-1.5"
          style={{
            margin: 0,
            marginTop: 8,
          }}
        />
      </div>
      <div
        // className="tw-flex-grow tw-overflow-scroll"
        style={{ maxHeight: '50vh', flexGrow: 1, overflow: 'scrol' }}
      >
        {store.fields.map(item => {
          const used = cachedSetting[item.key]?.visible;
          return (
            <div
              key={item.key}
              // className="tw-px-2 tw-text-black hover:tw-bg-blue-light"
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                color: 'black',
              }}
            >
              <Checkbox
                key={item.key}
                // className="tw-w-full tw-text-black tw-py-1.5"
                style={{
                  width: '100%',
                  color: 'black',
                  paddingTop: 8,
                  paddingBottom: 8,
                }}
                disabled={item.alwaysUsed}
                checked={item.alwaysUsed || (used ?? item.defaultUsed)}
                onChange={({ target }) => {
                  setCachedSetting({
                    ...cachedSetting,
                    [item.key]: {
                      ...(cachedSetting[item.key] || {}),
                      visible: target.checked,
                    },
                  });
                }}
              >
                {item.label}
              </Checkbox>
            </div>
          );
        })}
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
        <Button size="small" type="second" onClick={() => _onCancel()}>
          取消
        </Button>
        <Button size="small" type="second" onClick={() => _onReset()}>
          重置
        </Button>
        <Button size="small" type="primary" onClick={() => _onSave()}>
          保存设置
        </Button>
      </div>
    </div>
  );
};
export default Setting;
