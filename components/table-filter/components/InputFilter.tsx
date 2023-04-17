import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import type { FieldInputItem } from '../types';
import TableFilterContext from '../context';
import Input from '../../input';

export interface InputFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldInputItem;
}

const InputFilter: FC<InputFilterProps> = ({ className, field }) => {
  const store = useContext(TableFilterContext);
  const value = store.get(field);
  const [updatedValue, setUpdatedValue] = useState('');
  const [key, setKey] = useState(Math.random());
  useEffect(() => {
    // 重置事件, 通过key更新defaultValue
    // if (value === undefined) {
      setKey(Math.random());
    // }
  }, [value]);
  return (
    <Input
      key={key}
      className={classNames(className)}
      bordered={false}
      placeholder={field.placeholder || `请输入${field.label}`}
      allowClear
      defaultValue={value}
      type={field.inputType}
      onChange={({ target }) => {
        setUpdatedValue(target.value);
      }}
      onBlur={() => {
        if (['onChange', 'both'].includes(store.trigger!) && (value || '') !== updatedValue) {
          store.set(field.key, updatedValue);
          store.search();
        } else {
          store.set(field.key, updatedValue);
        }
      }}
      onKeyDown={e => {
        if (e.key !== 'Enter') return;
        if (['onChange', 'both'].includes(store.trigger!)) {
          store.search();
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
