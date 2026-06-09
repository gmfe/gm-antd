import { useCallback, useMemo, useState } from 'react';

interface UseFilterDeletedOptions {
  options?: any[];
  isShowDeletedSwitch?: boolean;
  fieldNames?: { value?: string; label?: string; options?: string };
}

export function useFilterDeleted({
  options,
  isShowDeletedSwitch = false,
  fieldNames,
}: UseFilterDeletedOptions) {
  const [filterDeleted, setFilterDeleted] = useState(isShowDeletedSwitch);

  const optionsFieldName = fieldNames?.options || 'options';

  const filteredOptions = useMemo(() => {
    if (!options) return [];
    if (!filterDeleted) return options;

    const filter = (opts: any[]): any[] => {
      return opts
        .map((opt) => {
          if (opt[optionsFieldName] && Array.isArray(opt[optionsFieldName])) {
            const children = opt[optionsFieldName].filter(
              (child: any) => !(child.isDeleted || child.deleted),
            );
            if (children.length > 0) {
              return { ...opt, [optionsFieldName]: children };
            }
            return null;
          }
          if (opt.isDeleted || opt.deleted) return null;
          return opt;
        })
        .filter(Boolean) as any[];
    };

    return filter(options);
  }, [options, filterDeleted, optionsFieldName]);

  const toggleFilterDeleted = useCallback((checked: boolean) => {
    setFilterDeleted(checked);
  }, []);

  return {
    filterDeleted,
    filteredOptions,
    toggleFilterDeleted,
  };
}
