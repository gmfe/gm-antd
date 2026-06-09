import { useCallback, useMemo } from 'react';

interface UseSelectAllOptions {
  value?: any;
  onChange?: (value: any, option: any) => void;
  options?: any[];
  mode?: 'multiple' | 'tags' | undefined;
  fieldNames?: { value?: string; label?: string; options?: string };
  isRenderDefaultBottom?: boolean;
}

export function useSelectAll({
  value,
  onChange,
  options,
  mode,
  fieldNames,
}: UseSelectAllOptions) {
  const valueFieldName = fieldNames?.value || 'value';
  const optionsFieldName = fieldNames?.options || 'options';

  const flattenOptions = useMemo(() => {
    const result: any[] = [];
    if (!options) return result;

    const process = (opts: any[]) => {
      for (const opt of opts) {
        if (opt[optionsFieldName] && Array.isArray(opt[optionsFieldName])) {
          process(opt[optionsFieldName]);
        } else if (opt[valueFieldName] !== undefined) {
          result.push(opt);
        }
      }
    };
    process(options);
    return result;
  }, [options, optionsFieldName, valueFieldName]);

  const availableValues = useMemo(
    () => flattenOptions.map((opt) => opt[valueFieldName]),
    [flattenOptions, valueFieldName],
  );

  const isAllSelected = useMemo(() => {
    if (mode !== 'multiple' && mode !== 'tags') return false;
    if (!flattenOptions.length) return false;
    const arr = Array.isArray(value) ? value : [];
    return availableValues.length > 0 && availableValues.every((v) => arr.includes(v));
  }, [mode, flattenOptions, value, availableValues]);

  const canSelectCount = flattenOptions.length;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const current = Array.isArray(value) ? value : [];
      let newValue: any[];
      if (checked) {
        newValue = Array.from(new Set([...current, ...availableValues]));
      } else {
        newValue = current.filter((v: any) => !availableValues.includes(v));
      }
      onChange?.(newValue, flattenOptions);
    },
    [value, availableValues, onChange, flattenOptions],
  );

  return {
    isAllSelected,
    canSelectCount,
    handleSelectAll,
    flattenOptions,
  };
}
