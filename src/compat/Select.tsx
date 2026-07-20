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

function getSelectChildName(node: React.ReactNode): string | undefined {
  if (!React.isValidElement(node)) return undefined;
  const type = node.type as any;
  return type?.displayName;
}

function normalizeReactKey(key: React.Key | null): React.Key | undefined {
  if (key == null) return undefined;
  const keyString = String(key);
  if (keyString.startsWith('.$')) return keyString.slice(2);
  if (keyString.startsWith('.')) return keyString.slice(1);
  return keyString;
}

function selectChildrenToOptions(children: React.ReactNode): any[] | undefined {
  if (children == null) return undefined;

  const nodes = React.Children.toArray(children).filter(React.isValidElement);
  if (!nodes.length) return undefined;

  return nodes.map((node) => {
    const { key, props } = node as React.ReactElement<any>;
    const { children: labelNode, label, value, disabled, ...rest } = props;
    const childName = getSelectChildName(node);
    const normalizedKey = normalizeReactKey(key);

    if (childName === 'OptGroup') {
      return {
        key: normalizedKey,
        label,
        options: selectChildrenToOptions(labelNode) || [],
        ...rest,
      };
    }

    return {
      key: normalizedKey,
      value: value !== undefined ? value : normalizedKey,
      label: label !== undefined ? label : labelNode,
      disabled,
      ...rest,
    };
  });
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

  const [searchValue, setSearchValue] = React.useState('');
  const mergedOptions = options || selectChildrenToOptions(children);
  const isMultiple = mode === 'multiple' || mode === 'tags';
  const useCustomRender =
    isMultiple &&
    isRenderDefaultBottom &&
    optionFilterProp !== 'label' &&
    !!mergedOptions;

  const handleSearch = (nextSearchValue: string) => {
    setSearchValue(nextSearchValue);
    onSearch?.(nextSearchValue);
  };

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
        options={mergedOptions as any[]}
        mode={mode}
        fieldNames={fieldNames}
        searchValue={searchValue}
        optionFilterProp={optionFilterProp}
        filterOption={filterOption}
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
      options={mergedOptions}
      fieldNames={fieldNames}
      popupRender={mergedPopupRender}
      // showSearch 强制 true: 原 GmSelect 设计(GM 增强需要搜索能力)
      showSearch
      onSearch={handleSearch}
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

// antd5 移除 Option/OptGroup(改 options API), AntSelect.Option 是 undefined。marker(render null + displayName),
// 让 TS 不报 + 运行时 null(不崩); ERP 渐进迁移到 options API(GmSelectInner 已忽略 children)。
const _optMarker = (name: string) => { const fn = (() => null) as any; fn.displayName = name; return fn; };
(ForwardedSelect as any).Option = _optMarker('Option');
(ForwardedSelect as any).OptGroup = _optMarker('OptGroup');
(ForwardedSelect as any).displayName = 'GmSelect';

export default ForwardedSelect as any;
