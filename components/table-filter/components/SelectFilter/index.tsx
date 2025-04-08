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

const { Option, OptGroup } = Select;

const SelectFilter: FC<SelectFilterProps> = ({ className, field }) => {
  const { multiple, options: originOptions, placeholder, remote, maxLength, label, selectProps } = field;
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext)
  const first = useRef(true);
  const [searchValue, setSearchValue] = useState('');
  const [options, setOptions] = useState(Array.isArray(originOptions) ? originOptions : []);
  const groups = groupBy(options, item => item.group);
  const [TableLocale] = useLocaleReceiver('Table');

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
      onDropdownVisibleChange={(open) => {
        if (open) {
          fetch();
        }
      }}
      onChange={(value, option) => {
        const oldValue = store.get(field);
        let val: typeof value | undefined = value;
        const isArray = Array.isArray(val)
        selectProps?.onChange?.(value, option)
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
        if (['onChange', 'both'].includes(store.trigger!) && value !== oldValue) {
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams())
          } else {
            store.search();
          }
        }
      }}
      searchValue={searchValue}
      onSearch={val => setSearchValue(val?.trim())}
      showSearch
      optionFilterProp="children"
      allowClear={field.allowClear}
      dropdownMatchSelectWidth={false}
      // dropdownAlign={{ offset: [-10, 2] }}
      filterOption={(input, option) =>
        (option!.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
      }
      onFocus={() => {
        store.focusedFieldKey = field.key;
      }}
      // @ts-ignore
      onBlurCapture={() => {
        store.focusedFieldKey = '';
      }}
    >
      {Object.keys(groups).length < 2 &&
        options.map(item => (
          <Option key={item.value} value={item.value}>
            {item.text}
          </Option>
        ))}
      {Object.keys(groups).length >= 2 &&
        Object.keys(groups).map((groupName = TableLocale?.defaultGrouping || '') => {
          const list = groups[groupName];
          if (!list.length) return null;
          return (
            <OptGroup key={groupName} label={groupName}>
              {list.map(item => (
                <Option key={item.value} value={item.value}>
                  {item.text}
                </Option>
              ))}
            </OptGroup>
          );
        })}
    </Select>
  );
};
export default observer(SelectFilter);
