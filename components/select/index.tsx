// TODO: 4.0 - codemod should help to change `filterOption` to support node props.

import classNames from 'classnames';
import type { SelectProps as RcSelectProps } from 'rc-select';
import RcSelect, { BaseSelectRef, OptGroup, Option } from 'rc-select';
import { OptionProps } from 'rc-select/lib/Option';
import type { BaseOptionType, DefaultOptionType } from 'rc-select/lib/Select';
import omit from 'rc-util/lib/omit';
import * as React from 'react';
import { useContext } from 'react';
import { ConfigContext } from '../config-provider';
import defaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import DisabledContext from '../config-provider/DisabledContext';
import type { SizeType } from '../config-provider/SizeContext';
import SizeContext from '../config-provider/SizeContext';
import { FormItemInputContext } from '../form/context';
import type { SelectCommonPlacement } from '../_util/motion';
import { getTransitionDirection, getTransitionName } from '../_util/motion';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';
import getIcons from './utils/iconUtil';
import warning from '../_util/warning';
import { useCompactItemContext } from '../space/Compact';
import Checkbox from '../checkbox';
import Space from '../space';
import Switch from '../switch';

type RawValue = string | number;

export { OptionProps, BaseSelectRef as RefSelectProps, BaseOptionType, DefaultOptionType };

export interface LabeledValue {
  key?: string;
  value: RawValue;
  label: React.ReactNode;
}

export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[] | undefined;

export interface InternalSelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends Omit<RcSelectProps<ValueType, OptionType>, 'mode'> {
  suffixIcon?: React.ReactNode;
  size?: SizeType;
  disabled?: boolean;
  mode?: 'multiple' | 'tags' | 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
  bordered?: boolean;
}

export interface SelectProps<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
> extends Omit<
  InternalSelectProps<ValueType, OptionType>,
  'inputIcon' | 'mode' | 'getInputElement' | 'getRawInputElement' | 'backfill' | 'placement'
> {
  placement?: SelectCommonPlacement;
  mode?: 'multiple' | 'tags';
  status?: InputStatus;
  /**
   * Callback when select all checkbox is changed
   */
  onSelectAllChange?: (checked: boolean) => void;
  /**
   * Callback when filter deleted switch is changed
   */
  onFilterDeletedChange?: (checked: boolean) => void;
  /**
   * Options data for select
   */
  options?: OptionType[];
  /**
   * @deprecated `dropdownClassName` is deprecated which will be removed in next major
   *   version.Please use `popupClassName` instead.
   */
  dropdownClassName?: string;
  popupClassName?: string;
  /** 是否展示全选 & 展示过滤已删除 */
  isRenderDefaultBottom?: boolean
  /** 是否展示过滤已删除的商品 */
  isShowDeletedSwitch?: boolean
  /** 是否展示全选按钮 */
  isShowCheckedAll?: boolean
}

const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';

