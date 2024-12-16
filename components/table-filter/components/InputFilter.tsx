import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import type { FieldInputItem } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import Input from '../../input';
import { useDebounce } from 'react-use'

export interface InputFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldInputItem;
}

const InputFilter: FC<InputFilterProps> = ({ className, field }) => {
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext)
  const value = store.get(field);
  const [updatedValue, setUpdatedValue] = useState(value);
  // const [key, setKey] = useState(Math.random());
  const isFirstMount = useRef(true)
  
  const [_, cancel] = useDebounce(() =>{
    if (isFirstMount.current) {
      return 
    }
    if (['onChange', 'both'].includes(store.trigger!) && updatedValue !== value) {
      store.set(field.key, updatedValue);
      if (searchBar?.onSearch) {
        searchBar.onSearch(store.toParams())
      } else {
        store.search();
      }
    }
  }, 750, [updatedValue])

  /** 考虑重置后，value 更新，需要重新设置updatedValue */
  useEffect(() => {
    if (value !== updatedValue) {
      setUpdatedValue(value)
    }
  }, [value])

  /** 这里setkey 会重渲染导致 input失焦 */
  // useEffect(() => {
  //   // 重置事件, 通过key更新defaultValue
  //   // if (value === undefined) {
  //     setKey(Math.random());
  //   // }
  // }, [value]);
  return (
    <Input
      // key={key}
      className={classNames(className)}
      bordered={false}
      placeholder={field.placeholder || `请输入${field.label}`}
      allowClear={field.allowClear ?? true}
      value={updatedValue}
      type={field.inputType}
      onChange={({ target }) => {
        isFirstMount.current = false
        setUpdatedValue(target.value);
      }}
      onBlur={() => {
        if (['onChange', 'both'].includes(store.trigger!) && (value || '') !== updatedValue) {
          cancel()
          store.set(field.key, updatedValue);
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams())
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
          cancel()
          store.set(field.key, updatedValue);
          if (searchBar?.onSearch) {
            searchBar.onSearch(store.toParams())
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
