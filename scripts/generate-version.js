const fs = require('fs-extra');
const path = require('path');

const { version } = require('../package.json');

/** 删除version 了，没什么用 */
// fs.writeFileSync(
//   path.join(__dirname, '..', 'components', 'version', 'version.tsx'),
//   `export default '${version}'`,
//   'utf8',
// );
