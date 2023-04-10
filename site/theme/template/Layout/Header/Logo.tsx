import * as React from 'react';
import { Link } from 'bisheng/router';
import * as utils from '../../utils';

import './Logo.less';

export interface LogoProps {
  isZhCN: boolean;
  location: any;
}

const Logo = ({ isZhCN, location }: LogoProps) => (
  <h1>
    <Link to={utils.getLocalizedPathname('/', isZhCN, location.query)} id="logo">
      GM Ant Design
    </Link>
  </h1>
);

export default Logo;
