<p align="center">
  <a href="https://ant.design">
    <img width="200" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg">
  </a>
</p>

<h1 align="center">GM x Ant Design</h1>

<div align="center">

Fork 自antd@4.24.0，做 AntD 组件二次开发及文档使用。[在线文档](https://gmfe.github.io/gm-antd/index-cn)

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

## 注意
mac 可能需要删掉 `bundlesize` 依赖，不然install 不下来, `yarn remove bundlesize`

## 开发流程

在你 clone 了 antd 的代码并且使用 yarn install 安装完依赖后，你还可以运行下面几个常用的命令：

- `yarn start` 在本地运行 Ant Design 的网站。
- `yarn lint` 检查代码风格。
- `yarn test` 运行测试。(在运行测试前请确保 NODE_ENV 环境变量没有被设定，否则可能会引发一些问题)
- `yarn compile` 编译 TypeScript 代码到 lib 和 es 目录。
- `yarn dist` 构建 antd 的 UMD 版本到 dist 目录。
- `yarn site` 构建静态文档站到\_site 目录
- `npx bumpp` 给当前包打tag，push 上去后会执行github action

### gm_api

Demo 中使用 gm_api 接口需要先初始化:

```
window.init_gm_api('https://env-xxx.x.k8s.guanmai.cn', 'TOKEN')
```

#### 配套开发工具

- CSS in JS 样式提示插件：https://marketplace.visualstudio.com/items?itemName=shezhangzhang.antd-design-token
- 组件属性提示插件：https://github.com/fi3ework/vscode-antd-rush

## 发包

- 运行`yarn test`检测你改动到的组件测试用例是否通过，假设你改动了 Button 组件，则使用`yarn test /button/`指定运行 button 的测试用例；
- 提交代码；
- 按照语义化更新版本号(feature:`yarn version --minor`,fix:`yarn version --patch`)；
- **更改 package.json 的 name 为"antd"**, 然后运行`yarn build`打包, link 后可以在上层项目中测试;
- **将 package.json 中的 name 改为`gm-antd`**, 运行`yarn publish`发布;（这是因为 build 使用的 antd-tools 需要 name 为"antd"，而 npm 需要 name 为"gm-antd"，暂时先这样手动处理）

如果是以下形式替换项目中的 antd 为 gm-antd，在发布完成后直接更改 package.json 中的对应版本号然后 `yarn` 一下就行了，如果 `yarn` 失败提示 "not found"，访问 https://npmmirror.com/package/gm-antd 点击 SYNC 同步镜像，然后重试即可。

```
"antd": "https://registry.npmmirror.com/gm-antd/-/gm-antd-1.1.0.tgz"
```

## 其他

- antd 官方贡献指南：https://ant.design/docs/react/contributing-cn

发包打tag
```
npx bumpp
```