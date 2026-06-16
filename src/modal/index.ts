// 文档入口:re-export compat 层的 Modal 垫片,使 dumi 能以 src/modal 为组件目录生成文档页。
// 运行时组件实现在 ../compat(antd5 + v4 visible/destroyOnClose 别名翻译)。
export { default } from '../compat/Modal';
export type { ModalProps } from '../compat/Modal';
