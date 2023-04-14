<p align="center">
  <a href="https://ant.design">
    <img width="200" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg">
  </a>
</p>

<h1 align="center">GM x Ant Design</h1>

<div align="center">

Fork自antd@2.24.0，做AntD组件二次开发及文档使用。[在线文档](https://gmfe.github.io/gm-antd/index-cn)

</div>

```
.
├── components                # 组件库源码目录
│   ├── demo         # 组件用例场景目录
│   │   ├── type.md  # demo
│   ├── Button         # 单个组件
│   │   ├── index.tsx  # 组件源码
│   │   ├── index.less # 组件样式
│   │   └── index.md   # 组件文档
│   └── index.ts       # 组件库入口文件

```

## 开发流程
在你 clone 了 antd 的代码并且使用 yarn install 安装完依赖后，你还可以运行下面几个常用的命令：
- `yarn start` 在本地运行 Ant Design 的网站。
- `yarn lint` 检查代码风格。
- `yarn test` 运行测试。(在运行测试前请确保 NODE_ENV 环境变量没有被设定，否则可能会引发一些问题)
- `yarn compile` 编译 TypeScript 代码到 lib 和 es 目录。
- `yarn dist` 构建 antd 的 UMD 版本到 dist 目录。
- `yarn site` 构建静态文档站到_site目录

#### 配套开发工具
- CSS in JS 样式提示插件：https://marketplace.visualstudio.com/items?itemName=shezhangzhang.antd-design-token
- 组件属性提示插件：https://github.com/fi3ework/vscode-antd-rush

## 发包
- 提交代码；
- 按照语义化更新版本号；
- 运行`yarn test`检测你改动到的组件测试用例是否通过，假设你改动了Button组件，则使用`yarn test /button/`指定运行button的测试用例；
- 运行`yarn build`打包, link后可以在上层项目中测试;
- 将package.json中的name改为`gm-antd`，在完成发布后再改回来。（这是因为build使用的antd-tools脚手架没有相关文档且其依赖package.json的name为antd，而npm发包只能用package的name为名，暂时先这样手动处理）
- 运行`yarn publish`发布;

## 如何贡献代码
- antd官方贡献指南：https://ant.design/docs/react/contributing-cn
