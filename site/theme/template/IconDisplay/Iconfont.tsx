import * as React from 'react';
import { injectIntl } from 'react-intl';
import { createFromIconfontCN } from '@ant-design/icons';

const CSS_URL = 'https://at.alicdn.com/t/c/font_4079364_omop55e0gd.css';
const SCRIPT_URL = 'https://at.alicdn.com/t/c/font_4079364_omop55e0gd.js';

interface IconfontProps {}

const IconFont = createFromIconfontCN({
  scriptUrl: SCRIPT_URL,
});

const Iconfont: React.FC<IconfontProps> = props => {
  const [iconList, setIconList] = React.useState<string[]>([]);
  React.useEffect(() => {
    // eslint-disable-next-line compat/compat
    fetch(CSS_URL)
      .then(res => res.text())
      .then(text => {
        const list = text
          .match(/\.icon.*:before/g)
          ?.map(t => t.replace(':before', '').replace('.', ''))!;
        setIconList(list);
      })
      .catch(console.log);
  }, []);
  return (
    <div>
      <div className="iconfont-list grid grid-cols-5 gap-3 align-center justify-center">
        {iconList.map(name => (
          <div key={name} className='flex flex-col overflow-hidden'>
            <IconFont type={name} style={{ fontSize: 32 }} />
            <span className="mt-2 whitespace-nowrap">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default injectIntl(Iconfont);
