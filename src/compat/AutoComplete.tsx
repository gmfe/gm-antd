import React from 'react';
import { AutoComplete as AntAutoComplete } from 'antd';
import type { AutoCompleteProps as AntAutoCompleteProps } from 'antd';
import { withBaseSelectCompat } from './withBaseSelectCompat';

export type AutoCompleteProps = AntAutoCompleteProps;

const Compat = withBaseSelectCompat(AntAutoComplete as React.ComponentType<AutoCompleteProps>);
(Compat as any).Option = AntAutoComplete.Option;

export default Compat as typeof Compat & { Option: typeof AntAutoComplete.Option };
