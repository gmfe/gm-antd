import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { Cascader } from 'antd';
import type { CascaderProps } from 'antd';
import type { CasCaderOption, FieldCascaderItem } from '../types';
import TableFilterContext, { SearchBarContext } from '../context';
import useGMLocale from '../../locale-adapter/useGMLocale';

// antd5 Cascader 的 multiple/displayRender/value 存在多重重载泛型, runtime 接受 string[]
// value + boolean multiple, 但 TS 无法在单/多选重载间调和(第三方库类型滞后)。
// 这里用显式 props 接口绕过重载推断, 不掩盖业务逻辑。
type CascaderFCProps = Omit<
  React.ComponentProps<typeof Cascader>,
  'multiple' | 'value' | 'displayRender'
> & {
  multiple?: boolean;
  value?: string[];
  displayRender?: CascaderProps<CasCaderOption>['displayRender'];
};
const CascaderFC = Cascader as unknown as React.FC<CascaderFCProps>;

interface CascaderFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  field: FieldCascaderItem;
}

const CascaderFilter: React.FC<CascaderFilterProps> = ({ className, field }) => {
  const {
    placeholder,
    changeOnSelect,
    label,
    multiple,
    useAntdDisplayRender,
    showSearch = true,
    displayRender = null,
    showCheckedStrategy,
  } = field;
  const store = useContext(TableFilterContext);
  const searchBar = useContext(SearchBarContext);
  const isFetched = useRef(false);
  const locale = useGMLocale();
  const tableLocale = locale?.Table as Record<string, string> | undefined;

  const originOptionsRef = useRef(field.options);
  originOptionsRef.current = field.options;

  const refreshSyncOptions = () => {
    const opts = originOptionsRef.current;
    if (typeof opts === 'function') {
      const res: any = opts();
      if (res && !res.then) {
        setOptions(res);
      }
    } else if (Array.isArray(opts)) {
      setOptions(opts);
    }
  };

  const [options, setOptions] = useState<CasCaderOption[]>(
    Array.isArray(field.options) ? field.options : [],
  );
  const value = store.get(field);

  useEffect(() => {
    const originOptions = originOptionsRef.current;
    if (!originOptions) return setOptions([]);
    if (Array.isArray(originOptions)) setOptions(originOptions);
    if (typeof originOptions !== 'function') return;
    if (store.isSaveOptions && store.optionData[field.key]) {
      setOptions(store.optionData[field.key] as CasCaderOption[]);
      return;
    }
    const res: any = originOptions();
    if (res?.then) {
      if (isFetched.current) return;
      res.then((data: CasCaderOption[]) => {
        if (store.isSaveOptions) {
          store.setOptionData(field.key, data);
        }
        setOptions(data);
      });
      isFetched.current = true;
    } else {
      setOptions(res);
    }
  }, [field.options]);

  const defaultDisplayRender = (labels: string[]) => <span>{labels[labels.length - 1]}</span>;

  const renderDisplayRender = () => {
    if (useAntdDisplayRender && !displayRender) return {};
    if (displayRender) return { displayRender };
    return { displayRender: defaultDisplayRender };
  };

  return (
    <div style={{ width: '100%' }} onBlurCapture={() => { store.focusedFieldKey = ''; }}>
      {/* antd5 Cascader 的 multiple/displayRender 存在重载泛型, multiple:boolean 会与
          displayRender 单选分支的类型冲突(第三方库类型滞后), 对 Cascader 做类型转换 */}
      <CascaderFC
        className={classNames(className)}
        style={{ width: '100%' }}
        variant="borderless"
        placeholder={placeholder || `${tableLocale?.pleaseSelect || '请选择'}${label?.toLowerCase()}`}
        allowClear
        changeOnSelect={changeOnSelect ?? true}
        expandTrigger="hover"
        options={options}
        displayRender={displayRender as unknown as CascaderProps<CasCaderOption>['displayRender']}
        value={value}
        multiple={multiple}
        showSearch={showSearch}
        maxTagCount="responsive"
        onChange={(value: any) => {
          store.set(field, value);
          if (['onChange', 'both'].includes(store.trigger!)) {
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
        onOpenChange={(open: boolean) => {
          if (open) refreshSyncOptions();
        }}
        showCheckedStrategy={showCheckedStrategy}
        {...renderDisplayRender()}
      />
    </div>
  );
};

export default observer(CascaderFilter);
