import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { DownOutlined, FilterOutlined, UpOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import ResizeObserver from 'rc-resize-observer';
import TableFilterStore from './form.store';
import Labeled from './components/Labeled';
import TableFilterContext, { SearchBarContext } from './context';
import Button from '../button';
import Popover from '../popover';
import Setting from './components/Setting';
import type { TableFilterProps } from './types';
import './index.less';
import { useFirstMountState } from 'react-use';
import { useLocaleReceiver } from '../locale-provider/LocaleReceiver';

const GAP = 12.5;
const FIELD_MIN_WIDTH = 300;

/** TableFilter采用单实例单store，以便支持页面缓存、一个页面中多个TableFilter等场景，所有的store记录在此对象中 */
const _controllerMap: Record<string, TableFilterStore> = {};

function Component(options: TableFilterProps) {
  const {
    className,
    fields,
    // mixins = [],
    // model_type,
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
    resetFn
  } = options;
  const id = options.id ?? new URL(location.href.replace('/#', '')).pathname;

  const { current: store } = useRef(new TableFilterStore());
  _controllerMap[id] = store;
  const [showSetting, setShowSetting] = useState(false);
  const [visibleFields, setVisibleFields] = useState(store.getVisibleFields());
  const [TableLocale] = useLocaleReceiver('Table');

  const [expanded, setExpanded] = useState(false);

  const [{ width }, setState] = useState({ width: 1 });
  const flex = parseInt(`${width / FIELD_MIN_WIDTH}`, 10) || 1; // 每行个数
  const fieldWidth = width / flex - ((flex - 1) * GAP) / flex;
  const isFirstMount = useFirstMountState();
  // #endregion

  useEffect(() => {
    store
      .init({
        id,
        // eslint-disable-next-line camelcase
        // model_type,
        fixedFields: fields,
        // mixins,
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

  // fields 变化时，重新设置, 如果你的field 中包含select，
  // 而select 中的option 并不是从options 方法中获取。而是通过其他异步方式获取然后更改field 时
  // 需要用到该字段, 场景是，当你的搜索内容有相互联动时，你不得不使用这种方式，比如其他搜索内容依赖于某个搜索时间组件时
  //
  useEffect(() => {
    if (isFirstMount) {
      return;
    }
    if (!isUpdateFields) return;
    /** 如果他并不是第一次渲染，那么表示他有store.field, 那么我们只要更新当前的store.field 即可 */
    store.updateFields(fields);
    setVisibleFields(store.getVisibleFields());
  }, [fields, isFirstMount]);

  const handleReset = () => {
    store.reset(skipInitialValues)
    resetFn && resetFn()
    if (onSearch) {
      store.setLoading(true)
      Promise.resolve(onSearch?.(store.toParams())).finally(() => {
        setTimeout(() => store.setLoading(false), 100)
      })
    } else {
      setTimeout(() => store.search(), 50)
    }
  }

  return (
    <SearchBarContext.Provider value={{ onSearch }}>
    <TableFilterContext.Provider value={store}>
      <ResizeObserver onResize={({ width }) => setState({ width })}>
        <div className={classNames('table-filter', className)} style={{ gap: GAP }}>
          {visibleFields.map(field => {
            const groupFields = field.group
              ? visibleFields.filter(item => field.group === item.group)
              : [field];
            // 分组展示后一个字段就够了
            if (groupFields.indexOf(field) > 0) return null;

            // 未展开时，隐藏收起的字段
            if (isExpanded && !expanded && field.collapsed) {
              return null;
            }

            if (field.render) {
              return (
                <div
                  key={field.key}
                  style={{
                    width:
                      field.type === 'date' && field.range
                        ? fieldWidth * 2 + GAP // 时间范围占两个，加上少了的间距
                        : fieldWidth,
                  }}
                >
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
                </div>
              );
            }

            return (
              <Labeled
                key={field.key}
                fields={groupFields}
                style={{
                  width:
                    field.type === 'date' && field.range
                      ? fieldWidth * 2 + GAP // 时间范围占两个，加上少了的间距
                      : fieldWidth,
                }}
              />
            );
          })}
          <div
            // className="tw-flex tw-items-center tw-flex-grow"
            style={{ gap: GAP, display: 'flex', alignItems: 'center', flexGrow: 1 }}
          >
            <div
              // className={classNames({
              //   'tw-hidden': store.fields.filter(field => !field.alwaysUsed).length === 0,
              // })}
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
                  className={classNames('filter-btn-icon', {
                    // 'tw-bg-blue-light tw-text-blue': showSetting,
                  })}
                  style={{
                    borderColor: showSetting ? 'var(--ant-primary-color)' : undefined,
                    color: showSetting ? 'var(--ant-primary-color)' : undefined,
                  }}
                  onClick={() => setShowSetting(!showSetting)}
                >
                  <FilterOutlined
                    className="filter-icon"
                    // className="tw-text-base tw-leading-none"
                    style={{ transform: 'scaleX(0.9)', fontSize: 16, lineHeight: 'none' }}
                  />
                </div>
              </Popover>
            </div>
            <div
              // className="tw-flex-grow"
              style={{ flexGrow: 1 }}
            />
            {isExpanded && (
              <Button
                // className={classNames('tw--mr-2', {
                //   'tw-hidden': false,
                // })}
                style={{ marginRight: '-10px' }}
                type="link"
                onClick={() => setExpanded(!expanded)}
              >
                <span>{expanded ? TableLocale?.close : TableLocale?.open}</span>
                <span>{expanded ? <UpOutlined /> : <DownOutlined />}</span>
              </Button>
            )}
            <Button
              // className={classNames({
              //   'tw-hidden': trigger === 'onChange',
              // })}
              style={{
                display: trigger === 'onChange' ? 'none' : undefined,
              }}
              type="second"
              onClick={handleReset}
            >
              {TableLocale?.filterReset}
            </Button>
            <Button
              // className={classNames({
              //   'tw-hidden': trigger === 'onChange',
              // })}
              style={{
                display: trigger === 'onChange' ? 'none' : undefined,
              }}
              type="primary"
              key={
                store.loading ? Date.now().toString() : Date.now().toString() // 解决loading态和点击动效不丝滑
              }
              loading={store.loading}
              onClick={() => {
                if (onSearch) {
                  store.setLoading(true)
                  Promise.resolve(onSearch?.(store.toParams())).finally(() => {
                    setTimeout(() => store.setLoading(false), 100)
                  })
                } else {
                  store.search()
                }
              }}
            >
              {TableLocale?.search}
            </Button>
          </div>
        </div>
      </ResizeObserver>
    </TableFilterContext.Provider>
    </SearchBarContext.Provider>
  );
}

/** 获取指定id(同路由单实例可不传)的TableFilter控制器, 见{@link TableFilterStore}, 以便在外部操作 */
Component.get = (id?: string) => {
  id = id ?? new URL(location.href.replace('/#', '')).pathname;
  return _controllerMap[id];
};

/**
 * 通用自定义筛选查询组件
 *
 *     <TableFilter id="uniq_id" paginationResult={paginationResult} fields={[]} />;
 *     // 获取store
 *     const filter = TableFilter.get('uniq_id');
 */
const TableFilter = observer(Component);
export default TableFilter;

export * from './types'
export { TableFilterContext, SearchBarContext }
