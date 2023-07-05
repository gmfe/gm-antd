import type { FC, HTMLAttributes } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import type { CasCaderOption, FieldCascaderItem } from '../types';
import TableFilterContext from '../context';
import Cascader, { CascaderProps } from '../../cascader';

export interface CascaderFilterProps extends HTMLAttributes<HTMLDivElement> {
  field: FieldCascaderItem;
}

const CascaderFilter: FC<CascaderFilterProps> = ({ className, field }) => {
  const { options: originOptions, placeholder, changeOnSelect, label, multiple, useAntdDisplayRender, displayRender = null, showCheckedStrategy } = field;
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
  const defaultDisplayRender = (labels: string[]) => <span>{labels[labels.length - 1]}</span>;

 /** 设置是否使用ant 内部渲染，或者使用自定义渲染，或者是渲染最后一级 */
 const renderDisplayRender = () => {
  /** 如果想使用antd 内部渲染并且没有使用自定义渲染，那么直接使用ant 内部渲染 */
  if (useAntdDisplayRender && !displayRender) {
    return {}
  }

  if (displayRender) {
    return {
      displayRender: displayRender,
    }
  }
  return {
    displayRender: defaultDisplayRender,
  }
}

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
      displayRender={displayRender as unknown as CascaderProps<CasCaderOption>['displayRender']}
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
      showCheckedStrategy={showCheckedStrategy}
      {...renderDisplayRender()}
    />
  );
};
export default observer(CascaderFilter);
