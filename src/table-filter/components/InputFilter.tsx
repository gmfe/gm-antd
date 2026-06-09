import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Input } from 'antd';
import { useDebounce } from 'react-use';
import type { FieldInputItem } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import useGMLocale from '../../locale-adapter/useGMLocale';

interface InputFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  field: FieldInputItem;
}

const InputFilter: React.FC<InputFilterProps> = ({ className, field }) => {
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext);
  const value = store.get(field);
  const [updatedValue, setUpdatedValue] = useState(value);
  const isFirstMount = useRef(true);
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const [_, cancel] = useDebounce(() => {
    if (isFirstMount.current) return;
    if (['onChange', 'both'].includes(store.trigger!) && updatedValue !== value) {
      store.set(field.key, updatedValue);
      if (searchBar?.onSearch) {
        searchBar.onSearch(store.toParams());
      } else {
        store.search();
      }
    }
  }, 750, [updatedValue]);

  useEffect(() => {
    if (value !== updatedValue) {
      setUpdatedValue(value);
    }
  }, [value]);

  return (
    <Input
      className={classNames(className)}
      variant="borderless"
      placeholder={field.placeholder || `${tableLocale?.pleaseEnter || '请输入'}${field.label?.toLowerCase()}`}
      allowClear={field.allowClear ?? true}
      value={updatedValue}
      type={field.inputType}
      onChange={({ target }) => {
        isFirstMount.current = false;
        setUpdatedValue(target.value);
      }}
      onBlur={() => {
        if (typeof value === 'undefined' && typeof updatedValue === 'undefined') return;
        if (['onChange', 'both'].includes(store.trigger!) && (value || '') !== updatedValue) {
          cancel();
          store.set(field.key, updatedValue);
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams());
          } else {
            store.search();
          }
        } else {
          store.set(field.key, updatedValue);
        }
      }}
      onKeyDown={e => {
        if (e.key !== 'Enter') return;
        if (['onChange', 'both'].includes(store.trigger!)) {
          cancel();
          store.set(field.key, updatedValue);
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
      onBlurCapture={() => {
        store.focusedFieldKey = '';
      }}
    />
  );
};

export default observer(InputFilter);
