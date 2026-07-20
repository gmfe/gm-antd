import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { DownOutlined, FilterOutlined, UpOutlined } from '@ant-design/icons';
import { Col, Popover, Row } from 'antd';
import { observer } from 'mobx-react';
import { useFirstMountState } from 'react-use';
import GmButton from '../button';
import './index.css';
import TableFilterStore from './form.store';
import Labeled from './components/Labeled';
import TableFilterContext, { SearchBarContext } from './context';
import Setting from './components/Setting';
import type { TableFilterProps } from './types';
import useGMLocale from '../locale-adapter/useGMLocale';

const GAP = 12.5;

const _controllerMap: Record<string, TableFilterStore> = {};

function Component(options: TableFilterProps) {
  const {
    className,
    fields,
    paginationResult,
    immediate,
    trigger,
    isExpanded,
    isUpdateFields,
    isAlwaysShowCustom,
    skipInitialValues,
    isSaveOptions = false,
    onCustomSave,
    onSearch,
    resetFn,
    colSpan = 6,
  } = options;
  const id = options.id ?? new URL(location.href.replace('/#', '')).pathname;

  const { current: store } = useRef(new TableFilterStore());
  _controllerMap[id] = store;
  const [showSetting, setShowSetting] = useState(false);
  const [visibleFields, setVisibleFields] = useState(store.getVisibleFields());
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const [expanded, setExpanded] = useState(false);
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    store
      .init({
        id,
        fixedFields: fields,
        paginationResult,
        trigger,
        isSaveOptions,
      })
      .then(() => {
        setVisibleFields(store.getVisibleFields());
        if (immediate) {
          if (onSearch) {
            onSearch?.(store.toParams());
          } else {
            store.search();
          }
        }
      });
    return () => {
      store.clear();
      delete _controllerMap[id];
    };
  }, [id]);

  useEffect(() => {
    store.setSearch(onSearch);
  }, [onSearch]);

  useEffect(() => {
    if (isFirstMount) return;
    if (!isUpdateFields) return;
    store.updateFields(fields);
    setVisibleFields(store.getVisibleFields());
  }, [fields, isFirstMount]);

  const handleReset = () => {
    store.reset(skipInitialValues);
    resetFn && resetFn();
    if (onSearch) {
      store.setLoading(true);
      Promise.resolve(onSearch?.(store.toParams())).finally(() => {
        setTimeout(() => store.setLoading(false), 100);
      });
    } else {
      setTimeout(() => store.search(), 50);
    }
  };

  return (
    <SearchBarContext.Provider value={{ onSearch }}>
      <TableFilterContext.Provider value={store}>
        <div className={classNames('table-filter', className)}>
          <Row gutter={[GAP, GAP]}>
            {visibleFields.map(field => {
              const groupFields = field.group
                ? visibleFields.filter(item => field.group === item.group)
                : [field];
              if (groupFields.indexOf(field) > 0) return null;
              if (isExpanded && !expanded && field.collapsed) return null;

              if (field.render) {
                return (
                  <Col key={field.key} span={colSpan}>
                    {React.cloneElement(field.render as React.ReactElement, {
                      field: field,
                      key: field.key,
                      value: store.get(field),
                      onValueChange: (value: any) => {
                        store.set(field.key, value);
                        if (['onChange', 'both'].includes(store.trigger!)) {
                          store.search();
                        }
                      },
                    })}
                  </Col>
                );
              }

              return (
                <Col key={field.key} span={colSpan}>
                  <Labeled fields={groupFields} />
                </Col>
              );
            })}
            <Col span={colSpan} style={{ display: 'flex', alignItems: 'center', gap: GAP }}>
              <div
                style={{
                  display:
                    !isAlwaysShowCustom &&
                    store.fields.filter(field => !field.alwaysUsed).length === 0
                      ? 'none'
                      : undefined,
                }}
              >
                <Popover
                  trigger="click"
                  open={showSetting}
                  onOpenChange={visible => setShowSetting(visible)}
                  overlayClassName="overlay-setting"
                  content={
                    <Setting
                      afterCancel={() => setShowSetting(false)}
                      afterSave={() => {
                        setShowSetting(false);
                        setVisibleFields(store.getVisibleFields());
                        onCustomSave?.();
                      }}
                    />
                  }
                >
                  <div
                    className={classNames('filter-btn-icon')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      color: showSetting
                        ? 'var(--ant-color-primary, var(--gm-color-primary, #0363ff))'
                        : 'rgb(113, 113, 112)',
                      border: `1px solid ${
                        showSetting
                          ? 'var(--ant-color-primary, var(--gm-color-primary, #0363ff))'
                          : '#d6d6d6'
                      }`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowSetting(!showSetting)}
                  >
                    <FilterOutlined
                      style={{ transform: 'scaleX(0.9)', fontSize: 16, lineHeight: 'none' }}
                    />
                  </div>
                </Popover>
              </div>
              {isExpanded && (
                <GmButton
                  style={{ marginRight: '-10px' }}
                  type="link"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span>{expanded ? tableLocale?.close : tableLocale?.open}</span>
                  <span>{expanded ? <UpOutlined /> : <DownOutlined />}</span>
                </GmButton>
              )}
              <GmButton
                style={{ display: trigger === 'onChange' ? 'none' : undefined }}
                type="second"
                onClick={handleReset}
              >
                {tableLocale?.filterReset}
              </GmButton>
              <GmButton
                style={{ display: trigger === 'onChange' ? 'none' : undefined }}
                type="primary"
                loading={store.loading}
                onClick={() => {
                  if (onSearch) {
                    store.setLoading(true);
                    Promise.resolve(onSearch?.(store.toParams())).finally(() => {
                      setTimeout(() => store.setLoading(false), 100);
                    });
                  } else {
                    store.search();
                  }
                }}
              >
                {tableLocale?.search}
              </GmButton>
            </Col>
          </Row>
        </div>
      </TableFilterContext.Provider>
    </SearchBarContext.Provider>
  );
}

Component.get = (id?: string) => {
  id = id ?? new URL(location.href.replace('/#', '')).pathname;
  return _controllerMap[id];
};

const TableFilter = observer(Component);
export default TableFilter;

export * from './types';
export { TableFilterContext, SearchBarContext };
