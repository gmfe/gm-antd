import React from 'react';
import { Select as AntSelect } from 'antd';
// antd5 公共入口不导出 BaseOptionType/DefaultOptionType, 暂用深路径(无公共替代)
import type {
  SelectProps as AntSelectProps,
  RefSelectProps,
  BaseOptionType,
  DefaultOptionType,
} from 'antd/es/select';
import { applyCompatProps } from './withCompat';
import { BASE_SELECT_RENAME, transformBordered } from './withBaseSelectCompat';
import DropdownRender from '../select/DropdownRender';

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

function GmSelectInner<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(props: GmSelectProps<ValueType, OptionType>, ref: React.Ref<RefSelectProps>) {
  // 1) BaseSelect v4→v5 改名(dropdownClassName→popupClassName 等)+ bordered→variant
  const renamed = applyCompatProps(props as Record<string, any>, {
    rename: BASE_SELECT_RENAME,
    transform: transformBordered,
  });

  const {
    isRenderDefaultBottom = true,
    isShowCheckedAll = true,
    isShowDeletedSwitch = false,
    options,
    mode,
    value,
    onChange,
    fieldNames,
    popupRender: customPopupRender, // rename 后已从 dropdownRender 变为 popupRender
    children,
    onSearch,
    optionFilterProp,
    filterOption,
    ...rest
  } = renamed as GmSelectProps<ValueType, OptionType> & { popupRender?: any };

  if (process.env.NODE_ENV !== 'production' && children != null) {
    // eslint-disable-next-line no-console
    console.warn('[gm-antd Select] children 形式不被支持, 请使用 options prop。children 已忽略。');
  }

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const useCustomRender =
    isMultiple &&
    isRenderDefaultBottom &&
    !(React.Children.count(children) > 0 || optionFilterProp === 'label');

  // 直接计算,不使用 useMemo(无外部消费者需要稳定引用)
  const mergedPopupRender = (menu: React.ReactElement) => {
    if (!useCustomRender) {
      return customPopupRender ? customPopupRender(menu) : menu;
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

  return (
    <AntSelect<ValueType, OptionType>
      ref={ref}
      {...rest}
      value={value}
      onChange={onChange}
      mode={mode}
      options={options}
      fieldNames={fieldNames}
      popupRender={mergedPopupRender}
      // showSearch 强制 true: 原 GmSelect 设计(GM 增强需要搜索能力)
      showSearch
      onSearch={onSearch}
      filterOption={useCustomRender ? false : filterOption}
    />
  );
}

const ForwardedSelect = React.forwardRef(GmSelectInner) as unknown as <
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: React.PropsWithChildren<GmSelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<RefSelectProps>;
  },
) => React.ReactElement;

// 补回 antd Select 静态成员
(ForwardedSelect as any).Option = AntSelect.Option;
(ForwardedSelect as any).OptGroup = AntSelect.OptGroup;
(ForwardedSelect as any).displayName = 'GmSelect';

export default ForwardedSelect as typeof ForwardedSelect & {
  Option: typeof AntSelect.Option;
  OptGroup: typeof AntSelect.OptGroup;
};
