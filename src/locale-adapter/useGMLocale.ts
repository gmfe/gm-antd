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
 */
function useGMLocale(): Locale & { TableFilter?: Record<string, string> } {
  const { locale } = useContext(ConfigProvider.ConfigContext);
  if (!locale) {
    return zhCN;
  }
  return { ...zhCN, ...locale } as Locale & { TableFilter?: Record<string, string> };
}

export default useGMLocale;