const InternalSelect = <OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType>(
  {
    prefixCls: customizePrefixCls,
    bordered = true,
    className,
    getPopupContainer,
    dropdownClassName,
    popupClassName,
    listHeight = 256,
    placement,
    listItemHeight = 24,
    size: customizeSize,
    disabled: customDisabled,
    notFoundContent,
    status: customStatus,
    showArrow,
    isRenderDefaultBottom = false,
    isShowCheckedAll = true,
    isShowDeletedSwitch = true,
    ...props
  }: SelectProps<OptionType>,
  ref: React.Ref<BaseSelectRef>,
) => {
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    renderEmpty,
    direction,
    virtual,
    dropdownMatchSelectWidth,
  } = React.useContext(ConfigContext);
  const size = React.useContext(SizeContext);

  const prefixCls = getPrefixCls('select', customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

  const mode = React.useMemo(() => {
    const { mode: m } = props as InternalSelectProps<OptionType>;

    if ((m as any) === 'combobox') {
      return undefined;
    }

    if (m === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
      return 'combobox';
    }

    return m;
  }, [props.mode]);

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const mergedShowArrow =
    showArrow !== undefined ? showArrow : props.loading || !(isMultiple || mode === 'combobox');

  // =================== Warning =====================
  warning(
    !dropdownClassName,
    'Select',
    '`dropdownClassName` is deprecated which will be removed in next major version. Please use `popupClassName` instead.',
  );

  // ===================== Form Status =====================
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon,
  } = useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);

  // ===================== Empty =====================
  let mergedNotFound: React.ReactNode;
  if (notFoundContent !== undefined) {
    mergedNotFound = notFoundContent;
  } else if (mode === 'combobox') {
    mergedNotFound = null;
  } else {
    mergedNotFound = (renderEmpty || defaultRenderEmpty)('Select');
  }

  // ===================== Icons =====================
  const { suffixIcon, itemIcon, removeIcon, clearIcon } = getIcons({
    ...props,
    multiple: isMultiple,
    hasFeedback,
    feedbackIcon,
    showArrow: mergedShowArrow,
    prefixCls,
  });

  const selectProps = omit(props as typeof props & { itemIcon: any }, ['suffixIcon', 'itemIcon']);

  const rcSelectRtlDropdownClassName = classNames(popupClassName || dropdownClassName, {
    [`${prefixCls}-dropdown-${direction}`]: direction === 'rtl',
    [`${prefixCls}-dropdown-multiple`]: mode === 'multiple',
  });

  const mergedSize = compactSize || customizeSize || size;

  // ===================== Disabled =====================
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled ?? disabled;

  const mergedClassName = classNames(
    {
      [`${prefixCls}-lg`]: mergedSize === 'large',
      [`${prefixCls}-sm`]: mergedSize === 'small',
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-borderless`]: !bordered,
      [`${prefixCls}-in-form-item`]: isFormItemInput,
    },
    getStatusClassNames(prefixCls, mergedStatus, hasFeedback),
    compactItemClassnames,
    className,
  );

  // ===================== Placement =====================
  const getPlacement = () => {
    if (placement !== undefined) {
      return placement;
    }
    return direction === 'rtl'
      ? ('bottomRight' as SelectCommonPlacement)
      : ('bottomLeft' as SelectCommonPlacement);
  };

  // ===================== Dropdown Render =====================
  /**
   * 状态管理：
   * - filterDeleted: 控制是否过滤已删除商品的开关状态
   * - internalValue: 内部管理的选中值，用于处理全选和过滤逻辑
   */
  const [filterDeleted, setFilterDeleted] = React.useState(true);
  const [internalValue, setInternalValue] = React.useState<any[]>(() => {
    // 初始化内部值
    const initialValue = props.value || props.defaultValue || [];
    return Array.isArray(initialValue) ? initialValue : [initialValue];
  });

  // 同步外部 value 到内部状态
  React.useEffect(() => {
    if (!isRenderDefaultBottom) {
      return 
    }
    if (props.value !== undefined) {
      const newValue = Array.isArray(props.value) ? props.value : [props.value];
      setInternalValue(newValue);
    }
  }, [props.value]);

  /**
   * 获取可用选项（根据过滤条件）
   * 如果开启了过滤已删除商品，则只返回未被删除的选项
   */
  const getAvailableOptions = React.useMemo(() => {
    if (!props.options) return [];
    
    if (filterDeleted) {
      // 过滤掉已删除的商品（假设已删除的商品有一个 isDeleted 属性）
      // 实际使用时，可能需要根据具体的属性名来调整
      return props.options.filter((option: any) => {
        // 假设已删除的商品有 isDeleted 或 deleted 属性
        const isDeleted = option.isDeleted || option.deleted;
        return !isDeleted;
      });
    }
    
    return props.options;
  }, [props.options, filterDeleted]);

  /**
   * 扁平化选项，处理嵌套的 OptGroup
   */
  const flattenOptions = React.useMemo(() => {
    const result: any[] = [];
    const optionsFieldName = props.fieldNames?.options || 'options'
    const childrenFieldName = props.fieldNames?.options || 'value'
    
    const processOption = (option: any) => {
      if (option[optionsFieldName] && Array.isArray(option[optionsFieldName])) {
        // 处理 OptGroup
        option.options.forEach((child: any) => {
          if (child[childrenFieldName]) {
            result.push(child);
          }
        });
      } else {
        if (option[childrenFieldName]) {
          result.push(option);
        }
      }
    };
    
    getAvailableOptions.forEach(processOption);
    if (props.fieldNames) {
      console.log(result)
    }
    return result;
  }, [getAvailableOptions, filterDeleted]);

  /**
   * 获取所有可用选项的值
   */
  const availableOptionValues = React.useMemo(() => {
    return flattenOptions.map(option => option.value);
  }, [flattenOptions, filterDeleted]);

  /**
   * 检查是否所有可用选项都被选中
   */
  const isAllAvailableSelected = React.useMemo(() => {
    if (!flattenOptions.length) return false;
    
    // 使用内部值来判断
    return availableOptionValues.every(value => internalValue.includes(value)) 
  }, [flattenOptions, availableOptionValues, internalValue, filterDeleted]);

  /**
   * 全选/取消全选的处理函数
   * @param e - Checkbox 的 change 事件
   */
  const handleSelectAllChange = (e: any) => {
    const checked = e.target.checked;
    let newValue: any[];

    if (checked) {
      // 全选：选择所有可用选项，同时保留已选中的不可用选项
      // const unavailableSelectedValues = internalValue.filter(value => !availableOptionValues.includes(value));
      newValue = [ ...availableOptionValues];
    } else {
      // 取消全选：只保留不在可用选项中的已选项
      newValue = []
    }
    
    // 更新内部状态
    setInternalValue(newValue);
    
    // 触发 onChange
    props.onChange?.(newValue as any, flattenOptions as any);
    
    // // 触发全选/取消全选的逻辑
    // if (props.onSelectAllChange) {
    //   // 如果提供了自定义处理函数，则调用它
    //   props.onSelectAllChange(checked);
    // }
  };

  /**
   * 过滤已删除商品开关的处理函数
   * @param checked - Switch 的状态
   */
  const handleFilterDeletedChange = (checked: boolean) => {
    // 先计算新的可用选项值，基于新的过滤状态
    const newAvailableOptions = checked
      ? props.options?.filter((option: any) => {
          const isDeleted = option.isDeleted || option.deleted;
          return !isDeleted;
        }) || []
      : props.options || [];
    
    // 扁平化新选项，处理嵌套的 OptGroup
    const newFlattenOptions: any[] = [];
    newAvailableOptions.forEach((option: any) => {
      if (option.children && Array.isArray(option.children)) {
        option.children.forEach((child: any) => {
          newFlattenOptions.push(child);
        });
      } else {
        newFlattenOptions.push(option);
      }
    });
    
    const newAvailableOptionValues = newFlattenOptions.map(option => option.value);
    
    // 当过滤状态改变时，需要重新处理选中项
    let newValue: any[];
    
    if (checked) {
      // 开启过滤：移除已删除项的选中状态
      newValue = internalValue.filter(value => newAvailableOptionValues.includes(value));
    } else {
      // 关闭过滤：保持当前选中状态不变
      newValue = internalValue;
    }
    
    // 更新过滤状态
    setFilterDeleted(checked);
    
    // 更新内部状态
    setInternalValue(newValue);
    
    // 如果选中值发生变化，触发 onChange
    if (newValue !== internalValue) {
      props.onChange?.(newValue as any, [] as any);
    }
    
    // // 触发过滤逻辑
    // if (props.onFilterDeletedChange) {
    //   // 如果提供了自定义处理函数，则调用它
    //   props.onFilterDeletedChange(checked);
    // }
  };

  /**
   * 默认的下拉菜单渲染函数
   * @param menu - 原始的下拉菜单元素
   * @returns 自定义的下拉菜单元素
   */
  const defaultDropDownRender = (menu: React.ReactElement) => {
    // 添加分隔线和适当的间距，使其更符合 Ant Design 的设计规范
    return (
      <div className={`${prefixCls}-dropdown-render`}>
        {menu}
        {isRenderDefaultBottom && (props.mode === 'multiple' || props.mode === 'tags') && !(props.children || props.optionFilterProp === 'label') && (
          <div className={`${prefixCls}-dropdown-render-section`}>
            {
              isShowCheckedAll && (
                <Checkbox
                  checked={isAllAvailableSelected}
                  onChange={handleSelectAllChange}
                >
                  全选({getAvailableOptions.length})
                </Checkbox>
              )
            }
            {
              isShowDeletedSwitch && (
                <Space size="small">
                  <Switch
                    size="small"
                    checked={filterDeleted}
                    onChange={handleFilterDeletedChange}
                  />
                  <span style={{ fontSize: '12px' }}>过滤已删除商品</span>
                </Space>
              )
            }
            
          </div>
        )}
        
      </div>
    );
  };

  // 如果用户没有提供 dropdownRender，则使用默认的
  const mergedDropdownRender = props.dropdownRender || defaultDropDownRender;

  // 处理值变化，同步到内部状态
  const handleChange = (value: any, option: any) => {
    if (isRenderDefaultBottom) {
      const newValue = Array.isArray(value) ? value : [value];
      setInternalValue(newValue);
    }
    props.onChange?.(value, option);
  };

  // 使用内部值或外部值（受控模式优先）
  const selectValue = props.value !== undefined ? props.value : internalValue;

  return (
    <RcSelect<any, any>
      ref={ref as any}
      virtual={virtual}
      dropdownMatchSelectWidth={isRenderDefaultBottom ? false : dropdownMatchSelectWidth}
      {...selectProps}
      value={selectValue}
      onChange={handleChange}
      transitionName={getTransitionName(
        rootPrefixCls,
        getTransitionDirection(placement),
        props.transitionName,
      )}
      listHeight={listHeight}
      listItemHeight={listItemHeight}
      mode={mode as any}
      prefixCls={prefixCls}
      placement={getPlacement()}
      direction={direction}
      inputIcon={suffixIcon}
      menuItemSelectedIcon={itemIcon}
      removeIcon={removeIcon}
      clearIcon={clearIcon}
      notFoundContent={mergedNotFound}
      className={mergedClassName}
      getPopupContainer={getPopupContainer || getContextPopupContainer}
      dropdownClassName={rcSelectRtlDropdownClassName}
      showArrow={hasFeedback || showArrow}
      disabled={mergedDisabled}
      dropdownRender={mergedDropdownRender}
      options={props.children || props.optionFilterProp === 'label' ? undefined : getAvailableOptions}
    />
  );
};

const Select = React.forwardRef(InternalSelect) as unknown as (<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: React.PropsWithChildren<SelectProps<ValueType, OptionType>> & {
    ref?: React.Ref<BaseSelectRef>;
  },
) => React.ReactElement) & {
  SECRET_COMBOBOX_MODE_DO_NOT_USE: string;
  Option: typeof Option;
  OptGroup: typeof OptGroup;
};

Select.SECRET_COMBOBOX_MODE_DO_NOT_USE = SECRET_COMBOBOX_MODE_DO_NOT_USE;
Select.Option = Option;
Select.OptGroup = OptGroup;

export default Select;
