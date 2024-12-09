import type { ValidateMessages } from 'rc-field-form/lib/interface';
import * as React from 'react';
import warning from '../_util/warning';
import type { PickerLocale as DatePickerLocale } from '../date-picker/generatePicker';
import type { TransferLocale as TransferLocaleForEmpty } from '../empty';
import type { ModalLocale } from '../modal/locale';
import { changeConfirmLocale } from '../modal/locale';
import type { PaginationLocale } from '../pagination/Pagination';
import type { PopconfirmLocale } from '../popconfirm/PurePanel';
import type { TableLocale } from '../table/interface';
import type { TransferLocale } from '../transfer';
import type { UploadLocale } from '../upload/interface';
import type { LocaleContextProps } from './context';
import LocaleContext from './context';

export const ANT_MARK = 'internalMark';

export interface Locale {
  locale: string;
  Pagination?: PaginationLocale;
  DatePicker?: DatePickerLocale;
  TimePicker?: Record<string, any>;
  Calendar?: Record<string, any>;
  Table?: TableLocale;
  Modal?: ModalLocale;
  Popconfirm?: PopconfirmLocale;
  Transfer?: TransferLocale;
  Select?: Record<string, any>;
  Upload?: UploadLocale;
  Empty?: TransferLocaleForEmpty;
  global?: Record<string, any>;
  PageHeader?: { back: string };
  Icon?: Record<string, any>;
  Text?: {
    edit?: any;
    copy?: any;
    copied?: any;
    expand?: any;
  };
  Form?: {
    optional?: string;
    defaultValidateMessages: ValidateMessages;
  };
  Image?: {
    preview: string;
  };
  TableFilter?: {
    today?: string;
    yesterday?: string;
    last7days?: string;
    last30Days?: string;
  };
}

export interface LocaleProviderProps {
  locale: Locale;
  children?: React.ReactNode;
  /** @internal */
  _ANT_MARK__?: string;
}

const LocaleProvider: React.FC<LocaleProviderProps> = props => {
  const { locale = {} as Locale, children, _ANT_MARK__ } = props;

  if (process.env.NODE_ENV !== 'production') {
    warning(
      _ANT_MARK__ === ANT_MARK,
      'LocaleProvider',
      '`LocaleProvider` is deprecated. Please use `locale` with `ConfigProvider` instead: http://u.ant.design/locale',
    );
  }

  React.useEffect(() => {
    changeConfirmLocale(locale && locale.Modal);
    return () => {
      changeConfirmLocale();
    };
  }, [locale]);

  const getMemoizedContextValue = React.useMemo<LocaleContextProps>(
    () => ({ ...locale, exist: true }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={getMemoizedContextValue}>{children}</LocaleContext.Provider>
  );
};

export default LocaleProvider;
