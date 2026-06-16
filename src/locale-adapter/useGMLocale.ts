import { useContext } from 'react';
import { ConfigProvider } from 'antd';
// antd5 公共入口不导出 Locale 类型, 暂用深路径(无公共替代)
import type { Locale } from 'antd/es/locale';
import zhCN from '../locale/zh_CN';

/**
 * Replaces antd 4's useLocaleReceiver.
 * Returns the current locale merged with GM custom fields.
 *
 * Usage: const locale = useGMLocale()
 * Access: locale.Table?.headerSettings, locale.TableFilter?.today, etc.
 *
 * 合并策略:GM 自定义字段(如 Table.search/pleaseSelect, antd 原生 locale 没有)必须保留,
 * 否则浅合并 {...zhCN, ...locale} 会让 antd 的 locale.Table 整体覆盖 GM 增强的 Table,
 * 导致「查询」「请选择」等文案丢失。这里对 Table/Upload 等 GM 扩展过的子对象做深合并,
 * GM 字段优先(仅中文,无多语言版),其余回退到 antd locale。
 */
function useGMLocale(): Locale & { TableFilter?: Record<string, string> } {
  const { locale } = useContext(ConfigProvider.ConfigContext);
  if (!locale) {
    return zhCN;
  }
  const merged = { ...zhCN, ...locale } as Locale & { TableFilter?: Record<string, string> };
  // 深合并 GM 扩展过的子对象:GM 自定义字段优先,antd locale 字段次之
  (['Table', 'Upload'] as const).forEach((key) => {
    const gmPart = (zhCN as any)[key];
    const antdPart = (locale as any)[key];
    if (gmPart && typeof gmPart === 'object') {
      (merged as any)[key] = { ...(antdPart as object), ...(gmPart as object) };
    }
  });
  return merged;
}

export default useGMLocale;
