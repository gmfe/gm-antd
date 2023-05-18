import * as React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Link } from 'bisheng/router';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import * as utils from '../../utils';
import type { SharedProps } from './interface';

import './Navigation.less';

export interface NavigationProps extends SharedProps {
  isMobile: boolean;
  pathname: string;
  responsive: null | 'narrow' | 'crowded';
  location: { pathname: string; query: any };
  directionText: string;
  showTechUIButton: boolean;
  onLangChange: () => void;
  onDirectionChange: () => void;
}

export default ({
  isZhCN,
  isMobile,
  pathname,
  location,
}: NavigationProps) => {
  const menuMode = isMobile ? 'inline' : 'horizontal';

  const module = pathname.split('/').slice(0, -1).join('/');
  let activeMenuItem = module || 'home';
  if (location.pathname === 'changelog' || location.pathname === 'changelog-cn') {
    activeMenuItem = 'docs/react';
  } else if (location.pathname === 'docs/resources' || location.pathname === 'docs/resources-cn') {
    activeMenuItem = 'docs/resources';
  }


  const items: MenuProps['items'] = [
    {
      label: (
        <Link to={utils.getLocalizedPathname('/components/overview/', isZhCN, location.query)}>
          <FormattedMessage id="app.header.menu.components" />
        </Link>
      ),
      key: 'components',
    },
    {
      label: (
        <a
          href="https://github.com/gmfe/gm-antd"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
      ),
      key: 'github',
    },
  ];

  return (
    <Menu
      className={classNames('menu-site')}
      mode={menuMode}
      selectedKeys={[activeMenuItem]}
      id="nav"
      disabledOverflow
      items={items}
    />
  );
};
