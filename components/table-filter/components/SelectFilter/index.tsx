import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { debounce, groupBy } from 'lodash';
import type { FieldSelectItem, SelectOptions } from '../../types';
import TableFilterContext, { SearchBarContext } from '../../context';
import Select from '../../../select';
import { useLocaleReceiver } from '../../../locale-provider/LocaleReceiver';

export interface SelectFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldSelectItem;
}

const SelectFilter: FC<SelectFilterProps> = ({ className, field }) => {
  const {
    multiple,
    options: originOptions,
    placeholder,
    remote,
    maxLength,
    label,
    selectProps,
    trigger,
  } = field;
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext);
  const first = useRef(true);
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState(Array.isArray(originOptions) ? originOptions : []);
  const groups = groupBy(options, item => item.group);
  const [TableLocale] = useLocaleReceiver('Table');

  // 将 options 转换为 Select 组件需要的格式
  const selectOptions = useMemo(() => {
    if (Object.keys(groups).length < 2) {
      // 没有分组的情况
      return options.map(item => ({
        value: item.value,
        label: item.text,
        key: item.value
      }));
    } else {
      // 有分组的情况
      return Object.keys(groups).map((groupName = TableLocale?.defaultGrouping || '') => {
        const list = groups[groupName];
        if (!list.length) return null;
        return {
          label: groupName,
          options: list.map(item => ({
            value: item.value,
            label: item.text,
            key: item.value
          }))
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);
    }
  }, [options, groups, TableLocale]);

  const value = store.get(field);

  const fetch = useMemo(() => {
    function fetch() {
      if (!originOptions) return setOptions([]);
      if (Array.isArray(originOptions)) setOptions(originOptions);
      if (typeof originOptions !== 'function') return;
      const res: any = originOptions(searchValue || undefined);
      if (res.then) {
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
    return debounce(fetch, 300);
  }, [originOptions, searchValue]);

  useEffect(() => {
    if (remote) {
      fetch();
      return;
    }
    /** 如果是启动了保存options 并且有值，就直接从里面取，避免每次展开收起时重新调接口 */
    if (store.isSaveOptions && store.optionData[field.key]) {
      setOptions(store.optionData[field.key] as SelectOptions);
      return;
    }

    if (first.current) {
      setTimeout(fetch, 300);
      first.current = false;
    }
  }, [originOptions, searchValue]);

  return (
    <Select
      className={classNames(className)}
      style={{ width: '100%' }}
      bordered={false}
      mode={multiple ? 'multiple' : undefined}
      maxTagCount="responsive"
      placeholder={placeholder || `${TableLocale?.pleaseSelect}${label?.toLowerCase()}`}
      value={options.length ? value : undefined}
      {...selectProps}
      isRenderDefaultBottom={selectProps?.isRenderDefaultBottom ?? true}
      onDropdownVisibleChange={(open) => {
        if (open) {
          fetch();
        }
      }}
      onChange={(value, option) => {
        const oldValue = store.get(field);
        let val: typeof value | undefined = value;
        const isArray = Array.isArray(val)
        selectProps?.onChange?.(value, option as any)
        if (typeof val === 'string' || typeof val === 'number') {
          if (val === '') val = undefined;
        } else if (isArray) {
          if (val.length === 0) val = undefined;
        }
        if (val && isArray && maxLength && val.length > maxLength) {
          // 删除前面的值，保留maxLength个
          value = val.slice(0, maxLength);
        }
        store.set(field, value);
        if (['onChange', 'both'].includes(trigger || store.trigger!) && value !== oldValue) {
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams());
          } else {
            store.search();
          }
        }
      }}
      searchValue={searchValue}
      onSearch={val => setSearchValue(val?.trim())}
      showSearch
      allowClear={field.allowClear}
      dropdownMatchSelectWidth={false}
      // dropdownAlign={{ offset: [-10, 2] }}
      filterOption={(input, option) =>
        (option!.label as unknown as string)?.toLowerCase().includes(input.toLowerCase())
      }
      options={selectOptions as any}
      onBlur={() => {
        if (trigger === 'onBlur') {
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams());
          } else {
            store.search();
          }
        }
      }}
      onFocus={() => {
        store.focusedFieldKey = field.key;
      }}
      // @ts-ignore
      onBlurCapture={() => {
        store.focusedFieldKey = '';
      }}
    />
  );
};
export default observer(SelectFilter);
