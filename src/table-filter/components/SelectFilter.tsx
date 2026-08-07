import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { debounce, groupBy } from 'lodash';
// 用 gm-antd 自己的 compat 增强 Select(消费 isRenderDefaultBottom 等增强 prop,渲染「已选中/未选中/全选」增强下拉),
// 而非 `from 'antd'`——后者在 gm-antd 内部会解析到真实 antd5 原生 Select(无 GmSelect 增强)。
import Select from '../../compat/Select';
import type { FieldSelectItem, SelectOptions } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import useGMLocale from '../../locale-adapter/useGMLocale';

interface SelectFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  field: FieldSelectItem;
}

const SelectFilter: React.FC<SelectFilterProps> = ({ className, field }) => {
  const { multiple, options: originOptions, placeholder, remote, maxLength, label, selectProps, trigger, isMountToFetch = true } = field;
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext);
  const first = useRef(true);
  const [searchValue, setSearchValue] = useState('');
  const searchValueRef = useRef(searchValue);
  const [options, setOptions] = useState(Array.isArray(originOptions) ? originOptions : []);
  const groups = groupBy(options, item => item.group);
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  useEffect(() => {
    searchValueRef.current = searchValue;
  }, [searchValue]);

  const selectOptions = useMemo(() => {
    if (Object.keys(groups).length < 2) {
      return options.map(item => ({
        value: item.value,
        label: item.text,
        key: item.value,
      }));
    }
    return Object.keys(groups)
      .map((groupName = tableLocale?.defaultGrouping || '') => {
        const list = groups[groupName];
        if (!list.length) return null;
        return {
          label: groupName,
          options: list.map(item => ({
            value: item.value,
            label: item.text,
            key: item.value,
          })),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [options, groups, tableLocale]);

  const value = store.get(field);

  const fetch = useMemo(() => {
    function fetchData() {
      if (!originOptions) return setOptions([]);
      if (Array.isArray(originOptions)) setOptions(originOptions);
      if (typeof originOptions !== 'function') return;
      const res: any = originOptions(searchValueRef.current || undefined);
      if (res?.then) {
        res.then((data: SelectOptions) => {
          if (store.isSaveOptions) {
            store.setOptionData(field.key, data);
          }
          setOptions(data);
        });
      } else {
        setOptions(res);
      }
    }
    return debounce(fetchData, 500);
  }, [originOptions]);

  const debouncedSearch = useMemo(() => {
    function doSearch() {
      if (searchBar?.onSearch) {
        searchBar.onSearch(store.toParams());
      } else {
        store.search();
      }
    }
    return debounce(doSearch, 300);
  }, [searchBar, store]);

  useEffect(() => {
    if (remote && isMountToFetch) {
      fetch();
      return;
    }
    if (store.isSaveOptions && store.optionData[field.key]) {
      setOptions(store.optionData[field.key] as SelectOptions);
      return;
    }
    if (first.current && isMountToFetch) {
      setTimeout(fetch, 300);
      first.current = false;
    }
  }, [originOptions]);

  const memoValue = useMemo(() => {
    if (options.length > 0 || value) {
      return value;
    }
    return undefined;
  }, [value, options.length]);

  return (
    <div style={{ width: '100%' }} onBlurCapture={() => { store.focusedFieldKey = ''; }}>
      <Select
        className={classNames(className)}
        style={{ width: '100%' }}
        variant="borderless"
        mode={multiple ? 'multiple' : undefined}
        maxTagCount="responsive"
        placeholder={placeholder || `${tableLocale?.pleaseSelect || '请选择'}${label?.toLowerCase()}`}
        value={memoValue}
        {...selectProps}
        onOpenChange={(open: boolean) => {
          if (open && Array.isArray(originOptions)) {
            fetch();
          }
        }}
        onChange={(value: any, option: any) => {
          const oldValue = store.get(field);
          let val: typeof value | undefined = value;
          const isArray = Array.isArray(val);
          selectProps?.onChange?.(value, option as any);
          if (typeof val === 'string' || typeof val === 'number') {
            if (val === '') val = undefined;
          } else if (isArray) {
            if (val.length === 0) val = undefined;
          }
          if (val && isArray && maxLength && val.length > maxLength) {
            value = val.slice(0, maxLength);
          }
          store.set(field, value);
          if (['onChange', 'both'].includes(trigger || store.trigger!) && value !== oldValue) {
            debouncedSearch();
          }
        }}
        onSearch={val => {
          const nextSearchValue = val?.trim() || '';
          searchValueRef.current = nextSearchValue;
          setSearchValue(nextSearchValue);
          if (typeof originOptions === 'function' || remote) {
            fetch();
          }
        }}
        showSearch
        allowClear={field.allowClear}
        popupMatchSelectWidth={false}
        filterOption={(input, option) =>
          (option?.label as unknown as string)?.toLowerCase().includes(input.toLowerCase())
        }
        options={selectOptions as any}
        onBlur={() => {
          if (trigger === 'onBlur') {
            debouncedSearch();
          }
        }}
        onFocus={() => {
          store.focusedFieldKey = field.key;
        }}
      />
    </div>
  );
};

export default observer(SelectFilter);
