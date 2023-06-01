import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import type { CasCaderOption, FieldCascaderItem } from '../types';
import TableFilterContext from '../context';
import Cascader from '../../cascader';

export interface CascaderFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldCascaderItem;
}

const CascaderFilter: FC<CascaderFilterProps> = ({ className, field }) => {
  const { options: originOptions, placeholder, changeOnSelect, label, multiple } = field;
  const store = useContext(TableFilterContext);

  const [options, setOptions] = useState<CasCaderOption[]>(
    Array.isArray(originOptions) ? originOptions : [],
  );
  const value = store.get(field);
  useEffect(() => {
    if (!originOptions) return setOptions([]);
    if (Array.isArray(originOptions)) setOptions(originOptions);
    if (typeof originOptions !== 'function') return;
    if (store.isSaveOptions && store.optionData[field.key]) { 
      setOptions(store.optionData[field.key] as CasCaderOption[])
      return
    }
    const res: any = originOptions();
    if (res.then) {
      res.then((data: CasCaderOption[]) => {
        if (store.isSaveOptions) {
          store.setOptionData(field.key, data);
        }
        setOptions(data)
      });
    } else {
      setOptions(res);
    }
  }, [originOptions]);

  /** 只展示最后一级 */
  const displayRender = (labels: string[]) => <span>{labels[labels.length - 1]}</span>;

  return (
    <Cascader
      className={classNames(className)}
      style={{ width: '100%' }}
      bordered={false}
      placeholder={placeholder || `请选择${label}`}
      allowClear
      changeOnSelect={changeOnSelect ?? true}
      expandTrigger="hover"
      options={options}
      displayRender={displayRender}
      value={value}
      multiple={multiple}
      maxTagCount="responsive"
      onChange={(value: any) => {
        store.set(field, value);
        if (['onChange', 'both'].includes(store.trigger!)) {
          store.search();
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
export default observer(CascaderFilter);
