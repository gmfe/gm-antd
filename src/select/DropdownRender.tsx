import React, { useMemo } from 'react';
import { Checkbox, Switch, Space } from 'antd';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import { useSelectAll } from './useSelectAll';
import { useFilterDeleted } from './useFilterDeleted';
import {
  dropdownContainerStyle,
  dropdownContentStyle,
  dropdownSectionStyle,
  sectionTitleStyle,
  sectionContentStyle,
  dropdownGroupStyle,
  dropdownGroupLabelStyle,
  dropdownGroupContentStyle,
  dropdownItemStyle,
  dropdownItemLabelStyle,
  checkIconStyle,
  footerStyle,
} from './styles';

interface DropdownRenderProps {
  menu: React.ReactElement;
  value?: any;
  onChange?: (value: any, option: any) => void;
  options?: any[];
  mode?: 'multiple' | 'tags' | undefined;
  fieldNames?: { value?: string; label?: string; options?: string };
  isRenderDefaultBottom?: boolean;
  isShowCheckedAll?: boolean;
  isShowDeletedSwitch?: boolean;
  prefixCls?: string;
  searchValue?: string;
  children?: React.ReactNode;
  optionFilterProp?: string;
  onSearch?: (value: string) => void;
  filterOption?: any;
}

export default function DropdownRender({
  menu,
  value,
  onChange,
  options,
  mode,
  fieldNames,
  searchValue = '',
  isRenderDefaultBottom = true,
  isShowCheckedAll = true,
  isShowDeletedSwitch = false,
  children,
  optionFilterProp,
  filterOption,
}: DropdownRenderProps) {
  const isMultiple = mode === 'multiple' || mode === 'tags';
  const labelFieldName = fieldNames?.label || 'label';
  const valueFieldName = fieldNames?.value || 'value';
  const optionsFieldName = fieldNames?.options || 'options';

  const { filterDeleted, filteredOptions, toggleFilterDeleted } = useFilterDeleted({
    options,
    isShowDeletedSwitch,
    fieldNames,
  });

  const searchedOptions = useMemo(() => {
    if (!filteredOptions || !searchValue) return filteredOptions;
    // filterOption === false 表示调用方自行过滤(典型场景:远程搜索,options 已是服务端过滤结果),
    // 本地不再二次过滤,与 antd 原生语义保持一致;否则会把 JSX label 等无法匹配的选项全部滤掉
    if (filterOption === false) return filteredOptions;

    const lowerSearchValue = String(searchValue).toLowerCase();
    const matchOption = (option: any) => {
      if (typeof filterOption === 'function') {
        return filterOption(searchValue, option);
      }

      const searchFieldName = optionFilterProp || labelFieldName;
      const target = option[searchFieldName] ?? option[labelFieldName] ?? option[valueFieldName];
      if (typeof target === 'string' || typeof target === 'number') {
        return String(target).toLowerCase().includes(lowerSearchValue);
      }

      return false;
    };

    return filteredOptions
      .map((option: any) => {
        if (option[optionsFieldName] && Array.isArray(option[optionsFieldName])) {
          const childrenOptions = option[optionsFieldName].filter(matchOption);
          return childrenOptions.length ? { ...option, [optionsFieldName]: childrenOptions } : null;
        }

        return matchOption(option) ? option : null;
      })
      .filter(Boolean) as any[];
  }, [
    filterOption,
    filteredOptions,
    labelFieldName,
    optionFilterProp,
    optionsFieldName,
    searchValue,
    valueFieldName,
  ]);

  const { isAllSelected, canSelectCount, handleSelectAll, flattenOptions } = useSelectAll({
    value,
    onChange,
    options: searchedOptions,
    mode,
    fieldNames,
    isRenderDefaultBottom,
  });

  const valueArray = useMemo(
    () => (Array.isArray(value) ? value : []),
    [value],
  );

  const selectedOptions = useMemo(() => {
    if (!filteredOptions) return [];
    const allFlat: any[] = [];
    const process = (opts: any[]) => {
      for (const opt of opts) {
        if (opt[optionsFieldName] && Array.isArray(opt[optionsFieldName])) {
          process(opt[optionsFieldName]);
        } else if (opt[valueFieldName] !== undefined && valueArray.includes(opt[valueFieldName])) {
          allFlat.push(opt);
        }
      }
    };
    process(filteredOptions);
    return allFlat;
  }, [filteredOptions, valueArray, optionsFieldName, valueFieldName]);

  const unselectedOptions = useMemo(() => {
    if (!searchedOptions || searchValue) return searchedOptions;
    const selectedValues = selectedOptions.map((item: any) => item[valueFieldName]);

    const filterUnselected = (opts: any[]): any[] => {
      return opts
        .map((opt: any) => {
          if (opt[optionsFieldName] && Array.isArray(opt[optionsFieldName])) {
            const filteredChildren = opt[optionsFieldName].filter(
              (child: any) => !selectedValues.includes(child[valueFieldName]),
            );
            if (filteredChildren.length > 0) {
              return { ...opt, [optionsFieldName]: filteredChildren };
            }
            return null;
          }
          if (!selectedValues.includes(opt[valueFieldName])) return opt;
          return null;
        })
        .filter(Boolean) as any[];
    };

    return filterUnselected(searchedOptions);
  }, [searchedOptions, searchValue, selectedOptions, valueFieldName, optionsFieldName]);

  const handleItemClick = (itemValue: any, item: any) => {
    const isInValue = valueArray.includes(itemValue);
    let newValue: any[];
    if (isInValue) {
      newValue = valueArray.filter((v: any) => v !== itemValue);
    } else {
      newValue = [...valueArray, itemValue];
    }
    onChange?.(newValue, item);
  };

  const renderItem = (option: any, index: number) => {
    const optVal = option[valueFieldName];
    const isSelected = valueArray.includes(optVal);
    const isDisabled = option.disabled;

    if (option[optionsFieldName] && Array.isArray(option[optionsFieldName])) {
      return (
        <div key={option.key || index} style={dropdownGroupStyle}>
          <div style={dropdownGroupLabelStyle}>{option[labelFieldName]}</div>
          <div style={dropdownGroupContentStyle}>
            {option[optionsFieldName].map((child: any, childIndex: number) => {
              const childSelected = valueArray.includes(child[valueFieldName]);
              const childDisabled = child.disabled;
              return (
                <div
                  key={child.key || child[valueFieldName] || childIndex}
                  style={dropdownItemStyle(childSelected, childDisabled)}
                  onClick={() => {
                    if (childDisabled) return;
                    handleItemClick(child[valueFieldName], child);
                  }}
                >
                  <span style={dropdownItemLabelStyle}>{child[labelFieldName]}</span>
                  {childSelected && <CheckOutlined style={checkIconStyle} />}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        key={option.key || optVal || index}
        style={dropdownItemStyle(isSelected, isDisabled)}
        onClick={() => {
          if (isDisabled) return;
          handleItemClick(optVal, option);
        }}
      >
        <span style={dropdownItemLabelStyle}>{option[labelFieldName]}</span>
        {isSelected && <CheckOutlined style={checkIconStyle} />}
      </div>
    );
  };

  const shouldRenderCustom =
    isMultiple &&
    isRenderDefaultBottom &&
    !(children || optionFilterProp === 'label');

  if (!shouldRenderCustom) {
    return menu;
  }

  return (
    <div style={dropdownContainerStyle}>
      <div style={dropdownContentStyle}>
        {!searchValue && selectedOptions.length > 0 && (
          <div style={dropdownSectionStyle}>
            <div style={sectionTitleStyle}>已选中</div>
            <div style={sectionContentStyle}>
              {selectedOptions.map((item: any, index: number) => {
                const isSelected = valueArray.includes(item[valueFieldName]);
                return (
                  <div
                    key={item.key || item[valueFieldName] || index}
                    style={dropdownItemStyle(isSelected, !!item.disabled)}
                    onClick={() => {
                      if (item.disabled) return;
                      handleItemClick(item[valueFieldName], item);
                    }}
                  >
                    <span style={dropdownItemLabelStyle}>{item[labelFieldName]}</span>
                    {isSelected && <CheckOutlined style={checkIconStyle} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={dropdownSectionStyle}>
          {!searchValue && <div style={sectionTitleStyle}>未选中</div>}
          <div style={sectionContentStyle}>
            {unselectedOptions && unselectedOptions.length > 0
              ? unselectedOptions.map(renderItem)
              : '未找到结果'}
          </div>
        </div>
      </div>

      {isRenderDefaultBottom && (
        <div style={footerStyle}>
          {isShowCheckedAll && (
            <Checkbox
              checked={isAllSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              disabled={flattenOptions.length === 0}
            >
              全选({canSelectCount})
            </Checkbox>
          )}
          {isShowDeletedSwitch && (
            <Space size="small">
              <Switch size="small" checked={filterDeleted} onChange={toggleFilterDeleted} />
              <span style={{ fontSize: 12 }}>过滤已删除的数据</span>
            </Space>
          )}
        </div>
      )}
    </div>
  );
}
