import React, { useCallback, useMemo } from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps, RefSelectProps, BaseOptionType, DefaultOptionType } from 'antd/es/select';
import DropdownRender from './DropdownRender';

export interface GmSelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends AntSelectProps<ValueType, OptionType> {
  /** 是否展示全选 & 展示过滤已删除 */
  isRenderDefaultBottom?: boolean;
  /** 是否展示过滤已删除的数据 */
  isShowDeletedSwitch?: boolean;
  /** 是否展示全选按钮 */
  isShowCheckedAll?: boolean;
}

function GmSelect<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(props: GmSelectProps<ValueType, OptionType>, ref: React.Ref<RefSelectProps>) {
  const {
    isRenderDefaultBottom = true,
    isShowCheckedAll = true,
    isShowDeletedSwitch = false,
    options,
    mode,
    value,
    onChange,
    fieldNames,
    dropdownRender: customDropdownRender,
    children,
    onSearch,
    optionFilterProp,
    filterOption,
    ...rest
  } = props;

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const useCustomRender =
    isMultiple && isRenderDefaultBottom && !(React.Children.count(children) > 0 || optionFilterProp === 'label');

  const handleSearch = useCallback(
    (val: string) => {
      onSearch?.(val);
    },
    [onSearch],
  );

  const mergedDropdownRender = useMemo(() => {
    if (customDropdownRender && !useCustomRender) return customDropdownRender;

    return (menu: React.ReactElement) => {
      if (!useCustomRender) {
        return customDropdownRender ? customDropdownRender(menu) : menu;
      }
      return (
        <DropdownRender
          menu={menu}
          value={value}
          onChange={onChange}
          options={options as any[]}
          mode={mode}
          fieldNames={fieldNames}
          isRenderDefaultBottom={isRenderDefaultBottom}
          isShowCheckedAll={isShowCheckedAll}
          isShowDeletedSwitch={isShowDeletedSwitch}
        />
      );
    };
  }, [
    customDropdownRender,
    useCustomRender,
    value,
    onChange,
    options,
    mode,
    fieldNames,
    isRenderDefaultBottom,
    isShowCheckedAll,
    isShowDeletedSwitch,
  ]);

  return (
    <AntSelect<ValueType, OptionType>
      ref={ref}
      {...rest}
      value={value}
      onChange={onChange}
      mode={mode}
      options={options}
      fieldNames={fieldNames}
      dropdownRender={mergedDropdownRender}
      showSearch
      onSearch={handleSearch}
      filterOption={useCustomRender ? false : filterOption}
    />
  );
}

const ForwardedSelect = React.forwardRef(GmSelect) as unknown as <
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: React.PropsWithChildren<GmSelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<RefSelectProps>;
  },
) => React.ReactElement;

(ForwardedSelect as any).displayName = 'GmSelect';

export default ForwardedSelect;
